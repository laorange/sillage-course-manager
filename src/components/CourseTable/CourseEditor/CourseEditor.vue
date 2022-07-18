<script setup lang="ts">
import {Course} from "../../../assets/ts/types";
import {computed, ref, watch} from "vue";
import WeekSelector from "./WeekSelector.vue";
import SituationEditor from "./SituationEditor.vue";
import {zhCN, dateZhCN, SelectOption, useMessage} from "naive-ui";
import getWeeksString from "../../../assets/ts/getWeeksString";
import {useStore} from "../../../pinia/useStore";
import {formatDate, getWeekAmountBetweenTwoDay} from "../../../assets/ts/datetimeUtils";
import dayjs from "dayjs";
import {isValidCourse} from "../../../assets/ts/courseFilter";
import {useRoute} from "vue-router";

const store = useStore();
const message = useMessage();
const route = useRoute();

const props = defineProps<{ course: Course, whatDay: number, lessonNum: number }>();
const emits = defineEmits(["update:course"]);

const courseLocal = ref<Course>({
  ...JSON.parse(JSON.stringify(props.course)),
  lessonNum: props.lessonNum,
  grade: route.query.grade ?? "",
});

const whatDayStrList = Array.from("一二三四五六天");

const handlers = {
  restore() {
    courseLocal.value = JSON.parse(JSON.stringify(props.course));
  },
  update() {
    if (!whetherCourseIsValid) {
      message.error("请将数据补充完整(红色边框代表必填项)");
    } else if (JSON.stringify(props.course) === JSON.stringify(courseLocal.value)) {
      message.warning("没有发现任何更改~");
    } else {
      alert("提交后端");
      emits("update:course", courseLocal.value);
      store.editor.show = false;
    }
  },
  add() {
    if (!whetherCourseIsValid) {
      message.error("请将数据补充完整(红色边框代表必填项)");
    } else {
      alert("提交后端，并获取后端返回的新id");
      store.courses.push(courseLocal.value);
      store.editor.show = false;
    }
  },
};

const courseNameOptions = ref<SelectOption[]>([
  {
    label: "数据库设计",
    value: "数据库设计",
  },
  {
    label: "确认与验证",
    value: "确认与验证",
  }]);

const gradeOptions = ref<SelectOption[]>([{
  label: "18级",
  value: "18级",
}]);

const methodOptions = ref<SelectOption[]>(["理论课", "习题课", "实验课", "考试"].map(m => {
  return {label: m, value: m};
}));

const weeks = ref<number[]>(props.course.dates.map(d => getWeekAmountBetweenTwoDay(store.semesterStartDay, dayjs(d)) + 1));
watch(() => weeks.value, (ws) => {
  courseLocal.value.dates = ws.map(w => formatDate(store.semesterStartDay.add(w - 1, "week").add(props.whatDay - 1, "day")));
}, {deep: true});

const whetherCourseIsValid = computed<boolean>(() => isValidCourse(courseLocal.value));
</script>

<template>
  <h3>星期{{ whatDayStrList[whatDay - 1] }} &nbsp; 第{{ lessonNum }}节课</h3>
  <div class="course-editor">
    <div class="responsive-left-part">
      <div aria-label="课程信息">
        <n-divider :dashed="true">课程信息</n-divider>
        <n-space :vertical="true">
          <n-select v-model:value="courseLocal.info.name" :status="courseLocal.info.name ? `success` : `error`"
                    placeholder="课程名称（必填）" :filterable="true" :tag="true" :options="courseNameOptions"/>

          <n-input v-model:value="courseLocal.info.code" placeholder="课程代码（选填）"/>

          <n-select v-model:value="courseLocal.method" placeholder="授课方式（选填）"
                    :filterable="true" :tag="true" :clearable="true" :options="methodOptions"/>
        </n-space>
      </div>

      <n-divider :dashed="true">上课周数:
        <span v-if="weeks.length">{{ getWeeksString(weeks) }}</span>
        <span v-else style="color: red">请在下方的穿梭框中选择</span>
      </n-divider>
      <WeekSelector v-model:weeks="weeks"/>
    </div>

    <div class="responsive-middle-divider"/>

    <div class="responsive-right-part">
      <div aria-label="年级（大组）">
        <n-divider :dashed="true">年级 / 大组</n-divider>
        <n-select v-model:value="courseLocal.grade" :filterable="true" :tag="true" :options="gradeOptions"/>
      </div>

      <div aria-label="班级（小组）">
        <n-divider :dashed="true">班级 / 小组
        <span style="color: red" v-show="courseLocal.situations.length===0">(需要至少添加一个)</span>
        </n-divider>
        <SituationEditor v-model:situations="courseLocal.situations"/>
      </div>

      <div aria-label="课程颜色">
        <n-divider :dashed="true">课程颜色</n-divider>
        <n-color-picker :modes="['hex']" placement="bottom" v-model:value="courseLocal.info.bgc">
          <template #label>点此设置背景颜色：{{ courseLocal.info.bgc }}</template>
        </n-color-picker>
      </div>

      <div aria-label="备注">
        <n-divider :dashed="true">备注</n-divider>
        <n-input v-model:value="courseLocal.note" placeholder="请输入备注信息（选填）"/>
      </div>
    </div>
  </div>

  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-space justify="center" align="center">
      <template v-if="store.editor.mode==='edit'">
        <n-popconfirm @positive-click="handlers.update()">
          <template #trigger>
            <n-button type="success" :disabled="!whetherCourseIsValid">保存更改</n-button>
          </template>
          将会把变更提交数据库，是否继续？
        </n-popconfirm>

        <n-popconfirm @positive-click="handlers.restore()">
          <template #trigger>
            <n-button type="warning">取消修改</n-button>
          </template>
          您在本页面所做的修改将会丢失，是否继续？
        </n-popconfirm>
      </template>

      <template v-if="store.editor.mode==='add'">
        <n-popconfirm @positive-click="handlers.add()">
          <template #trigger>
            <n-button type="success" :disabled="!whetherCourseIsValid">确认新增</n-button>
          </template>
          将会把变更提交数据库，是否继续？
        </n-popconfirm>
      </template>
    </n-space>
  </n-config-provider>
</template>

<style scoped>
.course-editor {
  display: flex;
  margin: 10px 30px;
}

.responsive-left-part, .responsive-right-part {
  flex: 0 50%;
  display: flex;
  flex-direction: column;
}

.responsive-middle-divider {
  margin: 0 2vw;
  width: 1px;
  background-color: black;
}

@media screen and (max-width: 1200px) {
  .responsive-middle-divider {
    display: none;
  }

  .course-editor {
    flex-direction: column;
  }
}
</style>
