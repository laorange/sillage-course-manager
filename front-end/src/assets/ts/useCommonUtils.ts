export function whetherTwoArraysHaveSameElement(as: unknown[], bs: unknown[]): boolean {
    return as.filter(a => bs.indexOf(a) > -1).length > 0;
}

export function getArrayWithUniqueItem<T>(ls: T[]): T[] {
    return Array.from(new Set(ls));
}

export default function useCommonUtils() {
    return {
        whetherTwoArraysHaveSameElement,
        getArrayWithUniqueItem,
    };
}
