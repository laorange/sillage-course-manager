<script setup lang="ts">
import {Course} from "../../../assets/ts/types";
import {useStore} from "../../../pinia/useStore";
import {computed, inject, Ref, ref, watch} from "vue";
import CourseBox from "../CourseBox/CourseBox.vue";
import {CoursesHandler} from "../../../assets/ts/courseToolkit";
import {formatDate, getIsoWeekDay} from "../../../assets/ts/datetimeUtils";
import dayjs from "dayjs";
import QueryDatePicker from "../QueryDatePicker/QueryDatePicker.vue";
import AdaptiveContainerWithFixedPixel from "../../../components/AdaptiveContainerWithFixedPixel.vue";
import WeeklyCourseTableHeader from "./WeeklyCourseTableHeader.vue";
import RouteFilter from "../RouteFilter/RouteFilter.vue";

const props = defineProps<{ courses: Course[], editable?: boolean, queryDate?: string, showGrade?: boolean }>();

const store = useStore();
const queryDateLocal = ref<string>(props.queryDate ?? formatDate(dayjs()));
const queryDayLocal = computed(() => dayjs(queryDateLocal.value));
const queryWhatDayLocal = computed<number>(() => getIsoWeekDay(queryDayLocal.value));

const routeFilter = inject("routeFilter") as Ref<typeof RouteFilter>;
const lockPage = computed(() => routeFilter?.value?.showFilterDialog);

const isDateMode = ref<boolean>(store.localConfig.isDateMode);
watch(() => isDateMode.value, newMode => store.localConfig.isDateMode = newMode);

const courseDecoratorOfThisWeeklyTable = computed<CoursesHandler>(() => {
  // 非日期模式，则返回当前学期的所有课
  if (!isDateMode.value) return store.filterCurrentSemesterCourses(new CoursesHandler(props.courses));
  // 日期模式，则返回当前周的课
  return (new CoursesHandler(props.courses)).isInSameWeek(dayjs(queryDateLocal.value));
});
</script>

<template>
  <QueryDatePicker v-model:is-date-mode="isDateMode" v-model:query-date="queryDateLocal" :lock-page="lockPage"/>

  <div class="weekly-course-table">
    <AdaptiveContainerWithFixedPixel :width="1200">
      <WeeklyCourseTableHeader :query-day="queryDayLocal" :is-date-mode="isDateMode"/>

      <n-grid cols="22" x-gap="2" y-gap="2">
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
                       :courses="courseDecoratorOfThisWeeklyTable.ofWhatDay(whatDay).ofLessonNum(lessonIndex+1).value"/>
          </n-gi>
        </template>
      </n-grid>
    </AdaptiveContainerWithFixedPixel>
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

.n-grid > * {
  border: 2px solid var(--border-color);
}
</style>
