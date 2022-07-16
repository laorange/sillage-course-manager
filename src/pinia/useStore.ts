import {defineStore} from "pinia";
import {Config, Course} from "../assets/ts/types";
import dayjs from "dayjs";

type State = {
    config: Config
    courses: Course[]
    grades: string[]
    editor: {
        show: boolean,
        mode: "none" | "add" | "copy" | "cut" | "edit"
        whatDay: number
        lessonNum: number
        courseEditing: Course | null
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
                    "2022-09-30"
                ],
                "lessonNum": 3,
                "note": "这是一条备注信息",
                "info": {
                    "name": "数据库设计",
                    "code": "CS21",
                    "bgc": "#9934CD"
                },
                "method": "实验课",
                "situations": [
                    {
                        "teacher": "王老师",
                        "room": "210教室",
                        "groups": [
                            "A班",
                            "B班"
                        ]
                    },
                    {
                        "teacher": "李老师",
                        "room": "210教室",
                        "groups": [
                            "C班",
                            "D班"
                        ]
                    }
                ]
            },
                {
                    "id": 2,
                    "grade": "18级",
                    "dates": [
                        "2022-10-10",
                        "2022-10-17"
                    ],
                    "lessonNum": 3,
                    "note": "这是一条备注信息",
                    "info": {
                        "name": "确认与验证",
                        "code": "CS41",
                        "bgc": "#00B050"
                    },
                    "method": "理论课",
                    "situations": [
                        {
                            "teacher": "王老师",
                            "room": "210教室",
                            "groups": [
                                "A班",
                                "B班"
                            ]
                        },
                        {
                            "teacher": "李老师",
                            "room": "210教室",
                            "groups": [
                                "C班",
                                "D班"
                            ]
                        }
                    ]
                }],
            grades: ["18级", "19级", "20级"],
            editor: {
                show: false,
                mode: "add",
                whatDay: 1,
                lessonNum: 1,
                courseEditing: null,
                coursesExisting: [],
            },
        };
    },
    getters: {
        semesterStartDay(): dayjs.Dayjs {
            return dayjs(this.config.semesterStartDate);
        },
    },
    actions: {},
});
