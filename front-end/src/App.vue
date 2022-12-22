<script setup lang="ts">
import TabBar from "./components/TabBar.vue";
import Initiator from "./components/Initiator.vue";
import {useStore} from "./pinia/useStore";
import CopyrightDiv from "./components/AboutPage/CopyrightDiv.vue";

const store = useStore();
</script>

<template>
  <n-dialog-provider>
    <n-message-provider>
      <n-spin :show="store.isLoading">
        <router-view/>
        <Initiator/>
        <template v-if="store.loadingDescription" #description>
          {{ store.loadingDescription }}
        </template>
      </n-spin>
    </n-message-provider>
  </n-dialog-provider>

  <CopyrightDiv project-url="https://github.com/laorange/sillage-course-manager" docs-url="https://www.yuque.com/laorange/sillage-docs/"/>

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
