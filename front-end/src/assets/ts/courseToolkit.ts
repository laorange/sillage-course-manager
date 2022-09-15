import {Course, GradeGroupArray} from "./types";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {getIsoWeekDay} from "./datetimeUtils";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type CourseFilter = (c: Course) => boolean

export class CoursesHandler {
    value: Course[];

    constructor(source: Course[] | CoursesHandler) {
        if (source instanceof CoursesHandler) {
            this.value = source.value.slice();
        } else {
            this.value = source;
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

    ofGradeGroups(ggs: GradeGroupArray[]): CoursesHandler {
        const grades = Array.from(new Set(ggs.map(gg => gg[0])));
        const gradeGroupDict: { [grade: string]: string[] } = {};
        for (const gg of ggs) {
            gradeGroupDict[gg[0]] ? gradeGroupDict[gg[0]].push(gg[1]) : (gradeGroupDict[gg[0]] = [gg[1]]);
        }

        // 先通过年级过滤
        return this.ofGrades(grades).filter(course => {
            for (const situation of course.situations) {
                if (situation.groups.length === 0) {
                    // 如果某节课没有指定“班级/小组”，则按年级，则符合条件
                    return true;
                }
                // 如果该课程的某 situation.groups 与需要的 groups 有重叠，则符合条件
                else if (gradeGroupDict[course.grade].filter(groupNeeded => situation.groups.indexOf(groupNeeded) > -1).length > 0) {
                    return true;
                }
            }
            return false;
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
            for (const situation of c.situations) {
                if (situation.teacher ? teachers.indexOf(situation.teacher) > -1 : allowCourseWithoutTeacher) {
                    return true;
                }
            }
            return false;
        };
        return this.filter(filter);
    }

    ofRooms(rooms: string[], allowCourseWithoutRoom: boolean = false) {
        let filter: CourseFilter = c => {
            for (const situation of c.situations) {
                if (situation.room ? rooms.indexOf(situation.room) > -1 : allowCourseWithoutRoom) {
                    return true;
                }
            }
            return false;
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
