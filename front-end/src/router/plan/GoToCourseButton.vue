<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {useStore} from "../../pinia/useStore";

const store = useStore();
const route = useRoute();
const router = useRouter();

function goToPlanButton() {
  router.push({name: "course", query: route.query});
}
</script>

<template>
  <n-button :dashed="true" color="#32647d" @click="goToPlanButton()">{{ store.translate(`课程`) }}</n-button>
</template>

<style scoped>

</style>
