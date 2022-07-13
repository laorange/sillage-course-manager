<script setup lang="ts">
import {useStore} from "../../pinia/useStore";

const store = useStore();
</script>

<template>
  <h1>config</h1>
  <div class="course-editor">
    <div class="responsive-left-part">
      <div aria-label="课程信息">
        <n-divider :dashed="true">课程信息</n-divider>
      </div>

      <n-divider :dashed="true">上课周数</n-divider>
    </div>

    <div class="responsive-middle-divider"/>

    <div class="responsive-right-part">
      <div aria-label="年级（大组）">
        <n-divider :dashed="true">年级 / 大组</n-divider>
      </div>

      <div aria-label="班级（小组）">
        <n-divider :dashed="true">班级 / 小组</n-divider>
      </div>

      <div aria-label="课程颜色">
        <n-divider :dashed="true">课程颜色</n-divider>
      </div>

      <div aria-label="备注">
        <n-divider :dashed="true">备注</n-divider>
      </div>
    </div>

  </div>
</template>

<style scoped>
.course-editor {
  display: flex;
  margin: 10px 30px;
}

</style>