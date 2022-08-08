<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {ref, watch} from "vue";
import CourseEditDialog from "./CourseEditDialog.vue";
import WeeklyCourseTable from "./WeeklyCourseTable.vue";
import {Course, Notice} from "../../assets/ts/types";
import RouteFilter from "./RouteFilter/RouteFilter.vue";
import NoticeDisplay from "./NoticeDisplay/NoticeDisplay.vue";

const store = useStore();

const filteredCourses = ref<Course[]>([]);
const filteredNotices = ref<Notice[]>([]);

const showGrade = ref<boolean>(false);
const whetherTwoColumns = ref<boolean>(true);
const editable = ref<boolean>(store.editor.authenticated);
watch(() => store.editor.authenticated, newStatus => editable.value = newStatus);
</script>

<template>
  <CourseEditDialog/>

  <h1>{{ store.translate(store.config.content.tableName) }}</h1>

  <div style="margin-bottom: 15px" v-if="store.editor.authenticated">
    <n-space justify="center" align="center">
      <!-- 管理员视图切换 -->
      <n-switch v-model:value="editable">
        <template #checked>管理员视图</template>
        <template #unchecked>用户视图</template>
      </n-switch>

      <n-switch v-model:value="whetherTwoColumns" v-show="editable">
        <template #checked>双栏</template>
        <template #unchecked>单栏</template>
      </n-switch>

      <!--      <n-button type="info" @click="store.editor.show=true" :round="true"-->
      <!--                v-show="store.editor.mode===`add` || store.editor.mode===`edit`">-->
      <!--        继续编辑-->
      <!--      </n-button>-->
    </n-space>
  </div>

  <RouteFilter v-model:courses="filteredCourses" v-model:show-grade="showGrade" v-model:notices="filteredNotices"/>

  <n-grid :cols="(editable && whetherTwoColumns)?2:1" :x-gap="5">
    <n-gi>
      <WeeklyCourseTable :courses="filteredCourses" :editable="editable" :show-grade="showGrade"/>
    </n-gi>
    <n-gi v-if="editable && whetherTwoColumns">
      <WeeklyCourseTable :courses="filteredCourses" :editable="editable" :show-grade="showGrade"/>
    </n-gi>
  </n-grid>

  <NoticeDisplay :notices="filteredNotices"/>
</template>

<style scoped>
h1 {
  margin-bottom: 10px;
}
</style>
