<script setup lang="ts">
import {computed, ref} from "vue";
import {useRoute} from "vue-router";

const route = useRoute();

const activeIndex = ref(route.name ?? "");

</script>
<template>
  <van-tabbar v-model="activeIndex" placeholder route>
    <van-tabbar-item icon="wap-home" name="home" to="/"></van-tabbar-item>
  </van-tabbar>
</template>

<style scoped>

</style>
