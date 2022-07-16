<script setup lang="ts">
import {onBeforeRouteUpdate, useRoute} from "vue-router";
import {useStore} from "../../pinia/useStore";
import CourseBox from "./CourseBox/CourseBox.vue";
import {computed, ref} from "vue";
import {CourseFilter} from "../../assets/ts/courseFilter";

onBeforeRouteUpdate((to) => {
  if (!(to.query.grade)) {
    return {name: "docs"};
  }
});

const route = useRoute();
const store = useStore();

const whatDay = ref<number>(1);
const whatDayStrList = Array.from("一二三四五六天");

const courseGradeFilter = computed<CourseFilter>(() => (new CourseFilter(store.courses)).filterByGrade(route.query.grade as string));
const courseGradeWhatDayFilter = computed<CourseFilter>(() => (new CourseFilter(courseGradeFilter.value)).filterByWhatDay(whatDay.value));
</script>

<template>
  <h1>{{ store.config.tableName }}</h1>
  <h2>{{ route.query.grade }}</h2>

  <div class="what-day-selector">
    <van-tabs type="card" color="#27a05a" v-model:active="whatDay">
      <van-tab :title="`星期${whatDayStr}`" v-for="(whatDayStr, wdi) in whatDayStrList" :key="`星期${whatDayStr}`" @click="whatDay=wdi+1"/>
    </van-tabs>
  </div>

  <div class="course-table-body">
    <div class="course-table-row" v-for="(lessonConfig, row0) in store.config.lessonConfigs" :key="`lessonNum${row0}`">
      <div class="lesson-start-end-time">
        <div>{{ lessonConfig.start }}</div>
        <div>{{ lessonConfig.end }}</div>
      </div>
      <div class="course-table-block">
        <CourseBox :courses="courseGradeWhatDayFilter.filterByLessonNum(row0+1).value"/>
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
  border-top: black 1px solid;
  border-left: black 1px solid;
}

.course-table-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  min-height: 50px;
  border-bottom: black 1px solid;
}

.lesson-start-end-time {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: black 1px solid;
}

.course-table-block {
  min-width: 10vw;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: black 1px solid;
}
</style>
