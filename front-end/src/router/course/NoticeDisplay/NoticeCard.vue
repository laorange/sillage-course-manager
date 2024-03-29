<script setup lang="ts">
import {Notice} from "../../../assets/ts/types";
import {computed} from "vue";
import {AlertCircleOutline, Trash, AddCircleOutline, CreateOutline} from "@vicons/ionicons5";
import dayjs from "dayjs";
import {formatDatetime} from "../../../assets/ts/datetimeUtils";
import CourseCard from "../CourseBox/CourseCard.vue";
import BulletinCard from "./BulletinCard.vue";

const props = defineProps<{ notice: Notice }>();

const noticeTimeDisplay = computed(() => {
  // PocketBase自动生成的update有时差！需要加8小时到北京时间
  return formatDatetime(dayjs(props.notice.updated).add(8, "hour"));
});

type TypeName = "info" | "success" | "warning" | "error" | "none"

const typeName = computed<TypeName>(() => {
  if (props.notice?.from && props.notice?.to) {
    return "warning";  // 有旧有新 = update
  } else if (!props.notice?.from && props.notice?.to) {
    return "success";  // 无旧有新 = add
  } else if (props.notice?.from && !props.notice?.to) {
    return "error";  // 有旧无新 = delete
  } else if (props.notice?.content) {
    return "info";  // 文字通知
  } else {
    return "none"; // 啥也不是
  }
});

</script>

<template>
  <n-timeline-item v-if="typeName!==`none`"
                   :type="typeName"
                   :time="noticeTimeDisplay">
    <template #header v-if="notice.content">
      <BulletinCard :content="`${notice.content}`"/>
    </template>
    <template #icon>
      <n-icon size="20">
        <AlertCircleOutline v-if="typeName==='info'"/>
        <AddCircleOutline v-if="typeName==='success'"/>
        <CreateOutline v-if="typeName==='warning'"/>
        <Trash v-if="typeName==='error'"/>
      </n-icon>
    </template>
    <template #default>
      <div class="notice-card-content">
        <!--新增课程-->
        <template v-if="!!notice.to && !notice.from">
          <CourseCard :course="notice.to" :show-grade="true" :show-what-day="true" :show-lesson-time="true"/>
        </template>

        <!--删除课程-->
        <template v-if="!notice.to && !!notice.from">
          <CourseCard :course="notice.from" :show-grade="true" :show-what-day="true" :show-lesson-time="true"/>
        </template>

        <!--更新课程-->
        <template v-if="!!notice.to && !!notice.from">
          <div class="update-notice">
            <n-grid cols="21" x-gap="0" y-gap="0">
              <n-gi span="10">
                <CourseCard :course="notice.from" :show-grade="true" :show-what-day="true" :show-lesson-time="true"/>
              </n-gi>
              <n-gi span="1">
                <div style="display: flex; justify-content: center; align-items: center; height: 100%">→</div>
              </n-gi>
              <n-gi span="10">
                <CourseCard :course="notice.to" :show-grade="true" :show-what-day="true" :show-lesson-time="true"/>
              </n-gi>
            </n-grid>
          </div>
        </template>
      </div>
    </template>
  </n-timeline-item>
</template>

<style scoped>
.notice-card-content {

}

.update-notice {
  height: calc(100% - 20px);
}

.course-card {
  border: 1px var(--border-color) solid;
}
</style>
