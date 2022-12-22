<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {computed, provide, ref} from "vue";
import {Course} from "../../assets/ts/types";
import RouteFilter from "../CourseTable/RouteFilter/RouteFilter.vue";
import PlanTableBody from "./PlanTableBody.vue";
import {ShareOutline} from "@vicons/ionicons5";
import AdaptiveContainerWithFixedPixel from "../common/AdaptiveContainerWithFixedPixel.vue";
import GoToCourseButton from "./GoToCourseButton.vue";

const store = useStore();

const routeFilter = ref<typeof RouteFilter>();

const filteredCourses = computed<Course[]>(() => routeFilter?.value?.courses ?? []);

const planTableBody = ref<typeof PlanTableBody>();

const handlers = {
  downloadDataAsCSV() {
    planTableBody.value?.downloadDataAsCSV();
  },
  downloadDataAsJSON() {
    planTableBody.value?.downloadDataAsJSON();
  },
};

const adaptiveContainerWithFixedPixel = ref<typeof AdaptiveContainerWithFixedPixel>();
provide("adaptiveContainerWithFixedPixel", adaptiveContainerWithFixedPixel);
</script>

<template>
  <h1>{{ store.translate(`教学计划`) }}</h1>
  <RouteFilter ref="routeFilter">
    <template #button>
      <n-space justify="center" align="center">
        <GoToCourseButton/>

        <n-button :dashed="true" color="#32647d" @click="handlers.downloadDataAsCSV()">
          csv
          <template #icon>
            <n-icon>
              <ShareOutline/>
            </n-icon>
          </template>
        </n-button>

        <n-button :dashed="true" color="#32647d" @click="handlers.downloadDataAsJSON()">
          json
          <template #icon>
            <n-icon>
              <ShareOutline/>
            </n-icon>
          </template>
        </n-button>
      </n-space>
    </template>
  </RouteFilter>
  <AdaptiveContainerWithFixedPixel :width="1200" ref="adaptiveContainerWithFixedPixel">
    <PlanTableBody ref="planTableBody" :courses="filteredCourses"/>
  </AdaptiveContainerWithFixedPixel>
</template>

<style scoped>

</style>
