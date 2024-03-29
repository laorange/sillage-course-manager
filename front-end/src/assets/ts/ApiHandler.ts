import PocketBase from "pocketbase";
import {Config, Course, Notice, PocketBaseModel, RawPocketBaseData} from "./types";
import axios, {AxiosPromise} from "axios";
import dayjs from "dayjs";
import {CoursesHandler} from "./courseToolkit";
import {useStore} from "../../pinia/useStore";


class Collection<T extends PocketBaseModel> {
    client: PocketBase;
    collectionName: string;
    maxPerPage: number;

    constructor(client: PocketBase, collectionName: string, maxPerPage: number = 200) {
        this.client = client;
        this.collectionName = collectionName;
        this.maxPerPage = maxPerPage;
    }

    public async create(newRecord: T, successHook?: (results: T) => any, errorHook?: (e: Error) => any) {
        const exeFunc = async () => {
            try {
                let result = await this.client.records.create(this.collectionName, {...newRecord, id: ""}) as unknown as T;
                if (successHook) successHook(result);
            } catch (e) {
                if (errorHook) errorHook(e as Error);
            }
        };

        const store = useStore();
        await store.withLoading(exeFunc());
    }

    async list(successHook?: (results: T[]) => any, errorHook?: (e: Error) => any) {
        const exeFunc = async () =>  {
            try {
                let results = await this.client.records.getFullList(this.collectionName, this.maxPerPage, {sort: "-updated"}) as unknown as T[];
                if (successHook) successHook(results);
            } catch (e) {
                if (errorHook) errorHook(e as Error);
            }
        }

        const store = useStore();
        await store.withLoading(exeFunc());
    }

    async update(oldRecord: T, newRecord: T, successHook?: (results: T) => any, errorHook?: (e: Error) => any) {
        const exeFunc = async () => {
            try {
                let result = await this.client.records.update(this.collectionName, oldRecord.id, newRecord) as unknown as T;
                if (successHook) successHook(result);
            } catch (e) {
                if (errorHook) errorHook(e as Error);
            }
        }

        const store = useStore();
        await store.withLoading(exeFunc());
    }

    async delete(oldRecord: T, successHook?: (results: T) => any, errorHook?: (e: Error) => any) {
        const exeFunc = async () => {
            try {
                let result = await this.client.records.delete(this.collectionName, oldRecord.id) as unknown as T;
                if (successHook) successHook(result);
            } catch (e) {
                if (errorHook) errorHook(e as Error);
            }
        }

        const store = useStore();
        await store.withLoading(exeFunc());
    }

}

class CourseCollection extends Collection<Course> {
    noticeHandler: Collection<Notice>;

    constructor(client: PocketBase, noticeHandler: Collection<Notice>) {
        super(client, "course");
        this.noticeHandler = noticeHandler;
    }

    getCleanData(rawData: Course): Course {
        for (const situation of rawData.situations) {
            situation.groups.sort((a: string, b: string) => a > b ? 1 : -1);
        }

        return {
            ...rawData,
            situations: rawData.situations.filter(s => s.groups.length || s.rooms.length || s.teachers.length),  // 过滤无效的教学计划
            dates: rawData.dates.slice().sort((a, b) => {
                return dayjs(a).isAfter(dayjs(b), "day") ? 1 : -1;
            }),
        };
    }

    async list(successHook?: (results: Course[]) => any, errorHook?: (e: Error) => any, pioneer?: RawPocketBaseData<Course>) {
        const exeFunc = async () => {
            try {
                pioneer = pioneer ?? (await axios(this.client.baseUrl + "/api/collections/course/records", {
                    params: {
                        page: 1,
                        perPage: 1,
                        sort: "-updated",
                    },
                })).data as RawPocketBaseData<Course>;

                let courses: Course[] = [];

                let promises: AxiosPromise<RawPocketBaseData<Course>>[] = [];
                for (let page = 1; page <= Math.ceil(pioneer.totalItems / this.maxPerPage); page++) {
                    promises.push(axios(this.client.baseUrl + "/api/collections/course/records", {
                        params: {
                            page,
                            perPage: this.maxPerPage,
                            sort: "-updated",
                        },
                    }));
                }
                let results = await Promise.all(promises);
                for (const result of results) {
                    courses = courses.concat(result.data.items);
                }

                if (successHook) successHook(courses);
            } catch (e) {
                if (errorHook) errorHook(e as Error);
            }
        }

        const store = useStore();
        await store.withLoading(exeFunc());
    }

    async create(newRecord: Course, successHook?: (result: Course) => any, errorHook?: (e: Error) => any) {
        newRecord = this.getCleanData(newRecord);

        let newSuccessHook = (result: Course) => {
            this.noticeHandler.create({
                id: "",
                type: "course",
                to: newRecord,
                groups: (new CoursesHandler(newRecord)).getGradeGroupArray(),
            });

            if (successHook) successHook(result);
        };
        await super.create(newRecord, newSuccessHook, errorHook);
    }

    async update(oldRecord: Course, newRecord: Course, successHook?: (result: Course) => any, errorHook?: (e: Error) => any) {
        newRecord = this.getCleanData(newRecord);

        let newSuccessHook = (result: Course) => {
            this.noticeHandler.create({
                id: "",
                type: "course",
                to: newRecord,
                from: oldRecord,
                groups: (new CoursesHandler([newRecord, oldRecord])).getGradeGroupArray(),
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
                groups: (new CoursesHandler(oldRecord)).getGradeGroupArray(),
            });

            if (successHook) successHook(result);
        };
        await super.delete(oldRecord, newSuccessHook, errorHook);
    }
}

class NoticeCollection extends Collection<Notice> {
    constructor(client: PocketBase, maxPerPage?: number) {
        super(client, "notice", maxPerPage);
    }

    async list(successHook?: (results: Notice[]) => any, errorHook?: (e: Error) => any) {
        const exeFunc = async () => {
            try {
                // 最多只请求{{ maxPerPage }}条公告(一页)
                let results: Notice[] = (await axios(this.client.baseUrl + "/api/collections/notice/records", {
                    params: {
                        page: 1,
                        perPage: this.maxPerPage,
                        sort: "-content,-updated",
                    },
                })).data.items;
                if (successHook) successHook(results);

            } catch (e) {
                if (errorHook) errorHook(e as Error);
            }
        }

        const store = useStore();
        await store.withLoading(exeFunc());
    }
}

export class ApiHandler {
    client: PocketBase;
    config: Collection<Config>;
    notice: NoticeCollection;
    course: CourseCollection;

    constructor(client: PocketBase) {
        this.client = client;
        this.config = new Collection<Config>(client, "config", 1);
        this.notice = new NoticeCollection(client, 200);
        this.course = new CourseCollection(client, this.notice);
    }
}

