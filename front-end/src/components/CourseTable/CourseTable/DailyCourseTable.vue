<script setup lang="ts">
import {Course} from "../../../assets/ts/types";
import {useStore} from "../../../pinia/useStore";
import {computed, ref, watch} from "vue";
import CourseBox from "../CourseBox/CourseBox.vue";
import {CoursesHandler} from "../../../assets/ts/courseToolkit";
import {formatDate, getIsoWeekDay} from "../../../assets/ts/datetimeUtils";
import dayjs from "dayjs";
import QueryDatePicker from "../QueryDatePicker/QueryDatePicker.vue";
import WhatDaySelector from "../CourseBox/WhatDaySelector.vue";

const props = withDefaults(defineProps<{
  courses: Course[], editable?: boolean, queryDate?: string,
  showGrade?: boolean, showDateSelector?: boolean, showWhatDaySelector?: boolean, showLessonTime?: boolean
}>(), {showWhatDaySelector: true, showDateSelector: true, showLessonTime: true});

const store = useStore();

const queryDate = ref<string>(props.queryDate ?? formatDate(dayjs()));
const isDateMode = ref<boolean>(store.localConfig.isDateMode);
watch(() => isDateMode.value, newMode => store.localConfig.isDateMode = newMode);

const coursesOfWhatDay = computed<CoursesHandler>(() => {
  let coursesFilteredByWhatDay = (new CoursesHandler(props.courses).ofWhatDay(getIsoWeekDay(dayjs(queryDate.value))));
  if (isDateMode.value) {
    // 日期模式：筛选与查询日期同一周的课程
    return coursesFilteredByWhatDay.isInSameWeek(dayjs(queryDate.value));
  } else {
    // 星期模式：筛选当前学期的课程
    return store.filterCurrentSemesterCourses(coursesFilteredByWhatDay);
  }
});
</script>

<template>
  <QueryDatePicker v-if="showDateSelector" v-model:is-date-mode="isDateMode" v-model:query-date="queryDate"/>

  <WhatDaySelector v-if="showWhatDaySelector" v-model:date="queryDate"/>

  <div class="course-table-body">
    <div class="course-table-row" v-for="(lessonConfig, row0) in store.config.content.lessonConfigs" :key="`lessonNum${row0}`">
      <div class="lesson-start-end-time" v-if="showLessonTime">
        <div>{{ lessonConfig.start }}</div>
        <div>{{ lessonConfig.end }}</div>
      </div>
      <div class="course-table-block">
        <CourseBox :query-date="queryDate"
                   :is-date-mode="isDateMode"
                   :lesson-num="row0+1"
                   :editable="editable"
                   :show-grade="showGrade"
                   :show-weeks="!isDateMode"
                   :courses="coursesOfWhatDay.ofLessonNum(row0+1).value"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-table-body {
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  border-top: var(--border-color) 1px solid;
  border-left: var(--border-color) 1px solid;
}

.course-table-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  min-height: 50px;
  border-bottom: var(--border-color) 1px solid;
}

.lesson-start-end-time {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: var(--border-color) 1px solid;
}

.course-table-block {
  min-width: 10vw;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: var(--border-color) 1px solid;
}
</style>
