import {Course} from "./types";
import dayjs from "dayjs";
import {getIsoWeekDay} from "./datetimeUtils";

export class CourseFilter {
    value: Course[];

    constructor(source: Course[] | CourseFilter) {
        if (source instanceof CourseFilter) {
            this.value = source.value.slice();
        } else {
            this.value = source;
        }
    }

    filterByWhatDay(whatDay: number): CourseFilter {
        const filter = (c: Course): boolean => {
            if (c.dates.length === 0) {
                return false;
            }
            return getIsoWeekDay(dayjs(c.dates[0])) === whatDay;
        };
        return new CourseFilter(this.value.filter(filter));
    }

    filterByLessonNum(lessonNum: number): CourseFilter {
        const filter = (c: Course): boolean => {
            return c.lessonNum === lessonNum;
        };
        return new CourseFilter(this.value.filter(filter));
    }

    filterByGrade(grade: string): CourseFilter {
        const filter = (c: Course): boolean => {
            return c.grade === grade;
        };
        return new CourseFilter(this.value.filter(filter));
    }
}
