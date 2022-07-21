<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {useRouter} from "vue-router";
import config from "../../../package.json";
import {computed, ref} from "vue";

const store = useStore();
const router = useRouter();

const languageIndex = ref(0);

const languageOptions = computed(() => ["简体中文"].concat(store.config.languages).map((language, index) => {
  return {
    value: index,
    label: language,
  };
}));

const handlers = {
  toDocs() {
    window.open("https://laorange.github.io/sillage-docs");
  },
  toConfig() {
    router.push({name: "config"});
  },
};
</script>

<template>
  <main>
    <n-space :vertical="true" justify="center" align="center" size="large">
      <h1>{{ store.config.tableName }}</h1>
      <div class="version">v{{ config.version }}</div>

      <div class="language-selector">
        <n-select v-model:value="languageIndex" :options="languageOptions"/>
      </div>

      <n-button v-for="grade in store.grades"
                :key="`grade${grade}`"
                type="success" size="large"
                @click="router.push({name:`course`, query:{grade}})">
        {{ grade }}
      </n-button>

      <n-button type="info" @click="handlers.toDocs">使用说明</n-button>

      <n-button type="warning" @click="handlers.toConfig">系统配置</n-button>
    </n-space>
  </main>
</template>

<style scoped>
main {
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  margin-bottom: 0;
}

.version {
}

.language-selector {
  min-width: 200px;
}
</style>
