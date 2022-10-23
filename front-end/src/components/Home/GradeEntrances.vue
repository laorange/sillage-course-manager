<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {useRouter} from "vue-router";

const store = useStore();
const router = useRouter();

const handlers = {
  toLastVisitPage() {
    router.push({name: "last-visit"});
  },
  toToFavoritesPage() {
    router.push({name: "favorites"});
  },
};
</script>
<template>
  <div class="grade-entrances-container" v-if="store.courses.length">
    <div class="grade-entrances">
      <template v-for="grade in store.grades" :key="`grade${grade}`">
        <n-button type="success" class="grade-entrance" :round="true"
                  @click="router.push({name:`course`, query:{grade}})">
          {{ store.translate(grade) }}
        </n-button>
      </template>

      <n-button class="grade-entrance" :round="true" type="success" @click="router.push({name:`course`})" v-if="store.courses.length">{{ store.translate(`全部课程`) }}</n-button>

      <n-button class="grade-entrance" :round="true" type="success"
                @click="handlers.toLastVisitPage" v-if="store.localConfig.lastVisitPath">{{ store.translate(`上次访问`) }}
      </n-button>

      <n-button class="grade-entrance" :round="true" type="success"
                @click="handlers.toToFavoritesPage()" v-if="store.localConfig.favorites.length">{{ store.translate(`收藏夹`) }}
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.grade-entrances {
  display: flex;
  justify-content: space-between;
  align-content: space-between;
  flex-wrap: wrap;
  margin: -20px -10px;
}

.grade-entrance {
  flex: 1 40%;
  margin: 15px 10px;
}
</style>
