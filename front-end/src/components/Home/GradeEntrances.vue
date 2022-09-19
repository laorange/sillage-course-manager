<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {useRouter} from "vue-router";

const store = useStore();
const router = useRouter();

const handlers = {
  toLastVisitPage() {
    router.push({name: "last-visit"});
  },
};
</script>
<template>
  <div class="grade-entrances-container">
    <div class="grade-entrances">
      <template v-for="grade in store.grades" :key="`grade${grade}`">
        <n-button type="success" class="grade-entrance"
                  @click="router.push({name:`course`, query:{grade}})">
          {{ store.translate(grade) }}
        </n-button>
      </template>

      <n-button class="grade-entrance" type="success" @click="router.push({name:`course`})" v-if="store.courses.length">{{ store.translate(`全部课程`) }}</n-button>

      <n-button class="grade-entrance grade-entrance-full-row" type="success"
                @click="handlers.toLastVisitPage" v-if="store.localConfig.lastVisitPath">{{ store.translate(`上次访问`) }}
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

.grade-entrance-full-row {
  flex: 1 100%;
}
</style>
