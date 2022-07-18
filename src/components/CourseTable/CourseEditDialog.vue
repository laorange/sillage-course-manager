<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {computed, watch} from "vue";
import {getEmptyCourse} from "../../assets/ts/types";
import CourseEditor from "./CourseEditor/CourseEditor.vue";

const store = useStore();
watch(() => store.editor.courseEditing, (newCourse) => {
  if (!newCourse) {
    store.editor.courseEditing = getEmptyCourse();
  }
}, {immediate: true});

const title = computed(() => {
  switch (store.editor.mode) {
    case "edit":
      return "编辑课程信息";
    case "cut":
      return "剪切课程(调课)";
    case "copy":
      return "复制课程";
    case "add":
      return "新增课程";
    default:
      return "这里有BUG，请联系开发者";
  }
});
</script>

<template>
  <n-drawer v-model:show="store.editor.show" height="100%" placement="top" :close-on-esc="true">
    <n-drawer-content :title="title" :closable="true">
      <CourseEditor :course="store.editor.courseEditing"/>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>

</style>
