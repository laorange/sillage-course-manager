<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {LessonConfig} from "../../assets/ts/types";

const store = useStore();

function createLessonConfigs(): LessonConfig {
  return {
    start: "",
    end: "",
  };
}
</script>

<template>
  <div class="situation-editor">
    <n-divider>每节课的开始与结束时间</n-divider>
    <n-dynamic-input v-model:value="store.config.content.lessonConfigs" :on-create="createLessonConfigs">
      <template #create-button-default>点击此处来添加一节课</template>
      <template #default="{ value, index }">
        <div style="display: flex; width: 100%; align-items: center">
          <div>{{ index + 1 }}:&nbsp;</div>
          <n-input v-model:value="value.start" placeholder="本节课的开始时间" :status="value.start?`success`:`error`"></n-input>
          <n-input v-model:value="value.end" placeholder="本节课的结束时间" :status="value.end?`success`:`error`"></n-input>
        </div>
      </template>
    </n-dynamic-input>
  </div>
</template>

<style scoped>

</style>
