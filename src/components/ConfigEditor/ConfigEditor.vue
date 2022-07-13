<script setup lang="ts">
import {zhCN, dateZhCN} from "naive-ui";
import {useStore} from "../../pinia/useStore";

const store = useStore();
</script>

<template>
  <h1>config</h1>
  <div class="config-editor">
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
.config-editor {
  display: flex;
  margin: 10px 30px;
}

</style>