<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";

const props = withDefaults(defineProps<{ width?: number, refreshRefer?: any, deepWatch?: boolean }>(), {width: 1440});

const reactiveClientWidth = ref<number>(document.body.clientWidth);

const containerWidth = computed<number>(() => {
  return Math.max(reactiveClientWidth.value, props.width);
});

const containerHeight = ref<number>(0);

const containerScaleNum = computed<number>(() => document.body.clientWidth / containerWidth.value);

const adaptiveContainerWithFixedPixel = ref();

function respondToScreenResize() {
  nextTick(() => {
    reactiveClientWidth.value = document.body.clientWidth;
    containerHeight.value = (adaptiveContainerWithFixedPixel?.value ?? document.body)?.scrollHeight * containerScaleNum.value;
  });
}

watch(() => props.refreshRefer, () => respondToScreenResize(), {deep: !!props.deepWatch});

onMounted(() => {
  nextTick(() => {
    window.addEventListener("resize", respondToScreenResize);
    respondToScreenResize();
  });
});
onBeforeUnmount(() => window.removeEventListener("resize", respondToScreenResize));

defineExpose({
  containerWidth,
  containerScaleNum,
});
</script>

<template>
  <div :style="{
    width: `${containerWidth-1}px`,
    height: `${containerHeight}px`,
    transform: `scale(${containerScaleNum})`,
    transformOrigin: `top left`,
  }" ref="adaptiveContainerWithFixedPixel"
  >
    <slot/>
  </div>
</template>

<style scoped>

</style>
