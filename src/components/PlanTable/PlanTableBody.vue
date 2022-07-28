<script setup lang="ts">
// @ts-ignore
import DataGridXL from "@datagridxl/datagridxl2";
import {computed, nextTick, ref, watch} from "vue";
import {Course} from "../../assets/ts/types";
import {useStore} from "../../pinia/useStore";

const props = defineProps<{ courses: Course[] }>();
const store = useStore();

// region 常数
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
// endregion

// region 类型
type GridData = (string | number)[]

class PlanSituationRecord {
  teacher: string;
  method: string;
  group: string;
  weekTimes: number[];

  constructor(method: string, teacher: string, group: string) {
    this.teacher = teacher;
    this.method = method;
    this.group = group;
    this.weekTimes = (new Array<number>(store.config.content.maxWeekNum)).fill(0);
  }

  addDates(dates: string[]) {
    for (const date of dates) {
      let weekIndex = store.getWeekNumOfSomeDate(date) - 1;
      if (weekIndex >= 0 && weekIndex < this.weekTimes.length) {
        this.weekTimes[weekIndex] += 1;
      }
    }
  }
}

// endregion

// region 函数
function addRecord(records: PlanSituationRecord[], method: string, teacher: string, group: string, dates: string[]) {
  let existRecords = records.filter(record => record.method === method && record.teacher === teacher && record.group === group);
  if (existRecords.length) {
    existRecords.map(record => record.addDates(dates));
  } else {
    let newRecord = new PlanSituationRecord(method, teacher, group);
    newRecord.addDates(dates);
    records.push(newRecord);
  }
}

function getOptions(data: GridData[]) {
  const columns = [
    {
      title: store.translate(`年级`),
      source: 0,
    },
    {
      title: store.translate(`名称`),
      source: 1,
    },
    {
      title: store.translate(`授课教师`),
      source: 2,
    },
    {
      title: store.translate(`授课方式`),
      source: 3,
    },
    {
      title: store.translate(`班级`),
      source: 4,
    },
    {
      title: `𝚺`,
      source: 5,
    },
  ];
  for (let i = 0; i < store.config.content.maxWeekNum; i++) {
    columns.push({title: `${i + 1}`, source: 6 + i});
  }

  return {
    data: data.length ? data : undefined,
    columns: columns,
    // disallow drag actions
    allowInsertRows: false,
    allowDeleteRows: false,
    allowMoveRows: false,
    allowInsertCols: false,
    allowDeleteCols: false,
    allowMoveCols: false,
    allowFillCells: false,
    allowEditCells: false,
    // disallow clipboard
    allowCut: false,
    allowPaste: false,
    locale: localeOptions,
  };
}

function refreshGridData() {
  const gradeNameRecord: { [grade: string]: { [courseName: string]: PlanSituationRecord[] } } = {};

  for (const course of props.courses) {
    if (!gradeNameRecord[course.grade]) gradeNameRecord[course.grade] = {};
    if (!gradeNameRecord[course.grade][course.info.name]) gradeNameRecord[course.grade][course.info.name] = [];

    if (course.situations.length) {
      for (const situation of course.situations) {
        if (situation.groups.length) {
          for (const group of situation.groups) {
            addRecord(gradeNameRecord[course.grade][course.info.name], course.method ?? "", situation.teacher ?? "", group, course.dates);
          }
        } else {
          addRecord(gradeNameRecord[course.grade][course.info.name], course.method ?? "", situation.teacher ?? "", "", course.dates);
        }
      }
    } else {
      addRecord(gradeNameRecord[course.grade][course.info.name], course.method ?? "", "", "", course.dates);
    }
  }

  const _gridDataArray: GridData[] = [];
  for (const [grade, value] of Object.entries(gradeNameRecord)) {
    for (const [courseName, records] of Object.entries(value)) {
      for (const record of records) {
        let gridData: GridData = [];
        gridData.push(store.translate(grade));
        gridData.push(store.translate(courseName));
        gridData.push(store.translate(record.teacher));
        gridData.push(store.translate(record.method));
        gridData.push(store.translate(record.group));
        gridData.push(record.weekTimes.reduce((sum, weekTime) => sum + weekTime, 0));
        record.weekTimes.map(weekTime => gridData.push(weekTime));
        console.log(gridData);
        _gridDataArray.push(gridData);
      }
    }
  }
  console.log(getOptions(_gridDataArray));
  nextTick(() => {
    planTableBodyObj.value = new DataGridXL(planTableBody.value, getOptions(_gridDataArray));
    Object.assign(document.body, {dataGridObj: planTableBody.value});
  });
}

// endregion

// region 响应式数据
const planTableBody = ref();
const planTableBodyObj = ref<any>(undefined);

const source = computed(() => {
  return {
    courses: props.courses,
    config: store.config,
  };
});
// endregion

watch(() => source.value, refreshGridData, {deep: true, immediate: true});
</script>

<template>
  <div class="plan-table-body">
    <div ref="planTableBody" class="grid"></div>
  </div>
</template>

<style scoped>
.grid {
  height: 80vh;
}
</style>
