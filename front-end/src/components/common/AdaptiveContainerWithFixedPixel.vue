<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";

const props = withDefaults(defineProps<{ width?: number }>(), {width: 1440});

const reactiveClientWidth = ref<number>(document.body.clientWidth);

function synchronizeWidth() {
  reactiveClientWidth.value = document.body.clientWidth;
}

const containerWidth = computed<number>(() => {
  return Math.max(reactiveClientWidth.value, props.width);
});

const containerScaleNum = computed<number>(() => document.body.clientWidth / containerWidth.value);

onMounted(() => {
  window.addEventListener("resize", synchronizeWidth);
  synchronizeWidth();
});
onBeforeUnmount(() => window.removeEventListener("resize", synchronizeWidth));

defineExpose({
  containerWidth,
  containerScaleNum,
});
</script>

<template>
  <div :style="{width: `${containerWidth-1}px`, zoom: containerScaleNum}">
    <slot/>
  </div>
</template>

<style scoped>

</style>
