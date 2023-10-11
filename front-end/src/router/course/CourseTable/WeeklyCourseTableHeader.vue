<script setup lang="ts">
import dayjs from "dayjs";
import {formatDate, getIsoWeekDay} from "../../../assets/ts/datetimeUtils";
import {useStore} from "../../../pinia/useStore";
import {computed} from "vue";
import getTodayX from "../../../assets/ts/getToday";

const props = defineProps<{ queryDay: dayjs.Dayjs, isDateMode: boolean }>();

const store = useStore();

const queryWhatDay = computed<number>(() => getIsoWeekDay(props.queryDay));

function isToday(whatDay: number): boolean {
  return props.queryDay.add(whatDay - queryWhatDay.value, "day").isSame(getTodayX(), "day");
}

function isQueryDate(whatDay: number): boolean {
  return queryWhatDay.value === whatDay;
}

function getNeighborDay(whatDay: number): dayjs.Dayjs {
  return props.queryDay.add(whatDay - queryWhatDay.value, "day");
}
</script>

<template>
  <div class="weekly-course-table-header">
    <n-grid cols="22" x-gap="2" y-gap="2">
      <n-gi span="1">
        <div v-if="isDateMode" class="course-table-header">{{ store.translate(`日期`) }}</div>
      </n-gi>
      <n-gi span="3" v-for="(whatDayStr, whatDay0) in [...`一二三四五六天`]" :key="`星期${whatDayStr}`"
            :class="{'course-table-header-today': isToday(whatDay0 + 1), 'course-table-header-query-date': isQueryDate(whatDay0 + 1)}">
        <div class="course-table-header">
          <div>{{ store.translate(`星期${whatDayStr}`) }}</div>
          <div v-if="isDateMode">{{ formatDate(getNeighborDay(whatDay0 + 1)) }}</div>
        </div>
      </n-gi>
    </n-grid>
  </div>
</template>

<style scoped>
.weekly-course-table-header {
  margin-bottom: 2px;
}

.n-grid > * {
  border: 2px solid var(--border-color);
}

.course-table-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: stretch;
  align-items: center;
  height: 100%;
  min-height: 50px;
}

.course-table-header-today {
  color: white;
  font-weight: bold;
  background-color: var(--border-color);
}

.course-table-header-query-date {
  border-width: 2px;
  border-radius: 25px;
}
</style>
