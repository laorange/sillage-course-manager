<script setup lang="ts">
import {CoursesHandler} from "../../assets/ts/courseToolkit";
import RoomInfoBox from "./RoomInfoBox.vue";
import {computed} from "vue";
import {useRouter} from "vue-router";

const props = defineProps<{ room: string, coursesHandler: CoursesHandler }>();

const router = useRouter();

const coursesOfThisRoom = computed(() => props.coursesHandler.ofRooms([props.room]));

function goToCoursePage(room: string) {
  router.push({name: "course", query: {room}});
}
</script>

<template>
  <div class="room-info-row">
    <n-grid cols="22" x-gap="2" y-gap="2">
      <n-gi span="1" class="room-label" @click="goToCoursePage(room)">{{ room }}</n-gi>
      <n-gi span="3" v-for="whatDay in 7" :key="`what-day-${whatDay}`">
        <RoomInfoBox :room="room" :courses-handler="coursesOfThisRoom.ofWhatDay(whatDay)"/>
      </n-gi>
    </n-grid>
  </div>
</template>

<style scoped>
.room-info-row {

}

.n-grid > * {
  border: 2px solid var(--border-color);
  height: 40px;
}

.room-label {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.room-label:hover {
  background-color: #32647d;
  color: white;
}
</style>
