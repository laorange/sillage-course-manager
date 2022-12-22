<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";

const props = withDefaults(defineProps<{ width?: number }>(), {width: 1440});

const reactiveClientWidth = ref<number>(document.body.clientWidth);

const containerWidth = computed<number>(() => {
  return Math.max(reactiveClientWidth.value, props.width);
});

const containerHeight = ref<number>(0);

const containerScaleNum = computed<number>(() => document.body.clientWidth / containerWidth.value);

const adaptiveContainerWithFixedPixel = ref();

function respondToScreenResize() {
  reactiveClientWidth.value = document.body.clientWidth;
}

let intervalId: number;
onMounted(() => {
  intervalId = Number(setInterval(() => {
    let heightNow = (adaptiveContainerWithFixedPixel?.value ?? document.body)?.scrollHeight * containerScaleNum.value;
    if (heightNow !== containerHeight.value) containerHeight.value = heightNow;
  }, 200));
  window.addEventListener("resize", respondToScreenResize);
  respondToScreenResize();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", respondToScreenResize);
  clearInterval(intervalId);
});

defineExpose({
  containerWidth,
  containerHeight,
  containerScaleNum,
});
</script>

<template>
  <div :style="{
    width: `${containerWidth-1}px`,
    height: containerScaleNum<1 ? `${containerHeight}px` : `auto`,
    transform: `scale(${containerScaleNum})`,
    transformOrigin: `top left`,
  }" ref="adaptiveContainerWithFixedPixel"
  >
    <slot/>
  </div>
</template>

<style scoped>

</style>
