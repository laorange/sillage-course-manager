import dayjs from "dayjs";

//<editor-fold desc="Course">
export interface Situation {
    "teacher": string | null,
    "room": string | null,
    "groups": string[]
}

export interface CourseInfo {
    "name": string,
    "code": string | null,
    "bgc": string
}

export interface Course {
    "_id": number,
    "info": CourseInfo,
    "situation": Situation[]
    "grade": string,

    "dates": string[],
    "lesson_num": number,

    "note": string,
    "method": string | null,
}

//</editor-fold>


//<editor-fold desc="Config">
export interface LessonConfig {
    start: string,
    end: string
}

export interface Config {
    // 学期开始时间
    semesterStartDate: dayjs.Dayjs;

    // 学期最大周数
    maxWeekNum: number;

    // 每节课的开始、结束时间
    lessonConfigs: LessonConfig[];

    // 语言与翻译(i18n)
    languages: string[];
    dictionary: { [key: string]: string[] };
}

//</editor-fold>