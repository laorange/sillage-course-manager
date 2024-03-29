<script setup lang="ts">
import {Course, GradeGroupArray, Notice} from "../../../assets/ts/types";
import {computed, nextTick, onBeforeUnmount, ref, watch} from "vue";
import {CoursesHandler, parseCourseRoute} from "../../../assets/ts/courseToolkit";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "../../../pinia/useStore";
import RouteFilterSelect from "./RouteFilterSelect.vue";
import {useMessage} from "naive-ui";
import GradeGroupSelect from "./GradeGroupSelect.vue";
import {NoticesHandler} from "../../../assets/ts/noticeToolkit";
import {Settings} from "@vicons/ionicons5";
import CopyUrlButton from "./CopyUrlButton.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();
const message = useMessage();

const courses = ref<Course[]>([]);
const showGrade = ref<boolean>(false);
const notices = ref<Notice[]>([]);

const showFilterDialog = ref<boolean>(false);

const courseRouteData = computed(() => parseCourseRoute(route));
const title = computed<string>(() => courseRouteData.value.title);
watch(() => title.value, (newTitle) => document.title = `${store.translate(store.config.content.tableName)}-${newTitle}`, {immediate: true});
onBeforeUnmount(() => document.title = store.translate(store.config.content.tableName));

let sources = computed(() => {
  const {grades, gradeGroups, rooms, methods, teachers, courseNames} = courseRouteData.value;

  return {
    grades, groups: gradeGroups, rooms, methods, teachers, courseNames,
    courseDecorator: new CoursesHandler(store.courses),
    noticeDecorator: new NoticesHandler(store.notices),
  };
});

// 监视路由中年级的数量，当且仅当年级数量为1时，不"显示年级"
watch(() => sources.value.grades, (grades) => {
  showGrade.value = grades.length !== 1;
}, {deep: true});


// 每次显示/关闭抽屉时，将路由的参数同步到formModel
const formModel = ref<{ grades: string[], groups: GradeGroupArray[], rooms: string[], methods: string[], teachers: string[], courseNames: string[] }>({
  grades: [], groups: [], rooms: [], methods: [], teachers: [], courseNames: [],
});
watch(() => showFilterDialog.value, () => formModel.value = {...sources.value});


watch(() => sources.value, (src) => {
  if (src.noticeDecorator) {
    let noticesFilter = src.noticeDecorator;

    let targetGradeGroups = src.grades.length ? src.grades.map(g => [g, ""]) : [];
    if (src.groups.length) targetGradeGroups = targetGradeGroups.concat(src.groups);

    if (targetGradeGroups.length) noticesFilter = noticesFilter.ofGradeGroups(targetGradeGroups as GradeGroupArray[]);
    notices.value = noticesFilter.value;
  }

  // 日期模式：不限制是当前学期；星期模式：必须为当前学期
  let decorator: CoursesHandler = src.courseDecorator;
  if (src.grades.length) decorator = decorator.ofGrades(src.grades);
  if (src.rooms.length) decorator = decorator.ofRooms(src.rooms);
  if (src.methods.length) decorator = decorator.ofMethods(src.methods);
  if (src.teachers.length) decorator = decorator.ofTeachers(src.teachers);
  if (src.groups.length) decorator = decorator.ofGradeGroups(src.groups);
  if (src.courseNames.length) decorator = decorator.ofCourseNames(src.courseNames);
  formModel.value = {...src};
  courses.value = decorator.value;
}, {deep: true, immediate: true});


function pushWithNewFilter() {
  nextTick(() => message.success(title.value ? title.value : store.translate(`全部课程`)));
  showFilterDialog.value = false;

  router.push({
    ...route,
    query: {
      grade: formModel.value.grades.length ? formModel.value.grades : undefined,
      room: formModel.value.rooms.length ? formModel.value.rooms : undefined,
      method: formModel.value.methods.length ? formModel.value.methods : undefined,
      teacher: formModel.value.teachers.length ? formModel.value.teachers : undefined,
      group: formModel.value.groups.length ? formModel.value.groups.map(g => JSON.stringify(g)) : undefined,
      subject: formModel.value.courseNames.length ? formModel.value.courseNames : undefined,
    },
  });
}

defineExpose({
  sources,
  courses,
  notices,
  showFilterDialog,
});
</script>

<template>
  <div class="route-filter">
    <n-space :vertical="true" :size="15">
      <n-space justify="center" align="center">
        <n-ellipsis style="max-width: 75vw" v-if="title">{{ title }}</n-ellipsis>
        <CopyUrlButton/>
      </n-space>

      <n-space justify="center" align="center" wrap="wrap">
        <n-button color="#32647d" :dashed="true" @click="showFilterDialog=true">
          <template #icon>
            <n-icon>
              <Settings/>
            </n-icon>
          </template>
        </n-button>

        <slot name="button"/>
      </n-space>
    </n-space>
  </div>

  <n-drawer v-model:show="showFilterDialog" height="100%" placement="top">
    <n-drawer-content :title="store.translate(`偏好设置`)" :closable="true" :footer-style="{justifyContent:'space-around'}">
      <div class="route-filter-drawer">
        <n-form
            ref="formRef"
            :model="formModel"
            label-placement="left"
            label-width="auto"
            require-mark-placement="right-hanging"
        >
          <slot name="formTop"/>

          <!--"年级", "班级", "授课方式", "授课教师", "教室"-->
          <RouteFilterSelect v-model:value="formModel.grades" :option-str-array="store.grades" :placeholder="store.translate(`年级`)"/>
          <GradeGroupSelect v-model:groups="formModel.groups" :placeholder="store.translate(`班级`)"/>
          <RouteFilterSelect v-model:value="formModel.methods" :option-str-array="store.methods" :placeholder="store.translate(`授课方式`)"/>
          <RouteFilterSelect v-model:value="formModel.teachers" :option-str-array="store.teachers" :placeholder="store.translate(`授课教师`)"/>
          <RouteFilterSelect v-model:value="formModel.rooms" :option-str-array="store.rooms" :placeholder="store.translate(`教室`)"/>
          <RouteFilterSelect v-model:value="formModel.courseNames" :option-str-array="store.courseNames" :placeholder="store.translate(`课程名称`)"/>

          <slot name="formBottom"/>
        </n-form>
      </div>

      <template #footer>
        <n-space>
          <n-button size="large" @click="pushWithNewFilter" type="success">{{ store.translate(`确定`) }}</n-button>
          <n-button size="large" @click="showFilterDialog=false" type="info">{{ store.translate(`取消`) }}</n-button>
        </n-space>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
.route-filter {
  margin: 15px;
}

.route-filter-drawer {
  margin: 10px 10vw
}

@media screen and (max-width: 800px) {
  .route-filter-drawer {
    margin: 10px 0
  }
}
</style>
