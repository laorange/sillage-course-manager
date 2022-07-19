<script setup lang="ts">
import {zhCN, dateZhCN} from "naive-ui";
import {useStore} from "../../pinia/useStore";
import LessonConfigEditor from "./LessonConfigEditor.vue";
import GradeEditor from "./GradeEditor.vue";
import DictionaryEditor from "./DictionaryEditor.vue";

const store = useStore();

function isNotMonday(d: string) {
  return (new Date(d)).getDay() !== 1;
}

const handlers = {
  upload() {
    alert("提交后端");
  },
  reset() {
    alert("重新请求后端");
  },
};
</script>

<template>
  <div class="config-editor">
    <div class="two-column-editor">
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
                         :is-date-disabled="isNotMonday"
                         :actions="[]"
                         value-format="yyyy-MM-dd"
                         type="date"/>
        </n-config-provider>

        <n-divider :dashed="true">学期最大周数</n-divider>
        <n-input-number v-model:value="store.config.maxWeekNum"
                        :update-value-on-input="false" placeholder="n" :min="1">
          <template #prefix>本学期共</template>
          <template #suffix>周</template>
        </n-input-number>
      </div>

      <div class="responsive-middle-divider"/>

      <div class="responsive-right-part">
        <div style="text-align:center;">
          <LessonConfigEditor/>
        </div>
      </div>
    </div>

    <div class="responsive-single-column">
      <GradeEditor/>

      <n-divider/>

      <DictionaryEditor/>

      <n-divider/>

      <n-space justify="center" align="center">
        <n-popconfirm @positive-click="handlers.upload()" positive-text="确定" negative-text="取消">
          <template #trigger>
            <n-button type="success" size="large">保存</n-button>
          </template>
          即将把当前数据提交到服务器，是否继续？
        </n-popconfirm>

        <n-popconfirm @positive-click="handlers.reset()" positive-text="确定" negative-text="取消">
          <template #trigger>
            <n-button type="default" size="large">取消</n-button>
          </template>
          当前未保存的信息将会丢失，是否继续？
        </n-popconfirm>

      </n-space>
    </div>
  </div>
</template>

<style scoped>
.config-editor {
  margin: 30px;
}

.two-column-editor {
  display: flex;
}

.responsive-left-part, .responsive-right-part {
  flex: 0 50%;
  display: flex;
  flex-direction: column;
}

.responsive-middle-divider {
  margin: 0 2vw;
  width: 1px;
  background-color: black;
}

.responsive-single-column {
  margin: 0 25vw;
}

@media screen and (max-width: 1200px) {
  .responsive-middle-divider {
    display: none;
  }

  .two-column-editor {
    flex-direction: column;
  }

  .responsive-single-column {
    margin: 0 0;
  }
}
</style>
