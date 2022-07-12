<script setup lang="ts">
import {Course} from "../../assets/ts/types";
import {computed, ref} from "vue";
import WeekSelector from "./WeekSelector.vue";

const props = defineProps<{ course: Course }>();
const emits = defineEmits(["update:course"]);

const courseLocal = computed<Course>({
  get: () => props.course,
  set: (newValue) => emits("update:course", newValue),
});

const options = ref([
  {
    label: "数据库设计",
    value: "数据库设计",
  },
  {
    label: "确认与验证",
    value: "确认与验证",
  }]);


const weeks = ref<number[]>([]);
</script>

<template>
  <h3>星期三 &nbsp; 第1节课</h3>
  <div class="course-editor">
    <div class="course-editor-left">
      <n-divider :dashed="true">课程信息</n-divider>
      <n-space :vertical="true">
        <n-select
            v-model:value="courseLocal.info.name"
            :filterable="true"
            :tag="true"
            :options="options"
        />

        <n-input v-model:value="courseLocal.info.code" placeholder="课程代码（选填）"/>

        <n-color-picker :modes="['hex']" placement="bottom" v-model:value="courseLocal.info.bgc">
          <template #label>设置背景颜色: {{ courseLocal.info.bgc }}</template>
        </n-color-picker>
      </n-space>
    </div>

    <div class="course-editor-divider"/>

    <div class="course-editor-right">
      <n-divider :dashed="true">选择上课周数</n-divider>
      <WeekSelector v-model:weeks="weeks"></WeekSelector>

      <n-divider :dashed="true">备注</n-divider>
      <n-input v-model:value="courseLocal.note" placeholder="请输入备注信息（选填）"/>
    </div>
  </div>
</template>

<style scoped>
.course-editor {
  display: flex;
  margin: 0 30px;
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