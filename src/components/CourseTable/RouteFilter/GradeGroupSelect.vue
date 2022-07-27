<script setup lang="ts">
import {GradeGroupArray} from "../../../assets/ts/types";
import {computed, ref, watch} from "vue";
import {useStore} from "../../../pinia/useStore";
import {CascaderOption} from "naive-ui";

const props = defineProps<{ groups: GradeGroupArray[], placeholder: string }>();
const emits = defineEmits(["update:groups"]);

const store = useStore();

const cascaderValue = computed<null | string[]>({
  get: () => {
    if (!props.groups) {
      return null;
    } else {
      return props.groups.map(g => JSON.stringify(g));
    }
  },
  set: (newValue) => {
    if (!newValue) {
      emits("update:groups", []);
    } else {
      emits("update:groups", newValue.map(ggStr => JSON.parse(ggStr) as GradeGroupArray));
    }
  },
});

const cascaderOptions = computed<CascaderOption[]>(() => {
  let _options: CascaderOption[] = [];
  for (const [grade, groups] of Object.entries(store.groupDict)) {
    _options.push({
      label: grade,
      value: grade,
      disabled: !groups.filter(_ => !!_).length,
      children: groups.map(group => {
        return {label: group, value: JSON.stringify([grade, group])};
      }),
    });
  }
  return _options;
});
</script>

<template>
  <n-form-item :label="placeholder">
    <n-cascader
        v-model:value="cascaderValue"
        :multiple="true"
        :clearable="true"
        :placeholder="placeholder"
        max-tag-count="responsive"
        expand-trigger="hover"
        placement="bottom"
        :options="cascaderOptions"
        :cascade="true"
        :show-path="true"
        check-strategy="child"
        :filterable="true"
        size="small"
        :clear-filter-after-select="true"
    />
  </n-form-item>
</template>

<style scoped>

</style>
