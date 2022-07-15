<script setup lang="ts">
import {onBeforeRouteUpdate, useRoute} from "vue-router";
import {useStore} from "../../pinia/useStore";

onBeforeRouteUpdate((to) => {
  if (!(to.query.grade)) {
    return {name: "docs"};
  }
});

const route = useRoute();
const store = useStore();

</script>

<template>
    <h1>{{store.config.tableName}}</h1>
  <h2>{{ route.query.grade }}</h2>

  <div class="course-table-body">
    <div class="course-table-row" v-for="(lessonConfig, row0) in store.config.lessonConfigs" :key="`lessonNum${lessonNum}`">
      <div class="lesson-start-end-time">
        <div>{{ lessonConfig.start }}</div>
        <div>{{ lessonConfig.end }}</div>
      </div>
      <div class="course-table-block" v-for="whatDay in 7" :key="`whatDay${whatDay}`">
        <div class="course-card">
          {{ row0 + 1 }} - {{ whatDay }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-table-body {
  display: flex;
  flex-direction: column;
  border-top: black 1px solid;
  border-left: black 1px solid;
}

.course-table-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  min-height: 10vh;
  border-bottom: black 1px solid;
}

.lesson-start-end-time {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-right: black 1px solid;
}

.course-table-block {
  min-width: 10vw;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: black 1px solid;
}
</style>
