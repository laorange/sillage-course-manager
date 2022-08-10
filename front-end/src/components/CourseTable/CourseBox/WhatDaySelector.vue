<script setup lang="ts">
import {computed} from "vue";
import {formatDate, getIsoWeekDay} from "../../../assets/ts/datetimeUtils";
import dayjs from "dayjs";
import {useStore} from "../../../pinia/useStore";

const props = defineProps<{ date: string }>();
const emits = defineEmits(["update:date"]);

const store = useStore();

const whatDayFrom0 = computed<number>({
  get: () => getIsoWeekDay(dayjs(props.date)) - 1,
  set: (to) => {
    let someDay = dayjs(props.date);
    emits("update:date", formatDate(someDay.add(to + 1 - getIsoWeekDay(someDay), "day")));
  },
});
</script>

<template>
  <div class="what-day-selector">
    <van-tabs type="card" color="#32647d" :background="`transparent`" v-model:active="whatDayFrom0">
      <van-tab :title="store.translate(`星期${whatDayStr}`)" v-for="whatDayStr in [...`一二三四五六天`]" :key="`星期${whatDayStr}`"/>
    </van-tabs>
  </div>
</template>

<style scoped>
.what-day-selector {
  margin-bottom: 10px;
}
</style>
