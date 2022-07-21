<script setup lang="ts">
import {computed} from "vue";
import {useStore} from "../pinia/useStore";
import {useRoute} from "vue-router";

const store = useStore();
const route = useRoute();

const activeTabName = computed<string>(() => {
  let routeName = (route.name ?? "") as string;
  if (["home", "config"].indexOf(routeName) !== -1) {
    return routeName;
  }
  return `grade${route.query.grade}`;
});

const gradeTabList = computed<string[]>(() => {
  let routeQueryGrade = (route.query.grade ?? "") as string;
  if (!!routeQueryGrade && store.grades.indexOf(routeQueryGrade) === -1) {
    return store.grades.concat([routeQueryGrade]);
  }
  return store.grades;
});
</script>

<template>
  <van-tabs type="card" color="#178848" :background="`transparent`" :active="activeTabName" :key="`tabs${gradeTabList.join(',')}`">
    <van-tab title="首页" name="home" :to="{name:'home'}"/>
    <van-tab v-for="grade in gradeTabList" :name="`grade${grade}`" :key="`grade${grade}`" :title="grade" :to="{name: 'course', query:{grade}}"/>
    <van-tab title="系统设置" name="config" :to="{name:'config'}"/>
  </van-tabs>
</template>

<style scoped>

</style>
