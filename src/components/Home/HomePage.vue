<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {useRouter} from "vue-router";
import config from "../../../package.json";
import {computed} from "vue";

const store = useStore();
const router = useRouter();

const inDevelopMode: boolean = import.meta.env.MODE === "development";

const languageOptions = computed(() => ["中文"].concat(store.config.languages).map(language => {
  return {
    value: language,
    label: language,
  };
}));

const handlers = {
  toDocs() {
    location.href = "https://laorange.github.io/sillage-docs";
  },
  toConfig() {
    router.push({name: "config"});
  },
  toLogin() {
    router.push({name: "login"});
  },
};
</script>

<template>
  <main>
    <n-space :vertical="true" justify="center" align="center" size="large">
      <h1>{{ store.translate(store.config.tableName) }}</h1>
      <div class="version">v{{ config.version }}<span v-if="inDevelopMode">-alpha</span></div>

      <div class="language-selector">
        <n-select v-model:value="store.userConfig.language" :options="languageOptions"/>
      </div>

      <n-button v-for="grade in store.grades"
                :key="`grade${grade}`"
                type="success" size="large"
                @click="router.push({name:`course`, query:{grade}})">
        {{ store.translate(grade) }}
      </n-button>

      <n-button type="info" @click="handlers.toDocs">{{ store.translate(`使用说明`) }}</n-button>

      <n-button type="warning" v-if="!store.editor.authenticated" @click="handlers.toLogin">登录</n-button>
      <n-button type="warning" v-if="store.editor.authenticated" @click="store.editor.authenticated = !store.editor.authenticated">退出登录</n-button>

      <template v-if="store.editor.authenticated">
        <n-button type="error" @click="handlers.toConfig">{{ store.translate(`系统配置`) }}</n-button>
      </template>
    </n-space>
  </main>
</template>

<style scoped>
main {
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  margin-bottom: 0;
}

.version {
}

.language-selector {
  min-width: 200px;
}
</style>
