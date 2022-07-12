<script setup lang="ts">
import {Situation} from "../../../assets/ts/types";
import {computed} from "vue";
import {SelectOption} from "naive-ui";

const props = defineProps<{ situations: Situation[] }>();
const emits = defineEmits(["update:situations"]);

const situationsLocal = computed<Situation[]>({
  get: () => props.situations,
  set: (newValue) => emits("update:situations", newValue),
});

function createSituation(): Situation {
  return {
    teacher: null,
    room: null,
    groups: [],
  };
}

const teacherOptions: SelectOption[] = [
  {label: "张三", value: "张三"},
  {label: "李四", value: "李四"},
];

const groupOptions: SelectOption[] = [
  {label: "A班", value: "A班"},
  {label: "B班", value: "B班"},
  {label: "C班", value: "C班"},
  {label: "D班", value: "D班"},
];

const roomOptions: SelectOption[] = [
  {label: "101", value: "101"},
  {label: "120", value: "120"},
  {label: "210", value: "210"},
  {label: "220", value: "220"},
];
</script>

<template>
  <div class="situation-editor">
    <n-dynamic-input v-model:value="situationsLocal" :on-create="createSituation">
      <template #create-button-default>添加教学计划</template>
      <template #default="{ value, index }">
        <div class="situation-editor__single-situation">
          <n-select v-model:value="value.groups" :options="groupOptions" placeholder="班级名 / 小组名"
                    :status="value.groups.length ? `success` : `error`"
                    :filterable="true" :tag="true" :clearable="true" :multiple="true"/>
          <n-select v-model:value="value.teacher" :options="teacherOptions" placeholder="教师(选填)"
                    :filterable="true" :tag="true" :clearable="true"/>
          <n-select v-model:value="value.room" :options="roomOptions" placeholder="地点(选填)"
                    :filterable="true" :tag="true" :clearable="true"/>
        </div>
      </template>
    </n-dynamic-input>
  </div>
</template>

<style scoped>
.situation-editor__single-situation {
  display: flex;
  width: 100%;
}

.situation-editor__single-situation > * {
  flex: 0 25%;
}

.situation-editor__single-situation > *:first-child {
  flex: 0 50%;
}
</style>