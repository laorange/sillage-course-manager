<script setup lang="ts">
import {computed, ref} from "vue";
import {useRoute} from "vue-router";

const route = useRoute();

const activeIndex = ref(route.name ?? "");

const routeName = computed(() => route.name);
</script>
<template>
  <div v-show="routeName!=='home'">
    <van-tabbar v-model="activeIndex" placeholder route>
      <van-tabbar-item icon="wap-home-o" name="home" to="/"></van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>

</style>
