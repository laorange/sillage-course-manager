<script setup lang="ts">
import {Course, GradeGroupArray} from "../../../assets/ts/types";
import {computed, nextTick, ref, watch} from "vue";
import {CourseDecorator} from "../../../assets/ts/courseToolkit";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "../../../pinia/useStore";
import RouteFilterSelect from "./RouteFilterSelect.vue";
import {useMessage} from "naive-ui";
import GradeGroupSelect from "./GradeGroupSelect.vue";

const props = defineProps<{ courses: Course[] }>();
const emits = defineEmits(["update:courses"]);

const store = useStore();
const route = useRoute();
const router = useRouter();
const message = useMessage();

const showFilterDialog = ref<boolean>(false);

// 是否只显示当前学期的课程
const currentSemester = computed<boolean>(() => true);

let sources = computed(() => {
  return {
    grades: (route.query.grade instanceof Array ? route.query.grade : [route.query.grade]).filter(_ => !!_) as unknown as string[],
    groups: (route.query.groups instanceof Array ? route.query.groups : [route.query.groups]).filter(_ => !!_).map(_ => JSON.parse(_ as string)) as GradeGroupArray[],
    rooms: (route.query.rooms instanceof Array ? route.query.rooms : [route.query.rooms]).filter(_ => !!_) as unknown as string[],
    methods: (route.query.methods instanceof Array ? route.query.methods : [route.query.methods]).filter(_ => !!_) as unknown as string[],
    teachers: (route.query.teachers instanceof Array ? route.query.teachers : [route.query.teachers]).filter(_ => !!_) as unknown as string[],
    courseDecorator: (currentSemester ? store.courseOfCurrentSemester : (new CourseDecorator(store.courses))),
  };
});

const title = computed<string>(() => {
  return formModel.value.grades
      .concat(formModel.value.groups.map(gg => `${store.translate(gg[0])}:${store.translate(gg[1])}`))
      .concat(formModel.value.teachers).concat(formModel.value.methods).concat(formModel.value.rooms)
      .map((s: string) => store.translate(s)).filter(_ => !!_).join(` `);
});

// 每次显示/关闭抽屉时，将路由的参数同步到formModel
const formModel = ref({...sources.value, courseDecorator: undefined});
watch(() => showFilterDialog.value, () => formModel.value = {...sources.value, courseDecorator: undefined});

watch(() => sources.value, (src) => {
  let decorator: CourseDecorator = src.courseDecorator;
  if (src.grades.length) decorator = decorator.ofGrades(src.grades);
  if (src.rooms.length) decorator = decorator.ofRooms(src.rooms);
  if (src.methods.length) decorator = decorator.ofMethods(src.methods);
  if (src.teachers.length) decorator = decorator.ofTeachers(src.teachers);
  formModel.value = {...src, courseDecorator: undefined};
  emits("update:courses", decorator.value);
}, {deep: true, immediate: true});

const handlers = {
  pushWithNewFilter() {
    nextTick(() => message.success(title.value));
    showFilterDialog.value = false;
    router.push({
      ...route,
      query: {
        grade: formModel.value.grades ? formModel.value.grades : undefined,
        rooms: formModel.value.rooms ? formModel.value.rooms : undefined,
        methods: formModel.value.methods ? formModel.value.methods : undefined,
        teachers: formModel.value.teachers ? formModel.value.teachers : undefined,
        groups: formModel.value.groups ? formModel.value.groups.map(g => JSON.stringify(g)) : undefined,
      },
    });
  },
};
</script>

<template>
  <div class="route-filter">
    <n-button size="large" :dashed="true" color="#32647d" @click="showFilterDialog=true">
      <n-ellipsis style="max-width: 80vw">
        {{ store.translate(`正在查看`) }}:
        {{ title }}
      </n-ellipsis>
    </n-button>
  </div>

  <n-drawer v-model:show="showFilterDialog" height="100%" placement="top">
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
