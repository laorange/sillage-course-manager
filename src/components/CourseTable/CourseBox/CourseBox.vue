<script setup lang="ts">
import {Course} from "../../../assets/ts/types";
import CourseCard from "./CourseCard.vue";
import EmptyCourseCard from "./EmptyCourseCard.vue";

defineProps<{ courses: Course[], lessonNum: number, editable?: boolean }>();

</script>

<template>
  <!-- 如果此处没有课 -->
  <div class="course-box" v-if="courses.length===0">
    <template v-if="editable">
      <EmptyCourseCard :lesson-num="lessonNum" :courses-existing="courses"/>
    </template>
  </div>

  <div class="course-box" v-else>
    <div class="course-card-container" v-for="course in courses" :key="course.id">
      <CourseCard :lesson-num="lessonNum" :course="course" :courses-existing="courses" :editable="editable"/>
    </div>
    <div class="empty-course-card" v-if="editable">
      <EmptyCourseCard :lesson-num="lessonNum" :courses-existing="courses"/>
    </div>
  </div>
</template>

<style scoped>
.course-card-container + .course-card-container, .course-card-container + .empty-course-card {
  border-left: var(--border-color) 1px solid;
}

.course-box {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  min-height: 150px;
}

.course-card-container {
  width: 100%;
}
</style>
