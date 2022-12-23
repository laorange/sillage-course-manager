<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from "vue";
import {useStore} from "../../pinia/useStore";
import {useRouter} from "vue-router";
import {useMessage} from "naive-ui";

const store = useStore();
const router = useRouter();
const message = useMessage();

const newGrade = ref<string>("");
const existingGradeNewName = ref<string>("");
const selectedGrade = ref<string | null>(null);

const gradeOptions = computed(() => store.grades.map(g => {
  return {label: g, value: g};
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
      let query = {grade: newGrade.value};
      newGrade.value = "";
      router.push({name: "course", query});
    }
  },
  keyUpHandler(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      handlers.addNewGrade();
    }
  },
  cancelSelectionOfGrade() {
    selectedGrade.value = null;
  },
  async renameSelectedGrade() {
    if (selectedGrade.value) {
      // 将所有目标年级的课程改为新的名字
      let selectedGradeCourses = store.courses.filter(c => c.grade === selectedGrade.value);
      for (const course of selectedGradeCourses) {
        await store.api.course.update(course, {...course, grade: existingGradeNewName.value},
            () => message.success(`${course.info.name}的年级由${course.grade}变为${existingGradeNewName.value}`),
            () => message.error(`id为${course.id}的${course.info.name}: 年级更改失败`),
        );
        course.grade = existingGradeNewName.value;
      }

      handlers.cancelSelectionOfGrade();
    }
  },
  async deleteSelectedGrade() {
    if (selectedGrade.value) {
      // 删除所有目标年级的课程
      let selectedGradeCourses = store.courses.filter(c => c.grade === selectedGrade.value);
      for (const course of selectedGradeCourses) {
        await store.api.course.delete(course, () => message.success(`${course.info.name}删除成功`),
            () => message.error(`id为${course.id}的【${course.info.name}: 删除失败`));
      }

      store.courses = store.courses.filter(c => c.grade !== selectedGrade.value);
      handlers.cancelSelectionOfGrade();
    }
  },
};

onMounted(() => document.addEventListener("keyup", handlers.keyUpHandler));
onUnmounted(() => document.removeEventListener("keyup", handlers.keyUpHandler));
</script>

<template>
  <div class="grade-editor">
    <n-divider>新增 年级/大组</n-divider>
    <n-input-group>
      <n-input v-model:value="newGrade"
               type="text" :clearable="true"
               placeholder="请输入将要添加的年级/大组的名称"/>
      <n-button type="primary" :disabled="!validators.whetherNewGradeIsValid()" @click="handlers.addNewGrade()">确定新增</n-button>
    </n-input-group>

    <h3 v-show="!validators.whetherNewGradeIsUnique()" style="color: red">该课表名称已存在！</h3>

    <template v-if="store.grades.length>=1">
      <n-divider>已有年级/大组</n-divider>
      <n-space justify="center" :vertical="true">
        <n-select v-model:value="selectedGrade" :options="gradeOptions" :clearable="true"
                  :placeholder="`请选择 [当前共有${store.grades.length}张表]`" style="text-align: center"/>

        <n-space v-if="selectedGrade" justify="center">
          <n-popconfirm @positive-click="handlers.renameSelectedGrade" positive-text="确定" negative-text="取消">
            <template #trigger>
              <n-button type="warning">重命名</n-button>
            </template>
            <n-space :vertical="true">
              <div>
                警告：所有<strong>{{ selectedGrade }}</strong>的课程都变为<strong>{{ existingGradeNewName ? existingGradeNewName : `重命名后的年级` }}</strong>的课程
              </div>
              <div>该操作不可撤销，是否继续？</div>
              <n-input v-model:value="existingGradeNewName" placeholder="请在此处输入新的名称"/>
            </n-space>
          </n-popconfirm>

          <n-popconfirm @positive-click="handlers.deleteSelectedGrade" positive-text="确定" negative-text="取消">
            <template #trigger>
              <n-button type="error">删除</n-button>
            </template>
            警告：所有<strong>{{ selectedGrade }}</strong>的课程都将被删除，该操作不可撤销，是否继续？
          </n-popconfirm>

          <n-button type="info" @click="handlers.cancelSelectionOfGrade">取消选择</n-button>
        </n-space>
      </n-space>
    </template>
  </div>
</template>

<style>
.grade-editor {

}
</style>
