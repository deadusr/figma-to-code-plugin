import { userColors, userStyles } from "../../code";
import { RGBAToHexA } from "../../utils/colors";
import {
    tailwindColors,
    tailwindSpacing,
    tailwindFontSize,
    tailwindFontWeight,
    tailwindBorderRadius
} from "./tailwindDefaults";

const DefaultStyleConfig = {
    spacing: tailwindSpacing,
    text: tailwindFontSize,
    weight: tailwindFontWeight,
    radius: tailwindBorderRadius,
    color: tailwindColors
}

type Key = keyof typeof DefaultStyleConfig | "border" | "rotate";

export const valueToTailwindValue = (value: number | RGB | RGBA, name: Key, prefix?: string): string => {
    let result = "";
    if (value === 0) return result;

    const valueNegitive = Number(value) < 0;

    switch (name) {
        case 'border':
        case 'rotate':
            return prefix ? `${valueNegitive ? "-" : ""}${prefix}-${Math.abs(value as number)}` : value.toString();

        case 'color':
            const baseValue: RGB = { ...(value as RGB) }
            const opacity = 'a' in (value as RGBA) ? (value as RGBA).a : 1;

            const hex = RGBAToHexA(baseValue);
            const defaultColor = DefaultStyleConfig.color.get(hex);
            const userColor = userColors.colors.get(hex);
            const userStyle = userStyles.styles.get(hex);
            const color = userColor || userStyle || defaultColor;

            const hasOpacity = opacity !== 1;
            const opacityModifier = hasOpacity ? `/${Math.round(opacity * 100)}` : '';

            // If color exists in palette: prefix-color/opacity
            // If color doesn't exist: prefix-[#hex] (where hex includes alpha if a !== 1)
            const fullHex = RGBAToHexA(value as RGBA);

            return prefix
                ? color !== undefined
                    ? `${prefix}-${color}${opacityModifier}`
                    : `${prefix}-[${fullHex}]`
                : color ? `${color}${opacityModifier}` : fullHex;

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