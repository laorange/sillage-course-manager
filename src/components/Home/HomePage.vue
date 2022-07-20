<script setup lang="ts">
import {useStore} from "../../pinia/useStore";

const store = useStore();
</script>

<template>
  <main>
    <h1>{{ store.config.tableName }}</h1>
  </main>
</template>

<style scoped>

</style>
