<script setup lang="ts">
import {inject, Ref} from "vue";
import useEmptyCourseCard from "../../../assets/ts/useEmptyCourseCard";
import RouteFilter from "../RouteFilter/RouteFilter.vue";
import ContextMenu from "@imengyu/vue3-context-menu";
import {useStore} from "../../../pinia/useStore";

const props = defineProps<{ lessonNum: number, queryDate: string, isDateMode: boolean }>();

const store = useStore();

const routeFilter = inject("routeFilter") as Ref<typeof RouteFilter>;

const {getContextMenuItems} = useEmptyCourseCard();

function onContextMenu(e: MouseEvent) {
  e.preventDefault();
  store.editor.lessonNum = props.lessonNum;

  ContextMenu.showContextMenu({
    x: e.pageX,
    y: e.pageY,
    items: getContextMenuItems(routeFilter?.value?.sources?.grades ?? [], props.lessonNum, props.queryDate, props.isDateMode),
  });
}
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
