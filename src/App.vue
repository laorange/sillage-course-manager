<script setup lang="ts">
import TopTabBar from "./components/TopTabBar.vue";
import {onMounted} from "vue";
import {useStore} from "./pinia/useStore";

const store = useStore();

onMounted(() => {
  document.title = store.config.tableName;
});
</script>

<template>
  <TopTabBar/>
  <n-dialog-provider>
    <n-message-provider>
      <router-view/>
    </n-message-provider>
  </n-dialog-provider>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

:root {
  --courseCardMinWidth: 150px;
  --courseCardMinHeight: 150px;
}
</style>
