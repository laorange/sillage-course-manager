<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {computed} from "vue";
import DictionaryEditor from "./DictionaryEditor.vue";

const props = defineProps<{ show: boolean }>();
const emits = defineEmits(["update:show"]);

const store = useStore();

const showLocal = computed<boolean>({
  get: () => props.show,
  set: (newValue) => emits("update:show", newValue),
});

const languageOptions = [
  "English",
  "Français",
  "русский язык",
  "Deutsch",
  "Español",
  "Português",
  "日本語",
  "بالعربية",
].map(l => {
  return {label: l, value: l};
});

function onCancel() {
  showLocal.value = false;
}

</script>

<template>
  <n-drawer v-model:show="showLocal" height="100%" placement="top">
    <n-drawer-content title="外语词典配置">
      <DictionaryEditor :on-cancel="onCancel"/>
    </n-drawer-content>
  </n-drawer>

  <div>
    <div style="margin-bottom: 10px">
      <n-select
          v-model:value="store.config.languages"
          placeholder="点击此处可选择外语。若预设中无您所需，可直接输入"
          :filterable="true"
          :multiple="true"
          :tag="true"
          :options="languageOptions"
      />
    </div>
    <n-button type="info" @click="showLocal=true" v-show="store.config.languages.length!==0">配置词典</n-button>
  </div>
</template>

<style scoped>

</style>
