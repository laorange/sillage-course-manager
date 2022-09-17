import {useStore} from "../../../pinia/useStore";
import {MenuItem} from "@imengyu/vue3-context-menu";
import {useDialog, useMessage} from "naive-ui";
import dayjs from "dayjs";
import {Course} from "../types";
import {formatDate, getIsoWeekDay} from "../datetimeUtils";
import {getEmptyCourse} from "../courseToolkit";

export default function useEmptyCourseCard() {
    const store = useStore();
    const message = useMessage();
    const dialog = useDialog();

    function getContextMenuItems(grades: string[], lessonNum: number, queryDate: string, isDateMode: boolean) {
        const queryWhatDay = getIsoWeekDay(dayjs(queryDate));
        const queryWhatDayStr = store.getWhatDayStr(queryWhatDay);


        const handlers = {
            // ensureNoConflict(course: Course) {
            //     // 如有冲突，阻止 并弹出警告
            //     if (store.hasConflictOfCourse(course)) {
            //         message.error("检测到操作中的课程与已有课程冲突！");
            //         throw Error(`冲突: ${course}`);
            //     }
            //     return course;
            // },
            notDateMode: {
                getNewCourse(grade: string): Course {
                    return {
                        ...store.editor.courseEditing,
                        lessonNum: lessonNum,
                        grade: grade,
                        dates: store.editor.fromDates.map((d: string) => {
                            const preDate = dayjs(d);
                            return formatDate(preDate.add(queryWhatDay - getIsoWeekDay(preDate), "day"));
                        }),
                    };
                },
                cut(grade: string) {
                    let newCourse = handlers.notDateMode.getNewCourse(grade);

                    const onPositiveClick = async () => {
                        // 星期模式，在一个星期内平移
                        let restDates = store.editor.courseEditing.dates.filter(d => store.editor.fromDates.indexOf(d) === -1);
                        // 全部剪切
                        if (restDates.length === 0) {
                            await store.api.course.update(store.editor.courseEditing, newCourse, () => {
                                // 用新的课程信息替换原来的
                                store.courses = store.courses.filter(c => c.id !== store.editor.courseEditing.id).concat(newCourse);
                                store.editor.show = false;
                                store.editor.mode = "none";
                                message.success(`剪切成功`);
                            }, () => message.error("提交失败，请检查网络连接"));
                        }
                        //  部分剪切
                        else {
                            // 用新的课程信息替换原来的
                            let courseUpdate = {...store.editor.courseEditing, dates: restDates};
                            await store.api.course.update(store.editor.courseEditing, courseUpdate, async () => {
                                store.courses = store.courses.filter(c => c.id !== store.editor.courseEditing.id).concat(courseUpdate);
                                // 创建新的
                                await store.api.course.create(newCourse, () => {
                                    store.courses.push(newCourse);

                                    store.editor.show = false;
                                    store.editor.mode = "none";
                                    message.success(`剪切成功`);
                                }, (e) => {
                                    throw e;
                                });
                            }, () => message.error("提交失败，请检查网络连接"));
                        }
                    };

                    store.localConfig.thinkTwice ? dialog.info({
                        title: "提示",
                        content: `${store.editorFromWhatDayStr}第${store.editor.courseEditing.lessonNum}节 ${store.editor.courseEditing.grade}的${store.editor.courseEditing.info.name} 将会被剪切到 ${grade}的 ${queryWhatDayStr} 第${store.editor.lessonNum}节课，是否继续？`,
                        positiveText: "确定",
                        negativeText: "取消",
                        onPositiveClick,
                    }) : onPositiveClick();
                },
                copy(grade: string) {
                    let newCourse = handlers.notDateMode.getNewCourse(grade);

                    const onPositiveClick = async () => {
                        // store.editor.mode = "none";  // 是否清空复制状态 > 否
                        await store.api.course.create(newCourse, (record) => {
                            store.courses.push(record as unknown as Course);
                            store.editor.show = false;
                            message.success(`复制成功`);
                        }, () => message.error("提交失败，请检查网络连接"));
                    };

                    store.localConfig.thinkTwice ? dialog.info({
                        title: "提示",
                        content: `${store.editorFromWhatDayStr}第${store.editor.courseEditing.lessonNum}节 ${store.editor.courseEditing.grade}的${store.editor.courseEditing.info.name} 将会被复制到 ${grade}的 ${queryWhatDayStr} 第${store.editor.lessonNum}节课，是否继续？`,
                        positiveText: "确定",
                        negativeText: "取消",
                        onPositiveClick,
                    }) : onPositiveClick();
                },
            },
            // 日期模式
            isDateMode: {
                cutSuccess() {
                    store.editor.show = false;
                    store.editor.mode = "none";
                    message.success(`剪切成功`);
                },
                cutFail(e: Error) {
                    message.error("提交失败，请检查网络连接");
                    console.error(e);
                },
                getNewCourse(grade: string): Course {
                    return {
                        ...store.editor.courseEditing,
                        lessonNum: lessonNum,
                        grade: grade,
                        dates: [queryDate],
                    };
                },
                cut(grade: string) {
                    let newCourse = handlers.isDateMode.getNewCourse(grade);

                    const onPositiveClick = async () => {
                        let restDates = store.editor.courseEditing.dates.filter(d => store.editor.fromDates.indexOf(d) === -1);

                        if (restDates.length) {

                            // 日期模式 ①如果原课程有很多周，那就删除选中的那一周，再新增指定日期的课
                            let updateTo: Course = {...store.editor.courseEditing, dates: restDates};
                            await store.api.course.update(store.editor.courseEditing, updateTo,
                                async () => {
                                    await store.api.course.create(newCourse,
                                        (newCourse) => {
                                            // 用新的课程信息替换原来的
                                            store.courses = store.courses.filter(c => c.id !== store.editor.courseEditing.id).concat([updateTo, newCourse]);
                                        },
                                        (e) => {
                                            throw e;
                                        });
                                    handlers.isDateMode.cutSuccess();
                                },
                                () => handlers.isDateMode.cutFail);
                        } else {

                            // ② 如果原课程只有一周，那就直接改日期
                            await store.api.course.update(store.editor.courseEditing, newCourse,
                                () => {
                                    // 用新的课程信息替换原来的
                                    store.courses = store.courses.filter(c => c.id !== store.editor.courseEditing.id).concat([newCourse]);
                                    handlers.isDateMode.cutSuccess();
                                },
                                () => handlers.isDateMode.cutFail);
                        }

                    };

                    store.localConfig.thinkTwice ? dialog.info({
                        title: "提示",
                        content: `${store.editor.fromDates.join("、")} 第${store.editor.courseEditing.lessonNum}节 ${store.editor.courseEditing.grade}的${store.editor.courseEditing.info.name} 将会被剪切到${grade}的${queryWhatDayStr}第${store.editor.lessonNum}节课，是否继续？`,
                        positiveText: "确定",
                        negativeText: "取消",
                        onPositiveClick,
                    }) : onPositiveClick();
                },
                copy(grade: string) {
                    let newCourse = handlers.isDateMode.getNewCourse(grade);

                    const onPositiveClick = async () => {
                        await store.api.course.create(newCourse,
                            (newCourse) => {
                                store.courses.push(newCourse);
                                store.editor.show = false;
                                message.success(`复制成功`);
                            },
                            (e) => {
                                message.error("提交失败，请检查网络连接");
                                console.error(e);
                            });
                    };

                    store.localConfig.thinkTwice ? dialog.info({
                        title: "提示",
                        content: `${store.editor.fromDates}第${store.editor.courseEditing.lessonNum}节 ${store.editor.courseEditing.grade}的${store.editor.courseEditing.info.name} 将会被复制到${grade}的${queryDate}第${store.editor.lessonNum}节课，是否继续？`,
                        positiveText: "确定",
                        negativeText: "取消",
                        onPositiveClick,
                    }) : onPositiveClick();
                },
            },
        };


        let items: MenuItem[] = [];
        (grades.length ? grades : store.grades).map(grade => items.push({
            label: `为${grade}新增课程`,
            onClick: () => {
                store.editor.mode = "add";
                store.editor.show = true;
                store.editor.fromDates = [queryDate];
                store.editor.courseAdding = {
                    ...getEmptyCourse(),
                    lessonNum: lessonNum,
                    grade: grade,
                    dates: isDateMode ? [queryDate] : [],
                };
            },
        }));
        (grades.length ? grades : store.grades).map(grade => {
            let hasConflict: boolean = store.hasConflictOfCourse(
                isDateMode ? handlers.isDateMode.getNewCourse(grade) : handlers.notDateMode.getNewCourse(grade),
            );

            items.push({
                label: `粘贴到${grade}${hasConflict?'(与现有课程冲突)':''}`,
                disabled: !(store.editor.mode === "cut" || store.editor.mode === "copy") || hasConflict,
                onClick: () => {
                    if (isDateMode && store.editor.mode === "cut") handlers.isDateMode.cut(grade);
                    else if (isDateMode && store.editor.mode === "copy") handlers.isDateMode.copy(grade);
                    else if (!isDateMode && store.editor.mode === "cut") handlers.notDateMode.cut(grade);
                    else if (!isDateMode && store.editor.mode === "copy") handlers.notDateMode.copy(grade);
                },
            });
        });
        return items;
    }

    return {getContextMenuItems};
}
