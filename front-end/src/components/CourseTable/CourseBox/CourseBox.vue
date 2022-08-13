<script setup lang="ts">
import {Course} from "../../../assets/ts/types";
import CourseCard from "./CourseCard.vue";
import EmptyCourseCard from "./EmptyCourseCard.vue";
import {computed} from "vue";
import dayjs from "dayjs";

const props = defineProps<{
  courses: Course[], queryDate: string, isDateMode: boolean, lessonNum: number,
  editable?: boolean, showWeeks?: boolean, showGrade?: boolean
}>();

// region 以 store.localConfig.verticalCard 来判断是否垂直显示课程。
import {useStore} from "../../../pinia/useStore";

const store = useStore();
const verticalLocal = computed<boolean>(() => store.localConfig.verticalCard);
// endregion

const coursesSorted = computed(() => {
  return props.courses.slice().sort((a, b) => {
    return dayjs(a.dates[0]).isAfter(dayjs(b.dates[0]), "day") ? 1 : -1;
  });
});
</script>

<template>
  <!-- 如果此处没有课 -->
  <div class="course-box" v-if="coursesSorted.length===0">
    <template v-if="editable">
      <EmptyCourseCard :query-date="queryDate" :is-date-mode="isDateMode" :lesson-num="lessonNum" :courses-existing="courses"/>
    </template>
  </div>

  <div class="course-box" :class="{'course-box-vertical': verticalLocal, 'course-box-horizontal': !verticalLocal}" v-else>
    <div class="course-card-container" v-for="course in coursesSorted" :key="course.id">
      <CourseCard v-if="editable" :course="course" :show-grade="showGrade" :show-weeks="showWeeks" :is-date-mode="isDateMode"
                  :edit-data="{coursesExisting:coursesSorted, lessonNum:lessonNum, queryDate:queryDate}"/>
      <CourseCard v-else :course="course" :show-grade="showGrade" :show-weeks="showWeeks" :is-date-mode="isDateMode"/>
    </div>
    <div class="empty-course-card" v-if="editable && false">
      <EmptyCourseCard :query-date="queryDate" :is-date-mode="isDateMode" :lesson-num="lessonNum" :courses-existing="courses"/>
    </div>
  </div>
</template>

<style scoped>
/* 水平模式下，课程之间的边框 */
.course-box-horizontal .course-card-container + .course-card-container,
.course-box-horizontal .course-card-container + .empty-course-card {
  border-left: var(--border-color) 1px solid;
}

/* 竖直模式下，课程之间的边框 */
.course-box-vertical .course-card-container + .course-card-container,
.course-box-vertical .course-card-container + .empty-course-card {
  border-top: var(--border-color) 1px solid;
}

.course-box {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  min-height: 150px;
}

.course-card-container {
  width: 100%;
  flex: 1;
}

.course-box-horizontal {
  flex-direction: row;
}

.course-box-vertical {
  flex-direction: column;
}
</style>
