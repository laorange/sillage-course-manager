import {createApp} from "vue";
import {createPinia} from "pinia";
import App from "./App.vue";
import router from "./router/router";
import "@imengyu/vue3-context-menu/lib/vue3-context-menu.css";
import ContextMenu from "@imengyu/vue3-context-menu";
import Vue3Storage from "vue3-storage";

createApp(App)
    .use(createPinia())
    .use(router)
    .use(ContextMenu)
    .use(Vue3Storage, {namespace: "sillage_"})
    .mount("#app");
