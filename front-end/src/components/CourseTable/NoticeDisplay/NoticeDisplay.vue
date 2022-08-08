<script setup lang="ts">
import {Notice} from "../../../assets/ts/types";
import NoticeCard from "./NoticeCard.vue";

const props = defineProps<{ notices: Notice[] }>();
</script>

<template>
  <div id="notice-display">
    <n-divider/>

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
