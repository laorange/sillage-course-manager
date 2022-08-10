import {createRouter, createWebHashHistory, NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw} from "vue-router";
import HomePage from "../components/Home/HomePage.vue";
import ConfigEditor from "../components/ConfigEditor/ConfigEditor.vue";
import CourseTable from "../components/CourseTable/CourseTable.vue";
import LoginPage from "../components/LoginPage/LoginPage.vue";
import PlanTable from "../components/PlanTable/PlanTable.vue";
import {useStore} from "../pinia/useStore";

function noGradeToAllGrades(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
    const store = useStore();
    if (!to.query.grade) next({path: to.path, query: {...to.query, grade: store.grades}});
    else next();
}


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
        beforeEnter: noGradeToAllGrades,
    },
    {
        path: "/login/",
        name: "login",
        component: LoginPage,
    },
    {
        path: "/plan/",
        name: "plan",
        component: PlanTable,
        beforeEnter: noGradeToAllGrades,
    },
];

export default createRouter({
    history: createWebHashHistory(),
    routes,
});
