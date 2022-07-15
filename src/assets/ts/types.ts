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
    "id": number,
    "info": CourseInfo,
    "situations": Situation[]
    "grade": string,

    "dates": string[],
    "lessonNum": number,

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
    // 课表名
    tableName: string;

    // 学期开始时间
    semesterStartDate: string;

    // 学期最大周数
    maxWeekNum: number;

    // 每节课的开始、结束时间
    lessonConfigs: LessonConfig[];

    // 语言与翻译(i18n)
    languages: string[];
    dictionary: { [key: string]: string[] };
}

//</editor-fold>


