<script setup lang="ts">
import {useStore} from "../../../pinia/useStore";
import useContextMenu from "../../../assets/ts/useContextMenu";
import {MenuItem} from "@imengyu/vue3-context-menu";
import {Course} from "../../../assets/ts/types";
import {useDialog, useMessage} from "naive-ui";
import {formatDate, getIsoWeekDay} from "../../../assets/ts/datetimeUtils";
import dayjs from "dayjs";
import {computed} from "vue";
import {useRoute} from "vue-router";
import {getEmptyCourse} from "../../../assets/ts/courseToolkit";

const {$contextmenu} = useContextMenu();

const props = defineProps<{ lessonNum: number, queryDate: string, coursesExisting: Course[] }>();

const store = useStore();
const route = useRoute();
const message = useMessage();
const dialog = useDialog();
const grades = computed<string[]>(() => (route.query.grade instanceof Array ? route.query.grade : [route.query.grade]).filter(_ => !!_).sort() as unknown as string[]);

const queryWhatDay = computed<number>(() => getIsoWeekDay(dayjs(props.queryDate)));
const queryWhatDayStr = computed<string>(() => store.getWhatDayStr(queryWhatDay.value));

function addInfoInThisBlockIntoStore() {
  store.editor.lessonNum = props.lessonNum;
}

function onContextMenu(e: MouseEvent) {
  e.preventDefault();
  addInfoInThisBlockIntoStore();
  let items: MenuItem[] = [
    {
      label: "新增课程",
      onClick: () => {
        store.editor.mode = "add";
        store.editor.show = true;
        store.editor.fromDate = props.queryDate;
        store.editor.courseAdding = {
          ...getEmptyCourse(),
          lessonNum: props.lessonNum,
          grade: ((route.query.grade instanceof Array ? route.query.grade : [route.query.grade]).filter(_ => !!_).sort() as string[])[0],
          dates: store.localConfig.isDateMode ? [props.queryDate] : [],
        };
      },
    },
  ];

  grades.value.map(grade => items.push({
    label: `粘贴到${grade}`,
    disabled: !(store.editor.mode === "cut" || store.editor.mode === "copy"),
    onClick: () => {
      if (store.localConfig.isDateMode && store.editor.mode === "cut") handlers.isDateMode.cut(grade);
      else if (store.localConfig.isDateMode && store.editor.mode === "copy") handlers.isDateMode.copy(grade);
      else if (!store.localConfig.isDateMode && store.editor.mode === "cut") handlers.notDateMode.cut(grade);
      else if (!store.localConfig.isDateMode && store.editor.mode === "copy") handlers.notDateMode.copy(grade);
    },
  }));

  $contextmenu({
    x: e.pageX,
    y: e.pageY,
    items,
  });
}

const handlers = {
  ensureNoConflict(course: Course) {
    // 如有冲突，阻止 并弹出警告
    let conflict = store.getConflictOfCourse(course);
    if (conflict) {
      message.error(conflict);
      throw Error(conflict);
    }
    return course;
  },
  notDateMode: {
    getNewCourse(grade: string): Course {
      return handlers.ensureNoConflict({
        ...store.editor.courseEditing,
        lessonNum: props.lessonNum,
        grade: grade,
        dates: store.editor.courseEditing.dates.map((d: string) => {
          const preDate = dayjs(d);
          return formatDate(preDate.add(queryWhatDay.value - getIsoWeekDay(preDate), "day"));
        }),
      });
    },
    cut(grade: string) {
      dialog.info({
        title: "提示",
        content: `${store.editorFromWhatDayStr}第${store.editor.courseEditing.lessonNum}节 ${store.editor.courseEditing.grade}的${store.editor.courseEditing.info.name} 将会被剪切到 ${grade}的 ${queryWhatDayStr.value} 第${store.editor.lessonNum}节课，是否继续？`,
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: () => {
          // 星期模式，在一个星期内平移
          let newCourse = handlers.notDateMode.getNewCourse(grade);
          store.client.Records.update("course", store.editor.courseEditing.id, newCourse).then(() => {
            // store.editor.courseEditing.lessonNum = props.lessonNum;
            // store.editor.courseEditing.dates = courseLocal.dates;
            // store.editor.courseEditing.grade = grade;
            // 用新的课程信息替换原来的
            store.courses = store.courses.filter(c => c.id !== store.editor.courseEditing.id).concat(newCourse);
            store.editor.show = false;
            store.editor.mode = "none";
            message.success(`剪切成功`);
          }).catch(() => message.error("提交失败，请检查网络连接"));
        },
      });
    },
    copy(grade: string) {
      dialog.info({
        title: "提示",
        content: `${store.editorFromWhatDayStr}第${store.editor.courseEditing.lessonNum}节 ${store.editor.courseEditing.grade}的${store.editor.courseEditing.info.name} 将会被复制到 ${grade}的 ${queryWhatDayStr.value} 第${store.editor.lessonNum}节课，是否继续？`,
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: () => {
          let newCourse = handlers.notDateMode.getNewCourse(grade);
          // store.editor.mode = "none";  // 是否清空复制状态 > 否
          store.client.Records.create("course", newCourse).then((record) => {
            store.courses.push(record as unknown as Course);
            store.editor.show = false;
            message.success(`复制成功`);
          }).catch(() => message.error("提交失败，请检查网络连接"));
        },
      });
    },
  },
  // 日期模式
  isDateMode: {
    getNewCourse(grade: string): Course {
      return handlers.ensureNoConflict({
        ...store.editor.courseEditing,
        lessonNum: props.lessonNum,
        grade: grade,
        dates: [props.queryDate],
      });
    },
    cut(grade: string) {
      dialog.info({
        title: "提示",
        content: `${store.editor.fromDate}第${store.editor.courseEditing.lessonNum}节 ${store.editor.courseEditing.grade}的${store.editor.courseEditing.info.name} 将会被剪切到${grade}的${queryWhatDayStr}第${store.editor.lessonNum}节课，是否继续？`,
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: async () => {
          let newCourse = handlers.isDateMode.getNewCourse(grade);
          let restDates = store.editor.courseEditing.dates.filter(d => d !== store.editor.fromDate);
          try {
            if (restDates.length) {

              // 日期模式 ①如果原课程有很多周，那就删除选中的那一周，再新增指定日期的课
              let updateTo: Course = {...store.editor.courseEditing, dates: restDates};
              await store.client.Records.update("course", store.editor.courseEditing.id, updateTo);
              newCourse = await store.client.Records.create("course", newCourse) as unknown as Course;
              // 用新的课程信息替换原来的
              store.courses = store.courses.filter(c => c.id !== store.editor.courseEditing.id).concat([updateTo, newCourse]);

            } else {

              // ② 如果原课程只有一周，那就直接改日期
              await store.client.Records.update("course", store.editor.courseEditing.id, newCourse);
              // 用新的课程信息替换原来的
              store.courses = store.courses.filter(c => c.id !== store.editor.courseEditing.id).concat([newCourse]);

            }

            store.editor.show = false;
            store.editor.mode = "none";
            message.success(`剪切成功`);
          } catch (e) {
            message.error("提交失败，请检查网络连接");
            console.error(e);
          }
        },
      });
    },
    copy(grade: string) {
      dialog.info({
        title: "提示",
        content: `${store.editor.fromDate}第${store.editor.courseEditing.lessonNum}节 ${store.editor.courseEditing.grade}的${store.editor.courseEditing.info.name} 将会被复制到${grade}的${props.queryDate}第${store.editor.lessonNum}节课，是否继续？`,
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: async () => {
          let newCourse = handlers.isDateMode.getNewCourse(grade);
          try {
            newCourse = await store.client.Records.create("course", newCourse) as unknown as Course;
            store.courses.push(newCourse);
            store.editor.show = false;
            message.success(`复制成功`);
          } catch (e) {
            message.error("提交失败，请检查网络连接");
            console.error(e);
          }
        },
      });
    },
  },
};
</script>

<template>
  <div class="empty-course-card" @contextmenu="onContextMenu($event)">
    <n-space justify="center" align="center">
      <div>鼠标右键查看菜单</div>
    </n-space>
  </div>
</template>

<style scoped>
.empty-course-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  height: 100%;
  min-width: var(--courseCardMinWidth);
  min-height: var(--courseCardMinHeight);
}
</style>
