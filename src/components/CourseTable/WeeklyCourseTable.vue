<script setup lang="ts">
import {Course} from "../../assets/ts/types";
import {useStore} from "../../pinia/useStore";
import {computed, ref} from "vue";
import CourseBox from "./CourseBox/CourseBox.vue";
import {CourseDecorator} from "../../assets/ts/courseDecorator";

const props = withDefaults(defineProps<{ courses: Course[], whatDay?: number, editable?: boolean }>(),
    {whatDay: 1});

const store = useStore();

const whatDayFrom0 = ref<number>(props.whatDay - 1);
const whatDay = computed<number>({
  get: () => whatDayFrom0.value + 1,
  set: (nwd) => whatDayFrom0.value = nwd - 1,
});

const coursesOfWhatDay = computed<CourseDecorator>(() => (new CourseDecorator(props.courses).ofWhatDay(whatDay.value)));

const editable = ref<boolean>(false);
</script>

<template>
  <div style="margin-bottom: 10px">
    <n-switch v-model:value="editable">
      <template #checked>编辑权限：开</template>
      <template #unchecked>编辑权限：关</template>
    </n-switch>
  </div>

  <div class="what-day-selector">
    <van-tabs type="card" color="#32647d" :background="`transparent`" v-model:active="whatDayFrom0">
      <van-tab :title="store.translate(`星期${whatDayStr}`)" v-for="whatDayStr in Array.from(`一二三四五六天`)" :key="`星期${whatDayStr}`"/>
    </van-tabs>
  </div>

  <div class="course-table-body">
    <div class="course-table-row" v-for="(lessonConfig, row0) in store.config.lessonConfigs" :key="`lessonNum${row0}`">
      <div class="lesson-start-end-time">
        <div>{{ lessonConfig.start }}</div>
        <div>{{ lessonConfig.end }}</div>
      </div>
      <div class="course-table-block">
        <CourseBox :what-day="whatDayFrom0 + 1" :lesson-num="row0+1"
                   :editable="editable"
                   :courses="coursesOfWhatDay.ofLessonNum(row0+1).value"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.what-day-selector {
  margin-bottom: 10px;
}

.course-table-body {
  display: flex;
  flex-direction: column;
  border-top: var(--border-color) 1px solid;
  border-left: var(--border-color) 1px solid;
}

.course-table-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  min-height: 50px;
  border-bottom: var(--border-color) 1px solid;
}

.lesson-start-end-time {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: var(--border-color) 1px solid;
}

.course-table-block {
  min-width: 10vw;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: var(--border-color) 1px solid;
}
</style>
