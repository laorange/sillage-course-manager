<script setup lang="ts">
import {useRoute} from "vue-router";
import {useStore} from "../../pinia/useStore";
import {computed, ref, watch} from "vue";
import CourseEditDialog from "./CourseEditDialog.vue";
import WeeklyCourseTable from "./WeeklyCourseTable.vue";
import GradeTab from "./CourseEditor/GradeTab.vue";
import {Course} from "../../assets/ts/types";
import {CourseDecorator} from "../../assets/ts/courseToolkit";

const route = useRoute();
const store = useStore();

// TODO: 是否为当前学期
const currentSemester = true;

let grades = computed<string[]>(() => (route.query.grade instanceof Array ? route.query.grade : [route.query.grade]).filter(_ => !!_) as unknown as string[]);
let rooms = computed<string[]>(() => (route.query.room instanceof Array ? route.query.room : [route.query.room]).filter(_ => !!_) as unknown as string[]);
let methods = computed<string[]>(() => (route.query.method instanceof Array ? route.query.method : [route.query.method]).filter(_ => !!_) as unknown as string[]);
let teachers = computed<string[]>(() => (route.query.teacher instanceof Array ? route.query.teacher : [route.query.teacher]).filter(_ => !!_) as unknown as string[]);

const filteredCourses = computed<Course[]>(() => {
  let decorator: CourseDecorator = (currentSemester ? store.courseOfCurrentSemester : (new CourseDecorator(store.courses)));
  if (grades.value.length) decorator = decorator.ofGrades(grades.value);
  if (rooms.value.length) decorator = decorator.ofRooms(rooms.value);
  if (methods.value.length) decorator = decorator.ofMethods(methods.value);
  if (teachers.value.length) decorator = decorator.ofTeachers(teachers.value);
  return decorator.value;
});

const editable = ref<boolean>(store.editor.authenticated);
watch(() => store.editor.authenticated, newStatus => editable.value = newStatus);
</script>

<template>
  <CourseEditDialog/>

  <h1>{{ store.translate(store.config.content.tableName) }}</h1>

  <div style="margin-bottom: 15px" v-if="store.editor.authenticated">
    <n-space justify="center" align="center">
      <n-switch v-model:value="editable">
        <template #checked>管理员视图</template>
        <template #unchecked>用户视图</template>
      </n-switch>

      <n-button type="info" @click="store.editor.show=true" :round="true"
                v-show="store.editor.mode===`add` || store.editor.mode===`edit`">
        继续编辑
      </n-button>
    </n-space>

  </div>

  <GradeTab/>

  <WeeklyCourseTable :courses="filteredCourses" :editable="editable"/>
</template>

<style scoped>

</style>
