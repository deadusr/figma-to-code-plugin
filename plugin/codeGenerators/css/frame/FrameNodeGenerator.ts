import { RGBAToHexA } from "../../../utils/colors";
import { ColorInfo } from "../../tags/index";
import { valueToTailwindValue } from "../defaultConfig";

import getBackgrounds from "../common/index";


const JUSTIFY_CLASSES = {
    "MIN": "justify-start",
    "MAX": "justify-end",
    "CENTER": "justify-center",
    "SPACE_BETWEEN": "justify-between"
}



const ALIGN_CLASSES = {
    "MIN": "items-start",
    "MAX": "items-end",
    "CENTER": "items-center",
    "BASELINE": "items-baseline"
}

const ALIGN_CONTENT = {
    "SPACE_BETWEEN": "content-between",
    "AUTO": "",
}


type ReturnType = {
    className: string;
    assets: {
        colors: ColorInfo[];
        styles: string
    };
}

const generateStylesFromFrame = async (node: FrameNode | ComponentNode | InstanceNode): Promise<ReturnType> => {
    const [, colorVariables] = await getColors(node);
    const classes: string[] = []
    const styles: string[] = [];

    const parentFlex = node.parent && 'layoutMode' in node.parent && node.parent.layoutMode !== "NONE";
    const absolutePos = node.layoutPositioning === "ABSOLUTE";

    const absouluteChild = node.children.find(el => 'layoutPositioning' in el && el.layoutPositioning === "ABSOLUTE") !== undefined;

    const rotation = Math.round(-node.rotation);
    const transform = rotation !== 0 ? valueToTailwindValue(rotation, "rotate", "rotate") : "";

    classes.push(transform);

    if (absouluteChild && !absolutePos) {
        const position = 'relative';
        classes.push(position);
    }



    if (absolutePos) {
        const position = "absolute";
        classes.push(position);

        const useRight = node.constraints.horizontal === "MAX";
        const useBottom = node.constraints.vertical === "MAX";

        const leftPos = node.relativeTransform[0][2];
        const topPos = node.relativeTransform[1][2];

        const mxAuto = node.parent && 'width' in node.parent && (node.parent.width / 2 - leftPos) > 1; // one pixel difference 
        if (mxAuto) {
            classes.push('left-0 right-0 mx-auto');
        } else {
            if (useRight) {
                const parentWith = node.parent && 'width' in node.parent ? node.parent.width : 0;
                const right = `right-[${parentWith - leftPos - node.width}px]`;
                classes.push(right);
            } else {
                const left = `left-[${leftPos}px]`;
                classes.push(left);
            }
        }

        const myAuto = node.parent && 'height' in node.parent && (node.parent.height / 2 - topPos) > 1; // one pixel difference 
        if (myAuto) {
            classes.push('top-0 bottom-0 my-auto');
        } else {
            if (useBottom) {
                const parentHeight = node.parent && 'height' in node.parent ? node.parent.height : 0;
                const bottom = `bottom-[${parentHeight - topPos - node.height}px]`;
                classes.push(bottom);
            } else {
                const top = `top-[${topPos}px]`
                classes.push(top);
            }
        }

    }

    const isFlex = node.layoutMode !== "NONE";

    const width = node.layoutSizingHorizontal === "FILL" ? "w-full" : node.layoutSizingHorizontal === "HUG" ? "w-fit" : valueToTailwindValue(node.width, "spacing", "w");
    classes.push(width);

    const height = node.layoutSizingVertical === "FILL" ? parentFlex ? "self-stretch" : "h-full" : node.layoutSizingVertical === "HUG" ? "h-fit" : valueToTailwindValue(node.height, "spacing", "h");
    classes.push(height);


    const paddingHoriz = isFlex ? node.paddingLeft === node.paddingRight ? valueToTailwindValue(node.paddingLeft, 'spacing', "px") : `${valueToTailwindValue(node.paddingLeft, 'spacing', "pl")} ${valueToTailwindValue(node.paddingRight, 'spacing', "pr")}` : "";
    classes.push(paddingHoriz);

    const paddingVert = isFlex ? node.paddingTop === node.paddingBottom ? valueToTailwindValue(node.paddingTop, 'spacing', "py") : `${valueToTailwindValue(node.paddingTop, 'spacing', "pt")} ${valueToTailwindValue(node.paddingBottom, 'spacing', "pb")}` : "";
    classes.push(paddingVert);

    const grow = node.layoutGrow === 1 ? "flex-1" : "shrink-0";
    classes.push(grow);
    const overflow = node.clipsContent ? "overflow-hidden" : "";
    classes.push(overflow);


    if (isFlex && node.inferredAutoLayout !== null) {
        const display = 'flex ';
        classes.push(display);

        const layout = node.inferredAutoLayout;

        const flexDir = layout.layoutMode === "HORIZONTAL" ? "flex-row" : "flex-col";
        classes.push(flexDir);

        const justifyItems = JUSTIFY_CLASSES[layout.primaryAxisAlignItems];
        classes.push(justifyItems);

        const alignItems = ALIGN_CLASSES[layout.counterAxisAlignItems];
        classes.push(alignItems);

        const alignContent = layout.counterAxisAlignContent ? ALIGN_CONTENT[layout.counterAxisAlignContent] : "";
        classes.push(alignContent);

        const flexWrap = node.layoutWrap === "WRAP" ? "flex-wrap" : "";
        classes.push(flexWrap);

        const flexGapX = layout.itemSpacing !== 0 ? valueToTailwindValue(layout.itemSpacing, "spacing", "gap") : "";
        classes.push(flexGapX);

        const flexGapY = node.counterAxisSpacing ? valueToTailwindValue(node.counterAxisSpacing, "spacing", "gap-y") : "";
        classes.push(flexGapY);
    }



    const [bgClasses, bgStyles] = await getBackgrounds(node);
    if (bgStyles.length !== 0)
        styles.push(bgStyles);

    classes.push(bgClasses);

    const hasBorder = node.strokes.length > 0;

    if (hasBorder) {
        if (node.strokeWeight === figma.mixed) {
            const borderVertWidth = node.strokeTopWeight === node.strokeBottomWeight ? valueToTailwindValue(node.strokeTopWeight, "border", "border-y") : `${valueToTailwindValue(node.strokeTopWeight, "border", "border-t")} ${valueToTailwindValue(node.strokeBottomWeight, "border", "border-b")}`;
            classes.push(borderVertWidth)
            const borderHorzWidth = node.strokeLeftWeight === node.strokeRightWeight ? valueToTailwindValue(node.strokeLeftWeight, "border", "border-x") : `${valueToTailwindValue(node.strokeLeftWeight, "border", "border-l")} ${valueToTailwindValue(node.strokeRightWeight, "border", "border-r")}`;
            classes.push(borderHorzWidth)
        } else {
            const borderWidth = valueToTailwindValue(node.strokeWeight, "border", "border");
            classes.push(borderWidth)
        }

        const borderColor = node.strokes[0].type === "SOLID" ? valueToTailwindValue({ ...node.strokes[0].color, a: node.strokes[0].opacity ?? 1 }, "color", "border") : "";
        classes.push(borderColor);


        const hasDashes = node.dashPattern.filter(el => el !== 0).length > 0;
        if (hasDashes) {
            classes.push('border-dashed')
        }

    }




    if (node.cornerRadius === figma.mixed) {
        const leftRadius = node.topLeftRadius === node.bottomLeftRadius ? valueToTailwindValue(node.topLeftRadius, "radius", "rounded-s") : `${valueToTailwindValue(node.topLeftRadius, "radius", "rounded-ss")} ${valueToTailwindValue(node.bottomLeftRadius, "radius", "rounded-es")}`;
        classes.push(leftRadius)
        const rightRadius = node.topRightRadius === node.bottomRightRadius ? valueToTailwindValue(node.topRightRadius, "radius", "rounded-e") : `${valueToTailwindValue(node.topRightRadius, "radius", "rounded-se")} ${valueToTailwindValue(node.bottomRightRadius, "radius", "rounded-ee")}`;
        classes.push(rightRadius)
    } else {
        const radius = valueToTailwindValue(node.cornerRadius, 'radius', 'rounded');
        classes.push(radius)
    }


    const className = classes.filter(el => el.trim().length !== 0).join(' ');


    return {
        className,
        assets: {
            colors: colorVariables,
            styles: styles.join('\n')
        }
    }

}



const getColors = async (node: FrameNode | ComponentNode | InstanceNode) => {
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


export default generateStylesFromFrame;