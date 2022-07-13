<script setup lang="ts">
import TopTabBar from "./components/TopTabBar.vue";
</script>

<template>
  <TopTabBar/>
  <router-view/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.responsive-left-part, .responsive-right-part {
  flex: 0 50%;
  display: flex;
  flex-direction: column;
}

.responsive-middle-divider {
  margin: 0 2vw;
  width: 1px;
  background-color: black;
}

@media screen and (max-width: 1200px) {
  .responsive-middle-divider {
    display: none;
  }

  .course-editor {
    flex-direction: column;
  }
}
</style>
