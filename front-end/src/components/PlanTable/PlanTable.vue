<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {ref} from "vue";
import {Course} from "../../assets/ts/types";
import RouteFilter from "../CourseTable/RouteFilter/RouteFilter.vue";
import PlanTableBody from "./PlanTableBody.vue";

const store = useStore();

const showGrade = ref<boolean>(false);
const filteredCourses = ref<Course[]>([]);
</script>

<template>
  <h1>{{ store.translate(`教学计划`) }}</h1>
  <RouteFilter v-model:courses="filteredCourses" v-model:show-grade="showGrade"/>
  <PlanTableBody :courses="filteredCourses"/>
</template>

<style scoped>

</style>
