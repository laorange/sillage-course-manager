<script setup lang="ts">
import {Notice} from "../../../assets/ts/types";
import NoticeCard from "./NoticeCard.vue";
import {useStore} from "../../../pinia/useStore";

const props = defineProps<{ notices: Notice[] }>();

const store = useStore();
</script>

<template>
  <div id="notice-display">
    <n-divider><h3>{{ store.translate(`变更日志`) }}</h3></n-divider>

    <n-timeline>
      <NoticeCard v-for="notice of notices" :key="`notice${notice.id}`" :notice="notice"/>
    </n-timeline>
  </div>
</template>

<style scoped>
#notice-display {
  text-align: left;
  max-width: 100vw;
  margin-left: 10px;
}
</style>
