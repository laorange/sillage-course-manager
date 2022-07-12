<script setup lang="ts">
import {ref} from "vue";

const gradeList = ["18级", "19级", "20级"]

const activeIndex = ref<number>()
</script>

<template>
  <van-tabs type="card" color="#27a05a" v-model:active="activeIndex" :key="`tabs${gradeList.join(',')}`">
    <van-tab title="系统设置" :to="{name:'config'}"/>

    <van-tab v-for="grade in gradeList" :key="`grade${grade}`" :title="grade" :to="{name: 'course', params:{grade}}"/>

    <van-tab title="使用说明" :to="{name:'docs'}"/>
  </van-tabs>
</template>

<style scoped>

</style>