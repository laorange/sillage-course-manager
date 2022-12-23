<script setup lang="ts">
import dayjs from "dayjs";
import {zhCN, dateZhCN, SelectOption, useMessage} from "naive-ui";
import {useStore} from "../../../pinia/useStore";
import {computed, onMounted, onUnmounted, watch} from "vue";
import {formatDate} from "../../../assets/ts/datetimeUtils";
import {ArrowRedoOutline, ArrowBackCircleOutline, ArrowForwardCircleOutline} from "@vicons/ionicons5";

const store = useStore();
const message = useMessage();

const props = withDefaults(defineProps<{ queryDate: string, isDateMode: boolean, allowChangeDateMode?: boolean, lockPage?: boolean }>(), {allowChangeDateMode: true});
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
  let week: number;
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
watch(() => weekStr.value, (newWeekStr) => {
  if (newWeekStr) message.info(newWeekStr, {duration: 1000});
});

const handlers = {
  nextWeek() {
    queryDateLocal.value = formatDate(dayjs(queryDateLocal.value).add(1, "week"));
  },
  lastWeek() {
    queryDateLocal.value = formatDate(dayjs(queryDateLocal.value).add(-1, "week"));
  },
  keyUpHandler(event: KeyboardEvent) {
    // 在日期模式 && 没有打开"课程编辑器" && 没有打开"偏好设置"
    if (props.isDateMode && !store.editor.show && !props.lockPage) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlers.lastWeek();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handlers.nextWeek();
      }
    }
  },
  backToToday() {
    queryDateLocal.value = formatDate(dayjs());
  },
};

onMounted(() => document.addEventListener("keyup", handlers.keyUpHandler));
onUnmounted(() => document.removeEventListener("keyup", handlers.keyUpHandler));
</script>

<template>
  <div class="query-date-picker" aria-label="日期选择">
    <n-space :vertical="true" :size="10">
      <n-space justify="center" align="center" wrap="wrap">
        <template v-if="props.isDateMode">
          <n-config-provider :locale="store.localConfig.language===`中文`?zhCN:undefined"
                             :date-locale="store.localConfig.language===`中文`?dateZhCN:undefined">
            <n-date-picker v-model:formatted-value="queryDateLocal" value-format="yyyy-MM-dd" type="date"
                           placement="bottom" :input-readonly="true" :first-day-of-week="0" :disabled="dateMode!==`日期模式`"/>
          </n-config-provider>
        </template>

        <n-popselect v-model:value="dateMode" :options="dateModeOption" trigger="click" v-if="allowChangeDateMode">
          <n-button :dashed="true" color="#32647d">{{ store.translate(dateMode) || "弹出选择" }}</n-button>
        </n-popselect>

        <div v-if="!props.isDateMode">{{ store.translate(`今天`) }}: {{ weekStr }}</div>
      </n-space>

      <n-space justify="center" align="center" :size="20" v-if="dateMode === `日期模式`">
        <n-button type="info" size="large" @click="handlers.lastWeek()">
          <n-space justify="center" align="center" :size="5">
            <n-icon :size="20">
              <ArrowBackCircleOutline/>
            </n-icon>
            <div>{{ store.translate(`上一周`) }}</div>
          </n-space>
        </n-button>
        <n-space :vertical="true" :size="1">
          <div v-if="weekStr">{{ weekStr }}</div>
          <n-button v-if="queryDateLocal!==formatDate(dayjs())" @click="handlers.backToToday()" size="tiny" :dashed="true" color="#32647d">
            {{ store.translate(`今天`) }}
            <template #icon>
              <n-icon>
                <ArrowRedoOutline/>
              </n-icon>
            </template>
          </n-button>
        </n-space>
        <n-button type="info" size="large" @click="handlers.nextWeek()">
          <n-space justify="center" align="center" :size="5">
            <div>{{ store.translate(`下一周`) }}</div>
            <n-icon :size="20">
              <ArrowForwardCircleOutline/>
            </n-icon>
          </n-space>
        </n-button>
      </n-space>
    </n-space>
  </div>
</template>

<style scoped>
.query-date-picker {
  margin-bottom: 15px;
}
</style>
