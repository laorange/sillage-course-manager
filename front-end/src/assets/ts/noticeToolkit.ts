import {GradeGroupArray, Notice} from "./types";

type NoticeFilter = (n: Notice) => boolean

export class NoticeDecorator {
    value: Notice[];

    constructor(notices: Notice[]) {
        this.value = notices;
    }

    filter(filterFunc: NoticeFilter) {
        return new NoticeDecorator(this.value.filter(filterFunc));
    }

    ofGradeGroups(targetGradeGroups: GradeGroupArray[]) {
        let filterFunc: NoticeFilter = n => {
            // 如果没有年级和分组，则为全员公告。any=>true
            if (!n.groups?.length) return true;

            for (const nGradeGroup of n.groups) {
                let nGrade = nGradeGroup[0];
                let nGroup = nGradeGroup[1];
                let targetGrades: string[] = targetGradeGroups.map(gg => gg[0]);

                // 没有分组，则为全年级公告。年级相同=>true
                if (!nGroup) {
                    if (targetGrades.indexOf(nGrade) > -1) {
                        return true;
                    }
                }

                // 有分组，则需要 年级&分组 均相同，才是目标人群
                else {
                    for (const targetGG of targetGradeGroups) {
                        if (targetGG[0] === nGrade && targetGG[1] === nGroup) {
                            return true;
                        }
                    }
                }
            }

            return false;
        };

        return this.filter(filterFunc);
    }
}
