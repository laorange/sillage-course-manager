<script setup lang="ts">
import {CoursesHandler} from "../../assets/ts/courseToolkit";
import {useStore} from "../../pinia/useStore";
import RoomInfoCard from "./RoomInfoCard.vue";
import {inject, ref, Ref, watch} from "vue";
import CourseBox from "../course/CourseBox/CourseBox.vue";

const props = defineProps<{ room: string, coursesHandler: CoursesHandler }>();

const store = useStore();

const roomQueryDate = inject("roomQueryDate") as Ref<string>;

const lessonNumActivated = ref<number>(0);

function setLessonNum(lessonNum: number) {
  lessonNumActivated.value = lessonNum;
}

watch(() => props.coursesHandler, () => {
  if (lessonNumActivated.value !== 0) {
    setLessonNum(0);
  }
}, {deep: false});
</script>

<template>
  <div class="room-info-box">
    <template v-for="lessonNum in store.config.content.lessonConfigs.length" :key="`RoomInfoCard-lessonNum${lessonNum}`">
      <transition name="room-info-card">
        <RoomInfoCard v-if="lessonNum!==lessonNumActivated"
                      @setLessonNum="setLessonNum" :lesson-num="lessonNum" :room="room"
                      :courses-handler="coursesHandler.ofLessonNum(lessonNum)"/>
      </transition>

      <transition name="room-info-course-box">
        <div class="room-info-course-box-container" v-if="lessonNum===lessonNumActivated">
          <CourseBox :lesson-num="lessonNumActivated" :is-date-mode="true"
                     :query-date="roomQueryDate" :editable="false"
                     :show-grade="true" :show-lesson-time="true" :show-weeks="true"
                     :courses="coursesHandler.ofLessonNum(lessonNumActivated).value"
          />
        </div>
      </transition>
    </template>

    <template v-if="lessonNumActivated!==0">
      <teleport to="#app">
        <div class="room-info-course-box-mask" @click.prevent="setLessonNum(0)"/>
      </teleport>
    </template>
  </div>
</template>

<style scoped>
.room-info-box {
  display: flex;
  justify-items: center;
  align-items: center;
  height: 100%;
  background-color: #c1ffaa;
}

.room-info-course-box-mask {
  width: 100%;
  height: 98vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(200, 200, 200, 3%);
  z-index: 98;
  cursor: pointer;
}

.room-info-course-box-container {
  z-index: 99;
  background-color: var(--border-color);
  border: 3px var(--border-color) solid;
  border-radius: 3px;
}

.room-info-course-box-enter-from, .room-info-course-box-leave-to {
  transform: scale(0);
  transform-origin: center;
}

.room-info-course-box-enter-to, .room-info-course-box-leave-from {
  transform: scale(1);
}

.room-info-course-box-enter-active, .room-info-course-box-leave-active {
  transition: all 0.3s linear;
}

.room-info-card-enter-from {
  transform: scale(0);
  transform-origin: center;
}

.room-info-card-enter-to {
  transform: scale(1);
}

.room-info-card-enter-active {
  transition: all 0.3s linear;
  transition-delay: 0.3s;
}
</style>
