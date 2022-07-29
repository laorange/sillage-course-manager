<script setup lang="ts">
import {Course} from "../../assets/ts/types";
import {useStore} from "../../pinia/useStore";
import {computed, ref, watch} from "vue";
import CourseBox from "./CourseBox/CourseBox.vue";
import {CourseDecorator} from "../../assets/ts/courseToolkit";
import {formatDate, getIsoWeekDay} from "../../assets/ts/datetimeUtils";
import dayjs from "dayjs";
import QueryDatePicker from "./QueryDatePicker/QueryDatePicker.vue";

const props = defineProps<{ courses: Course[], editable?: boolean }>();

const store = useStore();

const queryDate = ref<string>(formatDate(dayjs()));
const isDateMode = ref<boolean>(store.localConfig.isDateMode);
watch(() => isDateMode.value, newMode => store.localConfig.isDateMode = newMode);

const whatDayFrom0 = computed<number>({
  get: () => getIsoWeekDay(dayjs(queryDate.value)) - 1,
  set: (to) => {
    let queryDay = dayjs(queryDate.value);
    queryDate.value = formatDate(queryDay.add(to + 1 - getIsoWeekDay(queryDay), "day"));
  },
});

const coursesOfWhatDay = computed<CourseDecorator>(() => {
  let _cd = (new CourseDecorator(props.courses).ofWhatDay(getIsoWeekDay(dayjs(queryDate.value))));
  return isDateMode.value ? _cd.isInSameWeek(dayjs(queryDate.value)) : _cd;
});
</script>

<template>
  <QueryDatePicker v-model:is-date-mode="isDateMode" v-model:query-date="queryDate"/>

  <div class="what-day-selector">
    <van-tabs type="card" color="#32647d" :background="`transparent`" v-model:active="whatDayFrom0">
      <van-tab :title="store.translate(`星期${whatDayStr}`)" v-for="whatDayStr in Array.from(`一二三四五六天`)" :key="`星期${whatDayStr}`"/>
    </van-tabs>
  </div>

  <div class="course-table-body">
    <div class="course-table-row" v-for="(lessonConfig, row0) in store.config.content.lessonConfigs" :key="`lessonNum${row0}`">
      <div class="lesson-start-end-time">
        <div>{{ lessonConfig.start }}</div>
        <div>{{ lessonConfig.end }}</div>
      </div>
      <div class="course-table-block">
        <CourseBox :query-date="queryDate"
                   :is-date-mode="isDateMode"
                   :lesson-num="row0+1"
                   :editable="editable"
                   :courses="coursesOfWhatDay.ofLessonNum(row0+1).value"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.what-day-selector {
  margin-bottom: 10px;
}

.course-table-body {
  display: flex;
  flex-direction: column;
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
