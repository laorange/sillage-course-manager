<script setup lang="ts">
import {Course, Situation} from "../../../assets/ts/types";
import {computed} from "vue";
import dayjs from "dayjs";
import {getWeekAmountBetweenTwoDay} from "../../../assets/ts/datetimeUtils";
import {useStore} from "../../../pinia/useStore";
import getWeeksString from "../../../assets/ts/getWeeksString";
import {parseFontColor} from "../../../assets/ts/useColorParser";

const props = defineProps<{ course: Course }>();

const store = useStore();

const weeks = computed<number[]>(() => props.course.dates.map(d => getWeekAmountBetweenTwoDay(store.semesterStartDay, dayjs(d)) + 1));

function getSituationStr(situation: Situation) {
  return [situation.groups.join("&"), situation.teacher, situation.room].filter(s => !!s).join(" ");
}
</script>

<template>
  <div class="course-card" :style="{backgroundColor: course.info.bgc, color: parseFontColor(course.info.bgc)}">
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
  min-height: 150px;
}

.course-card-situations {
  display: flex;
  justify-content: center;
  flex-direction: row;
}
</style>
