import {defineStore} from "pinia";
import {Config, Course, CourseInfo, LocalConfig, Notice} from "../assets/ts/types";
import dayjs from "dayjs";
import {CoursesHandler, getEmptyCourse} from "../assets/ts/courseToolkit";
import PocketBase from "pocketbase";
import {formatDate, formatDatetime, getIsoWeekDay, getWeekAmountBetweenTwoDay} from "../assets/ts/datetimeUtils";
import {courseInfoArray, teacherArray, roomArray, methodArray} from "../assets/ts/usePreset";
import {ApiHandler} from "../assets/ts/ApiHandler";
import {getArrayWithUniqueItem} from "../assets/ts/useCommonUtils";

import storeData from "../assets/back_up_data/storeData.json"
import getTodayX from "../assets/ts/getToday";

type State = {
    isLoading: boolean
    loadingDescription: string

    api: ApiHandler

    config: Config
    courses: Course[]
    notices: Notice[]

    localConfig: LocalConfig
    editor: {
        show: boolean,
        mode: "none" | "add" | "copy" | "cut" | "edit"
        fromDates: string[]
        lessonNum: number
        courseEditing: Course
        courseAdding: Course
        authenticated: boolean
    }
}

export const useStore = defineStore("store", {
    state: (): State => {
        return {
            isLoading: false,
            loadingDescription: "",

            api: new ApiHandler(new PocketBase(import.meta.env.VITE_BACKEND_URL)),

            courses: (storeData as unknown as State).localConfig.database.courses,
            config: (storeData as unknown as State).config,
            notices: (storeData as unknown as State).notices,

            localConfig: (storeData as unknown as State).localConfig,

            editor: (storeData as unknown as State).editor,
        };
    },
    getters: {
        todayDate(): string {
            return formatDate(getTodayX());
        },
        semesterStartDay(): dayjs.Dayjs {
            return dayjs(this.config.content.semesterStartDate);
        },
        editorFromWhatDay(): number {
            return getIsoWeekDay(dayjs(this.editor.fromDates[0]));
        },
        editorFromWhatDayStr(): string {
            const whatDayStrList = Array.from("一二三四五六天");
            return `星期${whatDayStrList[this.editorFromWhatDay - 1]}`;
        },
        grades(): string[] {
            let _grades: string[] = [];
            for (const courses of this.courses) {
                if (!!courses.grade && _grades.indexOf(courses.grade) === -1) {
                    _grades.push(courses.grade);
                }
            }
            return getArrayWithUniqueItem(_grades).sort();
        },
        groupDict(): { [grade: string]: string[] } {
            const _groupDict: { [grade: string]: string[] } = {};
            for (const courses of this.courses) {
                for (const situation of courses.situations) {
                    if (!(_groupDict[courses.grade] instanceof Array)) {
                        _groupDict[courses.grade] = [];
                    }
                    for (const group of situation.groups) {
                        if (_groupDict[courses.grade].indexOf(group) === -1) {
                            _groupDict[courses.grade].push(group);
                        }
                    }
                }
            }
            for (const groups of Object.values(_groupDict)) {
                // 对每个年级的分组们 按字符(编码)排序
                groups.sort();
            }
            return _groupDict;
        },
        rooms(): string[] {
            // 从预设中导入
            let _rooms: string[] = (import.meta.env.MODE !== "release") ? roomArray : [];

            // 从已有课程中遍历出已有教室
            _rooms = _rooms.concat((new CoursesHandler(this.courses)).getSituItems().rooms);

            return getArrayWithUniqueItem(_rooms).sort();
        },
        teachers(): string[] {
            // 从预设中导入
            let _teachers: string[] = (import.meta.env.MODE !== "release") ? teacherArray : [];

            // 从已有课程中遍历出已有授课教师
            _teachers = _teachers.concat((new CoursesHandler(this.courses)).getSituItems().teachers);

            return getArrayWithUniqueItem(_teachers).sort();
        },
        methods(): string[] {
            // 从预设中导入
            let _methods: string[] = (import.meta.env.MODE !== "release") ? methodArray : [];
            // 从已有课程中遍历出现有授课方式
            for (const courses of this.courses) {
                if (!!courses.method && _methods.indexOf(courses.method) === -1) {
                    _methods.push(courses.method);
                }
            }
            return getArrayWithUniqueItem(_methods).sort();
        },
        courseNames(): string[] {
            return Object.keys(this.courseInfoDict).sort();
        },
        courseInfoDict(): { [key: string]: CourseInfo } {
            // 提取现有课程的课程信息，(若有多个同名课程，只会记录首次出现的课程信息)
            const courseInfoDict: { [key: string]: CourseInfo } = {};

            // 先从已有课程中遍历出课程信息
            for (const courses of this.courses) {
                if (!courseInfoDict[courses.info.name]) courseInfoDict[courses.info.name] = courses.info;
            }

            // 再从json文件中导入预设的课程信息，如果已有某节课的信息，不会覆盖旧信息
            if (import.meta.env.MODE !== "release") {
                for (const courseInfo of (courseInfoArray as CourseInfo[])) {
                    if (!courseInfoDict[courseInfo.name]) courseInfoDict[courseInfo.name] = courseInfo;
                }
            }

            return courseInfoDict;
        },
        dictionaryItems(): string[] {
            return [this.config.content.tableName]
                .concat(this.grades)
                .concat((Array.from(new Set(Object.values(this.groupDict).reduce(
                    (out, groups) => out.concat(groups), [])),
                ).sort()))
                .concat(this.courseNames)
                .concat(this.methods)
                .concat(this.teachers)
                .concat(this.rooms)
                .concat(["使用说明", "教学计划", "偏好设置", "课程", "全部课程", "复制网址", "年级", "班级", "授课方式", "授课教师", "教室"])
                .concat(["公告", "一天", "一周", "管理员入口", "水平显示", "竖直显示", "上次访问"])
                .concat(["名称", "上一周", "下一周", "日期模式", "星期模式", "显示内容", "堆叠方向"])
                .concat(["确定", "取消", "成功", "完成", "失败", "课程名称"])
                .concat(["收藏夹", "收藏本页", "已收藏", "取消收藏", "这里空空如也", "返回首页"])
                .concat(["今天"])
                .concat(Array.from("一二三四五六天").map(w => `星期${w}`));
        },
        courseOfCurrentSemester(): CoursesHandler {
            return (new CoursesHandler(this.courses))
                .isSameOrAfter(this.semesterStartDay)
                .before(this.semesterStartDay.add(this.config.content.maxWeekNum, "week"));
        },
        gradeCourseDictOfAll(): { [grade: string]: Course[] } {
            const _dict: { [grade: string]: Course[] } = {};
            for (const grade of this.grades) {
                _dict[grade] = (new CoursesHandler(this.courses)).ofGrade(grade).value;
            }
            return _dict;
        },
        gradeCourseDictOfCurrentSemester(): { [grade: string]: Course[] } {
            const _dict: { [grade: string]: Course[] } = {};
            for (const grade of this.grades) {
                _dict[grade] = this.courseOfCurrentSemester.ofGrade(grade).value;
            }
            return _dict;
        },
    },
    actions: {
        translate(word: string | null | undefined): string {
            if (!word) {
                return "";
            }
            // 若没有设置外语语言，则直接返回原词
            if (!this.config.content.languages) {
                return word;
            }
            let result = word;
            let languageIndex = this.config.content.languages.indexOf(this.localConfig.language);
            if (word in this.config.content.dictionary && languageIndex !== -1) {
                result = this.config.content.dictionary[word][languageIndex];
            }
            return result ? result : word;
        },
        getExistingCoursesOfCourse(targetCourse: Course): CoursesHandler {
            let ecs = (new CoursesHandler(this.courses)).ofLessonNum(targetCourse.lessonNum).ofDates(targetCourse.dates);

            if (this.editor.mode !== "copy" && this.editor.mode !== "cut" && this.editor.mode !== "add") {
                // 复制、剪切 的时候 需要考虑 当前正在编辑课程带来的影响。新增时，id为空，无影响
                // 编辑(更新) 时 不需要考虑 当前正在编辑课程带来的影响
                ecs = ecs.filter((c: Course) => c.id !== targetCourse.id);
            }

            return ecs;
        },
        hasConflictOfCourse(targetCourse: Course) {
            return this.getExistingCoursesOfCourse(targetCourse).hasConflictCourse(targetCourse.dates, targetCourse.lessonNum, targetCourse);
        },
        validateAuthStatus() {
            // if (localStorage.getItem("pocketbase_auth")) {
            //     this.api.client.Admins.refresh().then(() => {
            //         this.editor.authenticated = true;
            //     }).catch(() => localStorage.removeItem("pocketbase_auth"));
            // }
        },
        getWeekNumOfSomeDate(someDate: string | dayjs.Dayjs): number {
            if (typeof someDate === "string") {
                someDate = dayjs(someDate);
            }
            return getWeekAmountBetweenTwoDay(this.semesterStartDay, someDate) + 1;
        },
        getWhatDayStr(whatDay: number) {
            return `星期${Array.from("一二三四五六天")[whatDay - 1]}`;
        },
        filterCurrentSemesterCourses(courseDecorator: CoursesHandler): CoursesHandler {
            return courseDecorator.isSameOrAfter(this.semesterStartDay)
                .before(this.semesterStartDay.add(this.config.content.maxWeekNum, "week"));
        },
        async withLoading(asyncFunc: Promise<any>, description: string = "") {
            this.isLoading = true;
            this.loadingDescription = description;
            await asyncFunc;
            this.isLoading = false;
            this.loadingDescription = "";
        },
    },
});
