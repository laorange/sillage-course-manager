import {createRouter, createWebHashHistory, RouteRecordRaw} from "vue-router";
import HomePage from "../components/Home/HomePage.vue";
import ConfigEditor from "../components/ConfigEditor/ConfigEditor.vue";
import CourseTable from "../components/CourseTable/CourseTable.vue";
import LoginPage from "../components/LoginPage/LoginPage.vue";


const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "home",
        component: HomePage,
        alias: "/home/",
    },
    {
        path: "/config/",
        name: "config",
        component: ConfigEditor,
    },
    {
        path: "/course/",
        name: "course",
        component: CourseTable,
    },
    {
        path: "/login/",
        name: "login",
        component: LoginPage,
    }
];

export default createRouter({
    history: createWebHashHistory(),
    routes,
});
