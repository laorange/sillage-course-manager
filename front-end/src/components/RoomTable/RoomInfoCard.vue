<script setup lang="ts">
import {CoursesHandler} from "../../assets/ts/courseToolkit";
import {computed, inject, ref, Ref} from "vue";
import CourseBox from "../CourseTable/CourseBox/CourseBox.vue";
import {useStore} from "../../pinia/useStore";

const props = defineProps<{ room: string, lessonNum: number, coursesHandler: CoursesHandler }>();

const store = useStore();

const roomQueryDate = inject("roomQueryDate") as Ref<string>;

const adaptiveContainerWithFixedPixel: any = inject("adaptiveContainerWithFixedPixel");
const containerScaleNum = computed(() => adaptiveContainerWithFixedPixel?.value?.containerScaleNum ?? 1 as number);

const isOccupied = computed(() => props.coursesHandler.value.length > 0);
const backgroundColor = computed(() => isOccupied.value ? "#fd8888" : "#c1ffaa");

const courseDialogTop = ref<number>(0);
const courseDialogLeft = ref<number>(0);
const showDialog = ref<boolean>(false);

function refreshPosition(e: MouseEvent) {
  if (props.coursesHandler.value.length > 0) {
    showDialog.value = true;

    const BOX_WIDTH = 150;
    const BOX_HEIGHT = 150;

    courseDialogLeft.value = Math.min(e.clientX + (document.body.clientWidth / 2 - e.clientX) * 0.01, document.body.clientWidth) - BOX_WIDTH / 2;
    courseDialogTop.value = Math.min(e.clientY + (document.body.clientHeight / 2 - e.clientY) * 0.01, document.body.clientHeight) - BOX_HEIGHT / 2;
  }
}
</script>

<template>
  <div class="room-info-card" :class="{occupied: isOccupied}" :style="{backgroundColor: backgroundColor}" @click="refreshPosition($event)">
    {{ lessonNum }}
  </div>

  <teleport to="#app" v-if="showDialog">
    <div class="room-info-course-dialog">
      <div class="room-info-course-box-container" style="transform-origin: top left"
           :style="{top:`${courseDialogTop}px`, left:`${courseDialogLeft}px`, transform: `scale(${containerScaleNum})`}">
        <CourseBox :lesson-num="lessonNum" :is-date-mode="true"
                   :query-date="roomQueryDate"
                   :courses="coursesHandler.value" :editable="false"
                   :show-grade="true" :show-lesson-time="true" :show-weeks="'auto'"/>
      </div>

      <div class="room-info-course-dialog-mask" @click.prevent="showDialog = false"/>
    </div>
  </teleport>
</template>

<style scoped>
.room-info-card {
  flex: 1;
}

.occupied {
  user-select: none;
  cursor: pointer;
}

.room-info-course-dialog {

}

.room-info-course-dialog-mask {
  width: 100%;
  height: 98vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(200, 200, 200, 3%);
  z-index: 98;
}

.room-info-course-box-container {
  position: fixed;
  z-index: 999;
  border: white 10px solid;
  border-radius: 10px;
}
</style>
