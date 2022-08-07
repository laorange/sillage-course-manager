import PocketBase from "pocketbase";
import {Config, Course, GradeGroupArray, Notice, PocketBaseModel} from "./types";


function getGradeGroupArrayOfCourse(course: Course | Course[]): GradeGroupArray[] {
    if (course instanceof Array) {
        return Array.from(new Set(course.reduce((r: GradeGroupArray[], c) => r.concat(getGradeGroupArrayOfCourse(c)), []))).sort();
    }

    let groups = course.situations.reduce((r: string[], s) => r.concat(s.groups ?? []), []);
    return Array.from(new Set(groups.length ? groups.map(g => [course.grade, g]) : [[course.grade, ""]])).sort() as GradeGroupArray[];
}

class Collection<T extends PocketBaseModel> {
    client: PocketBase;
    collectionName: string;

    constructor(client: PocketBase, collectionName: string) {
        this.client = client;
        this.collectionName = collectionName;
    }

    public async create(newRecord: T, successHook?: (results: T) => any, errorHook?: (e: Error) => any) {
        try {
            let result = await this.client.Records.create(this.collectionName, newRecord) as unknown as T;
            if (successHook) successHook(result);
        } catch (e) {
            if (errorHook) errorHook(e as Error);
        }
    }

    async list(successHook?: (results: T[]) => any, errorHook?: (e: Error) => any) {
        try {
            // 潜在问题: batchSize 设为 1e8，以便一次性请求全部的信息
            let results = await this.client.Records.getFullList(this.collectionName, 1e8) as unknown as T[];
            if (successHook) successHook(results);
        } catch (e) {
            if (errorHook) errorHook(e as Error);
        }
    }

    async update(oldRecord: T, newRecord: T, successHook?: (results: T) => any, errorHook?: (e: Error) => any) {
        try {
            let result = await this.client.Records.update(this.collectionName, oldRecord.id, newRecord) as unknown as T;
            if (successHook) successHook(result);
        } catch (e) {
            if (errorHook) errorHook(e as Error);
        }
    }

    async delete(oldRecord: T, successHook?: (results: T) => any, errorHook?: (e: Error) => any) {
        try {
            let result = await this.client.Records.delete(this.collectionName, oldRecord.id) as unknown as T;
            if (successHook) successHook(result);
        } catch (e) {
            if (errorHook) errorHook(e as Error);
        }
    }

}

class CourseCollection extends Collection<Course> {
    noticeHandler: Collection<Notice>;

    constructor(client: PocketBase, configHandler: Collection<Notice>) {
        super(client, "course");
        this.noticeHandler = configHandler;
    }

    async create(newRecord: Course, successHook?: (result: Course) => any, errorHook?: (e: Error) => any) {
        let newSuccessHook = (result: Course) => {
            this.noticeHandler.create({
                id: "",
                type: "course",
                to: newRecord,
                groups: getGradeGroupArrayOfCourse(newRecord),
            });

            if (successHook) successHook(result);
        };
        await super.create(newRecord, newSuccessHook, errorHook);
    }

    async update(oldRecord: Course, newRecord: Course, successHook?: (result: Course) => any, errorHook?: (e: Error) => any) {
        let newSuccessHook = (result: Course) => {
            this.noticeHandler.create({
                id: "",
                type: "course",
                to: newRecord,
                from: oldRecord,
                groups: getGradeGroupArrayOfCourse([newRecord, oldRecord]),
            });

            if (successHook) successHook(result);
        };
        await super.update(oldRecord, newRecord, newSuccessHook, errorHook);
    }

    async delete(oldRecord: Course, successHook?: (result: Course) => any, errorHook?: (e: Error) => any) {
        let newSuccessHook = (result: Course) => {
            this.noticeHandler.create({
                id: "",
                type: "course",
                from: oldRecord,
                groups: getGradeGroupArrayOfCourse(oldRecord),
            });

            if (successHook) successHook(result);
        };
        await super.delete(oldRecord, newSuccessHook, errorHook);
    }
}

export class ApiHandler {
    client: PocketBase;
    config: Collection<Config>;
    notice: Collection<Notice>;
    course: Collection<Course>;

    constructor(client: PocketBase) {
        this.client = client;
        this.config = new Collection<Config>(client, "config");
        this.notice = new Collection<Notice>(client, "notice");
        this.course = new CourseCollection(client, this.notice);
    }
}

