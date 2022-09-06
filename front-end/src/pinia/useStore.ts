import {defineStore} from "pinia";
import {Config, Course, CourseInfo, LocalConfig, Notice} from "../assets/ts/types";
import dayjs from "dayjs";
import {CourseConflictDetector, CourseDecorator, getEmptyCourse} from "../assets/ts/courseToolkit";
import PocketBase from "pocketbase";
import {formatDate, getIsoWeekDay, getWeekAmountBetweenTwoDay} from "../assets/ts/datetimeUtils";
import {courseInfoArray, teacherArray, roomArray, methodArray} from "../assets/ts/usePreset";
import {ApiHandler} from "../assets/ts/ApiHandler";

type State = {
    isLoading: boolean

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

            api: new ApiHandler(new PocketBase(import.meta.env.VITE_BACKEND_URL)),

            courses: [],
            config: {
                id: "",
                content: {
                    tableName: "迹云课表",
                    semesterStartDate: "2022-08-29",
                    maxWeekNum: 20,
                    lessonConfigs: [
                        {"start": "08:00", "end": "09:35"},
                        {"start": "10:05", "end": "11:40"},
                        {"start": "13:30", "end": "15:05"},
                        {"start": "15:35", "end": "17:10"},
                        {"start": "18:30", "end": "20:05"},
                    ],
                    "languages": [],
                    "dictionary": {},
                },
            },
            notices: [],

            localConfig: {
                language: "中文",
                isDateMode: false,
                verticalCard: true,
                displayMode: "周视图",
                thinkTwice: true,
                version: "0.0.0",
            },

            editor: {
                show: false,
                mode: "none",
                fromDates: [],
                lessonNum: 1,
                courseEditing: getEmptyCourse(),
                courseAdding: getEmptyCourse(),
                authenticated: false,
            },
        };
    },
    getters: {
        todayDate(): string {
            return formatDate(dayjs());
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
            return _grades.sort();
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
            const _rooms: string[] = (import.meta.env.MODE !== "release") ? roomArray : [];

            // 从已有课程中遍历出已有教室
            for (const courses of this.courses) {
                for (const situation of courses.situations) {
                    if (!!situation.room && _rooms.indexOf(situation.room) === -1) {
                        _rooms.push(situation.room);
                    }
                }
            }

            return _rooms.sort();
        },
        teachers(): string[] {
            // 从预设中导入
            let _teachers: string[] = (import.meta.env.MODE !== "release") ? teacherArray : [];

            // 从已有课程中遍历出已有授课教师
            for (const courses of this.courses) {
                for (const situation of courses.situations) {
                    if (!!situation.teacher && _teachers.indexOf(situation.teacher) === -1) {
                        _teachers.push(situation.teacher);
                    }
                }
            }
            return _teachers.sort();
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
            return _methods.sort();
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
                .concat(["使用说明", "教学计划", "偏好设置", "全部课程", "复制网址", "年级", "班级", "授课方式", "授课教师", "教室"])
                .concat(["公告", "单列表", "双列表", "周视图", "管理员入口", "水平显示", "竖直显示"])
                .concat(["名称", "上一周", "下一周", "日期模式", "星期模式", "显示模式", "堆叠方向"])
                .concat(["确定", "取消", "成功", "完成", "失败"])
                .concat(Array.from("一二三四五六天").map(w => `星期${w}`));
        },
        courseOfCurrentSemester(): CourseDecorator {
            return (new CourseDecorator(this.courses))
                .isSameOrAfter(this.semesterStartDay)
                .before(this.semesterStartDay.add(this.config.content.maxWeekNum, "week"));
        },
        gradeCourseDictOfAll(): { [grade: string]: Course[] } {
            const _dict: { [grade: string]: Course[] } = {};
            for (const grade of this.grades) {
                _dict[grade] = (new CourseDecorator(this.courses)).ofGrade(grade).value;
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
        getConflictOfCourse(targetCourse: Course): string {
            let existingCourses: Course[] = (new CourseDecorator(this.courses))
                .ofLessonNum(targetCourse.lessonNum).ofDates(targetCourse.dates).value;
            if (this.editor.mode === "copy" || this.editor.mode === "cut" || this.editor.mode === "add") {
                // 复制、剪切 的时候 需要考虑 当前正在编辑课程带来的影响。新增时，id为空，无影响
            } else {
                // 编辑(更新) 时 不需要考虑 当前正在编辑课程带来的影响
                existingCourses = existingCourses.filter((c: Course) => c.id !== targetCourse.id);
            }
            return (new CourseConflictDetector(targetCourse, existingCourses)).getConflictString();
        },
        validateAuthStatus() {
            if (localStorage.getItem("pocketbase_auth")) {
                this.api.client.Admins.refresh().then(() => {
                    this.editor.authenticated = true;
                }).catch(() => localStorage.removeItem("pocketbase_auth"));
            }
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
        filterCurrentSemesterCourses(courseDecorator: CourseDecorator): CourseDecorator {
            return courseDecorator.isSameOrAfter(this.semesterStartDay)
                .before(this.semesterStartDay.add(this.config.content.maxWeekNum, "week"));
        },
    },
});
