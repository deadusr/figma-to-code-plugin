import { concat } from "lodash"
import { ColorInfo } from "../../tags/index"
import { getColorsFromFills } from "../../../utils/colors"
import { valueToTailwindValue } from "../defaultConfig"

const UNTIS = {
    "PIXELS": "px",
    "PERCENT": "%"
}

const TEXT_TRANSFORM = {
    "UPPER": "uppercase",
    "LOWER": "lowercase",
    "TITLE": "capitalize",
    "ORIGINAL": "normal-case",
    "SMALL_CAPS": "",
    "SMALL_CAPS_FORCED": "",
}

const TEXT_DECORATION = {
    "UNDERLINE": "underline",
    "STRIKETHROUGH": "line-through",
    "NONE": ""
}

const TEXT_DECORATION_STYLE = {
    "SOLID": "decoration-solid",
    "WAVY": "decoration-wavy",
    "DOTTED": "decoration-dotted"
}


type TextSegmentProps = {
    characters: string
    start: number
    end: number
    fontSize: number
    fontName: FontName
    fontWeight: number
    textDecoration: TextDecoration
    textDecorationStyle: TextDecorationStyle | null
    textDecorationOffset: TextDecorationOffset | null
    textDecorationThickness: TextDecorationThickness | null
    textDecorationColor: TextDecorationColor | null
    textDecorationSkipInk: boolean | null
    textCase: TextCase
    lineHeight: LineHeight
    letterSpacing: LetterSpacing
    fills: Paint[]
    textStyleId: string
    fillStyleId: string
    listOptions: TextListOptions
    listSpacing: number
    indentation: number
    paragraphIndent: number
    paragraphSpacing: number
    hyperlink: HyperlinkTarget | null
    openTypeFeatures: {
        readonly [feature in OpenTypeFeature]: boolean
    }
    boundVariables?: {
        [field in VariableBindableTextField]?: VariableAlias
    }
    textStyleOverrides: TextStyleOverrideType[]
}



const generateStylesFromTextSegment = async (segment: TextSegmentProps, parent: TextNode) => {
    const [, colorVariables] = await getColorsFromFills(segment.fills, parent as SceneNode, segment.fillStyleId);

    const fontName = `font-[${segment.fontName.family}] `;
    const fontStyle = segment.fontName.style.toLowerCase() !== "italic" ? "" : `italic `;
    const fontSize = valueToTailwindValue(segment.fontSize, 'text', 'text') + ' ';
    const fontWeight = valueToTailwindValue(segment.fontWeight, 'weight', 'font') + ' ';
    const letterSpacing = `tracking-[${segment.letterSpacing.value}_${UNTIS[segment.letterSpacing.unit]}] `
    const lineHeight = segment.lineHeight.unit === "AUTO" ? "" : `leading-[${segment.lineHeight.value}_${UNTIS[segment.lineHeight.unit]}] `

    const textCase = `${TEXT_TRANSFORM[segment.textCase]} `;
    const textDecoration = `${TEXT_DECORATION[segment.textDecoration]} `;

    const textDecorationColor = segment.textDecorationColor === null || segment.textDecorationColor.value === "AUTO" ? "" : `${segment.textDecorationColor.value} ` // TODO bound variables for textDecorationColor
    const textDecorationStyle = segment.textDecorationStyle === null ? "" : `${TEXT_DECORATION_STYLE[segment.textDecorationStyle]} `
    const textDecorationThickness = segment.textDecorationThickness === null || segment.textDecorationThickness.unit === "AUTO" ? "" : `decoration-[${segment.textDecorationThickness.value}_${UNTIS[segment.textDecorationThickness.unit]}] `;

    // Build font color: use valueToTailwindValue for solid fills (matches Tailwind palette),
    // fall back to variable names for bound variables / styles
    const fontColorParts: string[] = colorVariables.map(variable => `text-${variable.name}`);
    const solidFills = (segment.fills as Paint[]).filter(f => f.type === "SOLID");
    if (fontColorParts.length === 0 && solidFills.length > 0) {
        const fill = solidFills[0];
        const color = valueToTailwindValue({ ...fill.color, a: fill.opacity ?? 1 } as RGBA, 'color', 'text');
        fontColorParts.push(color);
    }
    const fontColor = fontColorParts.join(' ') + ' ';


    let className = `${fontName}${fontStyle}${fontSize}${fontWeight}${letterSpacing}${lineHeight}${textCase}${textDecoration}${textDecorationColor}${textDecorationStyle}${textDecorationThickness}${fontColor}`;
    return {
        className,
        assets: {
            colors: colorVariables
        }
    };
}


export default generateStylesFromTextSegment;