<script setup lang="ts">
import {Course} from "../../../assets/ts/types";
import {useStore} from "../../../pinia/useStore";
import {computed, ref, watch} from "vue";
import CourseBox from "../CourseBox/CourseBox.vue";
import {CourseDecorator} from "../../../assets/ts/courseToolkit";
import {formatDate, getIsoWeekDay} from "../../../assets/ts/datetimeUtils";
import dayjs from "dayjs";
import QueryDatePicker from "../QueryDatePicker/QueryDatePicker.vue";

const props = defineProps<{ courses: Course[], editable?: boolean, queryDate?: string, showGrade?: boolean }>();

const store = useStore();
const queryDateLocal = ref<string>(props.queryDate ?? formatDate(dayjs()));
const queryDayLocal = computed(() => dayjs(queryDateLocal.value));
const queryWhatDayLocal = computed<number>(() => getIsoWeekDay(queryDayLocal.value));

const isDateMode = ref<boolean>(store.localConfig.isDateMode);
watch(() => isDateMode.value, newMode => store.localConfig.isDateMode = newMode);

const courseDecoratorOfThisWeeklyTable = computed<CourseDecorator>(() => {
  // 非日期模式，则返回当前学期的所有课
  if (!isDateMode.value) return store.filterCurrentSemesterCourses(new CourseDecorator(props.courses));
  // 日期模式，则返回当前周的课
  return (new CourseDecorator(props.courses)).isInSameWeek(dayjs(queryDateLocal.value));
});

const weeklyCourseTableWidth = computed<number>(() => {
  const DEFAULT_WIDTH = 1440;
  return Math.max(document.body.clientWidth, DEFAULT_WIDTH);
});

const weeklyCourseTableScaleNum = computed<number>(() => document.body.clientWidth / weeklyCourseTableWidth.value);
</script>

<template>
  <QueryDatePicker v-model:is-date-mode="isDateMode" v-model:query-date="queryDateLocal"/>

  <div class="weekly-course-table"
       :style="{width: `${weeklyCourseTableWidth}px`, zoom: weeklyCourseTableScaleNum}">
    <n-grid cols="22" x-gap="2" y-gap="2">
      <n-gi span="1"></n-gi>
      <n-gi span="3" v-for="whatDayStr in [...`一二三四五六天`]" :key="`星期${whatDayStr}`">{{ store.translate(`星期${whatDayStr}`) }}</n-gi>

      <template v-if="isDateMode">
        <n-gi span="1">{{ store.translate(`日期`) }}</n-gi>
        <n-gi span="3" v-for="whatDay in 7" :key="`whatDay-date-${whatDay}`">
          {{formatDate(queryDayLocal.add(whatDay - queryWhatDayLocal, "day"))}}
        </n-gi>
      </template>

      <template v-for="(lessonConfig, lessonIndex) of store.config.content.lessonConfigs" :key="`weeklyLesson${lessonIndex}`">
        <n-gi span="1">
          <div class="lesson-start-end-time">
            <div>{{ lessonConfig.start }}</div>
            <div>{{ lessonConfig.end }}</div>
          </div>
        </n-gi>

        <n-gi span="3" v-for="whatDay of 7" :key="`whatDay${whatDay}lessonIndex${lessonIndex}`">
          <CourseBox :query-date="formatDate(queryDayLocal.add(whatDay-queryWhatDayLocal, 'day'))"
                     :is-date-mode="isDateMode"
                     :lesson-num="lessonIndex+1"
                     :editable="editable"
                     :show-grade="showGrade"
                     :show-weeks="!isDateMode"
                     :courses="courseDecoratorOfThisWeeklyTable.ofWhatDay(whatDay).ofLessonNum(lessonIndex+1).value"/>
        </n-gi>
      </template>
    </n-grid>
  </div>
</template>

<style scoped>
.weekly-course-table {
  transform-origin: 0 0;
}

.lesson-start-end-time {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
}

.n-grid > div {
  border: 1px solid var(--border-color);
}
</style>
