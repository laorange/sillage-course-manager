<script setup lang="ts">
import dayjs from "dayjs";
import {zhCN, dateZhCN} from "naive-ui";
import {useStore} from "../../../pinia/useStore";
import {computed, watch} from "vue";
import {formatDate} from "../../../assets/ts/datetimeUtils";

const store = useStore();

const props = defineProps<{ queryDate: string }>();
const emits = defineEmits(["update:queryDate"]);

const queryDateLocal = computed<string>({
  get: () => props.queryDate,
  set: (newValue) => emits("update:queryDate", newValue),
});

const weekStr = computed<string>(() => {
  let week = store.getWeekNumOfSomeDate(queryDateLocal.value);
  if (week > store.config.content.maxWeekNum || week <= 0) return "";
  let _weekUnitStr = store.translate("星期");
  return _weekUnitStr === "星期" ? `第${week}周` : `${_weekUnitStr} ${week}`;
});

// 模式切换时，将查询日期重新设为当天
watch(() => store.localConfig.isDateMode, (mode) => {
  if (!mode) queryDateLocal.value = formatDate(dayjs());
});

const handlers = {
  nextWeek() {
    queryDateLocal.value = formatDate(dayjs(queryDateLocal.value).add(1, "week"));
  },
  lastWeek() {
    queryDateLocal.value = formatDate(dayjs(queryDateLocal.value).add(-1, "week"));
  },
};
</script>

<template>
  <div class="query-date-picker" aria-label="日期选择">
    <n-space :vertical="true">
      <n-space justify="center" align="center" wrap="wrap">
        <template v-if="store.localConfig.isDateMode">
          <n-config-provider :locale="store.localConfig.language===`中文`?zhCN:undefined"
                             :date-locale="store.localConfig.language===`中文`?dateZhCN:undefined">
            <n-date-picker v-model:formatted-value="queryDateLocal" value-format="yyyy-MM-dd" type="date"
                           placement="bottom" :input-readonly="true" :first-day-of-week="0" :disabled="!store.localConfig.isDateMode"/>
          </n-config-provider>
        </template>

        <n-switch v-model:value="store.localConfig.isDateMode">
          <template #checked>{{ store.translate(`日期`) }}</template>
          <template #unchecked>{{ store.translate(`星期`) }}</template>
        </n-switch>

        <n-space justify="center" align="center">
          <n-button type="info" size="small" @click="handlers.lastWeek()" v-if="store.localConfig.isDateMode">{{ store.translate(`上一周`) }}</n-button>
          <div v-if="weekStr">{{ weekStr }}</div>
          <n-button type="info" size="small" @click="handlers.nextWeek()" v-if="store.localConfig.isDateMode">{{ store.translate(`下一周`) }}</n-button>
        </n-space>
      </n-space>
    </n-space>
  </div>
</template>

<style scoped>
.query-date-picker {
  margin-bottom: 10px;
}
</style>
