<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import QueryDatePicker from "../CourseTable/QueryDatePicker/QueryDatePicker.vue";
import {computed, provide, ref} from "vue";
import WeeklyCourseTableHeader from "../CourseTable/CourseTable/WeeklyCourseTableHeader.vue";
import dayjs from "dayjs";
import {formatDate} from "../../assets/ts/datetimeUtils";
import {CoursesHandler} from "../../assets/ts/courseToolkit";
import RoomInfoRow from "./RoomInfoRow.vue";
import AdaptiveContainerWithFixedPixel from "../common/AdaptiveContainerWithFixedPixel.vue";

const store = useStore();

const roomQueryDate = ref(store.todayDate);
const roomQueryDay = computed<dayjs.Dayjs>({
  get: () => dayjs(roomQueryDate.value),
  set: (newDay) => roomQueryDate.value = formatDate(newDay),
});

const adaptiveContainerWithFixedPixel = ref<typeof AdaptiveContainerWithFixedPixel>();
provide("adaptiveContainerWithFixedPixel", adaptiveContainerWithFixedPixel);
provide("roomQueryDate", roomQueryDate);

const coursesOfThisWeek = computed<CoursesHandler>(() =>
    (new CoursesHandler(store.courses)).isInSameWeek(roomQueryDay.value));

</script>

<template>
  <div class="room-table">
    <h1>{{ store.translate(`教室`) }}</h1>
    <QueryDatePicker :is-date-mode="true" :allow-change-date-mode="false" v-model:query-date="roomQueryDate"/>

    <AdaptiveContainerWithFixedPixel ref="adaptiveContainerWithFixedPixel" :width="1440" :refresh-refer="coursesOfThisWeek" :deep-watch="false">
      <n-space :vertical="true" :size="3">
        <WeeklyCourseTableHeader :is-date-mode="true" :query-day="roomQueryDay"/>

        <template v-for="room of store.rooms" :key="`RoomInfoRow-${room}`">
          <RoomInfoRow :courses-handler="coursesOfThisWeek" :room="room"/>
        </template>
      </n-space>
    </AdaptiveContainerWithFixedPixel>
  </div>
</template>

<style scoped>
.room-table {
  margin-bottom: 20px;
}
</style>
