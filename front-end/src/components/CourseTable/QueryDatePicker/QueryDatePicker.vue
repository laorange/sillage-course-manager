<script setup lang="ts">
import dayjs from "dayjs";
import {zhCN, dateZhCN, SelectOption} from "naive-ui";
import {useStore} from "../../../pinia/useStore";
import {computed} from "vue";
import {formatDate} from "../../../assets/ts/datetimeUtils";

const store = useStore();

const props = defineProps<{ queryDate: string, isDateMode: boolean }>();
const emits = defineEmits(["update:queryDate", "update:isDateMode"]);

const dateModeOption: SelectOption[] = ["日期模式", "星期模式"].map(mode => {
  return {label: store.translate(mode), value: mode};
});

const queryDateLocal = computed<string>({
  get: () => props.queryDate,
  set: (newValue) => emits("update:queryDate", newValue),
});

const dateMode = computed<"日期模式" | "星期模式">({
  get: () => props.isDateMode ? `日期模式` : `星期模式`,
  set: (newDateMode) => emits("update:isDateMode", (newDateMode === `日期模式`)),
});

const weekStr = computed<string>(() => {
  let week: number
  if (props.isDateMode) {
    // 日期模式下，显示查询日期是第几周
    week = store.getWeekNumOfSomeDate(queryDateLocal.value);
  } else {
    // 星期模式下，显示当天是第几周
    week = store.getWeekNumOfSomeDate(dayjs());
  }
  if (week > store.config.content.maxWeekNum || week <= 0) return "";
  let _weekUnitStr = store.translate("星期");
  return _weekUnitStr === "星期" ? `第${week}周` : `${_weekUnitStr} ${week}`;
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
        <template v-if="props.isDateMode">
          <n-config-provider :locale="store.localConfig.language===`中文`?zhCN:undefined"
                             :date-locale="store.localConfig.language===`中文`?dateZhCN:undefined">
            <n-date-picker v-model:formatted-value="queryDateLocal" value-format="yyyy-MM-dd" type="date"
                           placement="bottom" :input-readonly="true" :first-day-of-week="0" :disabled="dateMode!==`日期模式`"/>
          </n-config-provider>
        </template>

        <n-popselect v-model:value="dateMode" :options="dateModeOption" trigger="click">
          <n-button :dashed="true" color="#32647d">{{ store.translate(dateMode) || "弹出选择" }}</n-button>
        </n-popselect>

        <n-space justify="center" align="center">
          <n-button type="info" size="small" @click="handlers.lastWeek()" v-if="dateMode === `日期模式`">{{ store.translate(`上一周`) }}</n-button>
          <div v-if="weekStr">{{ weekStr }}</div>
          <n-button type="info" size="small" @click="handlers.nextWeek()" v-if="dateMode === `日期模式`">{{ store.translate(`下一周`) }}</n-button>
        </n-space>
      </n-space>
    </n-space>
  </div>
</template>

<style scoped>
.query-date-picker {
  margin-bottom: 15px;
}
</style>
