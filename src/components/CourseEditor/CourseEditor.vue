<script setup lang="ts">
import {Course} from "../../assets/ts/types";
import {computed, ref} from "vue";
import WeekSelector from "./WeekSelector.vue";
import SituationEditor from "./SituationEditor.vue";

const props = defineProps<{ course: Course }>();
const emits = defineEmits(["update:course"]);

const courseLocal = computed<Course>({
  get: () => props.course,
  set: (newValue) => emits("update:course", newValue),
});

const courseNameOptions = ref([
  {
    label: "数据库设计",
    value: "数据库设计",
  },
  {
    label: "确认与验证",
    value: "确认与验证",
  }]);

const gradeOptions = ref([{
  label: "18级",
  value: "18级",
}]);

const methodOptions = ["理论课", "习题课", "实验课", "考试"].map(m => {
  return {label: m, value: m};
});


const weeks = ref<number[]>([]);
</script>

<template>
  <h3>星期三 &nbsp; 第1节课</h3>
  <div class="course-editor">
    <div class="course-editor-left">
      <div aria-label="课程信息">
        <n-divider :dashed="true">课程信息</n-divider>
        <n-space :vertical="true">
          <n-select v-model:value="courseLocal.info.name" :status="courseLocal.info.name ? `success` : `error`"
                    placeholder="课程名称（必填）" :filterable="true" :tag="true" :options="courseNameOptions"/>

          <n-input v-model:value="courseLocal.info.code" placeholder="课程代码（选填）"/>

          <n-select v-model:value="courseLocal.method" placeholder="授课方式（选填）"
                    :filterable="true" :tag="true" :clearable="true" :options="methodOptions"/>
        </n-space>
      </div>

      <n-divider :dashed="true">选择上课周数</n-divider>
      <WeekSelector v-model:weeks="weeks"/>
    </div>

    <div class="course-editor-divider"/>

    <div class="course-editor-right">
      <div aria-label="年级（大组）">
        <n-divider :dashed="true">年级 / 大组</n-divider>
        <n-select v-model:value="courseLocal.grade" :filterable="true" :tag="true" :options="gradeOptions"/>
      </div>

      <div aria-label="班级（小组）">
        <n-divider :dashed="true">班级 / 小组</n-divider>
        <SituationEditor v-model:situations="courseLocal.situations"/>
      </div>

      <div aria-label="课程颜色">
        <n-divider :dashed="true">课程颜色</n-divider>
        <n-color-picker :modes="['hex']" placement="bottom" v-model:value="courseLocal.info.bgc">
          <template #label>点此设置背景颜色</template>
        </n-color-picker>
      </div>

      <div aria-label="备注">
        <n-divider :dashed="true">备注</n-divider>
        <n-input v-model:value="courseLocal.note" placeholder="请输入备注信息（选填）"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-editor {
  display: flex;
  margin: 10px 30px;
}

.course-editor-left, .course-editor-right {
  flex: 0 50%;
  display: flex;
  flex-direction: column;
}

.course-editor-divider {
  margin: 0 2vw;
  width: 1px;
  background-color: black;
}

@media screen and (max-width: 1200px) {
  .course-editor-divider {
    display: none;
  }

  .course-editor {
    flex-direction: column;
  }
}
</style>