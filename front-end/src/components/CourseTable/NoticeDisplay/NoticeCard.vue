<script setup lang="ts">
import {Notice} from "../../../assets/ts/types";
import {computed} from "vue";
import {AlertCircleOutline, Trash, AddCircleOutline, CreateOutline} from "@vicons/ionicons5";
import dayjs from "dayjs";
import {formatDatetime} from "../../../assets/ts/datetimeUtils";
import CourseCard from "../CourseBox/CourseCard.vue";

const props = defineProps<{ notice: Notice }>();

const noticeTimeDisplay = computed(() => {
  // PocketBase自动生成的update有时差！需要加8小时到北京时间
  return formatDatetime(dayjs(props.notice.created).add(8, "hour"));
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
  <n-timeline-item v-if="typeName!=='none'"
                   :type="typeName"
                   :title="notice.content"
                   :time="noticeTimeDisplay">
    <template #icon v-if="typeName!=='none'">
      <n-icon size="30">
        <AlertCircleOutline v-if="typeName==='info'"/>
        <AddCircleOutline v-if="typeName==='success'"/>
        <CreateOutline v-if="typeName==='warning'"/>
        <Trash v-if="typeName==='error'"/>
      </n-icon>
    </template>
    <template #default>
      <div class="notice-card-content">
        <n-grid x-gap="30" :cols="[notice.to, notice.from].filter(_=>!!_).length+(typeName==='info'?1:0)">
          <n-gi v-if="typeName==='info'">
            <div class="notice-card-content-text">{{ notice.content }}</div>
          </n-gi>

          <n-gi v-if="notice.to">
            <CourseCard :course="notice.to" :courses-existing="[]" :show-grade="true" :lesson-num="1" query-date="2022-08-08"/>
          </n-gi>

          <n-gi v-if="notice.from">
            <CourseCard :course="notice.from" :courses-existing="[]" :show-grade="true" :lesson-num="1" query-date="2022-08-08"/>
          </n-gi>
        </n-grid>
      </div>
    </template>
  </n-timeline-item>
</template>

<style scoped>
.notice-card-content {
  overflow-x: auto;
}

.notice-card-content-text {
  display: flex;
  height: 100%;
  justify-content: center;
  justify-items: center;
  align-items: center;
  align-content: center;
}
</style>
