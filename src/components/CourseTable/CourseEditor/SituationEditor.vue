<script setup lang="ts">
import {Situation} from "../../../assets/ts/types";
import {computed} from "vue";
import {SelectOption} from "naive-ui";
import {useStore} from "../../../pinia/useStore";
import {useRoute} from "vue-router";

const props = defineProps<{ situations: Situation[] }>();
const emits = defineEmits(["update:situations"]);

const store = useStore();
const route = useRoute();

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

const teacherOptions = computed<SelectOption[]>(() => store.teachers.map(t => {
  return {label: t, value: t};
}));

const groupOptions = computed<SelectOption[]>(() => (store.groupDict[route.query.grade as string] ?? []).map(g => {
  return {label: g, value: g};
}));

const roomOptions = computed<SelectOption[]>(() => store.rooms.map(r => {
  return {label: r, value: r};
}));
</script>

<template>
  <div class="situation-editor">
    <n-dynamic-input v-model:value="situationsLocal" :on-create="createSituation">
      <template #create-button-default>
        <div>添加教学计划</div>
      </template>
      <template #default="{ value, index }">
        <div class="situation-editor__single-situation">
          <n-select v-model:value="value.groups" :options="groupOptions" placeholder="班级名 / 小组名"
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
