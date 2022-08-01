<script setup lang="ts">
import {useStore} from "../../pinia/useStore";
import {FormInst, FormItemRule, useMessage, FormRules} from "naive-ui";
import {onBeforeMount, ref} from "vue";
import {useRouter} from "vue-router";

const store = useStore();
const message = useMessage();
const router = useRouter();

onBeforeMount(() => {
  if (store.editor.authenticated) {
    handlers.loginSuccess();
  } else {
    store.validateAuthStatus();
  }
});

const handlers = {
  backToHome() {
    router.push({name: "home"});
  },
  loginSuccess() {
    message.success("您已成功登录，请开始编辑吧");
    handlers.backToHome();
  },
  loginFail() {
    message.error("认证失败！请确认密码后重试");
    model.value = {
      email: null,
      password: null,
    };
    formRef.value?.restoreValidation();
  },
  login() {
    formRef.value?.validate().then(
        () => {
          store.api.client.Admins.authViaEmail(model.value.email ?? "", model.value.password ?? "", {}, {})
              .then(() => {
                store.editor.authenticated = true;
                handlers.loginSuccess();
              }).catch(() => handlers.loginFail());
        },
    ).catch(() => {
      message.error("请先完成填写");
    });
  },
};

const formRef = ref<FormInst | null>(null);
const model = ref({
  email: null,
  password: null,
});

const rules: FormRules = {
  email: [
    {
      required: true,
      message: "请输入邮箱",
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error("该项为必填");
        } else if (!/^[a-zA-Z\d_-]+@[a-zA-Z\d_-]+(\.[a-zA-Z\d_-]+)+$/.test(value)) {
          return new Error("请输入正确的邮箱地址");
        }
        return true;
      },
      trigger: ["input", "blur"],
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error("该项为必填");
        }
      },
      trigger: ["input", "blur"],
    },
  ],
};
</script>

<template>
  <main>
    <n-space :vertical="true" justify="center" align="center" size="large">
      <h1>登录页面</h1>

      <n-form ref="formRef" :model="model" :rules="rules">
        <n-form-item path="email" label="邮箱">
          <n-input v-model:value="model.email"
                   placeholder="请输入邮箱"
                   @keydown.enter.prevent/>
        </n-form-item>
        <n-form-item path="password" label="密码">
          <n-input
              v-model:value="model.password"
              placeholder="请输入密码"
              type="password"
              @input="rules.handlePasswordInput"
              @keydown.enter.prevent
          />
        </n-form-item>
      </n-form>

      <n-button type="success" @click="handlers.login">登录</n-button>
    </n-space>
  </main>
</template>

<style scoped>
main {
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  margin-bottom: 0;
}
</style>
