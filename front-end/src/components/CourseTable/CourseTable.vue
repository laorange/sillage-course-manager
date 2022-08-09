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
const whetherTwoColumns = ref<boolean>(document.documentElement.clientWidth > 800);
const editable = ref<boolean>(store.editor.authenticated);
watch(() => store.editor.authenticated, newStatus => editable.value = newStatus);

const handlers = {
  moveToNoticeDisplay() {
    let noticeDisplayNode = document.getElementById("notice-display");
    if (noticeDisplayNode) {
      window.scrollTo({
        behavior: "smooth",
        top: noticeDisplayNode.offsetTop,
      });
    }
  },
};
</script>

<template>
  <CourseEditDialog/>

  <h1>{{ store.translate(store.config.content.tableName) }}</h1>

  <RouteFilter v-model:courses="filteredCourses" v-model:show-grade="showGrade" v-model:notices="filteredNotices"/>

  <div style="margin: 15px 0">
    <n-space justify="center" align="center">
      <!-- 管理员视图切换 -->
      <n-switch v-model:value="editable" v-if="store.editor.authenticated">
        <template #checked>管理员视图</template>
        <template #unchecked>用户视图</template>
      </n-switch>

      <n-switch v-model:value="whetherTwoColumns">
        <template #checked>双栏</template>
        <template #unchecked>单栏</template>
      </n-switch>

      <n-badge v-if="filteredNotices.length" :value="filteredNotices.length" :max="90">
        <n-button :dashed="true" color="#32647d" size="small" @click="handlers.moveToNoticeDisplay">{{ store.translate(`变更日志`) }}</n-button>
      </n-badge>
    </n-space>
  </div>

  <n-grid :cols="(whetherTwoColumns)?2:1" :x-gap="5">
    <n-gi>
      <WeeklyCourseTable :courses="filteredCourses" :editable="editable" :show-grade="showGrade"/>
    </n-gi>
    <n-gi v-if="whetherTwoColumns">
      <WeeklyCourseTable :courses="filteredCourses" :editable="editable" :show-grade="showGrade"/>
    </n-gi>
  </n-grid>

  <NoticeDisplay v-if="filteredNotices.length" :notices="filteredNotices"/>
</template>

<style scoped>
h1 {
  margin-bottom: 10px;
}
</style>
