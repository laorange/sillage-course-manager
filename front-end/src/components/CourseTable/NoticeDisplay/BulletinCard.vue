<script setup lang="ts">
// @ts-ignore
import Markdown from "vue3-markdown-it";

defineProps<{ content: string }>();
</script>

<template>
  <Markdown :source="content"/>
</template>

<style scoped>

</style>
