<script setup lang="ts">
import {computed, ref} from "vue";
import {zhCN, dateZhCN, SelectOption, useMessage} from "naive-ui";
import dayjs from "dayjs";
import {formatDate, getIsoWeekDay} from "../../../assets/ts/datetimeUtils";
import getWeeksString from "../../../assets/ts/getWeeksString";
import {useStore} from "../../../pinia/useStore";

const props = withDefaults(defineProps<{
  dates: string[], semesterStartDay: dayjs.Dayjs, whatDay: number,
  maxWeekNum?: number, disabledWeeks?: number[], disabledDates?: string[]
}>(), {maxWeekNum: 20});
const emits = defineEmits(["update:dates"]);

const store = useStore();
const message = useMessage();

const weeks = computed<number[]>({
  get: () => props.dates.map(d => store.getWeekNumOfSomeDate(d)),
  set: (newWeeks) => {
    let weeks = Array.from(new Set(newWeeks)).sort();
    let invalidWeeks = weeks.filter(w => (props.disabledWeeks ?? []).includes(w));
    let validWeeks = weeks.filter(w => !(props.disabledWeeks ?? []).includes(w));

    const getDateOfWeek = (w: number) => formatDate(store.semesterStartDay.add(w - 1, "week").add(store.editorFromWhatDay - 1, "day"));
    let dates = validWeeks.map(w => getDateOfWeek(w));
    let validDates = dates.filter(date => !(props.disabledDates ?? []).includes(date));
    let invalidDates = dates.filter(date => (props.disabledDates ?? []).includes(date));
    invalidWeeks = Array.from(new Set(invalidWeeks.concat(invalidDates.map(d => store.getWeekNumOfSomeDate(d)))));

    if (invalidWeeks.length) {
      message.warning(`第${getWeeksString(invalidWeeks)}周 现有课程与本课程存在冲突`);
    }
    emits("update:dates", validDates);
  },
});

const weekOptions = computed<SelectOption[]>(() => {
  let maxWeekProps = Math.max(...weeks.value);
  let minWeekProps = Math.min(...weeks.value);
  let maxWeekNum = props.maxWeekNum >= maxWeekProps ? props.maxWeekNum : maxWeekProps;
  let minWeekNum = minWeekProps >= 1 ? 1 : minWeekProps;

  let _options: SelectOption[] = [];
  for (let w = minWeekNum; w <= maxWeekNum; w++) {
    let dateOfThisWeek = formatDate(props.semesterStartDay.add(w - 1, "week").add(props.whatDay - 1, "day"));
    _options.push({
      label: (w >= 1 ? `第${w}周` : `开学前${1 - w}周`) + `(${dateOfThisWeek})`,
      value: w,
      disabled: (props.disabledWeeks ?? []).includes(w) || (props.disabledDates ?? []).includes(dateOfThisWeek),
    });
  }
  return _options;
});

const availableWeeks = computed<number[]>(() => weekOptions.value.filter(wo => !wo?.disabled).map(wo => wo.value) as number[]);

const handlers = {
  selectAll() {
    weeks.value = availableWeeks.value;
  },
  selectOpposite() {
    weeks.value = availableWeeks.value.filter(aw => weeks.value.indexOf(aw) === -1);
  },
  filterOdd() {
    weeks.value = weeks.value.filter(week => week % 2 === 1);
  },
  filterEven() {
    weeks.value = weeks.value.filter(week => week % 2 === 0);
  },
  filterFrontHalf() {
    if (weeks.value.length >= 2) {
      let _weeks = weeks.value.slice().sort((a, b) => a - b);
      weeks.value = _weeks.sort((a, b) => a - b).filter(week => week <= (_weeks[_weeks.length - 1] + _weeks[0]) / 2);
    }
  },
  filterRearHalf() {
    if (weeks.value.length >= 2) {
      let _weeks = weeks.value.slice().sort((a, b) => a - b);
      weeks.value = _weeks.sort((a, b) => a - b).filter(week => week >= (_weeks[_weeks.length - 1] + _weeks[0]) / 2);
    }
  },
  addNewDate() {
    weeks.value = weeks.value.concat([store.getWeekNumOfSomeDate(dayjs(newDateStr.value))]);
    newDateStr.value = store.editor.fromDates[0];
  },
};

const judgements = {
  disableFilterOdd() {
    // 已经没有偶数了，无需再筛
    return weeks.value.filter(week => week % 2 === 0).length === 0;
  },
  disableFilterEven() {
    // 已经没有奇数了，无需再筛
    return weeks.value.filter(week => week % 2 === 1).length === 0;
  },
  disableFilterHalf() {
    // 当前已选周的数量不足两个，无法折半
    return weeks.value.length < 2;
  },
  isSameWhatDay(d: string) {
    return getIsoWeekDay(dayjs(d)) !== store.editorFromWhatDay;
  },
};

const newDateStr = ref<string>(store.editor.fromDates[0]);
</script>

<template>
  <n-divider :dashed="true">上课周数:
    <span v-if="weeks.length">第{{ getWeeksString(weeks) }}周</span>
    <span v-else style="color: red">请在下方的穿梭框中选择</span>
  </n-divider>

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

        <n-popconfirm @positive-click="handlers.addNewDate()" positive-text="添加" negative-text="取消">
          <template #trigger>
            <n-button>其他日期</n-button>
          </template>
          新增日期：
          <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
            <n-date-picker v-model:formatted-value="newDateStr"
                           :is-date-disabled="judgements.isSameWhatDay"
                           value-format="yyyy-MM-dd" type="date"/>
          </n-config-provider>
        </n-popconfirm>
      </n-space>

      <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
        <n-transfer v-model:value="weeks" :options="weekOptions"
                    :virtual-scroll="true" :filterable="true"
                    size="small" source-title="可选" target-title="已选"/>
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
