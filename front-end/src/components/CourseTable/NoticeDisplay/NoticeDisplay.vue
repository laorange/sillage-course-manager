<script setup lang="ts">
import {Notice} from "../../../assets/ts/types";
import NoticeCard from "./NoticeCard.vue";
import {useStore} from "../../../pinia/useStore";

const props = defineProps<{ notices: Notice[] }>();

const store = useStore();
</script>

<template>
  <div id="notice-display">
    <n-divider/>

    <h2 style="text-align: center">{{ store.translate(`公告`) }}</h2>

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
  min-height: 95vh;
}
</style>
