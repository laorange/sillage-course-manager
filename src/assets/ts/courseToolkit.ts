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

    hasSameDate(dates: string[]): CourseDecorator {
        let filter: CourseFilter = c => c.dates.filter(cd => dates.indexOf(cd) > -1).length > 0;
        return this.getNewProxyThroughFilter(filter);
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

export class CourseConflictDetector {
    /**
     * 判断"目标课程"是否与"现有课程"冲突。当两个课程有相交的日期、LessonNum 时，以下情况会产生冲突：
     * 1. 若某位老师有别的课，视为冲突
     * 2. 若某个小组有别的课，视为冲突
     * 3. 若有课程是以大组(年级)为单位，且该年级有别的课，视为冲突
     * 4. 若包含相同的教室，视为冲突
     * 如果有冲突，返回 冲突的文字描述，否则返回 空字符串
     * */

    dc: Course;
    ecs: Course[];

    constructor(detectedCourse: Course, existingCourses: Course[]) {
        this.dc = detectedCourse;
        this.ecs = this.getEcsHavingIntersectionWithDc(existingCourses);
    }

    getEcsHavingIntersectionWithDc(existingCourses: Course[]): Course[] {
        // 找到与检测课程lessonNum相等的现有课程
        return existingCourses.filter(ec => ec.lessonNum === this.dc.lessonNum)
            // 找到与检测课程有日期交集的现有课程
            .filter(ec => ec.dates.filter(ecd => this.dc.dates.indexOf(ecd) > -1).length > 0);
    }

    getConflictString(): string {
        return [this.detectTeacherConflict(), this.detectRoomConflict(), this.detectGroupConflict()].filter(c => !!c).join("、");
    }

    detectTeacherConflict(): string {
        // 有某位老师在本时段是否有别的课
        for (const ec of this.ecs) {
            let teachersOfDc = this.dc.situations.map(dcs => dcs.teacher).filter(teacher => !!teacher) as string[];
            let teachersOfEc = ec.situations.map(ecs => ecs.teacher).filter(teacher => !!teacher) as string[];
            let intersectionTeachers = teachersOfDc.filter(teacher => teachersOfEc.indexOf(teacher) > -1);
            if (intersectionTeachers.length > 0) {
                return `${intersectionTeachers.join("&")}已有一节${ec.info.name}`;
            }
        }
        return "";
    }

    detectRoomConflict(): string {
        // 有某教室在本时段是否有别的课
        for (const ec of this.ecs) {
            let roomsOfDc = this.dc.situations.map(dcSituation => dcSituation.room).filter(room => !!room) as string[];
            let roomsOfEc = ec.situations.map(ecSituation => ecSituation.room).filter(room => !!room) as string[];
            let intersectionRooms = roomsOfDc.filter(room => roomsOfEc.indexOf(room) > -1);
            if (intersectionRooms.length > 0) {
                return `${intersectionRooms.join("&")}已有一节${ec.info.name}`;
            }
        }
        return "";
    }

    detectGroupConflict(): string {
        for (const ec of this.ecs) {
            // 如果年级相同
            if (ec.grade === this.dc.grade) {
                let groupsOfEc: string[] = ec.situations.map(s => s.groups)
                    .reduce((result, item) => result.concat(item), []);
                let groupsOfDc: string[] = this.dc.situations.map(s => s.groups)
                    .reduce((result, item) => result.concat(item), []);

                // 有某个 Situation 没有设置 Group，因此“只要此处有相同年级，则视为冲突”
                if (groupsOfEc.length !== groupsOfEc.filter(g => !!g).length
                    && groupsOfDc.length !== groupsOfDc.filter(g => !!g).length) {
                    return `${ec.grade}已有一节${ec.info.name}（${ec.grade}没有所属小组）`;
                }

                // 年级有分组，则以分组若有交集，则视为冲突
                let intersectionGroups: string[] = groupsOfEc.filter(ge => groupsOfDc.indexOf(ge) > -1);
                if (intersectionGroups.length > 0) {
                    return `${intersectionGroups.sort().join("&")}已有一节${ec.info.name}`;
                }
            }
        }
        return "";
    }
}
