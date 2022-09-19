<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {useRouter} from "vue-router";
import {parseCourseRoute} from "../../assets/ts/courseToolkit";
import {useDialog} from "naive-ui";
import {TrashOutline, RocketOutline} from "@vicons/ionicons5";
import {MinimalRoute} from "../../assets/ts/types";

const store = useStore();
const router = useRouter();
const dialog = useDialog();

const handler = {
  backToHome() {
    router.push({name: "home"});
  },
  goToFavoriteRoute(route: MinimalRoute) {
    router.push(route);
  },
  deleteFavoriteRoute(route: MinimalRoute) {
    dialog.warning({
      title: `${store.translate("取消收藏")}?`,
      positiveText: store.translate("确定"),
      negativeText: store.translate("取消"),
      onPositiveClick: () => store.localConfig.favorites = store.localConfig.favorites.filter(f => f.fullPath !== route.fullPath),
    });
  },
};
</script>

<template>
  <div class="favorites-page">
    <h1>{{ store.translate(`收藏夹`) }}</h1>

    <div class="favorite-grid">
      <n-space justify="center" align="center" :vertical="true" :size="30">
        <h2 v-if="store.localConfig.favorites.length === 0">{{ store.translate(`这里空空如也`) }}</h2>

        <n-grid cols="4" :x-gap="10" :y-gap="30">
          <template v-for="favoriteRoute in store.localConfig.favorites" :key="favoriteRoute.fullPath">
            <n-gi span="3">
              <n-button style="min-width: 70vw" type="info" :dashed="true" @click="handler.goToFavoriteRoute(favoriteRoute)">
                <n-ellipsis style="max-width: 50vw">{{ parseCourseRoute(favoriteRoute).title }}</n-ellipsis>
                <template #icon>
                  <RocketOutline/>
                </template>
              </n-button>
            </n-gi>
            <n-gi>
              <n-button type="error" :dashed="true" @click="handler.deleteFavoriteRoute(favoriteRoute)">
                <template #icon>
                  <TrashOutline/>
                </template>
              </n-button>
            </n-gi>
          </template>
        </n-grid>

        <n-button type="primary" @click="handler.backToHome" :dashed="true">{{ store.translate(`返回首页`) }}</n-button>
      </n-space>
    </div>
  </div>
</template>

<style scoped>
h1 {
  padding-top: 40px;
  margin-bottom: 50px;
}

.favorite-grid {
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
}
</style>
