export function parseHex(hex: string): number {
    return parseInt("0x" + hex);
}

export function parseHexColor(hexColor: string): number[] {
    return [hexColor.slice(1, 3), hexColor.slice(3, 5), hexColor.slice(5, 7), hexColor.slice(7, 9)].map(c => parseHex(c));
}

export function parseFontColor(hexColor: string): "black" | "white" {
    const parseResults = parseHexColor(hexColor);
    const red = parseResults[0];
    const green = parseResults[1];
    const blue = parseResults[2];
    const opacity = parseResults[3];

    if (opacity < 128) {
        return "black";
    }

    const gray = (red * 299 + green * 587 + blue * 114) / 1000;
    return gray < 80 ? "white" : "black";
}
