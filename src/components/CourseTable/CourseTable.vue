<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {ref, watch} from "vue";
import CourseEditDialog from "./CourseEditDialog.vue";
import WeeklyCourseTable from "./WeeklyCourseTable.vue";
import {Course} from "../../assets/ts/types";
import RouteFilter from "./RouteFilter/RouteFilter.vue";

const store = useStore();

const filteredCourses = ref<Course[]>([]);

const editable = ref<boolean>(store.editor.authenticated);
watch(() => store.editor.authenticated, newStatus => editable.value = newStatus);
</script>

<template>
  <CourseEditDialog/>

  <h1>{{ store.translate(store.config.content.tableName) }}</h1>

  <div style="margin-bottom: 15px" v-if="store.editor.authenticated">
    <n-space justify="center" align="center">
      <n-switch v-model:value="editable">
        <template #checked>管理员视图</template>
        <template #unchecked>用户视图</template>
      </n-switch>

      <n-button type="info" @click="store.editor.show=true" :round="true"
                v-show="store.editor.mode===`add` || store.editor.mode===`edit`">
        继续编辑
      </n-button>
    </n-space>
  </div>

  <RouteFilter v-model:courses="filteredCourses"/>

  <WeeklyCourseTable :courses="filteredCourses" :editable="editable"/>
</template>

<style scoped>

</style>
