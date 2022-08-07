<script setup lang="ts">
// @ts-ignore
import DataGridXL from "@datagridxl/datagridxl2";
import {computed, onMounted, ref} from "vue";
import {useStore} from "../../pinia/useStore";
import {useMessage} from "naive-ui";

const store = useStore();
const message = useMessage();

const props = defineProps<{ onCancel: () => any }>();

interface GridRowData {
  [language: string]: string;
}

const localeOptions = {
  "Copy": "复制",
  "Cut": "剪切",
  "Paste": "粘贴",
  "Delete Row(s)": "删除行",
  "Insert Row(s) (up)": "在上方插入行",
  "Insert Row(s) (down)": "在下方插入行",
  "Delete Column(s)": "删除列",
  "Insert Column(s) (left)": "在左侧插入列",
  "Insert Column(s) (right)": "在右侧插入列",
  "Deselect": "取消选择",
  "Search": "搜索",
};

const initData = computed<GridRowData[]>(() => store.dictionaryItems.map(item => {
  let itemData: GridRowData = {};
  for (let i = 0; i < store.config.content.languages.length; i++) {
    itemData["中文"] = item;
    itemData[store.config.content.languages[i]] = (store.config.content.dictionary[item] ?? [])[i] ?? "";
  }
  return itemData;
}));

const dataGridOptions = computed(() => {
  return {
    data: initData.value,
    allowDeleteRows: false,
    allowInsertRows: false,
    allowMoveRows: false,
    allowHideRows: false,
    allowShowRows: false,
    allowDeleteCols: false,
    allowInsertCols: false,
    allowMoveCols: false,
    allowHideCols: false,
    allowShowCols: false,
    locale: localeOptions,
  };
});

const dataGrid = ref();

const dataGridObj = ref<any>(undefined);

function saveDictionaryToStore(gridObj: DataGridXL) {
  for (const row of (gridObj.getData() as GridRowData[])) {
    store.config.content.dictionary[row["中文"]] = store.config.content.languages.map(l => row[l] ?? "");
  }

  message.success("已保存");
  props.onCancel();
}

onMounted(() => {
  dataGridObj.value = new DataGridXL(dataGrid.value, dataGridOptions.value);
  Object.assign(document.body, {dataGridObj: dataGridObj.value});
});
</script>

<template>
  <div class="dictionary-editor">
    <div ref="dataGrid" class="grid"></div>
  </div>
  <n-space justify="center">
    <n-button type="success" @click="saveDictionaryToStore(dataGridObj)">保存配置</n-button>
    <n-button type="warning" @click="onCancel()">取消修改</n-button>
  </n-space>
</template>

<style>
.grid {
  height: 80vh;
}
</style>
