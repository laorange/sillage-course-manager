<script setup lang="ts">
import {Course, Situation} from "../../../assets/ts/types";
import {computed} from "vue";
import dayjs from "dayjs";
import {getWeekAmountBetweenTwoDay} from "../../../assets/ts/datetimeUtils";
import {useStore} from "../../../pinia/useStore";
import getWeeksString from "../../../assets/ts/getWeeksString";
import {parseFontColor} from "../../../assets/ts/useColorParser";
import useContextMenu from "../../../assets/ts/useContextMenu";
import {useDialog, useMessage} from "naive-ui";

const props = defineProps<{ course: Course, coursesExisting: Course[], whatDay: number, lessonNum: number, editable?: boolean }>();

const store = useStore();
const message = useMessage();
const dialog = useDialog();
const {$contextmenu} = useContextMenu();

const weeks = computed<number[]>(() => props.course.dates.map(d => getWeekAmountBetweenTwoDay(store.semesterStartDay, dayjs(d)) + 1));

function getSituationStr(situation: Situation) {
  return [situation.groups.map(g => store.translate(g)).join("&"), store.translate(situation.teacher), store.translate(situation.room)].filter(s => !!s).join(" | ");
}

function onContextMenu(e: MouseEvent) {
  if (props.editable) {
    e.preventDefault();
    $contextmenu({
      x: e.pageX,
      y: e.pageY,
      items: [
        {
          label: "编辑",
          onClick: () => {
            store.editor.show = true;
            store.editor.mode = "edit";
            store.editor.whatDay = props.whatDay;
            store.editor.lessonNum = props.lessonNum;
            store.editor.courseEditing = props.course;
          },
        },
        {
          label: "复制",
          onClick: () => {
            store.editor.mode = "copy";
            store.editor.courseEditing = props.course;
            message.success("已复制");
          },
        },
        {
          label: "剪切",
          onClick: () => {
            store.editor.mode = "cut";
            store.editor.courseEditing = props.course;
            message.success("已剪切");
          },
        },
        {
          label: "删除",
          onClick: () => {
            dialog.warning({
              title: "请注意",
              content: `这节“${props.course.info.name}”将会被删除，是否继续？`,
              positiveText: "确定",
              negativeText: "取消",
              onPositiveClick: () => {
                store.client.Records.delete("course", props.course.id).then(() => {
                  store.courses = store.courses.filter(c => c.id !== props.course.id);
                  message.success("删除成功");
                }).catch(() => message.error("删除失败，请检查网络连接"));
              },
            });
          },
        },
      ],
    });
  }
}

const getWeekStrWithUnit = computed<string>(() => {
  let weekStr = getWeeksString(weeks.value);
  let _weekUnitStr = store.translate("星期");
  return _weekUnitStr === "星期" ? `第${weekStr}周` : `${_weekUnitStr} ${weekStr}`;
});
</script>

<template>
  <div class="course-card" @contextmenu="onContextMenu($event)"
       :style="{backgroundColor: course.info.bgc, color: parseFontColor(course.info.bgc)}">
    <div v-if="course.info.code">{{ store.translate(course.info.code) }}</div>
    <div>{{ store.translate(course.info.name) }}</div>
    <div v-if="course.method">{{ store.translate(course.method) }}</div>
    <div>{{ getWeekStrWithUnit }}</div>

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
