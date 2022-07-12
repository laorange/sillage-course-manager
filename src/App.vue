<script setup lang="ts">
import {Course} from "./assets/ts/types";
import CourseEditor from "./components/CourseEditor/CourseEditor.vue";
import {ref} from "vue";

const course = ref<Course>({
  "_id": 1,
  "grade": "18级",
  "dates": [
    "2022-06-30",
    "2022-07-01",
  ],
  "lesson_num": 3,
  "note": "这是一条备注信息",
  "info": {
    "name": "数据库设计",
    "code": null,
    "bgc": "#FFFFFFFF",
  },
  "method": "实验课",
  "situations": [
    {
      "teacher": "王老师",
      "room": "210教室",
      "groups": [
        "A班",
        "B班",
      ],
    },
    {
      "teacher": "李老师",
      "room": "210教室",
      "groups": [
        "C班",
        "D班"
      ],
    },
  ],
});
</script>

<template>
  <CourseEditor v-model:course="course"/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
