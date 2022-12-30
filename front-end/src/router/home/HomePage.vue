<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {useRouter} from "vue-router";
import config from "../../../package.json";
import LanguageSelector from "./LanguageSelector.vue";
import GradeEntrances from "./GradeEntrances.vue";

const store = useStore();
const router = useRouter();

const inDevelopMode: boolean = import.meta.env.MODE === "development";
const href = location.href;

const handlers = {
  toPlan() {
    router.push({name: "plan"});
  },
  toConfig() {
    router.push({name: "config"});
  },
  toLogin() {
    router.push({name: "login"});
  },
  toLogout() {
    localStorage.removeItem("pocketbase_auth");
    store.editor.authenticated = false;
  },
};
</script>

<template>
  <main>
    <div class="home-page">
      <h1>{{ store.translate(store.config.content.tableName) }}</h1>
      <LanguageSelector/>

      <GradeEntrances/>

      <n-button type="info" :round="true" @click="handlers.toPlan" v-if="store.courseOfCurrentSemester.value.length">{{ store.translate(`教学计划`) }}</n-button>

      <n-space vertical v-if="!store.editor.authenticated && store.courses.length === 0">
        <n-button type="warning" :round="true" @click="handlers.toLogin">
          {{ store.translate(`管理员入口`) }}
        </n-button>
        <div style="color: red">添加课程后，该按钮将不再显示。<strong>管理员入口</strong>的网址为：<code style="color: blue">{{ href }}login/</code></div>
      </n-space>

      <template v-if="store.editor.authenticated">
        <n-button type="error" :round="true" @click="handlers.toConfig">{{ store.translate(`系统配置`) }}</n-button>
      </template>

      <n-button type="warning" :round="true" v-if="store.editor.authenticated" @click="handlers.toLogout">退出登录</n-button>
    </div>
  </main>
</template>

<style scoped>
main {
  display: flex;
  min-height: 75vh;
  flex-direction: column;
  justify-content: center;
  flex-wrap: wrap;
}

.home-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-wrap: wrap;
}

.home-page > * {
  flex: 1 40%;
  margin: 15px max(calc(40vw - 130px), 30px);
  min-height: 34px;
}

h1 {
  margin-bottom: 0;
}
</style>
