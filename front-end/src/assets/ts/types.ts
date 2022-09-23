import {RouteLocationNormalized} from "vue-router";

export interface RawPocketBaseData<K> {
    "page": number,
    "perPage": number,
    "totalItems": number,
    "items": K[]
}

export interface PocketBaseModel {
    id: string;
    created?: string;
    updated?: string;
    "@collectionName"?: string;
    "@collectionId"?: string;
}


//<editor-fold desc="Course">
export interface Situation {
    // "teacher"?: string | null;
    // "room"?: string | null;
    "groups": string[];
    "teachers": string[];
    "rooms": string[];
}

export interface CourseInfo {
    "name": string,
    "code": string | null,
    "bgc": string
}

export interface Course extends PocketBaseModel {
    "id": string;
    "info": CourseInfo;
    "situations": Situation[];
    "grade": string;

    "dates": string[];
    "lessonNum": number;

    "note": string;
    "method": string | null;
}

//</editor-fold>


//<editor-fold desc="Config">
export interface LessonConfig {
    start: string,
    end: string
}

export interface Dictionary {
    [word: string]: string[];
}

export interface Config extends PocketBaseModel {
    content: {
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
        dictionary: Dictionary;
    };
}

//</editor-fold>


export interface Notice extends PocketBaseModel {
    type: "course" | "bulletin";
    content?: string;
    from?: Course;
    to?: Course;
    groups?: GradeGroupArray[];
}

export interface MinimalRoute {
    path: string,
    fullPath: RouteLocationNormalized["fullPath"]
    query: RouteLocationNormalized["query"]
    params: RouteLocationNormalized["params"]
}


export interface LocalConfig {
    language: string;
    isDateMode: boolean;
    displayMode: "一天" | "双列表" | "一周";
    verticalCard: boolean;
    thinkTwice: boolean;
    version: string;
    readNotices: string[];
    lastVisitPath: null | MinimalRoute;
    favorites: MinimalRoute[];
    database: {
        recordTime: string;
        courses: Course[];
    };
}

export type GradeGroupArray = [string, string]
