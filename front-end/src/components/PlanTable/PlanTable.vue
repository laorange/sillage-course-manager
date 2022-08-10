<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {computed, ref} from "vue";
import {Course} from "../../assets/ts/types";
import RouteFilter from "../CourseTable/RouteFilter/RouteFilter.vue";
import PlanTableBody from "./PlanTableBody.vue";
import {ShareOutline} from "@vicons/ionicons5";

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
</script>

<template>
  <h1>{{ store.translate(`教学计划`) }}</h1>
  <RouteFilter ref="routeFilter">
    <template #button>
      <n-space justify="center" align="center">
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
  <PlanTableBody ref="planTableBody" :courses="filteredCourses"/>
</template>

<style scoped>

</style>
