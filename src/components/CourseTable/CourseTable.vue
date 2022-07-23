<script setup lang="ts">
import {useRoute} from "vue-router";
import {useStore} from "../../pinia/useStore";
import {computed} from "vue";
import CourseEditDialog from "./CourseEditDialog.vue";
import WeeklyCourseTable from "./WeeklyCourseTable.vue";
import dayjs from "dayjs";
import {getIsoWeekDay} from "../../assets/ts/datetimeUtils";
import GradeTab from "./CourseEditor/GradeTab.vue";

const route = useRoute();
const store = useStore();

const grade = computed(() => (route.query.grade ?? "") as string);

const coursesOfThisGrade = computed(() => store.courseOfCurrentSemester.ofGrade(grade.value));

const inDevelopMode: boolean = import.meta.env.MODE === "development";
</script>

<template>
  <CourseEditDialog/>

  <h1>{{ store.translate(store.config.tableName) }}</h1>

  <GradeTab/>

  <div style="margin-bottom: 10px" v-if="inDevelopMode">
    <n-switch v-model:value="store.editor.authenticated">
      <template #checked>编辑权限：开（用于测试）</template>
      <template #unchecked>编辑权限：关（用于测试）</template>
    </n-switch>
  </div>

  <WeeklyCourseTable :what-day="getIsoWeekDay(dayjs())" :courses="coursesOfThisGrade.value" :editable="store.authenticated"/>
</template>

<style scoped>

</style>
