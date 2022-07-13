<script setup lang="ts">
import {zhCN, dateZhCN} from "naive-ui";
import {useStore} from "../../pinia/useStore";
import LessonConfigEditor from "./LessonConfigEditor.vue";

const store = useStore();
</script>

<template>
  <div class="course-editor">
    <div class="responsive-left-part">
      <div aria-label="课程信息">
        <n-divider :dashed="true">课表名称</n-divider>
        <n-input v-model:value="store.config.tableName" placeholder="课表名称"
                 :status="store.config.tableName ? `success` : `error`"/>
      </div>

      <n-divider :dashed="true">学期开始日期(用于计算周数)</n-divider>
      <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
        <n-date-picker v-model:formatted-value="store.config.semesterStartDate"
                       placement="bottom"
                       :is-date-disabled="d => (new Date(d)).getDay() !== 1"
                       value-format="yyyy-MM-dd"
                       type="date"/>
      </n-config-provider>

      <n-divider :dashed="true">学期最大周数</n-divider>
      <n-input-number v-model:value="store.config.maxWeekNum"
                      :update-value-on-input="false" placeholder="n" :min="0">
        <template #prefix>本学期共</template>
        <template #suffix>周</template>
      </n-input-number>
    </div>

    <div class="responsive-middle-divider"/>

    <div class="responsive-right-part">
      <LessonConfigEditor/>
    </div>
  </div>
</template>

<style scoped>
.course-editor {
  display: flex;
  margin: 30px 30px;
}

</style>