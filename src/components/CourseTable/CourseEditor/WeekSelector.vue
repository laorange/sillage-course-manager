<script setup lang="ts">
import {computed} from "vue";
import {zhCN, dateZhCN, SelectOption} from "naive-ui";

const props = withDefaults(defineProps<{ weeks: number[], maxWeekNum?: number, disabledWeeks?: number[] }>(), {maxWeekNum: 20});
const emits = defineEmits(["update:weeks"]);

const weeksLocal = computed<number[]>({
  get: () => props.weeks,
  set: (newValue) => emits("update:weeks", newValue),
});

const weekOptions = computed<SelectOption[]>(() => {
  let maxWeekProps = Math.max(...weeksLocal.value);
  let minWeekProps = Math.min(...weeksLocal.value);
  let maxWeekNum = props.maxWeekNum >= maxWeekProps ? props.maxWeekNum : maxWeekProps;
  let minWeekNum = minWeekProps >= 1 ? 1 : minWeekProps;

  let _options: SelectOption[] = [];
  for (let w = minWeekNum; w <= maxWeekNum; w++) {
    _options.push({
      label: w >= 1 ? `第${w}周` : `开学前${1 - w}周`,
      value: w + 1,
      disabled: (props.disabledWeeks ?? []).indexOf(w) !== -1,
    });
  }
  return _options;
});

const availableWeeks = computed<number[]>(() => weekOptions.value.filter(wo => !wo?.disabled).map(wo => wo.value) as number[]);

const handlers = {
  selectAll() {
    weeksLocal.value = availableWeeks.value;
  },
  selectOpposite() {
    weeksLocal.value = availableWeeks.value.filter(aw => weeksLocal.value.indexOf(aw) === -1);
  },
  filterOdd() {
    weeksLocal.value = weeksLocal.value.filter(week => week % 2 === 1);
  },
  filterEven() {
    weeksLocal.value = weeksLocal.value.filter(week => week % 2 === 0);
  },
  filterFrontHalf() {
    if (weeksLocal.value.length >= 2) {
      let _weeks = weeksLocal.value.slice().sort((a, b) => a - b);
      weeksLocal.value = _weeks.sort((a, b) => a - b).filter(week => week <= (_weeks[_weeks.length - 1] + _weeks[0]) / 2);
    }
  },
  filterRearHalf() {
    if (weeksLocal.value.length >= 2) {
      let _weeks = weeksLocal.value.slice().sort((a, b) => a - b);
      weeksLocal.value = _weeks.sort((a, b) => a - b).filter(week => week >= (_weeks[_weeks.length - 1] + _weeks[0]) / 2);
    }
  },
};

const judgements = {
  disableFilterOdd() {
    // 已经没有偶数了，无需再筛
    return weeksLocal.value.filter(week => week % 2 === 0).length === 0;
  },
  disableFilterEven() {
    // 已经没有奇数了，无需再筛
    return weeksLocal.value.filter(week => week % 2 === 1).length === 0;
  },
  disableFilterHalf() {
    // 当前已选周的数量不足两个，无法折半
    return weeksLocal.value.length < 2;
  },
};
</script>

<template>
  <div class="week-selector">
    <n-space :vertical="true">
      <n-space align="center" justify="center">
        <n-button @click="handlers.selectAll()">全选</n-button>
        <n-button @click="handlers.selectOpposite()">反选</n-button>
        <n-button @click="handlers.filterOdd()" :disabled="judgements.disableFilterOdd()">
          {{ !judgements.disableFilterOdd() && judgements.disableFilterEven() ? `清空` : `单周` }}
        </n-button>
        <n-button @click="handlers.filterEven()" :disabled="judgements.disableFilterEven()">
          {{ !judgements.disableFilterEven() && judgements.disableFilterOdd() ? `清空` : `双周` }}
        </n-button>
        <n-button @click="handlers.filterFrontHalf()" :disabled="judgements.disableFilterHalf()">前半</n-button>
        <n-button @click="handlers.filterRearHalf()" :disabled="judgements.disableFilterHalf()">后半</n-button>
      </n-space>

      <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
        <n-transfer v-model:value="weeksLocal" :options="weekOptions" size="small" source-title="可选" target-title="已选"/>
      </n-config-provider>
    </n-space>
  </div>
</template>

<style scoped>
.week-selector {
  display: flex;
  align-self: center;
}
</style>
