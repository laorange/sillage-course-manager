<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {computed} from "vue";

const props = defineProps<{ show: boolean }>();
const emits = defineEmits(["update:show"]);

const store = useStore();

const showLocal = computed<boolean>({
  get: () => props.show,
  set: (newValue) => emits("update:show", newValue),
});

const languageOptions = [
  "英语",
  "法语",
  "德语",
  "俄语",
  "日语",
  "阿拉伯语",
  "西班牙语",
  "葡萄牙语",
].map(l => {
  return {label: l, value: l};
});

</script>

<template>
  <n-drawer v-model:show="showLocal" height="100%" placement="top">
    <n-drawer-content title="外语词典配置" :closable="true">
      外语词典
    </n-drawer-content>
  </n-drawer>

  <n-space justify="center" align="center">
    <n-select
        v-model:value="store.config.languages"
        :filterable="true"
        :multiple="true"
        :tag="true"
        :options="languageOptions"
    />
    <n-button type="info" @click="showLocal=true">配置词典</n-button>
  </n-space>
</template>

<style scoped>

</style>
