<script setup lang="ts">
import {CopyOutline} from "@vicons/ionicons5";
import useClipboard from "vue-clipboard3";
import {useMessage} from "naive-ui";
import {useStore} from "../../../pinia/useStore";

const store = useStore();
const message = useMessage();
const {toClipboard} = useClipboard();

async function copyUrl() {
  try {
    await toClipboard(window.location.href);
    message.success(`${store.translate("复制网址")}: ${store.translate("完成")}`);
  } catch (e) {
    message.error(`Error: ${e}`);
  }
}
</script>

<template>
  <n-button :dashed="true" color="#32647d" size="tiny" @click="copyUrl()">
    <!--    {{ store.translate(`复制网址`) }}-->
    <template #icon>
      <n-icon>
        <CopyOutline/>
      </n-icon>
    </template>
  </n-button>
</template>

<style scoped>

</style>
