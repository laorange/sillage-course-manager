import {Course, GradeGroupArray} from "./types";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {getIsoWeekDay} from "./datetimeUtils";
import {getArrayWithUniqueItem, whetherTwoArraysHaveSameElement} from "./useCommonUtils";
import {RouteLocationNormalized} from "vue-router";
import {useStore} from "../../pinia/useStore";
import {UnwrapRef} from "vue";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type CourseFilter = (c: Course) => boolean

export class CoursesHandler {
    value: Course[];

    constructor(source: Course | Course[] | CoursesHandler) {
        if (source instanceof CoursesHandler) {
            this.value = source.value.slice();
        } else if (source instanceof Array) {
            this.value = source;
        } else {
            this.value = [source];
        }
    }

    filter(filter: CourseFilter) {
        return new CoursesHandler(this.value.filter(filter));
    }

    ofWhatDay(whatDay: number): CoursesHandler {
        const filter: CourseFilter = c => {
            if (c.dates.length === 0) {
                return false;
            }
            return getIsoWeekDay(dayjs(c.dates[0])) === whatDay;
        };
        return this.filter(filter);
    }

    ofLessonNum(lessonNum: number): CoursesHandler {
        const filter: CourseFilter = c => {
            return c.lessonNum === lessonNum;
        };
        return this.filter(filter);
    }

    ofGrade(grade: string): CoursesHandler {
        return this.ofGrades([grade]);
    }

    ofGrades(grades: string[]): CoursesHandler {
        const filter: CourseFilter = c => grades.indexOf(c.grade) > -1;
        return this.filter(filter);
    }

    ofGradeGroups(ggs: GradeGroupArray[], allowCourseWithoutGroup: boolean = true): CoursesHandler {
        const grades = Array.from(new Set(ggs.map(gg => gg[0])));

        // 先通过年级过滤
        return this.ofGrades(grades).filter(c => {
            let courseHandler = new CoursesHandler(c);

            // 如果某节课没有指定“班级/小组”，则按年级，则符合条件
            if (!(courseHandler.getSituItems().groups.filter(_ => !!_).length)) {
                return allowCourseWithoutGroup;
            }

            // 如果该课程的某 situation.groups 与需要的 groups 有重叠，则符合条件
            let groupsNeededForThisGrade = ggs.filter(gg => gg[0] === c.grade).map(gg => gg[1]);

            return whetherTwoArraysHaveSameElement((new CoursesHandler(c)).getSituItems().groups,
                allowCourseWithoutGroup ? groupsNeededForThisGrade.concat("") : groupsNeededForThisGrade);
        });
    }

    byDate(datePassJudge: (date: string) => boolean): CoursesHandler {
        const filter: CourseFilter = c => {
            for (const date of c.dates) {
                if (datePassJudge(date)) {
                    return true;
                }
            }
            return false;
        };
        return this.filter(filter);
    }

    before(someDay: dayjs.Dayjs): CoursesHandler {
        return this.byDate((date: string) => dayjs(date).isBefore(someDay, "day"));
    }

    after(someDay: dayjs.Dayjs): CoursesHandler {
        return this.byDate((date: string) => dayjs(date).isAfter(someDay, "day"));
    }

    isSameOrAfter(someDay: dayjs.Dayjs): CoursesHandler {
        return this.byDate((date: string) => dayjs(date).isSameOrAfter(someDay, "day"));
    }

    isSameOrBefore(someDay: dayjs.Dayjs): CoursesHandler {
        return this.byDate((date: string) => dayjs(date).isSameOrBefore(someDay, "day"));
    }

    isInSameWeek(someDay: dayjs.Dayjs): CoursesHandler {
        let whatDay = getIsoWeekDay(dayjs(someDay));
        return this.byDate((date: string) =>
            dayjs(date).isSameOrBefore(someDay.add(7 - whatDay, "day"), "day") && dayjs(date).isSameOrAfter(someDay.add(1 - whatDay, "day")));
    }

    ofDate(someDate: string): CoursesHandler {
        return this.ofDates([someDate]);
    }

    ofDates(dates: string[]): CoursesHandler {
        let filter: CourseFilter = c => c.dates.filter(cd => dates.indexOf(cd) > -1).length > 0;
        return this.filter(filter);
    }

    ofMethods(methods: string[], allowCourseWithoutMethod: boolean = false): CoursesHandler {
        const filter: CourseFilter = c => c.method ? (methods.indexOf(c.method) > -1) : allowCourseWithoutMethod;
        return this.filter(filter);
    }

    ofTeachers(teachers: string[], allowCourseWithoutTeacher: boolean = false) {
        let filter: CourseFilter = c => {
            return whetherTwoArraysHaveSameElement((new CoursesHandler(c)).getSituItems().teachers, allowCourseWithoutTeacher ? teachers.concat("") : teachers);
        };
        return this.filter(filter);
    }

    ofRooms(rooms: string[], allowCourseWithoutRoom: boolean = false) {
        let filter: CourseFilter = c => {
            return whetherTwoArraysHaveSameElement((new CoursesHandler(c)).getSituItems().rooms, allowCourseWithoutRoom ? rooms.concat("") : rooms);
        };
        return this.filter(filter);
    }

    ofCourseNames(courseNames: string[]) {
        const filter: CourseFilter = c => {
            for (const courseName of courseNames) {
                if (c.info.name.indexOf(courseName) !== -1) {
                    return true;
                }
            }
            return false;
        };
        return this.filter(filter);
    }

    getSituItems() {
        function decorate(strArray: string[] | undefined | null, course?: any) {
            if (typeof (strArray) === "undefined") {
                console.log("v0.7以前的数据:", course, strArray);
                return [];
            } else if (strArray === null || strArray.length === 0) {
                return [""];
            } else {
                return strArray;
            }
        }

        let teachers: string[] = [];
        let groups: string[] = [];
        let rooms: string[] = [];

        for (const course of this.value) {
            for (const situation of course.situations) {
                // 空数组的话，就补个空字符串（例如判断年级/分组的时候，兴许有用）
                teachers = teachers.concat(decorate(situation?.teachers, course));
                groups = groups.concat(decorate(situation?.groups, course));
                rooms = rooms.concat(decorate(situation?.rooms, course));
            }
        }

        return {
            teachers: getArrayWithUniqueItem<string>(teachers).filter(item => !!item),
            groups: getArrayWithUniqueItem<string>(groups).filter(item => !!item),
            rooms: getArrayWithUniqueItem<string>(rooms).filter(item => !!item),
        };
    }

    hasConflictTeachers(dates: string[], lessonNum: number, teachers: string[]): boolean {
        if (!teachers.length) return false;  // 没有需求，那就没有冲突
        return !!this.ofDates(dates).ofLessonNum(lessonNum).ofTeachers(teachers, false).value.length;
    }

    hasConflictGradeGroups(dates: string[], lessonNum: number, gradeGroupArrays: GradeGroupArray[]): boolean {
        if (!gradeGroupArrays.length) return false;  // 没有需求，那就没有冲突
        // allowCourseWithoutGroup: false，否则若有一节未指定小组的课程将导致所有小组被禁用
        return !!this.ofDates(dates).ofLessonNum(lessonNum).ofGradeGroups(gradeGroupArrays, false).value.length;
    }

    hasConflictRooms(dates: string[], lessonNum: number, rooms: string[]) {
        if (!rooms.length) return false;  // 没有需求，那就没有冲突
        return !!this.ofDates(dates).ofLessonNum(lessonNum).ofRooms(rooms, false).value.length;
    }

    hasConflictCourse(dates: string[], lessonNum: number, queryCourse: Course) {
        let situItems = new CoursesHandler(queryCourse).getSituItems();
        return this.hasConflictRooms(dates, lessonNum, situItems.rooms)
            || this.hasConflictTeachers(dates, lessonNum, situItems.teachers)
            || this.hasConflictGradeGroups(dates, lessonNum, situItems.groups.map(g => [queryCourse.grade, g]));
    }
}

export function isValidCourse(course: Course): boolean {
    return !!course.grade
        && !!course.dates.length
        && !!course.lessonNum
        && !!course.info.name
        && course.info.name !== `请输入课程名称`
        && !!course.info.bgc;
}

export function getEmptyCourse(): Course {
    return {
        "id": "",
        "grade": "",
        "dates": [],
        "lessonNum": 1,
        "note": "",
        "info": {
            "name": "请输入课程名称",
            "code": "",
            "bgc": "#FFFFFF",
        },
        "method": null,
        "situations": [],
    };
}

export function parseCourseRoute(route: RouteLocationNormalized | UnwrapRef<RouteLocationNormalized>) {
    const grades = (route.query.grade instanceof Array ? route.query.grade : [route.query.grade]).filter(_ => !!_).sort() as unknown as string[];
    const gradeGroups = (route.query.group instanceof Array ? route.query.group : [route.query.group]).filter(_ => !!_).map(_ => JSON.parse(_ as string)).sort() as GradeGroupArray[];
    const rooms = (route.query.room instanceof Array ? route.query.room : [route.query.room]).filter(_ => !!_).sort() as unknown as string[];
    const methods = (route.query.method instanceof Array ? route.query.method : [route.query.method]).filter(_ => !!_).sort() as unknown as string[];
    const teachers = (route.query.teacher instanceof Array ? route.query.teacher : [route.query.teacher]).filter(_ => !!_).sort() as unknown as string[];
    const courseNames = (route.query.subject instanceof Array ? route.query.subject : [route.query.subject]).filter(_ => !!_).sort() as unknown as string[];

    const store = useStore();
    const title = grades
        .concat(gradeGroups.map(gg => `${store.translate(gg[0])}:${store.translate(gg[1])}`))
        .concat(teachers).concat(methods).concat(rooms)
        .concat(courseNames)
        .map((s: string) => store.translate(s)).filter(_ => !!_).join(` `);

    return {grades, gradeGroups, rooms, methods, teachers, courseNames, title: title ? title : store.translate("全部课程")};
}
