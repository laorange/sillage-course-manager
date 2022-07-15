<script setup lang="ts">
import {Course} from "../../../assets/ts/types";
import CourseCard from "./CourseCard.vue";

withDefaults(defineProps<{ courses: Course[], columnThreshold?: number }>(), {columnThreshold: 3});

</script>

<template>
  <div class="course-box">
    <!-- 如果此处没有课 -->
    <div class="box-no-more-than-three" v-if="courses.length===0">
      <div class="card-no-more-than-three" :style="{backgroundColor: '#efefef'}">
        <n-space :vertical="true">
          <div>{{ "No Course" }}</div>
          <van-icon name="smile-comment-o" size="30px"/>
        </n-space>
      </div>
    </div>

    <!-- 3节课以内 -->
    <div class="box-no-more-than-three" v-if="courses.length>0 && courses.length<=columnThreshold">
      <div class="card-no-more-than-three"
           v-for="course in courses" :key="course.id">
        <course-card :course="course"/>
      </div>
    </div>

    <!-- 4节及以上的课 -->
    <div class="box-more-than-three" v-if="courses.length>columnThreshold">
      <div class="card-more-than-three"
           :style="{flex: `0 0 ${Math.round(100/courses.length)}`}"
           v-for="course in courses" :key="course.id">
        <course-card :course="course"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.box-no-more-than-three, .box-more-than-three {
  display: flex;
  flex-direction: row;
  width: 100%;
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
  min-width: 200px;
}
</style>
