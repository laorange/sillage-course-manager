<script setup lang="ts">
import {Course} from "../../../assets/ts/types";
import CourseCard from "./CourseCard.vue";
import EmptyCourseCard from "./EmptyCourseCard.vue";
import {computed} from "vue";
import dayjs from "dayjs";
import {useStore} from "../../../pinia/useStore";
import EditableCourseCard from "./EditableCourseCard.vue";

const props = withDefaults(defineProps<{
  courses: Course[], queryDate: string, isDateMode: boolean, lessonNum: number,
  editable?: boolean, showWeeks?: boolean | "auto", showGrade?: boolean, showLessonTime?: boolean,
}>(), {showWeeks: "auto"});

// region 以 store.localConfig.verticalCard 来判断是否垂直显示课程。
const store = useStore();
const verticalLocal = computed<boolean>(() => store.localConfig.verticalCard);
// endregion

const coursesSorted = computed(() => {
  return props.courses.slice().sort((a, b) => {
    if (a.grade > b.grade) return 1;
    if (a.grade < b.grade) return -1;

    if (dayjs(a.dates[0]).isAfter(dayjs(b.dates[0]), "day")) return 1;
    if (dayjs(a.dates[0]).isBefore(dayjs(b.dates[0]), "day")) return -1;

    let aGroup = a.situations[0]?.groups?.join() ?? "";
    let bGroup = b.situations[0]?.groups?.join() ?? "";
    if (!!aGroup && !!bGroup) {
      return aGroup > bGroup ? 1 : -1;
    }

    let aRoom = a.situations[0]?.rooms?.join() ?? "";
    let bRoom = b.situations[0]?.rooms?.join() ?? "";
    if (!!aRoom && !!bRoom) {
      return aRoom > bRoom ? 1 : -1;
    }

    return 0;
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
      <EditableCourseCard v-if="editable" :course="course" :show-grade="showGrade"
                          :show-weeks="showWeeks" :is-date-mode="isDateMode" :show-lesson-time="showLessonTime"
                          :edit-data="{coursesExisting:coursesSorted, lessonNum:lessonNum, queryDate:queryDate}"/>
      <CourseCard v-else :course="course" :show-grade="showGrade" :show-weeks="showWeeks" :is-date-mode="isDateMode" :show-lesson-time="showLessonTime"/>
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
