function splitWeekNeighbors(weeks: number[]) {
    return Array.from(new Set(weeks)).sort((a, b) => a - b).reduce((results: number[][], week: number): number[][] => {
        if (results.length === 0) return [[week]];

        let addFlag: boolean = false;
        for (const result of results) {
            if (result[result.length - 1] === week - 1) {
                // 某个result里最后一个元素是 week-1
                result.push(week);
                addFlag = true;
                break;
            }
        }

        if (!addFlag) results.push([week]);

        return results;
    }, []);
}

function parseWeekNeighbors(weekNeighbor: number[]): string {
    // weekNeighbor: 由相邻数字组成的数组
    if (weekNeighbor.length === 0) return "";
    else if (weekNeighbor.length === 1) return String(weekNeighbor[0]);
    else if (weekNeighbor.length === 2) return weekNeighbor.join("、");
    else return `${weekNeighbor[0]}-${weekNeighbor[weekNeighbor.length - 1]}`;
}

function getWeeksString(weeks: number[]): string {
    if (weeks.length === 0) return "";
    else if (weeks.length === 1) return `${weeks[0]}`;
    else return `${splitWeekNeighbors(weeks).map(parseWeekNeighbors).join("、")}`;
}

export default getWeeksString;
