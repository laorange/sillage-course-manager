<script setup lang="ts">
import ContextMenu from "@imengyu/vue3-context-menu";

function onContextMenu(e: MouseEvent) {
  e.preventDefault();
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: "新增课程",
        onClick: () => {
          alert("新增课程");
        },
      },
      {
        label: "粘贴",
        disabled: true,
        onClick: () => {
          alert("粘贴");
        },
      },
    ],
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
