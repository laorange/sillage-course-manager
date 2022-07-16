<script setup lang="ts">
import {Course, Situation} from "../../../assets/ts/types";
import {computed} from "vue";
import dayjs from "dayjs";
import {getWeekAmountBetweenTwoDay} from "../../../assets/ts/datetimeUtils";
import {useStore} from "../../../pinia/useStore";
import getWeeksString from "../../../assets/ts/getWeeksString";
import {parseFontColor} from "../../../assets/ts/useColorParser";
import useContextMenu from "../../../assets/ts/useContextMenu";

const props = defineProps<{ course: Course }>();

const store = useStore();
const {$contextmenu} = useContextMenu();

const weeks = computed<number[]>(() => props.course.dates.map(d => getWeekAmountBetweenTwoDay(store.semesterStartDay, dayjs(d)) + 1));

function getSituationStr(situation: Situation) {
  return [situation.groups.join("&"), situation.teacher, situation.room].filter(s => !!s).join(" ");
}

function onContextMenu(e: MouseEvent, cSelected: Course) {
  e.preventDefault();
  $contextmenu({
    x: e.pageX,
    y: e.pageY,
    items: [
      {
        label: "编辑",
        onClick: () => {
          alert("编辑" + JSON.stringify(cSelected));
        },
      },
      {
        label: "复制",
        onClick: () => {
          alert("复制" + JSON.stringify(cSelected));
        },
      },
      {
        label: "剪切",
        onClick: () => {
          alert("剪切" + JSON.stringify(cSelected));
        },
      },
      {
        label: "删除",
        onClick: () => {
          alert("删除" + JSON.stringify(cSelected));
        },
      },
    ],
  });
}
</script>

<template>
  <div class="course-card" @contextmenu="onContextMenu($event, course)"
       :style="{backgroundColor: course.info.bgc, color: parseFontColor(course.info.bgc)}">
    <div v-if="course.info.code">{{ course.info.code }}</div>
    <div>{{ course.info.name }}</div>
    <div v-if="course.method">{{ course.method }}</div>
    <div>{{ getWeeksString(weeks) }}</div>

    <!--  situations  -->
    <template v-if="course.situations.length===1">
      <div v-if="course.situations[0].groups.length">{{ course.situations[0].groups.join("&") }}</div>
      <div v-if="course.situations[0].teacher">{{ course.situations[0].teacher }}</div>
      <div v-if="course.situations[0].room">{{ course.situations[0].room }}</div>
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
  user-select: none;
  min-width: var(--courseCardMinWidth);
  min-height: var(--courseCardMinHeight);
}

.course-card-situations {
  display: flex;
  justify-content: center;
  flex-direction: row;
}
</style>
