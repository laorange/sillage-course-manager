<script setup lang="ts">
import {useStore} from "../../../pinia/useStore";
import useContextMenu from "../../../assets/ts/useContextMenu";
import {Course} from "../../../assets/ts/types";

const {$contextmenu} = useContextMenu();

const props = defineProps<{ whatDay: number, lessonNum: number, coursesExisting: Course[] }>();

const store = useStore();

function addInfoInThisBlockIntoStore() {
  store.editor.coursesExisting = props.coursesExisting;
  store.editor.whatDay = props.whatDay;
  store.editor.lessonNum = props.lessonNum;
}

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
          store.editor.mode = "add";
          store.editor.show = true;
          store.editor.courseEditing = null;
          addInfoInThisBlockIntoStore();
        },
      },
      {
        label: "粘贴",
        disabled: !(store.editor.mode === "cut" || store.editor.mode === "copy"),
        onClick: () => {
          store.editor.show = true;
          addInfoInThisBlockIntoStore();
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
