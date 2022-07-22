import {defineStore} from "pinia";
import {Config, Course, CourseInfo, getEmptyCourse} from "../assets/ts/types";
import dayjs from "dayjs";
import {CourseDecorator} from "../assets/ts/courseDecorator";
import PocketBase from "pocketbase";

type State = {
    client: PocketBase
    config: Config
    userConfig: {
        language: string
    }
    courses: Course[]
    editor: {
        show: boolean,
        mode: "none" | "add" | "copy" | "cut" | "edit"
        whatDay: number
        lessonNum: number
        courseEditing: Course
        coursesExisting: Course[]
        authenticated: boolean
    }
}

export const useStore = defineStore("store", {
    state: (): State => {
        return {
            client: new PocketBase(import.meta.env.VITE_BACKEND_URL),
            config: {
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
                "languages": ["English", "Français"],
                "dictionary": {
                    "迹云课表": ["Sillage", "Sillage"],
                    "18级": ["Grade 18", "Année 18"],
                    "19级": ["Grade 19", "Année 19"],
                    "A班": ["Class A", "Classe A"],
                    "B班": ["Class B", "Classe B"],
                    "C班": ["Class C", "Classe C"],
                    "D班": ["Class D", "Classe D"],
                    "数据库设计": ["Database design", "Conception de la base de données"],
                    "确认与验证": ["Confirmation and verification", "Validation et vérification"],
                    "实验课": ["Experimental class", "Cours de laboratoire"],
                    "理论课": ["Theory Course", "Cours de théorie"],
                    "李老师": ["Miss Li", "Mlle Li."],
                    "王老师": ["Miss Wang", "M. Wang."],
                    "120教室": ["Classroom 120", "Salle de classe 120"],
                    "122教室": ["122 classroom", "Salle de classe 122"],
                    "210教室": ["Classroom 210", "Salle de classe 210"],
                    "212教室": ["Classroom 212", "Salle de classe 212"],
                    "星期": ["week", "Semaine"],
                    "星期一": ["Monday", "Lundi"],
                    "星期二": ["Tuesday", "Mardi"],
                    "星期三": ["Wednesday", "Mercredi"],
                    "星期四": ["Thursday", "Jeudi"],
                    "星期五": ["Friday", "Vendredi"],
                    "星期六": ["Saturday", "Samedi"],
                    "星期天": ["Sunday", "Dimanche"],
                    "使用说明": ["Introduction", "Introduction"],
                    "系统配置": ["Settings", "Configurations"],
                },
            },
            userConfig: {
                language: "中文",
            },
            courses: [{
                "id": 1,
                "grade": "19级",
                "dates": [
                    "2022-09-23",
                    "2022-09-30",
                ],
                "lessonNum": 3,
                "note": "这是一条备注信息",
                "info": {
                    "name": "数据库设计",
                    "code": "CS21",
                    "bgc": "#9934CD",
                },
                "method": "实验课",
                "situations": [
                    {
                        "teacher": "王老师",
                        "room": "120教室",
                        "groups": [
                            "A班",
                            "B班",
                        ],
                    },
                    {
                        "teacher": "李老师",
                        "room": "122教室",
                        "groups": [
                            "C班",
                            "D班",
                        ],
                    },
                ],
            },
                {
                    "id": 2,
                    "grade": "18级",
                    "dates": [
                        "2022-10-10",
                        "2022-10-17",
                    ],
                    "lessonNum": 3,
                    "note": "这是一条备注信息",
                    "info": {
                        "name": "确认与验证",
                        "code": "CS41",
                        "bgc": "#00B050",
                    },
                    "method": "理论课",
                    "situations": [
                        {
                            "teacher": "王老师",
                            "room": "212教室",
                            "groups": [
                                "A班",
                                "B班",
                            ],
                        },
                        {
                            "teacher": "李老师",
                            "room": "210教室",
                            "groups": [
                                "C班",
                                "D班",
                            ],
                        },
                    ],
                }],

            editor: {
                show: false,
                mode: "none",
                whatDay: 1,
                lessonNum: 1,
                courseEditing: getEmptyCourse(),
                coursesExisting: [],
                authenticated: false,
            },
        };
    },
    getters: {
        authenticated(): boolean {
            return false;
        },
        semesterStartDay(): dayjs.Dayjs {
            return dayjs(this.config.semesterStartDate);
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
            return [this.config.tableName]
                .concat(this.grades)
                .concat((Array.from(new Set(Object.values(this.groupDict).reduce(
                    (out, groups) => out.concat(groups), [])),
                ).sort()))
                .concat(this.courseNames)
                .concat(this.methods)
                .concat(this.teachers)
                .concat(this.rooms)
                .concat(["星期"])
                .concat(Array.from("一二三四五六天").map(w => `星期${w}`));
        },
        courseOfCurrentSemester(): CourseDecorator {
            return (new CourseDecorator(this.courses))
                .isSameOrAfter(this.semesterStartDay)
                .before(this.semesterStartDay.add(this.config.maxWeekNum, "week"));
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
            let result = word;
            let languageIndex = this.config.languages.indexOf(this.userConfig.language);
            if (word in this.config.dictionary && languageIndex !== -1) {
                result = this.config.dictionary[word][languageIndex];
            }
            return result ? result : word;
        },
    },
});
