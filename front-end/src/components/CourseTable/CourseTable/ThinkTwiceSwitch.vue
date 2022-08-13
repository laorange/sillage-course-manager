<script setup lang="ts">
import {useStore} from "../../../pinia/useStore";
import {useMessage} from "naive-ui";
import {watch} from "vue";

const store = useStore();
const message = useMessage();

watch(() => store.localConfig.thinkTwice, (whetherThinkTwice) => {
  if (whetherThinkTwice) message.success("数据变更前，会弹出对话框向您确认")
  else message.warning("数据变更前，系统不再会弹出对话框向您确认")
});
</script>

<template>
  <n-switch v-model:value="store.localConfig.thinkTwice" v-if="store.editor.authenticated">
    <template #checked>二次确认：开</template>
    <template #unchecked>二次确认：关</template>
  </n-switch>
</template>

<style scoped>

</style>
