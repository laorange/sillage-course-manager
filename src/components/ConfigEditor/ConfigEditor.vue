<script setup lang="ts">
import {zhCN, dateZhCN, useMessage, useDialog} from "naive-ui";
import {useStore} from "../../pinia/useStore";
import LessonConfigEditor from "./LessonConfigEditor.vue";
import GradeEditor from "./GradeEditor.vue";
import LanguageEditor from "./LanguageEditor.vue";
import {ref} from "vue";
import {onBeforeRouteLeave, useRouter} from "vue-router";

const store = useStore();
const message = useMessage();
const dialog = useDialog();
const router = useRouter();

let configBackUp = JSON.parse(JSON.stringify(store.config));

const showDictionaryEditor = ref<boolean>(false);

function isNotMonday(d: string) {
  return (new Date(d)).getDay() !== 1;
}

onBeforeRouteLeave((to) => {
  if (!to.params.force) {
    dialog.info({
      title: "提示",
      content: `当前页面未保存的信息将会丢失，是否继续？`,
      positiveText: "确定",
      negativeText: "取消",
      onPositiveClick: () => {
        handlers.restoreData();
        router.push({...to, params: {...to.params, force: "true"}});
      },
    });
    return false;
  }
});

const handlers = {
  upload() {
    let configPromise: Promise<any>;
    if (store.config.id) {
      configPromise = store.client.Records.update("config", store.config.id, {content: store.config});
    } else {
      configPromise = store.client.Records.create("config", {content: store.config});
    }
    configPromise.then(() => {
      message.success("提交成功");
      configBackUp = JSON.parse(JSON.stringify(store.config));
      handlers.backToHomeWithForce();
    }).catch(() => message.error("提交失败，请检查网络连接"));
  },
  restoreData() {
    store.config = JSON.parse(JSON.stringify(configBackUp));
  },
  resetAndLeave() {
    handlers.restoreData();
    handlers.backToHomeWithForce();
  },
  backToHomeWithForce() {
    router.push({name: "home", params: {force: "true"}});
  },
};
</script>

<template>
  <div class="config-editor">
    <h1 style="margin-bottom: 5px">系统配置</h1>

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

      <n-divider>国际化设置</n-divider>

      <LanguageEditor v-model:show="showDictionaryEditor"/>

      <n-divider/>

      <n-space justify="center" align="center">
        <n-popconfirm @positive-click="handlers.upload()" positive-text="确定" negative-text="取消">
          <template #trigger>
            <n-button type="success" size="large">保存</n-button>
          </template>
          即将把当前数据提交到服务器，是否继续？
        </n-popconfirm>

        <n-popconfirm @positive-click="handlers.resetAndLeave()" positive-text="确定" negative-text="取消">
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
  padding: 30px;
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
