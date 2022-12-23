import {createRouter, createWebHashHistory, NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw} from "vue-router";
import {useStore} from "../pinia/useStore";

const HomePage = () => import("./home/HomePage.vue");
const ConfigEditor = () => import("./config/ConfigEditor.vue");
const CourseTable = () => import("./course/CourseTable.vue");
const LoginPage = () => import("./login/LoginPage.vue");
const PlanTable = () => import("./plan/PlanTable.vue");
const FavoritesPage = () => import("./favorites/FavoritesPage.vue");
const RoomTable = () => import("./room/RoomTable.vue");

function noGradeToAllGrades(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
    const store = useStore();
    if (!to.query.grade) next({path: to.path, query: {...to.query, grade: store.grades}});
    else next();
}

export function recordLastVisitPath(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
    const store = useStore();
    store.localConfig.lastVisitPath = {path: to.path, params: to.params, query: to.query, fullPath: to.fullPath};
    next();
}

function goToLastVisitPage(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
    const store = useStore();
    if (store.localConfig.lastVisitPath) next(store.localConfig.lastVisitPath);
    else next({...to, name: "course"});
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
        path: "/last-visit/",
        name: "last-visit",
        component: CourseTable,
        beforeEnter: goToLastVisitPage,
    },
    {
        path: "/favorites/",
        name: "favorites",
        component: FavoritesPage,
    },
    {
        path: "/course/",
        name: "course",
        component: CourseTable,
        beforeEnter: recordLastVisitPath,
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
    {
        path: "/room/",
        name: "room",
        component: RoomTable,
    },
];

export default createRouter({
    history: createWebHashHistory(),
    routes,
});
