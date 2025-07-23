import { RGBAToHexA } from "../../utils/colors";

const DefaultStyleConfig = {
    spacing: new Map([
        [4, 1],
        [8, 2],
        [12, 3],
        [16, 4],
        [20, 5],
        [24, 6],
        [28, 7],
        [32, 8],
        [36, 9],
        [40, 10],
        [44, 11],
        [48, 12],
        [56, 14],
        [64, 16],
        [80, 20],
        [96, 24],
        [112, 28],
        [128, 32],
        [144, 36],
        [160, 40],
        [176, 44],
        [192, 48],
        [208, 52],
        [224, 56],
        [240, 60],
        [256, 64],
        [288, 72],
        [320, 80],
        [384, 96]
    ]),

    text: new Map([
        [12, 'xs'],
        [14, 'sm'],
        [16, "base"],
        [18, "lg"],
        [20, "xl"],
        [24, "2xl"],
        [30, "3xl"],
        [36, "4xl"],
        [48, "5xl"],
        [72, "7xl"],
        [96, "8xl"],
        [128, "9xl"],
    ]),

    weight: new Map([
        [100, 'thin'],
        [200, 'extralight'],
        [300, 'light'],
        [400, 'normal'],
        [500, 'medium'],
        [600, 'semibold'],
        [700, 'bold'],
        [800, 'extrabold'],
        [900, 'black'],
    ]),


    radius: new Map([
        [2, "xs"],
        [4, "sm"],
        [6, "md"],
        [8, "lg"],
        [12, "xl"],
        [16, "2xl"],
        [24, "3xl"],
        [32, "4xl"],
    ]),
    color: new Map([
        ["#fef2f2", "red-50"],
        ["#fee2e2", "red-100"],
        ["#fecaca", "red-200"],
        ["#fca5a5", "red-300"],
        ["#f87171", "red-400"],
        ["#ef4444", "red-500"],
        ["#dc2626", "red-600"],
        ["#b91c1c", "red-700"],
        ["#991b1b", "red-800"],
        ["#7f1d1d", "red-900"],
        ["#450a0a", "red-950"],

        ["#fff7ed", "orange-50"],
        ["#ffedd5", "orange-100"],
    ])
}

type Key = keyof typeof DefaultStyleConfig | "border" | "rotate";

export const valueToTailwindValue = (value: number | RGB, name: Key, prefix?: string): string => {
    let result = "";
    if (value === 0) return result;

    const valueNegitive = Number(value) < 0;

    switch (name) {
        case 'border':
        case 'rotate':
            return prefix ? `${valueNegitive ? "-" : ""}${prefix}-${Math.abs(value as number)}` : value.toString();

        case 'color':
            const hex = RGBAToHexA(value as RGB);
            const color = DefaultStyleConfig.color.get(hex);
            return prefix
                ? color !== undefined
                    ? `${prefix}-${color}`
                    : `${prefix}-[${hex}]`
                : color || hex;

        case 'radius':
        case 'spacing':
        case 'text':
        case 'weight':
            const data = DefaultStyleConfig[name];
            const number = Math.abs(value as number);
            const hasValue = data.has(number);
            return prefix
                ? hasValue
                    ? `${valueNegitive ? "-" : ""}${prefix}-${data.get(number)}`
                    : `${prefix}-[${value}px]`
                : hasValue
                    ? `${valueNegitive ? "-" : ""}${data.get(number)}` as string
                    : value.toString();
    }
}



export default DefaultStyleConfig;