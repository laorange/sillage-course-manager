<script setup lang="ts">
import {CoursesHandler} from "../../assets/ts/courseToolkit";
import {computed} from "vue";

const emits = defineEmits<{ (event: "setLessonNum", lessonNum: number): void }>();
const props = defineProps<{ room: string, lessonNum: number, coursesHandler: CoursesHandler }>();

const isOccupied = computed(() => props.coursesHandler.value.length > 0);
const backgroundColor = computed(() => isOccupied.value ? "#fd8888" : "#c1ffaa");

function emitIfOccupied() {
  if (isOccupied.value) {
    emits(`setLessonNum`, props.lessonNum);
  }
}
</script>

<template>
  <div class="room-info-card" :class="{occupied: isOccupied}"
       :style="{backgroundColor: backgroundColor}"
       @click="emitIfOccupied">
    {{ lessonNum }}
  </div>
</template>

<style scoped>
.room-info-card {
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: center;
  align-items: center;
  align-content: center;
  user-select: none;
}

.room-info-card {
  border-left: var(--border-color) 1px solid;
}

.room-info-card:first-child {
  border-left: 0;
}

.occupied {
  user-select: none;
  cursor: pointer;
}
</style>
