<script setup lang="ts">
import {useStore} from "../../../pinia/useStore";
import useContextMenu from "../../../assets/ts/useContextMenu";

const {$contextmenu} = useContextMenu();

const props = defineProps<{ whatDay: number, lessonNum: number }>();

const store = useStore();

function onContextMenu(e: MouseEvent) {
  e.preventDefault();
  console.log(e);
  $contextmenu({
    x: e.pageX,
    y: e.pageY,
    items: [
      {
        label: "新增课程",
        onClick: () => {
          store.editor.show = true;
          store.editor.mode = "add";
          store.editor.whatDay = props.whatDay;
          store.editor.lessonNum = props.lessonNum;
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
