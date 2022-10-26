<script setup lang="ts">
import {CoursesHandler} from "../../assets/ts/courseToolkit";
import {useStore} from "../../pinia/useStore";
import RoomInfoCard from "./RoomInfoCard.vue";

const props = defineProps<{ room: string, coursesHandler: CoursesHandler }>();

const store = useStore();
</script>

<template>
  <div class="room-info-box">
    <template v-for="lessonNum in store.config.content.lessonConfigs.length" :key="`RoomInfoCard-lessonNum${lessonNum}`">
      <RoomInfoCard :courses-handler="coursesHandler.ofLessonNum(lessonNum)" :lesson-num="lessonNum" :room="room"/>
    </template>
  </div>
</template>

<style scoped>
.room-info-box {
  display: flex;
  justify-items: center;
  align-items: center;
}
</style>
