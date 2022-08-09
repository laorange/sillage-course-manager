<script setup lang="ts">
import {onBeforeMount, watch} from "vue";
import {useStore} from "../pinia/useStore";

import {useStorage} from "vue3-storage";
import {LocalConfig} from "../assets/ts/types";
import {useMessage} from "naive-ui";

const store = useStore();
const storage = useStorage();
const message = useMessage();
const LOCAL_CONFIG_STORAGE_KEY = "local_config";


const initiators = {
  pageTitle() {
    document.title = store.config.content.tableName;
  },
  api() {
    store.api.config.list(configs => {
      if (configs.length) store.config = configs[0];
    }, () => message.error("系统设置加载失败"));

    store.api.course.list(courses => store.courses = courses, () => message.error("课程加载失败"));
    store.api.notice.list(notices => store.notices = notices, () => message.error("公告加载失败"));
  },
  loginStatus() {
    store.validateAuthStatus();
  },
  localStorage() {
    // 从 localStorage 读取本地设置
    store.localConfig = storage.getStorageSync<LocalConfig>(LOCAL_CONFIG_STORAGE_KEY) ?? store.localConfig;
  },
};


onBeforeMount(() => {
  initiators.pageTitle();
  initiators.api();
  initiators.loginStatus();
  initiators.localStorage();
});

watch(() => store.localConfig, (to) => {
  // 向 localStorage 存入本地设置
  storage.setStorageSync(LOCAL_CONFIG_STORAGE_KEY, to);
}, {deep: true});
</script>

<template>

</template>

<style scoped>

</style>
