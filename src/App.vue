<script setup lang="ts">
import {onMounted, watch} from "vue";
import {useStore} from "./pinia/useStore";
import TabBar from "./components/TabBar.vue";
import {useStorage} from "vue3-storage";
import {LocalConfig} from "./assets/ts/types";

const store = useStore();
const storage = useStorage();
const LOCAL_CONFIG_STORAGE_KEY = "local_config";

onMounted(() => {
  document.title = store.config.content.tableName;
  store.fetchData();
  store.validateAuthStatus();

  // 从 localStorage 读取本地设置
  store.localConfig = storage.getStorageSync<LocalConfig>(LOCAL_CONFIG_STORAGE_KEY) ?? store.localConfig;
});

watch(() => store.localConfig, (to) => {
  // 向 localStorage 存入本地设置
  storage.setStorageSync(LOCAL_CONFIG_STORAGE_KEY, to);
}, {deep: true});
</script>

<template>
  <n-dialog-provider>
    <n-message-provider>
      <router-view/>
    </n-message-provider>
  </n-dialog-provider>

  <TabBar/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-image: linear-gradient(rgba(100, 200, 250, 30%) 10%, rgba(100, 200, 250, 10%), rgba(100, 200, 250, 30%));
  min-height: 100vh;
}

h1 {
  margin-block-start: 0;
  padding-block-start: 0.67em;
}

:root {
  --courseCardMinWidth: 150px;
  --courseCardMinHeight: 150px;
  --border-color: #32647d;
  --van-tabbar-background-color: rgb(100, 200, 255, 15%);
  --van-tabbar-item-active-background-color: transparent;
}
</style>
