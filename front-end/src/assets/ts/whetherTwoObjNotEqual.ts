// 参考：https://blog.csdn.net/qq_25742631/article/details/105581625

// 判断数据类型
function getDataType(data: any): string {
    const temp = Object.prototype.toString.call(data);
    const type = temp.match(/\b\w+\b/g);
    return type ? (type.length < 2) ? "Undefined" : type[1] : "Undefined";
}

// 判断两个对象的属性是否相同
export function whetherTwoObjNotEqual(source: any, comparison: any): boolean {
    const iterable = (data: any) => ["Object", "Array"].includes(getDataType(data));
    if (!iterable(source)) {
        throw new Error(`source should be a Object or Array , but got ${getDataType(source)}`);
    }

    if (getDataType(source) !== getDataType(comparison)) {
        return true;
    }

    const sourceKeys = Object.keys(source);

    const comparisonKeys = Object.keys({...source, ...comparison});

    if (sourceKeys.length !== comparisonKeys.length) {
        return true;
    }

    return comparisonKeys.some(key => {
        if (iterable(source[key])) {
            return whetherTwoObjNotEqual(source[key], comparison[key]);
        } else {
            return source[key] !== comparison[key];
        }
    });
}
