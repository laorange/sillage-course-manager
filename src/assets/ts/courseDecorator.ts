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
