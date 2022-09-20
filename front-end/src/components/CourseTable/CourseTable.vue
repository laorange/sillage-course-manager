<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {computed, provide, ref, watch} from "vue";
import CourseEditDialog from "./CourseTable/CourseEditDialog.vue";
import DailyCourseTable from "./CourseTable/DailyCourseTable.vue";
import {Course, Notice} from "../../assets/ts/types";
import RouteFilter from "./RouteFilter/RouteFilter.vue";
import NoticeDisplay from "./NoticeDisplay/NoticeDisplay.vue";
import dayjs from "dayjs";
import {formatDate} from "../../assets/ts/datetimeUtils";
import WeeklyCourseTable from "./CourseTable/WeeklyCourseTable.vue";
import {NoticesHandler} from "../../assets/ts/noticeToolkit";
import ThinkTwiceSwitch from "./CourseTable/ThinkTwiceSwitch.vue";
import VerticalCardSwitch from "./CourseTable/VerticalCardSwitch.vue";
import DisplayModeSelector from "./CourseTable/DisplayModeSelector.vue";
import {onBeforeRouteUpdate} from "vue-router";
import {recordLastVisitPath} from "../../router/router";
import FavoriteThisPageButton from "./CourseTable/FavoriteThisPageButton.vue";

const store = useStore();

const routeFilter = ref<typeof RouteFilter>();
const grades = computed<string[]>(() => routeFilter.value?.sources?.grades ?? []);
const filteredCourses = computed<Course[]>(() => routeFilter.value?.courses ?? []);
const filteredNotices = computed<Notice[]>(() => routeFilter.value?.notices ?? []);
const recentNotices = computed<Notice[]>(() => (new NoticesHandler(filteredNotices.value)).inThePastFewDays(7).value); // 7天内的公告
const unreadNotices = computed(() => recentNotices.value.filter(n => store.localConfig.readNotices.indexOf(n.id) === -1));  // 未读的公告
provide("routeFilter", routeFilter);

const displayModeSelector = ref<typeof DisplayModeSelector>();
const displayColumnNum = computed<number>(() => displayModeSelector.value?.displayColumnNum ?? 1);

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
    handlers.markRecentNoticeHasBeenRead();
  },
  markRecentNoticeHasBeenRead() {
    // 更新本地缓存中的已读公告，删除已失效的公告id
    store.localConfig.readNotices = store.localConfig.readNotices.filter(rnId => store.notices.map(n => n.id).indexOf(rnId) > -1);

    // 将当前页面的公告加入到本地缓存的已读公告中
    store.localConfig.readNotices = Array.from(new Set(store.localConfig.readNotices.concat(recentNotices.value.map(n => n.id))));
  },
};

onBeforeRouteUpdate(recordLastVisitPath);
</script>

<template>
  <CourseEditDialog/>

  <h1>{{ store.translate(store.config.content.tableName) }}</h1>

  <RouteFilter ref="routeFilter">
    <template #button>
      <FavoriteThisPageButton/>

      <n-badge v-if="unreadNotices.length" :value="unreadNotices.length" :max="99">
        <n-button :dashed="true" type="error" @click="handlers.moveToNoticeDisplay">{{ store.translate(`公告`) }}</n-button>
      </n-badge>
    </template>

    <template #formTop>
      <n-grid cols="1 400:2 800:4">
        <n-gi>
          <n-form-item :label="store.translate(`显示内容`)">
            <DisplayModeSelector ref="displayModeSelector"/>
          </n-form-item>
        </n-gi>

        <n-gi>
          <n-form-item :label="store.translate(`堆叠方向`)">
            <VerticalCardSwitch/>
          </n-form-item>
        </n-gi>

        <n-gi v-if="store.editor.authenticated">
          <n-form-item label="管理视图">
            <n-switch v-model:value="editable">
              <template #checked>开</template>
              <template #unchecked>关</template>
            </n-switch>
          </n-form-item>
        </n-gi>

        <n-gi v-if="store.editor.authenticated">
          <n-form-item label="二次确认">
            <ThinkTwiceSwitch/>
          </n-form-item>
        </n-gi>
      </n-grid>
    </template>
  </RouteFilter>

  <WeeklyCourseTable v-if="store.localConfig.displayMode==='一周'" :show-grade="grades.length !== 1" :courses="filteredCourses" :editable="editable"/>
  <n-grid v-else :cols="displayColumnNum" :x-gap="5">
    <n-gi v-for="dailyCourseTableNum of displayColumnNum" :key="`DailyCourseTable${dailyCourseTableNum}`">
      <DailyCourseTable :courses="filteredCourses" :editable="editable" :show-grade="grades.length !== 1"
                        :query-date="formatDate(dayjs().add(dailyCourseTableNum-1, 'day'))"/>
    </n-gi>
  </n-grid>

  <NoticeDisplay v-if="recentNotices.length" :notices="recentNotices"/>
</template>

<style scoped>
h1 {
  margin-bottom: 10px;
}
</style>
