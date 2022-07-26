<script setup lang="ts">
import {useStore} from "../../../pinia/useStore";
import useContextMenu from "../../../assets/ts/useContextMenu";
import {Course} from "../../../assets/ts/types";
import {useDialog, useMessage} from "naive-ui";
import {formatDate, getIsoWeekDay} from "../../../assets/ts/datetimeUtils";
import dayjs from "dayjs";
import {computed} from "vue";
import {useRoute} from "vue-router";
import {getEmptyCourse} from "../../../assets/ts/courseToolkit";

const {$contextmenu} = useContextMenu();

const props = defineProps<{ whatDay: number, lessonNum: number, coursesExisting: Course[] }>();

const store = useStore();
const route = useRoute();
const message = useMessage();
const dialog = useDialog();
const grade = computed<string>(() => (route.query.grade ?? "无效年级") as string);

const newDates = computed<string[]>(() => store.editor.courseEditing.dates.map(
    (d: string) => {
      const preDate = dayjs(d);
      return formatDate(preDate.add(props.whatDay - getIsoWeekDay(preDate), "day"));
    }));

function addInfoInThisBlockIntoStore() {
  store.editor.whatDay = props.whatDay;
  store.editor.lessonNum = props.lessonNum;
}

function onContextMenu(e: MouseEvent) {
  e.preventDefault();
  addInfoInThisBlockIntoStore();
  $contextmenu({
    x: e.pageX,
    y: e.pageY,
    items: [
      {
        label: "新增课程",
        onClick: () => {
          store.editor.mode = "add";
          store.editor.show = true;
          store.editor.courseEditing = getEmptyCourse();
        },
      },
      {
        label: "粘贴",
        disabled: !(store.editor.mode === "cut" || store.editor.mode === "copy"),
        onClick: () => {
          let courseLocal = {
            ...store.editor.courseEditing,
            lessonNum: props.lessonNum,
            dates: newDates.value,
            grade: grade.value,
          };

          // 如有冲突，阻止 并弹出警告
          let conflict = store.getConflictOfCourse(courseLocal);
          if (conflict) {
            return message.error(conflict);
          }

          dialog.info({
            title: "提示",
            content: `“${store.editor.courseEditing.info.name}”将会被${store.editor.mode === "cut" ? "剪切" : "复制"}到 ${store.editorWhatDayStr} 第${store.editor.lessonNum}节课，是否继续？`,
            positiveText: "确定",
            negativeText: "取消",
            onPositiveClick: () => {
              if (store.editor.mode === "cut") {
                store.editor.mode = "none";
                store.editor.courseEditing.lessonNum = props.lessonNum;
                store.editor.courseEditing.dates = newDates.value;
                store.editor.courseEditing.grade = grade.value;

                store.client.Records.update("course", store.editor.courseEditing.id, courseLocal).then(() => {
                  store.courses = store.courses.filter(c => c.id !== store.editor.courseEditing.id).concat(courseLocal);
                  store.editor.show = false;
                  message.success(`剪切成功`);
                }).catch(() => message.error("提交失败，请检查网络连接"));

              } else if (store.editor.mode === "copy") {
                // store.editor.mode = "none";  // 是否清空复制状态
                store.client.Records.create("course", courseLocal).then((record) => {
                  store.courses.push(record as unknown as Course);
                  store.editor.show = false;
                  message.success(`复制成功`);
                }).catch(() => message.error("提交失败，请检查网络连接"));
              }
            },
          });
        },
      },
    ],
  });
}
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
