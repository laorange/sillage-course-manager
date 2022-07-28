import {defineStore} from "pinia";
import {Config, Course, CourseInfo, LocalConfig} from "../assets/ts/types";
import dayjs from "dayjs";
import {CourseConflictDetector, CourseDecorator, getEmptyCourse} from "../assets/ts/courseToolkit";
import PocketBase from "pocketbase";
import {formatDate} from "../assets/ts/datetimeUtils";

type State = {
    client: PocketBase
    config: Config
    localConfig: LocalConfig
    refs: {
        queryDate: string
    },
    courses: Course[]
    editor: {
        show: boolean,
        mode: "none" | "add" | "copy" | "cut" | "edit"
        whatDay: number
        lessonNum: number
        courseEditing: Course
        authenticated: boolean
    }
}

export const useStore = defineStore("store", {
    state: (): State => {
        return {
            client: new PocketBase(import.meta.env.VITE_BACKEND_URL),
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
            localConfig: {
                language: "中文",
                isDateMode: false,
            },
            refs: {
                queryDate: formatDate(dayjs()),
            },
            courses: [],

            editor: {
                show: false,
                mode: "none",
                whatDay: 1,
                lessonNum: 1,
                courseEditing: getEmptyCourse(),
                authenticated: false,
            },
        };
    },
    getters: {
        semesterStartDay(): dayjs.Dayjs {
            return dayjs(this.config.content.semesterStartDate);
        },
        editorWhatDayStr(): string {
            const whatDayStrList = Array.from("一二三四五六天");
            return `星期${whatDayStrList[this.editor.whatDay - 1]}`;
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
            const _rooms: string[] = [];
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
            const _teachers: string[] = [];
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
            let _methods: string[] = [];
            for (const courses of this.courses) {
                if (!!courses.method && _methods.indexOf(courses.method) === -1) {
                    _methods.push(courses.method);
                }
            }
            return _methods.sort();
        },
        courseNames(): string[] {
            const _courseNames: string[] = [];
            for (const courses of this.courses) {
                if (!!courses.info.name && _courseNames.indexOf(courses.info.name) === -1) {
                    _courseNames.push(courses.info.name);
                }
            }
            return _courseNames.sort();
        },
        courseInfoDict(): { [key: string]: CourseInfo } {
            // 提取现有课程的课程信息，(若有多个同名课程，只会记录首次出现的课程信息)
            const courseInfoDict: { [key: string]: CourseInfo } = {};
            for (const courses of this.courses) {
                if (!courseInfoDict[courses.info.name]) {
                    courseInfoDict[courses.info.name] = courses.info;
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
                .concat(["使用说明", "正在查看", "年级", "班级", "授课方式", "授课教师", "教室"])
                .concat(["日期", "星期"])
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
        fetchData() {
            // config
            this.client.Records.getFullList("config").then((response) => {
                if (response[0]) this.config = response[0] as unknown as Config;
            }).catch(() => alert("在获取系统设置时出错了，请检查网络连接"));

            // courses  -  潜在问题: batchSize 设为 1e8，希望能一次性请求全部的课程
            this.client.Records.getFullList("course", 1e8, {sort: "-updated"}).then((response) => {
                this.courses = response as unknown as Course[];
            }).catch(() => alert("在获取课程信息时出错了，请检查网络连接"));
        },
        validateAuthStatus() {
            if (localStorage.getItem("pocketbase_auth")) {
                this.client.Admins.refresh().then(() => {
                    this.editor.authenticated = true;
                }).catch(() => localStorage.removeItem("pocketbase_auth"));
            }
        },
    },
});
