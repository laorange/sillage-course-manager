<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {useStore} from "../../pinia/useStore";

const store = useStore();

const newGrade = ref<string>("");
const existingGradeNewName = ref<string>("");
const selectedGradeIndex = ref<number | null>(null);
watch(() => selectedGradeIndex.value, (i) => existingGradeNewName.value = (store.grades[i ?? -1]) ?? "");

const gradeOptions = computed(() => store.grades.map((g, index) => {
  return {label: g, value: index};
}));

const validators = {
  whetherNewGradeHasContent(): boolean {
    return !!newGrade.value.length;
  },
  whetherNewGradeIsUnique(): boolean {
    return !newGrade.value.length || store.grades.indexOf(newGrade.value) === -1;
  },
  whetherNewGradeIsValid(): boolean {
    return validators.whetherNewGradeHasContent() && validators.whetherNewGradeIsUnique();
  },
};

const handlers = {
  addNewGrade() {
    if (validators.whetherNewGradeIsValid()) {
      store.grades.push(newGrade.value);
      newGrade.value = "";
    }
  },
  keyUpHandler(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      handlers.addNewGrade();
    }
  },
  cancelSelectionOfGrade() {
    selectedGradeIndex.value = null;
  },
  renameSelectedGrade() {
    if ((store.grades[selectedGradeIndex.value ?? -1]) ?? false) {
      alert("提交后端");
      for (const course of store.courses) {
        if (course.grade === store.grades[selectedGradeIndex.value ?? -1]) {
          course.grade = existingGradeNewName.value;
        }
      }
    }
  },
  deleteSelectedGrade() {
    if ((store.grades[selectedGradeIndex.value ?? -1]) ?? false) {
      alert("提交后端");
      store.courses = store.courses.filter(c => c.grade !== store.grades[selectedGradeIndex.value ?? -1]);
    }
  },
};

onMounted(() => document.addEventListener("keyup", handlers.keyUpHandler));
onUnmounted(() => document.removeEventListener("keyup", handlers.keyUpHandler));
</script>

<template>
  <div class="grade-editor">
    <n-divider>新增课表</n-divider>
    <n-input-group>
      <n-input v-model:value="newGrade"
               type="text" :clearable="true"
               placeholder="请输入将要添加的课表名称"/>
      <n-button type="primary" :disabled="!validators.whetherNewGradeIsValid()" @click="handlers.addNewGrade()">确定新增</n-button>
    </n-input-group>

    <h3 v-show="!validators.whetherNewGradeIsUnique()" style="color: red">该课表名称已存在！</h3>

    <template v-if="store.grades.length>=1">
      <n-divider>现有课表</n-divider>
      <n-space justify="center" :vertical="true">
        <n-select v-model:value="selectedGradeIndex" :options="gradeOptions"
                  :placeholder="`请选择 [当前共有${store.grades.length}张表]`" style="text-align: center"/>

        <n-space v-if="!!selectedGradeIndex || selectedGradeIndex===0" justify="center">
          <n-popconfirm @positive-click="handlers.renameSelectedGrade" positive-text="确定" negative-text="取消">
            <template #trigger>
              <n-button type="warning">重命名</n-button>
            </template>
            <n-space :vertical="true">
              <div>警告：该课表所属的所有课程的信息均会随之改变</div>
              <n-input v-model:value="existingGradeNewName"/>
            </n-space>
          </n-popconfirm>

          <n-popconfirm @positive-click="handlers.deleteSelectedGrade" positive-text="确定" negative-text="取消">
            <template #trigger>
              <n-button type="error">删除</n-button>
            </template>
            警告：该课表所属的所有课程的信息均会被删除，该操作不可撤销，是否继续？
          </n-popconfirm>

          <n-button type="primary" @click="handlers.cancelSelectionOfGrade">取消选择</n-button>
        </n-space>
      </n-space>
    </template>
  </div>
</template>

<style>
.grade-editor {

}
</style>
