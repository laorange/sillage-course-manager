import {defineStore} from "pinia";
import {Config, Course, CourseInfo, getEmptyCourse} from "../assets/ts/types";
import dayjs from "dayjs";

type State = {
    config: Config
    courses: Course[]
    editor: {
        show: boolean,
        mode: "none" | "add" | "copy" | "cut" | "edit"
        whatDay: number
        lessonNum: number
        courseEditing: Course
        coursesExisting: Course[]
    }
}

export const useStore = defineStore("counter", {
    state: (): State => {
        return {
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
                "languages": ["English"],
                "dictionary": {
                    "高等数学": ["Advanced mathematics"],
                    "大学物理": ["College Physics"],
                },
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
            },
        };
    },
    getters: {
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
    },
    actions: {},
});
