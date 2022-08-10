<script setup lang="ts">
import {Course, Situation} from "../../../assets/ts/types";
import {computed, inject, Ref} from "vue";
import {useStore} from "../../../pinia/useStore";
import getWeeksString from "../../../assets/ts/getWeeksString";
import {parseFontColor} from "../../../assets/ts/useColorParser";
import ContextMenu from "@imengyu/vue3-context-menu";
import {useDialog, useMessage} from "naive-ui";
import {MenuItem} from "@imengyu/vue3-context-menu";
import {getIsoWeekDay} from "../../../assets/ts/datetimeUtils";
import dayjs from "dayjs";
import useEmptyCourseCard from "../../../assets/ts/hooks/useEmptyCourseCard";
import RouteFilter from "../RouteFilter/RouteFilter.vue";


const props = withDefaults(defineProps<{
  course: Course, isDateMode?: boolean,
  showWeeks?: boolean, showGrade?: boolean, showWhatDay?: boolean, showLessonTime?: boolean,
  editData?: { coursesExisting: Course[], queryDate: string, lessonNum: number }
}>(), {showWeeks: true, showGrade: false, showWhatDay: false, showLessonTime: false});

const store = useStore();
const message = useMessage();
const dialog = useDialog();

const routeFilter = inject("routeFilter") as Ref<typeof RouteFilter>;
const {getContextMenuItems} = useEmptyCourseCard();

function getSituationStr(situation: Situation) {
  return [situation.groups.map(g => store.translate(g)).join("&"), store.translate(situation.teacher), store.translate(situation.room)].filter(s => !!s).join(" | ");
}

const optionGetters = {
  edit(): MenuItem {
    return {
      label: "编辑",
      onClick: () => {
        if (props.editData) {
          store.editor.show = true;
          store.editor.mode = "edit";
          store.editor.fromDates = props.course.dates;
          store.editor.lessonNum = props.editData.lessonNum;
          store.editor.courseEditing = props.course;
        }
      },
    };
  },
  copy(): MenuItem {
    function copyFinally() {
      store.editor.mode = "copy";
      store.editor.courseEditing = props.course;
      message.success("已复制");
    }

    // 课程只有一周，那直接返回单层的菜单
    if (props.course.dates.length === 1) {
      return {
        label: "复制",
        onClick: () => {
          store.editor.fromDates = props.course.dates;
          copyFinally();
        },
      };
    }

    // 课程有多周，需要子菜单
    let copyOption: MenuItem = {
      label: "复制",
      children: [{
        label: "全部",
        onClick: () => {
          store.editor.fromDates = props.course.dates;
          copyFinally();
        },
      }],
    };

    for (const date of props.course.dates) {
      copyOption.children?.push({
        label: `${date}(第${store.getWeekNumOfSomeDate(date)}周)`,
        onClick: () => {
          store.editor.fromDates = [date];
          copyFinally();
        },
      });
    }

    return copyOption;
  },
  cut(): MenuItem {
    function cutFinally() {
      store.editor.mode = "cut";
      store.editor.courseEditing = props.course;
      message.success("已剪切");
    }

    // 课程只有一周，那直接返回单层的菜单
    if (props.course.dates.length === 1) {
      return {
        label: "剪切",
        onClick: () => {
          store.editor.fromDates = props.course.dates;
          cutFinally();
        },
      };
    }

    // 课程有多周，需要子菜单
    let cutOption: MenuItem = {
      label: "剪切",
      children: [
        {
          label: "全部",
          onClick: () => {
            store.editor.fromDates = props.course.dates;
            cutFinally();
          },
        },
      ],
    };

    for (const date of props.course.dates) {
      cutOption.children?.push({
        label: `${date}(第${store.getWeekNumOfSomeDate(date)}周)`,
        onClick: () => {
          store.editor.fromDates = [date];
          cutFinally();
        },
      });
    }
    return cutOption;
  },
  delete(): MenuItem {
    async function deleteAll() {
      dialog.warning({
        title: "提示",
        content: `这节“${props.course.info.name}”将会被删除，是否继续？`,
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: async () => {
          await store.api.course.delete(props.course, () => {
            store.courses = store.courses.filter(c => c.id !== props.course.id);
            message.success("删除成功");
          }, () => message.error("删除失败，请检查网络连接"));
        },
      });
    }

    if (props.course.dates.length === 1) {
      return {
        label: "删除",
        onClick: deleteAll,
      };
    }

    const deleteOption: MenuItem = {
      label: "删除",
      children: [
        {
          label: "全部",
          onClick: deleteAll,
        },
      ],
    };

    for (const date of props.course.dates) {
      deleteOption.children?.push({
        label: `${date}(第${store.getWeekNumOfSomeDate(date)}周)`,
        onClick: () => {
          store.editor.fromDates = [date];
          let restDates = props.course.dates.filter(d => store.editor.fromDates.indexOf(d) === -1);
          if (restDates) {
            dialog.warning({
              title: "请注意",
              content: `${date}(第${store.getWeekNumOfSomeDate(date)}周)第${props.course.lessonNum}节的“${props.course.info.name}”将会被删除，是否继续？`,
              positiveText: "确定",
              negativeText: "取消",
              onPositiveClick: async () => {
                await store.api.course.update(props.course, {...props.course, dates: restDates}, (newCourse) => {
                  store.courses = store.courses.filter(c => c.id !== props.course.id).concat([newCourse]);
                  message.success("删除成功");
                }, () => message.error("删除失败，请检查网络连接"));
              },
            });
          }
        },
      });
    }

    return deleteOption;
  },
};

function onContextMenu(e: MouseEvent) {
  if (props.editData) {
    e.preventDefault();
    ContextMenu.showContextMenu({
      x: e.pageX,
      y: e.pageY,
      items: [
        optionGetters.edit(),
        optionGetters.copy(),
        optionGetters.cut(),
        optionGetters.delete(),
        ...(getContextMenuItems(routeFilter?.value?.sources?.grades ?? [], props.course.lessonNum,
            props.editData?.queryDate ?? store.todayDate, !!props.isDateMode) ?? []),
      ],
    });
  }
}

const getWeekStrWithUnit = computed<string>(() => {
  let validWeeks = props.course.dates.map(d => store.getWeekNumOfSomeDate(d)).filter(w => (w > 0 && w <= store.config.content.maxWeekNum));
  let weekZhStr = getWeeksString(validWeeks);
  let _weekUnitStr = store.translate("星期");
  let weekStr = (_weekUnitStr === "星期") ? `第${weekZhStr}周` : `${_weekUnitStr} ${weekZhStr}`;

  let invalidDates = props.course.dates.filter(d => {
    let week = store.getWeekNumOfSomeDate(d);
    return week <= 0 || week > store.config.content.maxWeekNum;
  });

  return invalidDates.length ? invalidDates.concat([weekStr]).join(",") : weekStr;
});

const whatDayStr = computed<string>(() => store.translate(store.getWhatDayStr(getIsoWeekDay(dayjs(props.course.dates[0]) ?? dayjs()))));
const lessonTimeStr = computed<string>(() => {
  let lessonConfig = store.config.content.lessonConfigs[props.course.lessonNum - 1];
  return `${lessonConfig.start}~${lessonConfig.end}`;
});
</script>

<template>
  <div class="course-card" @contextmenu="onContextMenu($event)"
       :style="{backgroundColor: course.info.bgc, color: parseFontColor(course.info.bgc)}">
    <div v-if="course.info.code">{{ store.translate(course.info.code) }}</div>
    <div>{{ store.translate(course.info.name) }}</div>
    <div v-if="course.method">{{ store.translate(course.method) }}</div>
    <div v-if="showGrade">{{ store.translate(course.grade) }}</div>
    <div v-if="showWeeks">{{ getWeekStrWithUnit }}</div>
    <div v-if="showWhatDay">{{ whatDayStr }}</div>
    <div v-if="showLessonTime">{{ lessonTimeStr }}</div>

    <!--  situations  -->
    <template v-if="course.situations.length===1">
      <div v-if="course.situations[0].groups.length">{{ course.situations[0].groups.map(g => store.translate(g)).join("&") }}</div>
      <div v-if="course.situations[0].teacher">{{ store.translate(course.situations[0].teacher) }}</div>
      <div v-if="course.situations[0].room">{{ store.translate(course.situations[0].room) }}</div>
    </template>
    <template v-if="course.situations.length>=2">
      <div class="course-card-situations" v-for="(situation, index) in course.situations"
           :key="`c${course.id}s${index}${getSituationStr(situation)}`">
        {{ getSituationStr(situation) }}
      </div>
    </template>

    <div v-if="course.note">{{ course.note }}</div>
  </div>
</template>

<style scoped>
.course-card {
  display: flex;
  text-align: center;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  font-size: 12px;
  min-width: var(--courseCardMinWidth);
  min-height: var(--courseCardMinHeight);
}

.course-card-situations {
  display: flex;
  justify-content: center;
  flex-direction: row;
}
</style>
