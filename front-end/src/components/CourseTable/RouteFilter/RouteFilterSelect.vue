<script setup lang="ts">
import {computed} from "vue";
import {useStore} from "../../../pinia/useStore";

const props = defineProps<{ value: string[], optionStrArray: string[], placeholder: string }>();
const emits = defineEmits(["update:value"]);

const store = useStore();

const valueLocal = computed<string[]>({
  get: () => props.value,
  set: (newValue) => emits("update:value", newValue),
});
</script>

<template>
  <n-form-item :label="placeholder">
    <n-select
        v-model:value="valueLocal"
        :filterable="true"
        :multiple="true"
        :tag="true"
        :clearable="true"
        max-tag-count="responsive"
        :placeholder="placeholder"
        :options="optionStrArray.map(_=>{return {label: store.translate(_), value: _}})"
    />
  </n-form-item>
</template>

<style scoped>

</style>
