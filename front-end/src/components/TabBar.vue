<script setup lang="ts">
import {computed, ref} from "vue";
import {useRoute} from "vue-router";
import {Star} from "@vicons/ionicons5";

const route = useRoute();

const activeIndex = ref(route.name ?? "");

const lastVisitIconColor = computed(() => {
  return route.name === "course" ? "#1989fa" : undefined;
});
</script>
<template>
  <van-tabbar v-model="activeIndex" placeholder route>
    <van-tabbar-item icon="wap-home" name="home" to="/"></van-tabbar-item>
    <van-tabbar-item icon="star" name="course" to="/last-visit/">
      <template #icon="props">
        <n-icon :color="lastVisitIconColor">
          <Star/>
        </n-icon>
      </template>
    </van-tabbar-item>
  </van-tabbar>
</template>

<style scoped>

</style>
