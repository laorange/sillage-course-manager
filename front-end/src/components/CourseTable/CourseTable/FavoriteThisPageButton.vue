<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed} from "vue";
import {useStore} from "../../../pinia/useStore";
import {useDialog, useMessage} from "naive-ui";

const store = useStore();
const route = useRoute();
const message = useMessage();
const dialog = useDialog();

const isInFavorites = computed<boolean>(() => store.localConfig.favorites.map(f => f.fullPath).indexOf(route.fullPath) > -1);

const buttonInnerText = computed<string>(() => isInFavorites.value ? store.translate(`取消收藏`) : store.translate(`收藏本页`));

const buttonType = computed<string>(() => isInFavorites.value ? "error" : "success");

function buttonClickHandler(): void {
  if (!isInFavorites.value) {
    store.localConfig.favorites.push({path: route.path, query: route.query, params: route.params, fullPath: route.fullPath});
    message.success(store.translate("已收藏"));
  } else {
    dialog.warning({
      title: `${store.translate("取消收藏")}?`,
      positiveText: store.translate("确定"),
      negativeText: store.translate("取消"),
      onPositiveClick: () => store.localConfig.favorites = store.localConfig.favorites.filter(f => f.fullPath !== route.fullPath),
    });
  }
}
</script>

<template>
  <n-button :dashed="true" @click="buttonClickHandler()" :type="buttonType">
    {{ buttonInnerText }}
  </n-button>
</template>

<style scoped>

</style>
