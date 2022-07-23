<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {useStore} from "../../../pinia/useStore";
import {useRoute} from "vue-router";

const store = useStore();
const route = useRoute();

const activeTabName = computed<string>(() => `grade${route.query.grade}`);

const tempGrades = ref<string[]>([]);
const tabGrades = computed(() => tempGrades.value.concat(store.grades.slice()).sort());
watch(() => route.query.grade, (grade) => {
  if (!!grade && store.grades.indexOf(`${grade}`) === -1 && tabGrades.value.indexOf(`${grade}`) === -1) {
    tempGrades.value.push(`${grade}`);
    tempGrades.value.sort();
  }
}, {immediate: true});
</script>

<template>
  <div class="grade-tab">
    <van-tabs type="card" color="#32647d" :background="`transparent`" :active="activeTabName" :key="`tabs${tabGrades.join(',')}`">
      <van-tab v-for="grade in tabGrades" :name="`grade${grade}`" :key="`grade${grade}`" :title="grade" :to="{name: 'course', query:{grade}}"/>
    </van-tabs>
  </div>
</template>

<style scoped>
.grade-tab {
  margin-bottom: 15px;
}
</style>
