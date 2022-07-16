<script setup lang="ts">
import {Course} from "../../../assets/ts/types";
import CourseCard from "./CourseCard.vue";
import EmptyCourseCard from "./EmptyCourseCard.vue";

withDefaults(defineProps<{ courses: Course[], whatDay: number, lessonNum: number, columnThreshold?: number }>(), {columnThreshold: 3});

</script>

<template>
  <div class="course-box">
    <!-- 如果此处没有课 -->
    <div class="box-no-more-than-three" v-if="courses.length===0">
      <EmptyCourseCard :what-day="whatDay" :lesson-num="lessonNum" :courses-existing="courses"/>
    </div>

    <!-- 3节课以内 -->
    <div class="box-no-more-than-three" v-if="courses.length>0 && courses.length<=columnThreshold">
      <div class="card-no-more-than-three" v-for="course in courses" :key="course.id">
        <CourseCard :what-day="whatDay" :lesson-num="lessonNum" :course="course" :courses-existing="courses"/>
      </div>
      <EmptyCourseCard :what-day="whatDay" :lesson-num="lessonNum" :courses-existing="courses"/>
    </div>

    <!-- 4节及以上的课 -->
    <div class="box-more-than-three" v-if="courses.length>columnThreshold">
      <div class="card-more-than-three"
           :style="{flex: `0 0 ${Math.round(100/courses.length)}`}"
           v-for="cLoop in courses" :key="cLoop.id">
        <CourseCard :what-day="whatDay" :lesson-num="lessonNum" :course="cLoop" :courses-existing="courses"/>
      </div>
      <EmptyCourseCard :what-day="whatDay" :lesson-num="lessonNum" :courses-existing="courses"/>
    </div>
  </div>
</template>

<style scoped>
.box-no-more-than-three, .box-more-than-three {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow-x: auto;
}

.card-no-more-than-three + .card-no-more-than-three, .card-more-than-three + .card-more-than-three {
  padding-left: 1px;
}

.card-no-more-than-three, .card-more-than-three {
  width: 100%;
}

.card-no-more-than-three {

}

.card-more-than-three {

}
</style>
