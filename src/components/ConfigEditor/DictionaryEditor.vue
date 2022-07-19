<script setup lang="ts">
import Spreadsheet from "x-data-spreadsheet";
import {Options} from "x-data-spreadsheet";
import {computed, onMounted, ref} from "vue";
import {useStore} from "../../pinia/useStore";
import {SpreadsheetRow, SpreadsheetRows} from "../../assets/ts/types";

const store = useStore();

const maxCol = computed<number>(() => store.config.languages.length + 1);

const totalWidth = computed<number>(() => {
  if (window.innerWidth > 1200) {
    return window.innerWidth / 2 - 80;
  } else {
    return window.innerWidth - 80;
  }
});

const colWidth = computed<number>(() => {
  if (maxCol.value <= 5) {
    return (totalWidth.value - 85) / maxCol.value;
  } else {
    return 100;
  }
});

const xSpreadSheet = ref();
const gridInitData = computed(() => {
  let rows: SpreadsheetRows = {
    len: store.dictionaryItems.length + 1, // +1：表头(语言)
    0: {"cells": {0: {text: "中文", editable: false}}},
  };

  store.config.languages.map((l, i) => rows[0].cells[i + 1] = {text: l, editable: false});

  for (let i = 0; i < store.dictionaryItems.length; i++) {
    let dictionaryItem = store.dictionaryItems[i];
    rows[i + 1] = {cells: {0: {text: dictionaryItem}}};

    let translations = store.config.dictionary[store.dictionaryItems[i]] ?? [];
    translations.map((translation, j) => rows[i + 1].cells[j + 1] = {"text": translation});
  }
  return [{
    "name": "dictionary",
    "freeze": "A1",
    "rows": rows,
  }];
});

const gridOptions: Options = {
  mode: "edit", // edit | read
  showToolbar: false,
  showBottomBar: false,
  showGrid: true,
  showContextmenu: true,
  view: {
    height: () => 400,
    width: () => totalWidth.value,
  },
  col: {
    len: maxCol.value,
    width: colWidth.value,
    indexWidth: 60,
    minWidth: 60,
  },
  style: {
    bgcolor: "#ffffff",
    align: "left",
    valign: "middle",
    textwrap: false,
    strike: false,
    underline: false,
    color: "#0a0a0a",
    font: {
      name: "Helvetica",
      size: 10,
      bold: false,
      italic: false,
    },
  },
};

onMounted(() => {
  new Spreadsheet(xSpreadSheet.value as HTMLElement, gridOptions)
      .loadData(gridInitData.value)
      .change(data => {
            for (const [rowIndex, row] of Object.entries(data.rows)) {
              if (rowIndex !== "len" && rowIndex !== "0") {
                let dictionaryKey: string = "";
                let dictionaryValue = [];

                for (const [cellIndex, cellValue] of (Object.entries((row as SpreadsheetRow).cells))) {
                  // 其他外语，依次填入
                  if (cellIndex === "0") {
                    dictionaryKey = cellValue.text;
                  } else {
                    dictionaryValue.push(cellValue.text);
                  }
                }

                if (dictionaryKey) {
                  // data=>store.config
                  store.config.dictionary[dictionaryKey] = dictionaryValue;
                }
              }
            }
          },
      );
});
</script>

<template>
  <div ref="xSpreadSheet" id="x-app"/>
</template>

<style scoped>

</style>
