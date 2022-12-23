<script setup lang="ts">
import {onMounted, watch} from "vue";
import {useStore} from "../pinia/useStore";

import {useStorage} from "vue3-storage";
import {Course, LocalConfig, RawPocketBaseData} from "../assets/ts/types";
import {useMessage} from "naive-ui";

import {version} from "../../package.json";
import axios from "axios";
import dayjs from "dayjs";
import {formatDatetime} from "../assets/ts/datetimeUtils";

const store = useStore();
const storage = useStorage();
const message = useMessage();
const LOCAL_CONFIG_STORAGE_KEY = "local_config";


const initiators = {
  pageTitle() {
    document.title = store.translate(store.config.content.tableName);
  },
  async getCourseFromApi() {
    let latestNotice = (await axios(store.api.client.baseUrl + "/api/collections/notice/records", {
      params: {
        page: 1,
        perPage: 1,
        sort: "-updated",
      },
    })).data as RawPocketBaseData<Course>;

    if (dayjs(latestNotice.items[0]?.updated).isAfter(dayjs(store.localConfig.database.recordTime))) {
      // 课程有更新，重新请求全部课程
      console.log("课程有更新，重新请求全部课程");
      await store.api.course.list(courses => {
            store.courses = courses;
            store.localConfig.database.courses = courses;
            store.localConfig.database.recordTime = latestNotice.items[0]?.updated ?? formatDatetime(dayjs("1970-01-01"));
          },
          () => message.error("课程加载失败"));
    } else {
      // 课程没有更新，那就用本地缓存
      console.log("课程没有更新，已加载本地缓存");
      store.courses = store.localConfig.database.courses;
    }
  },
  async api() {
    const store = useStore();
    await store.withLoading(Promise.all([
      store.api.config.list(configs => {
        if (configs.length) store.config = configs[0];
      }, () => message.error("系统设置加载失败")),

      store.api.notice.list(notices => store.notices = notices, () => message.error("公告加载失败")),

      initiators.getCourseFromApi(),
    ]));
  },
  loginStatus() {
    store.validateAuthStatus();
  },
  localStorage() {
    function isLatestVersion(localVersion: string, latestVersion: string): boolean {
      // 版本号格式：x.y.z
      const localVersionMatchResult = localVersion.match(/(\d+)\.(\d+)\.(\d+)/) ?? ["", "0", "0", "0"];
      const latestVersionMatchResult = latestVersion.match(/(\d+)\.(\d+)\.(\d+)/) ?? ["", "0", "0", "0"];
      for (let i = 1; i <= 3; i++) {
        // x, y, z 任何一个比现有版本的低，则不是最新版本
        if (localVersionMatchResult[i] < latestVersionMatchResult[i]) return false;
      }
      return true;
    }

    // 从 localStorage 读取本地设置
    let localConfig = storage.getStorageSync<LocalConfig>(LOCAL_CONFIG_STORAGE_KEY);

    // // let isNewComer: boolean = !!localConfig;  // 如果需要判断是否是第一次来到迹云课表时可用此判断

    localConfig = {...store.localConfig, ...localConfig} ?? store.localConfig;

    //  // 如果不是最新的版本，向localstorage中存入新的默认数据  // !isLatestVersion(localConfig.version, version)

    // 如果本地缓存中没有版本号，则是v0.8以前/第一次进入，则使用默认配置
    if (localConfig.version === "0.0.0") {
      store.localConfig = {...store.localConfig, version: version}; // 向localstorage中存入新的默认数据
    } else {
      store.localConfig = {...localConfig, version: version};
    }
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
      "situations": [],
    };
    for (let i = 0; i < 1000; i++) {
      await store.api.course.create(newCourse, () => {
        if (i % 10 === 0) message.success(`${i}`);
      });
    }
  },
  async migrate07_08() {
    let i = 0;
    let handleNum = 0;
    for (const course of store.courses) {
      if (course.situations.length) {
        let newSituations: typeof course.situations = course.situations.map(s => {
          return {
            groups: s.groups,
            // @ts-ignore
            teachers: [s?.teacher].concat(s.teachers).filter(_ => !!_),
            // @ts-ignore
            rooms: [s?.room].concat(s.rooms).filter(_ => !!_),
          };
        });
        if (newSituations.length) {
          await store.api.course.update(course, {
            ...course,
            situations: newSituations,
          });
          handleNum += 1;
        }
      }
      i += 1;
      console.log(`${i}/${store.courses.length}, handle: ${handleNum}`);
    }
    console.log("done");
  },
};


onMounted(async () => {
  initiators.localStorage();
  initiators.loginStatus();
  await initiators.api();
  initiators.pageTitle();
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
