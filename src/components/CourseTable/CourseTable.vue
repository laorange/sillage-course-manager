<script setup lang="ts">
import {useRoute} from "vue-router";
import {useStore} from "../../pinia/useStore";
import {computed} from "vue";
import CourseEditDialog from "./CourseEditDialog.vue";
import WeeklyCourseTable from "./WeeklyCourseTable.vue";

const route = useRoute();
const store = useStore();

const grade = computed(() => (route.query.grade ?? "") as string);

const coursesOfThisGrade = computed(() => store.courseOfCurrentSemester.ofGrade(grade.value));
</script>

<template>
  <CourseEditDialog/>

  <h1>{{ store.config.tableName }}</h1>
  <h2>{{ route.query.grade }}</h2>

  <WeeklyCourseTable :courses="coursesOfThisGrade.value" :editable="store.authenticated"/>
</template>

<style scoped>

</style>
