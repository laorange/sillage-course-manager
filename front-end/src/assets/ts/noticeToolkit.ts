import {GradeGroupArray, Notice} from "./types";
import dayjs from "dayjs";
import getTodayX from "./getToday";

type NoticeFilter = (n: Notice) => boolean

export class NoticesHandler {
    value: Notice[];

    constructor(notices: Notice[]) {
        this.value = notices;
    }

    filter(filterFunc: NoticeFilter) {
        return new NoticesHandler(this.value.filter(filterFunc));
    }

    hasTextContent() {
        const filterFunc: NoticeFilter = n => !!n.content;
        return this.filter(filterFunc);
    }

    inThePastFewDays(dayNum: number) {
        const filterFunc: NoticeFilter = n => {
            return dayjs(n.updated).isAfter(getTodayX().add(-dayNum, "day"), "minute");
        };
        return this.filter(filterFunc);
    }

    ofGradeGroups(targetGradeGroups: GradeGroupArray[]) {
        let filterFunc: NoticeFilter = n => {
            let targetGrades: string[] = targetGradeGroups.map(gg => gg[0]);

            // 如果没有年级和分组，则为全员公告。any=>true
            if (!n.groups?.length) return true;

            for (const nGradeGroup of n.groups) {
                let nGrade = nGradeGroup[0];
                let nGroup = nGradeGroup[1];

                // 没有分组，则为全年级公告。年级相同=>true
                if (!nGroup) {
                    if (targetGrades.indexOf(nGrade) > -1) {
                        return true;
                    }
                }

                // 有分组，则需要 年级&分组 均相同，才是目标人群
                else {
                    for (const targetGG of targetGradeGroups) {
                        // 如果年级相同
                        if (targetGG[0] === nGrade) {
                            // 需求中没有分组，或需求的分组与某个公告的分组相同，=>true
                            if (!targetGG[1] || targetGG[1] === nGroup) {
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        };

        return this.filter(filterFunc);
    }
}
