<script setup lang="ts">
import {Notice} from "../../../assets/ts/types";
import NoticeCard from "./NoticeCard.vue";
import {useStore} from "../../../pinia/useStore";
import {computed, ref} from "vue";
import dayjs from "dayjs";
import {NoticesHandler} from "../../../assets/ts/noticeToolkit";
import {MessageOutlined} from "@vicons/material";

const props = defineProps<{ notices: Notice[] }>();

const store = useStore();
const showNotice = ref<boolean>(false);

const textContentNotices = computed<Notice[]>(() => (new NoticesHandler(props.notices).hasTextContent().value));
const displayedNotices = computed<Notice[]>(() => {
  // 7天内的公告 + 有文字内容的公告
  let recentNotices = (new NoticesHandler(props.notices)).inThePastFewDays(7).value;
  return recentNotices.concat(textContentNotices.value.filter(n => !recentNotices.map(_ => _.id).includes(n.id)));  // 加上7天以外的有文字内容的公告
});
const unreadNotices = computed(() => displayedNotices.value.filter(n => store.localConfig.readNotices.indexOf(n.id) === -1));  // 未读的公告

const noticeWithBulletinFirst = computed<Notice[]>(() => {
  return displayedNotices.value.slice().sort((n1, n2) => {
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

function markRecentNoticeHasBeenRead() {
  // 更新本地缓存中的已读公告，删除已失效的公告id
  store.localConfig.readNotices = store.localConfig.readNotices.filter(rnId => store.notices.map(n => n.id).indexOf(rnId) > -1);

  // 将当前页面的公告加入到本地缓存的已读公告中
  store.localConfig.readNotices = Array.from(new Set(store.localConfig.readNotices.concat(displayedNotices.value.map(n => n.id))));
}

function moveToNoticeDisplay() {
  showNotice.value = true;
  markRecentNoticeHasBeenRead();
}
</script>

<template>
  <n-badge v-if="displayedNotices.length" :value="unreadNotices.length" :max="99">
    <n-button :dashed="true" color="#32647d" @click="moveToNoticeDisplay">
      <template #icon>
        <n-icon>
          <MessageOutlined/>
        </n-icon>
      </template>
    </n-button>
  </n-badge>

  <n-drawer v-model:show="showNotice" height="100%" placement="top">
    <n-drawer-content :title="store.translate(`公告`)" :closable="true"
                      :body-content-style="{padding:'0', margin:'10px 5px 10px -5px'}">
      <div class="notice-display">
        <n-timeline>
          <NoticeCard v-for="notice of noticeWithBulletinFirst" :key="`notice${notice.id}`" :notice="notice"/>
        </n-timeline>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
.notice-display {
  text-align: left;
  max-width: 100vw;
  margin-left: 10px;
  min-height: 95vh;
}
</style>
