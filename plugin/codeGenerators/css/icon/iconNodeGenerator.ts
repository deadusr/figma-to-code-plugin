import { RGBAToHexA } from "../../../utils/colors";
import { ColorInfo } from "../../tags/index";

const generateStylesFromIcon = async (node: FrameNode) => {
    const classes: string[] = []

    const [, colorVariables] = await getColors(node);

    if (colorVariables.length === 1) {
        const iconColor = `text-${colorVariables[0].name}`
        classes.push(iconColor);
    }

    const parentFlex = node.parent && 'layoutMode' in node.parent && node.parent.layoutMode !== "NONE";

    const className = classes.filter(el => el.trim().length !== 0).join(' ');

    const width = node.layoutSizingHorizontal === "FILL" ? "w-full" : node.layoutSizingHorizontal === "HUG" ? "w-fit" : `w-[${node.width}px]`;
    classes.push(width);

    const height = node.layoutSizingVertical === "FILL" ? parentFlex ? "self-stretch" : "h-full" : node.layoutSizingVertical === "HUG" ? "h-fit" : `h-[${node.height}px]`;
    classes.push(height);


    return {
        className,
        assets: {
            colors: colorVariables
        }
    }
}


const getColors = async (node: FrameNode) => {
    const colorVariables: ColorInfo[] = [];
    const colors: string[] = [];

    const fills = node.fills === figma.mixed ? [] : node.fills;

    const promises = fills.map(async fill => {
        if (fill.type !== "SOLID")
            return;

        if (fill.boundVariables !== undefined && fill.boundVariables.color !== undefined) {
            const color = await figma.variables.getVariableByIdAsync(fill.boundVariables.color.id);
            if (color !== null && color.resolvedType === "COLOR") {
                const value = color.resolveForConsumer(node as SceneNode).value as RGB | RGBA;
                const hex = RGBAToHexA(value);
                colorVariables.push({ name: color.name, value: hex });

                return;
            }
        }

        const hex = RGBAToHexA({ ...fill.color, a: fill.opacity ?? 1 });
        colors.push(hex);
        return;
    })


    await Promise.all(promises);

    return [colors, colorVariables] as const;
}


export default generateStylesFromIcon;