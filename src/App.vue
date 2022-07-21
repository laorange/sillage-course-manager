<script setup lang="ts">
import {onMounted} from "vue";
import {useStore} from "./pinia/useStore";
import TabBar from "./components/TabBar.vue";

const store = useStore();

onMounted(() => {
  document.title = store.config.tableName;
});
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
  --van-tabbar-background-color: rgb(100, 200, 255, 15%);
  --van-tabbar-item-active-background-color: transparent;
}
</style>
