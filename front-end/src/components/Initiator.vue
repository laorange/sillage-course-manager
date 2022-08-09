<script setup lang="ts">
import {onBeforeMount, watch} from "vue";
import {useStore} from "../pinia/useStore";

import {useStorage} from "vue3-storage";
import {Course, LocalConfig} from "../assets/ts/types";
import {useMessage} from "naive-ui";

const store = useStore();
const storage = useStorage();
const message = useMessage();
const LOCAL_CONFIG_STORAGE_KEY = "local_config";


const initiators = {
  pageTitle() {
    document.title = store.config.content.tableName;
  },
  async api() {
    store.isLoading = true;
    await Promise.all([
      store.api.config.list(configs => {
        if (configs.length) store.config = configs[0];
      }, () => message.error("系统设置加载失败")),

      store.api.notice.list(notices => store.notices = notices, () => message.error("公告加载失败")),

      store.api.course.list(courses => {
        store.courses = courses;
        store.isLoading = false;
      }, () => message.error("课程加载失败")),
    ]);
  },
  loginStatus() {
    store.validateAuthStatus();
  },
  localStorage() {
    // 从 localStorage 读取本地设置
    store.localConfig = storage.getStorageSync<LocalConfig>(LOCAL_CONFIG_STORAGE_KEY) ?? store.localConfig;
  },
  async addTextData() {
    let newCourse: Course = {
      "id": "",
      "dates": ["2022-09-03", "2022-09-10", "2022-09-17", "2022-09-24", "2022-10-01", "2022-10-08", "2022-10-15", "2022-10-22", "2022-10-29", "2022-11-05", "2022-11-12", "2022-11-19", "2022-11-26", "2022-12-03", "2022-12-10", "2022-12-17", "2022-12-24", "2022-12-31", "2023-01-07", "2023-01-14"],
      "grade": "测试年级",
      "info": {"bgc": "#000000", "code": "TEST", "name": "测试"},
      "lessonNum": 1,
      "method": "",
      "note": "",
      "situations": [{"groups": [], "room": "320", "teacher": ""}],
    };
    for (let i = 0; i < 1000; i++) {
      await store.api.course.create(newCourse, () => {
        if (i % 10 === 0) message.success(`${i}`);
      });
    }
  },
};


onBeforeMount(() => {
  initiators.pageTitle();
  initiators.api();
  initiators.loginStatus();
  initiators.localStorage();
});

// onMounted(() => initiators.test());

watch(() => store.localConfig, (to) => {
  // 向 localStorage 存入本地设置
  storage.setStorageSync(LOCAL_CONFIG_STORAGE_KEY, to);
}, {deep: true});
</script>

<template>

</template>

<style scoped>

</style>
