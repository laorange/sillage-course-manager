<script setup lang="ts">
import {computed} from "vue";
import {zhCN, dateZhCN} from "naive-ui";

const props = withDefaults(defineProps<{ weeks: number[], maxWeekNum?: number, disabledWeeks?: number[] }>(), {maxWeekNum: 20});
const emits = defineEmits(["update:weeks"]);

const weeksLocal = computed<number[]>({
  get: () => props.weeks,
  set: (newValue) => emits("update:weeks", newValue),
});

const weekOptions = computed(() => new Array(props.maxWeekNum).fill(0).map((_, index) => {
  return {
    label: `第${index + 1}周`,
    value: index + 1,
    disabled: (props.disabledWeeks ?? []).indexOf(index + 1) !== -1,
  };
}));
</script>

<template>
  <div class="week-selector">
    <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
      <n-transfer v-model:value="weeksLocal" :options="weekOptions" size="small" source-title="可选" target-title="已选"/>
    </n-config-provider>
  </div>
</template>

<style scoped>
.week-selector {
  display: flex;
  align-self: center;
}
</style>