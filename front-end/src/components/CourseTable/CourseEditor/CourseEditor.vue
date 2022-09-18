<script setup lang="ts">
import {Course} from "../../../assets/ts/types";
import {computed, ref, watch} from "vue";
import WeekSelector from "./WeekSelector.vue";
import SituationEditor from "./SituationEditor.vue";
import {zhCN, dateZhCN, SelectOption, useMessage, useDialog} from "naive-ui";
import {useStore} from "../../../pinia/useStore";
import {CoursesHandler, isValidCourse} from "../../../assets/ts/courseToolkit";
import {useRoute} from "vue-router";
import {whetherTwoObjNotEqual} from "../../../assets/ts/whetherTwoObjNotEqual";

const store = useStore();
const route = useRoute();
const message = useMessage();
const dialog = useDialog();

const operatingCourse = computed<Course>(() => store.editor.mode === "add" ? store.editor.courseAdding : store.editor.courseEditing);
const existingCoursesHandler = computed<CoursesHandler>(() => store.getExistingCoursesOfCourse(operatingCourse.value));

const courseLocal = ref<Course>(JSON.parse(JSON.stringify(operatingCourse.value)));
watch(() => operatingCourse.value, (oc) => {
  courseLocal.value = {
    ...JSON.parse(JSON.stringify(oc)),
  };
});

const whetherChanged = computed<boolean>(() => whetherTwoObjNotEqual(courseLocal.value, operatingCourse.value));

const handlers = {
  submitSuccess() {
    message.success("提交成功");
  },
  submitFail() {
    message.error("提交失败，请检查网络连接");
  },
  thinkTwiceIfDataChanged(hook: () => any, content: string, title: string = "提示") {
    if (whetherChanged.value) {
      store.localConfig.thinkTwice ? dialog.info({
        title: title,
        content: content,
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: hook,
      }) : hook();
    } else {
      hook();
    }
  },
  restore() {
    this.thinkTwiceIfDataChanged(() => {
      courseLocal.value = JSON.parse(JSON.stringify(operatingCourse.value));
      store.editor.mode = "none";
      store.editor.show = false;
    }, "您在本页面所做的修改将会丢失，是否继续？");
  },
  async update() {
    if (!whetherCourseIsValid) {
      message.error("请将数据补充完整(红色边框代表必填项)");
    } else if (!whetherChanged.value) {
      message.info("因为没有更改，所以无事发生");
      this.restore();
    } else {
      this.thinkTwiceIfDataChanged(() => {
        store.api.course.update(operatingCourse.value, courseLocal.value,
            () => {
              store.courses = store.courses.filter(c => c.id !== store.editor.courseEditing.id).concat(courseLocal.value);
              store.editor.show = false;
              store.editor.mode = "none";
              handlers.submitSuccess();
            },
            handlers.submitFail,
        );
      }, "将会把变更提交数据库，是否继续？");
    }
  },
  add() {
    if (!whetherCourseIsValid) {
      message.error("请将数据补充完整(红色边框代表必填项)");
    } else {
      this.thinkTwiceIfDataChanged(() => {
        store.api.course.create(courseLocal.value,
            record => {
              store.courses.push(record as unknown as Course);
              store.editor.show = false;
              store.editor.mode = "none";
              handlers.submitSuccess();
            },
            handlers.submitFail,
        );
      }, "将会把变更提交数据库，是否继续？");
    }
  },
};

const courseNameOptions = computed<SelectOption[]>(() => store.courseNames.map(n => {
  return {label: n, value: n};
}));

const gradeOptions = computed<SelectOption[]>(() => store.grades.map(g => {
  return {label: g, value: g};
}));

const methodOptions = computed<SelectOption[]>(() => store.methods.map(m => {
  return {label: m, value: m};
}));

// 监视课程信息，如果重新选择，则检索当前已有课程信息，帮助用户填写课程代码、背景颜色
watch(() => courseLocal.value.info.name, (name) => {
  if (!!store.courseInfoDict[name]) {
    courseLocal.value.info.code = store.courseInfoDict[name].code;
    courseLocal.value.info.bgc = store.courseInfoDict[name].bgc;
  }
});


// 在打开编辑栏时，检查当前课程是否有冲突，有的话自动去掉冲突项
watch(() => store.editor.show, (show) => {
  if (show) {
    let ecs = store.getExistingCoursesOfCourse(courseLocal.value);

    for (const s of courseLocal.value.situations) {
      for (const group of s.groups) {
        if (ecs.hasConflictGradeGroups(courseLocal.value.dates, courseLocal.value.lessonNum, [[courseLocal.value.grade, group]])) {
          message.error(`${courseLocal.value.grade}-${group}在此时段有别的课了，请修改`);
          s.groups = s.groups.filter(g => g !== group);
        }
      }

      for (const teacher of s.teachers) {
        if (ecs.hasConflictTeachers(courseLocal.value.dates, courseLocal.value.lessonNum, [teacher])) {
          message.error(`${teacher}在此时段有别的课了，请修改`);
          s.teachers = s.teachers.filter(t => t !== teacher);
        }
      }

      for (const room of s.rooms) {
        if (ecs.hasConflictRooms(courseLocal.value.dates, courseLocal.value.lessonNum, [room])) {
          message.error(`${room}在此时段有别的课了，请修改`);
          s.rooms = s.rooms.filter(r => r !== room);
        }
      }
    }
  }
}, {immediate: true});

const whetherCourseIsValid = computed<boolean>(() => isValidCourse(courseLocal.value));
</script>

<template>
  <h2 style="text-align: center">{{ store.editorFromWhatDayStr }} &nbsp; 第{{ store.editor.lessonNum }}节课</h2>
  <div class="course-editor">
    <div class="responsive-left-part">
      <div aria-label="课程信息">
        <n-divider :dashed="true">课程信息</n-divider>
        <n-space :vertical="true">
          <n-select v-model:value="courseLocal.info.name"
                    :status="(!!courseLocal.info.name && courseLocal.info.name!==`请输入课程名称`) ? `success` : `error`"
                    placeholder="课程名称（必填）" :filterable="true" :tag="true" :options="courseNameOptions"/>

          <n-input v-model:value="courseLocal.info.code" placeholder="课程代码（选填）"/>

          <n-select v-model:value="courseLocal.method" placeholder="授课方式（选填）"
                    :filterable="true" :tag="true" :clearable="true" :options="methodOptions"/>
        </n-space>
      </div>

      <WeekSelector v-model:dates="courseLocal.dates" :semester-start-day="store.semesterStartDay" :what-day="store.editorFromWhatDay"/>
    </div>

    <div class="responsive-middle-divider"/>

    <div class="responsive-right-part">
      <div aria-label="年级（大组）">
        <n-divider :dashed="true">年级 / 大组</n-divider>
        <n-select v-model:value="courseLocal.grade" :filterable="true" :tag="true" :options="gradeOptions" placeholder="请选择或输入"
                  :status="courseLocal.grade ? `success` : `error`"/>
      </div>

      <div aria-label="班级（小组）">
        <n-divider :dashed="true">教学计划</n-divider>
        <SituationEditor v-model:situations="courseLocal.situations" :grade="courseLocal.grade"
                         :selected-dates="courseLocal.dates" :selected-lesson-num="courseLocal.lessonNum"
                         :existing-courses-handler="existingCoursesHandler"/>
      </div>

      <div aria-label="课程颜色">
        <n-divider :dashed="true">课程颜色</n-divider>
        <n-color-picker :modes="['hex']" placement="bottom" v-model:value="courseLocal.info.bgc" :show-alpha="false">
          <template #label>点此设置背景颜色：{{ courseLocal.info.bgc }}</template>
        </n-color-picker>
      </div>

      <div aria-label="备注">
        <n-divider :dashed="true">备注</n-divider>
        <n-input v-model:value="courseLocal.note" placeholder="请输入备注信息（选填）" type="textarea" :autosize="true"/>
      </div>
    </div>
  </div>

  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-space justify="center" align="center">
      <template v-if="store.editor.mode==='edit'">
        <n-button type="success" :disabled="!whetherCourseIsValid" @click="handlers.update()">提交更改</n-button>
      </template>

      <template v-if="store.editor.mode==='add'">
        <n-button type="success" :disabled="!whetherCourseIsValid" @click="handlers.add()">确认新增</n-button>
      </template>

      <div v-show="!whetherCourseIsValid">（已用<span style="color: red">红色</span>标注了<strong>未完成</strong>的必填项）</div>

      <n-button type="warning" @click="handlers.restore()">取消修改</n-button>

      <!--      <n-button type="info" v-show="store.editor.mode==='add'" @click="store.editor.show=false">暂时退出</n-button>-->
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
