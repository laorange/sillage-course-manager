import {defineStore} from "pinia";
import {Config, Course} from "../assets/ts/types";
import dayjs from "dayjs";

type State = {
    config: Config
    courses: Course[]
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
            courses: [],
        };
    },
    getters: {
        semesterStartDay(): dayjs.Dayjs {
            return dayjs(this.config.semesterStartDate);
        },
    },
    actions: {},
});