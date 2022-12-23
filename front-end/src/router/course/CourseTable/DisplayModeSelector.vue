<script setup lang="ts">
import {useStore} from "../../../pinia/useStore";
import {computed} from "vue";
import {SelectOption} from "naive-ui";

const store = useStore();

const displayColumnNum = computed(() => {
  switch (store.localConfig.displayMode) {
    case "一天":
      return 1;
    case "双列表":
      return 2;
    case "一周":
      return 7;
  }
});
const displayModeOption: SelectOption[] = [
  {label: store.translate(`一天`), value: `一天`},
  // {label: store.translate(`双列表`), value: `双列表`},
  {label: store.translate(`一周`), value: `一周`},
];

defineExpose({
  displayColumnNum,
});
</script>

<template>
  <n-popselect v-model:value="store.localConfig.displayMode" :options="displayModeOption" trigger="click">
    <n-button :dashed="true" color="#32647d">{{ store.translate(store.localConfig.displayMode) || "弹出选择" }}</n-button>
  </n-popselect>
</template>

<style scoped>

</style>
