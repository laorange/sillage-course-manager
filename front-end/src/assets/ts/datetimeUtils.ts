import dayjs from "dayjs";

export function formatDate(d: dayjs.Dayjs) {
    return d.format("YYYY-MM-DD");
}

export function formatTime(d: dayjs.Dayjs) {
    return d.format("HH:mm:ss");
}

export function formatDatetime(d: dayjs.Dayjs) {
    return d.format("YYYY-MM-DD HH:mm:ss");
}

export function getIsoWeekDay(d: dayjs.Dayjs) {
    let day = d.day();
    return day === 0 ? 7 : day;
}

export function getWeekAmountBetweenTwoDay(from: dayjs.Dayjs = dayjs(), to: dayjs.Dayjs = dayjs()) {
    return Math.floor(to.diff(from) / (60 * 60 * 24 * 7 * 1000));
}
