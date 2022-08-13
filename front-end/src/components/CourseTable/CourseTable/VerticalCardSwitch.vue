<script setup lang="ts">
import {useStore} from "../../../pinia/useStore";
import {SelectOption} from "naive-ui";
import {ref, watch} from "vue";

const store = useStore();

const verticalCardOption: SelectOption[] = [
  {label: store.translate(`竖直显示`), value: `竖直显示`},
  {label: store.translate(`水平显示`), value: `水平显示`},
];

const verticalCardStr = ref<"竖直显示" | "水平显示">("水平显示");
watch(() => verticalCardStr.value, (s) => store.localConfig.verticalCard = (s === "竖直显示"));
</script>

<template>
  <n-popselect v-model:value="verticalCardStr" :options="verticalCardOption" trigger="click">
    <n-button :dashed="true" color="#32647d">{{ store.translate(verticalCardStr) || "弹出选择" }}</n-button>
  </n-popselect>
</template>

<style scoped>

</style>
