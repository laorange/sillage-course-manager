<script setup lang="ts">
import {Course} from "../../assets/ts/types";
import {useStore} from "../../pinia/useStore";
import {computed, ref, watch} from "vue";
import CourseBox from "./CourseBox/CourseBox.vue";
import {CourseDecorator} from "../../assets/ts/courseToolkit";
import {formatDate, getIsoWeekDay} from "../../assets/ts/datetimeUtils";
import dayjs from "dayjs";
import QueryDatePicker from "./QueryDatePicker/QueryDatePicker.vue";

const props = defineProps<{ courses: Course[], editable?: boolean, queryDate?: string, showGrade?: boolean }>();

const store = useStore();
const queryDate = ref<string>(props.queryDate ?? formatDate(dayjs()));
const queryDay = computed(() => dayjs(queryDate.value));
const queryWhatDay = computed<number>(() => getIsoWeekDay(queryDay.value));

const isDateMode = ref<boolean>(store.localConfig.isDateMode);
watch(() => isDateMode.value, newMode => store.localConfig.isDateMode = newMode);

const courseDecoratorOfThisWeeklyTable = computed<CourseDecorator>(() => {
  // 非日期模式，则返回当前学期的所有课
  if (!isDateMode.value) return new CourseDecorator(props.courses);
  // 日期模式，则返回当前周的课
  return (new CourseDecorator(props.courses)).isInSameWeek(dayjs(queryDate.value));
});
</script>

<template>
  <QueryDatePicker v-model:is-date-mode="isDateMode" v-model:query-date="queryDate"/>

  <n-grid cols="22" x-gap="2" y-gap="2">
    <n-gi span="1"></n-gi>
    <n-gi span="3" v-for="whatDayStr in [...`一二三四五六天`]" :key="`星期${whatDayStr}`">{{ store.translate(`星期${whatDayStr}`) }}</n-gi>

    <template v-if="isDateMode">
      <n-gi span="1">{{ store.translate(`日期`) }}</n-gi>
      <n-gi span="3" v-for="whatDay in 7" :key="`whatDay-date-${whatDay}`">{{ formatDate(queryDay.add(whatDay - queryWhatDay, "day")) }}</n-gi>
    </template>

    <template v-for="(lessonConfig, lessonIndex) of store.config.content.lessonConfigs" :key="`weeklyLesson${lessonIndex}`">
      <n-gi span="1">
        <div class="lesson-start-end-time">
          <div>{{ lessonConfig.start }}</div>
          <div>{{ lessonConfig.end }}</div>
        </div>
      </n-gi>

      <n-gi span="3" v-for="whatDay of 7" :key="`whatDay${whatDay}lessonIndex${lessonIndex}`">
        <CourseBox :query-date="formatDate(queryDay.add(whatDay-queryWhatDay, 'day'))"
                   :is-date-mode="isDateMode"
                   :lesson-num="lessonIndex+1"
                   :editable="editable"
                   :show-grade="showGrade"
                   :show-weeks="!isDateMode"
                   :courses="courseDecoratorOfThisWeeklyTable.ofWhatDay(whatDay).ofLessonNum(lessonIndex+1).value"/>
      </n-gi>
    </template>
  </n-grid>
</template>

<style scoped>
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
