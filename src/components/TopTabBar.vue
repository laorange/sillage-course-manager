<script setup lang="ts">
import {ref} from "vue";
import {useStore} from "../pinia/useStore";

const store = useStore();

const activeIndex = ref<number>(0);
</script>

<template>
  <van-tabs type="card" color="#27a05a" v-model:active="activeIndex" :key="`tabs${store.grades.join(',')}`">
    <van-tab title="使用说明" :to="{name:'docs'}"/>
    <van-tab v-for="grade in store.grades" :key="`grade${grade}`" :title="grade" :to="{name: 'course', query:{grade}}"/>
    <van-tab title="系统设置" :to="{name:'config'}"/>
  </van-tabs>
</template>

<style scoped>

</style>