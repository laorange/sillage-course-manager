<script setup lang="ts">
import {Course, Situation} from "../../../assets/ts/types";
import {computed} from "vue";
import {useStore} from "../../../pinia/useStore";
import getWeeksString from "../../../assets/ts/getWeeksString";
import {parseFontColor} from "../../../assets/ts/useColorParser";
import {useMessage} from "naive-ui";
import {getIsoWeekDay} from "../../../assets/ts/datetimeUtils";
import dayjs from "dayjs";
import getToday from "../../../assets/ts/getToday";
import getTodayX from "../../../assets/ts/getToday";

const props = withDefaults(defineProps<{
  course: Course, isDateMode?: boolean,
  showWeeks?: boolean | "auto", showGrade?: boolean, showWhatDay?: boolean, showLessonTime?: boolean,
}>(), {showWeeks: "auto", showGrade: false, showWhatDay: false, showLessonTime: false});

const emits = defineEmits<{ (emit: "contextmenu", event: MouseEvent): void }>();

const store = useStore();
const message = useMessage();

const showWeeksLocal = computed<boolean>(() => {
  if (props.showWeeks === true || props.showWeeks === false) {
    return props.showWeeks;
  } else if (!props.isDateMode) {
    // 如果是星期模式，或未指定`isDateMode` 那就一定要显示周数
    return true;
  } else {
    // 如果没有指定是否显示周数，则在课程有多个上课日期时显示
    return props.course.dates.length > 1;
  }
});

const getWeekStrWithUnit = computed<string>(() => {
  let validWeeks = props.course.dates.map(d => store.getWeekNumOfSomeDate(d)).filter(w => (w > 0 && w <= store.config.content.maxWeekNum));
  let weekStr = "";
  if (validWeeks.length) {
    let weekZhStr = getWeeksString(validWeeks);
    let _weekUnitStr = store.translate("星期");
    weekStr = (_weekUnitStr === "星期") ? `第${weekZhStr}周` : `${_weekUnitStr} ${weekZhStr}`;
  }

  let invalidDates = props.course.dates.filter(d => {
    let week = store.getWeekNumOfSomeDate(d);
    return week <= 0 || week > store.config.content.maxWeekNum;
  });

  return invalidDates.concat([weekStr]).filter(_ => !!_).join(",");
});

const whatDayStr = computed<string>(() => store.translate(store.getWhatDayStr(getIsoWeekDay(dayjs(props.course.dates[0]) ?? getTodayX()))));
const lessonTimeStr = computed<string>(() => {
  let lessonConfig = store.config.content.lessonConfigs[props.course.lessonNum - 1];
  return [`${lessonConfig.start}`, `${lessonConfig.end}`].filter(_ => !!_).join("~");
});

function getSituationStr(situation: Situation) {
  return [
    situation?.groups?.map(_ => store.translate(_)).join("&"),
    situation?.teachers?.map(_ => store.translate(_)).join("&"),
    situation?.rooms?.map(_ => store.translate(_)).join("&"),
  ].filter(s => !!s).join(" | ");
}
</script>

<template>
  <div class="course-card" @contextmenu="emits(`contextmenu`, $event)"
       :style="{backgroundColor: course.info.bgc, color: parseFontColor(course.info.bgc)}">
    <div v-if="course.info.code">{{ store.translate(course.info.code) }}</div>
    <div>{{ store.translate(course.info.name) }}</div>
    <div v-if="course.method">{{ store.translate(course.method) }}</div>
    <div v-if="showGrade">{{ store.translate(course.grade) }}</div>
    <div v-if="showWeeksLocal">{{ getWeekStrWithUnit }}</div>
    <div v-if="showWhatDay">{{ whatDayStr }}</div>
    <div v-if="showLessonTime && lessonTimeStr">{{ lessonTimeStr }}</div>

    <!--  situations  -->
    <template v-if="course.situations.length===1">
      <div v-if="course.situations[0]?.groups?.length">{{ course.situations[0].groups.map(g => store.translate(g)).join("&") }}</div>
      <div v-if="course.situations[0]?.teachers?.length">{{ course.situations[0].teachers.map(_ => store.translate(_)).join("&") }}</div>
      <div v-if="course.situations[0]?.rooms?.length">{{ course.situations[0].rooms.map(_ => store.translate(_)).join("&") }}</div>
    </template>
    <template v-if="course.situations.length>=2">
      <div class="course-card-situations" v-for="(situation, index) in course.situations"
           :key="`c${course.id}s${index}${getSituationStr(situation)}`">
        {{ getSituationStr(situation) }}
      </div>
    </template>

    <div v-if="course.note" :style="{whiteSpace: 'pre-wrap'}">{{ course.note }}</div>
  </div>
</template>

<style scoped>
.course-card {
  display: flex;
  text-align: center;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  font-size: 12px;
  min-width: var(--courseCardMinWidth);
  min-height: var(--courseCardMinHeight);
}

.course-card-situations {
  display: flex;
  justify-content: center;
  flex-direction: row;
}
</style>
