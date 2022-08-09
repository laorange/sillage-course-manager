<script setup lang="ts">
import {Course, GradeGroupArray, Notice} from "../../../assets/ts/types";
import {computed, nextTick, ref, watch} from "vue";
import {CourseDecorator} from "../../../assets/ts/courseToolkit";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "../../../pinia/useStore";
import RouteFilterSelect from "./RouteFilterSelect.vue";
import {useMessage} from "naive-ui";
import GradeGroupSelect from "./GradeGroupSelect.vue";
import useClipboard from "vue-clipboard3";
import {NoticeDecorator} from "../../../assets/ts/noticeToolkit";

const props = defineProps<{ courses: Course[], showGrade: boolean, notices?: Notice[] }>();
const emits = defineEmits(["update:courses", "update:showGrade", "update:notices"]);

const store = useStore();
const route = useRoute();
const router = useRouter();
const message = useMessage();
const {toClipboard} = useClipboard();

const showFilterDialog = ref<boolean>(false);


let sources = computed(() => {
  return {
    // formModel data
    grades: (route.query.grade instanceof Array ? route.query.grade : [route.query.grade]).filter(_ => !!_).sort() as unknown as string[],
    groups: (route.query.groups instanceof Array ? route.query.groups : [route.query.groups]).filter(_ => !!_).map(_ => JSON.parse(_ as string)).sort() as GradeGroupArray[],
    rooms: (route.query.rooms instanceof Array ? route.query.rooms : [route.query.rooms]).filter(_ => !!_).sort() as unknown as string[],
    methods: (route.query.methods instanceof Array ? route.query.methods : [route.query.methods]).filter(_ => !!_).sort() as unknown as string[],
    teachers: (route.query.teachers instanceof Array ? route.query.teachers : [route.query.teachers]).filter(_ => !!_).sort() as unknown as string[],

    courseDecorator: new CourseDecorator(store.courses),
    noticeDecorator: new NoticeDecorator(store.notices),
  };
});

const title = computed<string>(() => {
  return formModel.value.grades
      .concat(formModel.value.groups.map(gg => `${store.translate(gg[0])}:${store.translate(gg[1])}`))
      .concat(formModel.value.teachers).concat(formModel.value.methods).concat(formModel.value.rooms)
      .map((s: string) => store.translate(s)).filter(_ => !!_).join(` `);
});


// 监视路由中年级的数量，当且仅当年级数量为1时，不"显示年级"
watch(() => sources.value.grades, (grades) => {
  if (grades.length === 1) emits("update:showGrade", false);
  else emits("update:showGrade", true);
}, {deep: true});


// 每次显示/关闭抽屉时，将路由的参数同步到formModel
const formModel = ref<{ grades: string[], groups: GradeGroupArray[], rooms: string[], methods: string[], teachers: string[] }>({
  grades: [], groups: [], rooms: [], methods: [], teachers: [],
});
watch(() => showFilterDialog.value, () => formModel.value = {...sources.value});


watch(() => sources.value, (src) => {
  if (src.noticeDecorator) {
    let noticesFilter = src.noticeDecorator;

    let targetGradeGroups = src.grades.length ? src.grades.map(g => [g, ""]) : [];
    if (src.groups.length) targetGradeGroups = targetGradeGroups.concat(src.groups);

    if (targetGradeGroups.length) noticesFilter = noticesFilter.ofGradeGroups(targetGradeGroups as GradeGroupArray[]);
    emits("update:notices", noticesFilter.value);
  }

  // 日期模式：不限制是当前学期；星期模式：必须为当前学期
  let decorator: CourseDecorator = src.courseDecorator;
  if (src.grades.length) decorator = decorator.ofGrades(src.grades);
  if (src.rooms.length) decorator = decorator.ofRooms(src.rooms);
  if (src.methods.length) decorator = decorator.ofMethods(src.methods);
  if (src.teachers.length) decorator = decorator.ofTeachers(src.teachers);
  if (src.groups.length) decorator = decorator.ofGradeGroups(src.groups);
  formModel.value = {...src};
  emits("update:courses", decorator.value);
}, {deep: true, immediate: true});


const handlers = {
  pushWithNewFilter() {
    nextTick(() => message.success(title.value));
    showFilterDialog.value = false;
    formModel.value.grades = formModel.value.grades.length ? formModel.value.grades : store.grades;

    router.push({
      ...route,
      query: {
        grade: formModel.value.grades,
        rooms: formModel.value.rooms.length ? formModel.value.rooms : undefined,
        methods: formModel.value.methods.length ? formModel.value.methods : undefined,
        teachers: formModel.value.teachers.length ? formModel.value.teachers : undefined,
        groups: formModel.value.groups.length ? formModel.value.groups.map(g => JSON.stringify(g)) : undefined,
      },
    });
  },
  async copyUrl() {
    try {
      await toClipboard(window.location.href);
      message.success(`${store.translate("复制网址")}: ${route.fullPath}`);
    } catch (e) {
      message.error(`Error: ${e}`);
    }
  },
};
</script>

<template>
  <div class="route-filter">
    <n-space justify="center" align="center" wrap="wrap">
      <n-button :dashed="true" color="#32647d" @click="showFilterDialog=true">
        <n-ellipsis style="max-width: 80vw">
          {{ store.translate(`正在查看`) }}: {{ title ? title : store.translate(`全部课程`) }}
        </n-ellipsis>
      </n-button>

      <n-button :dashed="true" color="#32647d" @click="handlers.copyUrl()">{{ store.translate(`复制网址`) }}</n-button>

      <slot name="button"/>
    </n-space>
  </div>

  <n-drawer v-model:show="showFilterDialog" height="80%" placement="top">
    <n-drawer-content :title="store.translate(`正在查看`)" :closable="true" :footer-style="{justifyContent:'space-around'}">
      <div class="route-filter-drawer">
        <n-form
            ref="formRef"
            :model="formModel"
            label-placement="left"
            label-width="auto"
            require-mark-placement="right-hanging"
        >
          <!--"年级", "班级", "授课方式", "授课教师", "教室"-->
          <RouteFilterSelect v-model:value="formModel.grades" :option-str-array="store.grades" :placeholder="store.translate(`年级`)"/>
          <GradeGroupSelect v-model:groups="formModel.groups" :placeholder="store.translate(`班级`)"/>
          <RouteFilterSelect v-model:value="formModel.methods" :option-str-array="store.methods" :placeholder="store.translate(`授课方式`)"/>
          <RouteFilterSelect v-model:value="formModel.teachers" :option-str-array="store.teachers" :placeholder="store.translate(`授课教师`)"/>
          <RouteFilterSelect v-model:value="formModel.rooms" :option-str-array="store.rooms" :placeholder="store.translate(`教室`)"/>
        </n-form>
      </div>

      <template #footer>
        <n-space>
          <n-button size="large" @click="handlers.pushWithNewFilter">✅</n-button>
          <n-button size="large" @click="showFilterDialog=false">❌</n-button>
        </n-space>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
.route-filter {
  margin-bottom: 10px;
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
