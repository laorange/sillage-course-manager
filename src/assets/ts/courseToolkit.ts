import {Course} from "./types";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {getIsoWeekDay} from "./datetimeUtils";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type CourseFilter = (c: Course) => boolean

export class CourseDecorator {
    value: Course[];

    constructor(source: Course[] | CourseDecorator) {
        if (source instanceof CourseDecorator) {
            this.value = source.value.slice();
        } else {
            this.value = source;
        }
    }

    getNewProxyThroughFilter(filter: CourseFilter) {
        return new CourseDecorator(this.value.filter(filter));
    }

    ofWhatDay(whatDay: number): CourseDecorator {
        const filter: CourseFilter = c => {
            if (c.dates.length === 0) {
                return false;
            }
            return getIsoWeekDay(dayjs(c.dates[0])) === whatDay;
        };
        return this.getNewProxyThroughFilter(filter);
    }

    ofLessonNum(lessonNum: number): CourseDecorator {
        const filter: CourseFilter = c => {
            return c.lessonNum === lessonNum;
        };
        return this.getNewProxyThroughFilter(filter);
    }

    ofGrade(grade: string): CourseDecorator {
        const filter: CourseFilter = c => {
            return c.grade === grade;
        };
        return this.getNewProxyThroughFilter(filter);
    }

    byDate(datePassJudge: (date: string) => boolean): CourseDecorator {
        const filter: CourseFilter = c => {
            for (const date of c.dates) {
                if (datePassJudge(date)) {
                    return true;
                }
            }
            return false;
        };
        return this.getNewProxyThroughFilter(filter);
    }

    before(someDay: dayjs.Dayjs): CourseDecorator {
        return this.byDate((date: string) => dayjs(date).isBefore(someDay, "day"));
    }

    after(someDay: dayjs.Dayjs): CourseDecorator {
        return this.byDate((date: string) => dayjs(date).isAfter(someDay, "day"));
    }

    isSameOrAfter(someDay: dayjs.Dayjs): CourseDecorator {
        return this.byDate((date: string) => dayjs(date).isSameOrAfter(someDay, "day"));
    }

    isSameOrBefore(someDay: dayjs.Dayjs): CourseDecorator {
        return this.byDate((date: string) => dayjs(date).isSameOrBefore(someDay, "day"));
    }

    isInSameWeek(someDay: dayjs.Dayjs): CourseDecorator {
        let whatDay = getIsoWeekDay(dayjs(someDay));
        return this.isSameOrAfter(someDay.add(1 - whatDay, "day"))
            .isSameOrBefore(someDay.add(7 - whatDay, "day"));
    }
}

export function isValidCourse(course: Course): boolean {
    for (const situation of course.situations) {
        if (situation?.groups.length === 0) {
            return false;
        }
    }
    return !!course.grade
        && !!course.dates.length
        && !!course.lessonNum
        && !!course.info.name
        && !!course.info.bgc
        && !!course.situations.length;
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

export function getConflictBetweenCourseAndExistingCourses(targetCourse: Course, existingCourses: Course[]): string {
    /**
     * 判断"目标课程"是否与"现有课程"冲突。以下情况会产生冲突：
     * 1. 若某位老师有别的课，视为冲突
     * 2. 若某个小组有别的课，视为冲突
     * 3. 若有课程是以大组(年级)为单位，且该年级有别的课，视为冲突
     * 4. 若包含相同的教室，视为冲突
     * 如果有冲突，返回 冲突的文字描述，否则返回 空字符串
     * */

    for (const existingCourse of existingCourses) {
        // 有某位老师在本时段是否有别的课
        let teachersOfTarget = targetCourse.situations.map(ts => ts.teacher).filter(teacher => !!teacher) as string[];
        let teachersOfExisting = existingCourse.situations.map(ts => ts.teacher).filter(teacher => !!teacher) as string[];
        let intersectionTeachers = teachersOfTarget.filter(teacher => teachersOfExisting.indexOf(teacher) > -1);
        if (intersectionTeachers.length > 0) {
            return `${intersectionTeachers.join("&")}在本时段已有一节${existingCourse.info.name}`;
        }

        // 有某教室0在本时段是否有别的课
        let roomsOfTarget = targetCourse.situations.map(ts => ts.room).filter(room => !!room) as string[];
        let roomsOfExisting = existingCourse.situations.map(ts => ts.room).filter(room => !!room) as string[];
        let intersectionRooms = roomsOfTarget.filter(room => roomsOfExisting.indexOf(room) > -1);
        if (intersectionRooms.length > 0) {
            return `${intersectionRooms.join("&")}在本时段已有一节${existingCourse.info.name}`;
        }

        // 如果年级相同
        if (existingCourse.grade === targetCourse.grade) {
            let groupsOfExisting: string[] = existingCourse.situations.map(s => s.groups)
                .reduce((result, item) => result.concat(item), []);
            let groupsOfTarget: string[] = targetCourse.situations.map(s => s.groups)
                .reduce((result, item) => result.concat(item), []);

            if (groupsOfExisting.length !== groupsOfExisting.filter(g => !!g).length
                && groupsOfTarget.length !== groupsOfTarget.filter(g => !!g).length) {
                //    有某个 Situation 没有设置 Group，因此“只要此处有相同年级，则视为冲突”
                return `${existingCourse.grade}在本时段已有一节${existingCourse.info.name}`;
            }

            // 如果分组有交集
            let intersectionGroups: string[] = groupsOfExisting.filter(ge => groupsOfTarget.indexOf(ge) > -1);
            if (intersectionGroups.length > 0) {
                return `${intersectionGroups.sort().join("&")}在本时段已有一节${existingCourse.info.name}`;
            }
        }
    }

    // "happy path :)"
    return "";
}
