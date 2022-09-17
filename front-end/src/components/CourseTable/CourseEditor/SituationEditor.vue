<script setup lang="ts">
import {Situation} from "../../../assets/ts/types";
import {computed} from "vue";
import {SelectOption} from "naive-ui";
import {useStore} from "../../../pinia/useStore";
import {useRoute} from "vue-router";
import {CoursesHandler} from "../../../assets/ts/courseToolkit";

const props = defineProps<{
  situations: Situation[], grade: string,
  selectedDates: string[], selectedLessonNum: number, existingCoursesHandler: CoursesHandler
}>();
const emits = defineEmits(["update:situations"]);

const store = useStore();
const route = useRoute();

const situationsLocal = computed<Situation[]>({
  get: () => props.situations,
  set: (newValue) => emits("update:situations", newValue),
});

function createSituation(): Situation {
  return {
    teachers: [],
    rooms: [],
    groups: [],
  };
}

const teacherOptions = computed<SelectOption[]>(() => store.teachers.map(teacher => {
  return {
    label: teacher, value: teacher,
    disabled: props.existingCoursesHandler.hasConflictTeachers(props.selectedDates, props.selectedLessonNum, [teacher]),
  };
}));

const groupOptions = computed<SelectOption[]>(() => (store.groupDict[props.grade] ?? []).map(group => {
  return {
    label: group, value: group,
    disabled: props.existingCoursesHandler.hasConflictGradeGroups(props.selectedDates, props.selectedLessonNum, [[props.grade, group]]),
  };
}));

const roomOptions = computed<SelectOption[]>(() => store.rooms.map(room => {
  return {
    label: room, value: room,
    disabled: props.existingCoursesHandler.hasConflictRooms(props.selectedDates, props.selectedLessonNum, [room]),
  };
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
          <n-select v-model:value="value.teachers" :options="teacherOptions" placeholder="教师(选填)"
                    :filterable="true" :tag="true" :clearable="true" :multiple="true"/>
          <n-select v-model:value="value.rooms" :options="roomOptions" placeholder="地点(选填)"
                    :filterable="true" :tag="true" :clearable="true" :multiple="true"/>
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
  flex: 1;
}
</style>
