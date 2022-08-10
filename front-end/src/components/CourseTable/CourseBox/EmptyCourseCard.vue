<script setup lang="ts">
import {inject, Ref} from "vue";
import useEmptyCourseCard from "../../../assets/ts/hooks/useEmptyCourseCard";
import RouteFilter from "../RouteFilter/RouteFilter.vue";

const props = defineProps<{ lessonNum: number, queryDate: string, isDateMode: boolean }>();

const routeFilter = inject("routeFilter") as Ref<typeof RouteFilter>;

const {onContextMenu} = useEmptyCourseCard(routeFilter?.value?.sources?.grades ?? [], props.lessonNum, props.queryDate, props.isDateMode);
</script>

<template>
  <div class="empty-course-card" @contextmenu="onContextMenu($event)">
    <n-space justify="center" align="center">
      <div>鼠标右键查看菜单</div>
    </n-space>
  </div>
</template>

<style scoped>
.empty-course-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  height: 100%;
  min-width: var(--courseCardMinWidth);
  min-height: var(--courseCardMinHeight);
}
</style>
