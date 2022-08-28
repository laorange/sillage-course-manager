<script setup lang="ts">
import {Notice} from "../../../assets/ts/types";
import NoticeCard from "./NoticeCard.vue";
import {useStore} from "../../../pinia/useStore";
import {computed} from "vue";
import dayjs from "dayjs";

const props = defineProps<{ notices: Notice[] }>();

const store = useStore();

const noticeWithBulletinFirst = computed<Notice[]>(() => {
  return props.notices.slice().sort((n1, n2) => {
    // 将有内容的公告放置在前面
    if (!!n2.content && !n1.content) {
      return 1;
    } else if (!!n1.content && !n2.content) {
      return -1;
    } else {
      return dayjs(n2.updated).isAfter(dayjs(n1.updated)) ? 1 : -1;
    }
  });
});
</script>

<template>
  <div id="notice-display">
    <n-divider/>

    <h2 style="text-align: center">{{ store.translate(`公告`) }}</h2>

    <n-timeline>
      <NoticeCard v-for="notice of noticeWithBulletinFirst" :key="`notice${notice.id}`" :notice="notice"/>
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
