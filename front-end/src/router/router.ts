import {createRouter, createWebHashHistory, NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw} from "vue-router";
import HomePage from "../components/Home/HomePage.vue";
import ConfigEditor from "../components/ConfigEditor/ConfigEditor.vue";
import CourseTable from "../components/CourseTable/CourseTable.vue";
import LoginPage from "../components/LoginPage/LoginPage.vue";
import PlanTable from "../components/PlanTable/PlanTable.vue";
import FavoritesPage from "../components/FavoritesPage/FavoritesPage.vue";
import RoomTable from "../components/RoomTable/RoomTable.vue";
import {useStore} from "../pinia/useStore";

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
