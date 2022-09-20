<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {computed} from "vue";
import {Language} from "@vicons/ionicons5";

const store = useStore();

const languageOptions = computed(() => ["中文"].concat(store.config.content.languages).map(language => {
  return {
    value: language,
    label: language,
  };
}));
</script>

<template>
  <div class="language-selector" v-if="store.config.content.languages.length">
    <n-popselect v-model:value="store.localConfig.language" :options="languageOptions" trigger="click">
      <n-button color="#fff" :round="true" text-color="#000" style="flex: 1">
        {{ store.localConfig.language }}
        <template #icon>
          <Language/>
        </template>
      </n-button>
    </n-popselect>
  </div>
</template>

<style scoped>
.language-selector {
  display: flex;
  justify-content: center;
}
</style>
