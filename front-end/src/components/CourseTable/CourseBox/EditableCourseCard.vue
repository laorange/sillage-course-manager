<script setup lang="ts">
import {Course} from "../../../assets/ts/types";
import {inject, Ref} from "vue";
import RouteFilter from "../RouteFilter/RouteFilter.vue";
import useEmptyCourseCard from "../../../assets/ts/hooks/useEmptyCourseCard";
import ContextMenu, {MenuItem} from "@imengyu/vue3-context-menu";
import {useStore} from "../../../pinia/useStore";
import {useDialog, useMessage} from "naive-ui";
import useClipboard from "vue-clipboard3";
import CourseCard from "./CourseCard.vue";

const props = withDefaults(defineProps<{
  course: Course, isDateMode?: boolean,
  showWeeks?: boolean | "auto", showGrade?: boolean, showWhatDay?: boolean, showLessonTime?: boolean,
  editData?: { coursesExisting: Course[], queryDate: string, lessonNum: number }
}>(), {showWeeks: "auto", showGrade: false, showWhatDay: false, showLessonTime: false});

const store = useStore();
const message = useMessage();
const dialog = useDialog();
const {toClipboard} = useClipboard();

const routeFilter = inject("routeFilter") as Ref<typeof RouteFilter>;
const {getContextMenuItems} = useEmptyCourseCard();

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

    // 添加 ""
    copyOption.children?.push(optionGetters.copyJson());

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
      const onPositiveClick = async () => {
        await store.api.course.delete(props.course, () => {
          store.courses = store.courses.filter(c => c.id !== props.course.id);
          message.success("删除成功");
        }, () => message.error("删除失败，请检查网络连接"));
      };
      store.localConfig.thinkTwice ? dialog.warning({
        title: "提示",
        content: `这节“${props.course.info.name}”将会被删除，是否继续？`,
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick,
      }) : await onPositiveClick();
    }

    if (props.course.dates.length === 1) {
      return {
        label: "删除",
        divided: true,
        onClick: deleteAll,
      };
    }

    const deleteOption: MenuItem = {
      label: "删除",
      divided: true,
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
            const onPositiveClick = async () => {
              await store.api.course.update(props.course, {...props.course, dates: restDates}, (newCourse) => {
                store.courses = store.courses.filter(c => c.id !== props.course.id).concat([newCourse]);
                message.success("删除成功");
              }, () => message.error("删除失败，请检查网络连接"));
            };
            store.localConfig.thinkTwice ? dialog.warning({
              title: "请注意",
              content: `${date}(第${store.getWeekNumOfSomeDate(date)}周)第${props.course.lessonNum}节的“${props.course.info.name}”将会被删除，是否继续？`,
              positiveText: "确定",
              negativeText: "取消",
              onPositiveClick,
            }) : onPositiveClick();
          }
        },
      });
    }

    return deleteOption;
  },
  copyJson(): MenuItem {
    return {
      label: "Json(数据库中的原始数据)",
      onClick: async () => {
        await toClipboard(JSON.stringify(props.course));
        message.info("已复制到剪切板");
      },
    };
  },
};

function onContextMenu(e: MouseEvent) {
  if (props.editData) {
    e.preventDefault();
    e.stopPropagation();
    ContextMenu.showContextMenu({
      x: e.pageX,
      y: e.pageY,
      items: [
        optionGetters.edit(),
        optionGetters.copy(),
        optionGetters.cut(),
        optionGetters.delete(),
        ...(getContextMenuItems(routeFilter?.value?.sources?.grades ?? store.grades, props.course.lessonNum,
            props.editData?.queryDate ?? store.todayDate, !!props.isDateMode) ?? []),
      ],
    });
  }
}
</script>

<template>
  <CourseCard @contextmenu="onContextMenu($event)"
              :course="course" :is-date-mode="isDateMode"
              :show-weeks="showWeeks" :show-grade="showGrade"
              :show-what-day="showWhatDay" :show-lesson-time="showLessonTime"/>
</template>

<style scoped>

</style>
