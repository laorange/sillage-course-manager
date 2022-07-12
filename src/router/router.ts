import {createRouter, createWebHashHistory, RouteRecordRaw} from "vue-router";
import Docs from "../components/Docs/Docs.vue";
import ConfigEditor from "../components/ConfigEditor/ConfigEditor.vue";
import CourseTable from "../components/CourseTable/CourseTable.vue";


const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "docs",
        component: Docs,
        alias: "/docs/",
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
];

export default createRouter({
    history: createWebHashHistory(),
    routes,
});
