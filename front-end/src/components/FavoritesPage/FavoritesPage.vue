<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {useRouter} from "vue-router";
import {parseCourseRoute} from "../../assets/ts/courseToolkit";
import {useDialog} from "naive-ui";
import {AdsClickSharp} from "@vicons/material";
import {MinimalRoute} from "../../assets/ts/types";

const store = useStore();
const router = useRouter();
const dialog = useDialog();

const handler = {
  backToHome(event?: MouseEvent) {
    event?.stopPropagation();
    router.push({name: "home"});
  },
  goToFavoriteRoute(route: MinimalRoute) {
    router.push(route);
  },
  deleteFavoriteRoute(route: MinimalRoute, event?: MouseEvent) {
    event?.stopPropagation();
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

        <template v-for="favoriteRoute in store.localConfig.favorites" :key="favoriteRoute.fullPath">
          <div class="favorite-card" v-if="store.localConfig.favorites.length > 0">
            <n-card :hoverable="true" @click="handler.goToFavoriteRoute(favoriteRoute)">
              <template #header>
                <n-space justify="center" align="start">
                  <n-icon size="25">
                    <AdsClickSharp/>
                  </n-icon>
                  <n-ellipsis style="max-width: 60vw">{{ parseCourseRoute(favoriteRoute).title }}</n-ellipsis>
                </n-space>
              </template>

              <template #header-extra>
                <div class="close-cross" @click="handler.deleteFavoriteRoute(favoriteRoute, $event)">
                  <n-icon size="18">
                    <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g fill="currentColor" fill-rule="nonzero">
                          <path
                              d="M2.08859116,2.2156945 L2.14644661,2.14644661 C2.32001296,1.97288026 2.58943736,1.95359511 2.7843055,2.08859116 L2.85355339,2.14644661 L6,5.293 L9.14644661,2.14644661 C9.34170876,1.95118446 9.65829124,1.95118446 9.85355339,2.14644661 C10.0488155,2.34170876 10.0488155,2.65829124 9.85355339,2.85355339 L6.707,6 L9.85355339,9.14644661 C10.0271197,9.32001296 10.0464049,9.58943736 9.91140884,9.7843055 L9.85355339,9.85355339 C9.67998704,10.0271197 9.41056264,10.0464049 9.2156945,9.91140884 L9.14644661,9.85355339 L6,6.707 L2.85355339,9.85355339 C2.65829124,10.0488155 2.34170876,10.0488155 2.14644661,9.85355339 C1.95118446,9.65829124 1.95118446,9.34170876 2.14644661,9.14644661 L5.293,6 L2.14644661,2.85355339 C1.97288026,2.67998704 1.95359511,2.41056264 2.08859116,2.2156945 L2.14644661,2.14644661 L2.08859116,2.2156945 Z"></path>
                        </g>
                      </g>
                    </svg>
                  </n-icon>
                </div>
              </template>
            </n-card>
          </div>
        </template>

        <n-button type="primary" :dashed="true" :round="true" @click="handler.backToHome()">
          {{ store.translate(`返回首页`) }}
        </n-button>
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

.favorite-card {
  min-width: 80vw;
  cursor: pointer;
}

.close-cross {
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-content: center;
}

.close-cross:hover {
  background-color: #cccccc;
}
</style>
