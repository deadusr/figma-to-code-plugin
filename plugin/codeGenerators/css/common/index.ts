import { transformToRotation } from "../../../utils/transform";
import { valueToTailwindValue } from "../defaultConfig";


const GRADIENT_CLASSES = {
    "GRADIENT_ANGULAR": "bg-conic",
    "GRADIENT_LINEAR": "bg-linear",
    "GRADIENT_RADIAL": "bg-radial",
}

const getBackgrounds = async (node: FrameNode | TextNode): Promise<[string, string]> => {
    if (node.fills === figma.mixed) return ['', ''];

    const isText = node.type === "TEXT";

    let classes: string[] = [];
    let styles: { name: string, value: string }[] = [];
    const name = node.name.replace(/\s/g, '').toLowerCase();


    if (node.fills.length === 1) {
        const fill = node.fills[0];

        switch (fill.type) {
            case 'GRADIENT_ANGULAR':
            case 'GRADIENT_LINEAR':
                const rotationAngle = transformToRotation(fill.gradientTransform);

                const leftPos = fill.gradientTransform[0][2];
                const topPos = fill.gradientTransform[1][2];
                const isGradientComplex = leftPos !== 0 || topPos !== 1 || fill.gradientStops.length > 3;
                if (isGradientComplex) {
                    const css = (await node.getCSSAsync()).background;
                    const className = `${name}_gradient`;
                    styles.push({ name: className, value: css });
                    classes.push(className)
                    if (isText) {
                        classes.push(`w-fit`)
                        classes.push("text-transparent bg-clip-text")
                    }
                    break;
                }

                const gradientType = GRADIENT_CLASSES[fill.type];
                classes.push(`${gradientType} -${rotationAngle}/srgb`)

                const colorStops = fill.gradientStops.sort((prev, next) => prev.position - next.position) as readonly ColorStop[];

                const fromColorStop = colorStops[0];
                const fromColor = valueToTailwindValue(fromColorStop.color, "color", 'from');
                const fromPosition = fromColorStop.position !== 0 ? `from-${fromColorStop.position * 100}%` : "";
                classes.push(fromColor)
                classes.push(fromPosition)

                const hasVia = colorStops.length === 3;

                if (hasVia) {
                    const viaColorStop = colorStops[1];
                    const viaColor = viaColorStop !== undefined ? valueToTailwindValue(viaColorStop.color, "color", "via") : "";
                    const viaPosition = `via-${viaColorStop.position * 100}%`;
                    classes.push(viaColor);
                    classes.push(viaPosition);
                }

                const toColorStop = (hasVia ? colorStops[2] : colorStops[1]);

                const toColor = toColorStop !== undefined ? valueToTailwindValue(toColorStop.color, "color", "to") : "";
                const toPosition = toColorStop !== undefined && toColorStop.position !== 1 ? `to-${toColorStop.position * 100}%` : "";
                classes.push(toColor)
                classes.push(toPosition)

                if (isText) {
                    classes.push(`w-fit`)
                    classes.push("text-transparent bg-clip-text")
                }
                break;


            case 'GRADIENT_DIAMOND':
            case 'GRADIENT_RADIAL':
                const css = (await node.getCSSAsync()).background;
                const className = `${name}_gradient`;
                styles.push({ name: className, value: css });
                classes.push(className)
                if (isText) {
                    classes.push(`w-fit`)
                    classes.push("text-transparent bg-clip-text")
                }
                break;

            case 'SOLID':
                const color = valueToTailwindValue(fill.color as RGBA, "color", isText ? "text" : "bg")
                classes.push(color);
                break;

        }
    } else {
        const css = (await node.getCSSAsync()).background;
        const className = `${name}_bg`;
        styles.push({ name: className, value: css });
        if (isText) {
            classes.push("text-transparent bg-clip-text")
        }
        classes.push(className)
    }



    const classesStr = classes.map(el => el.trim()).filter(el => el.length !== 0).join(' ');
    const stylesStr = styles.filter(el => el.value !== undefined && el.value.length !== 0).map(el => `@utility ${el.name} { background-image: ${el.value}; }`).join('\n');
    return [classesStr, stylesStr]
}

export default getBackgrounds;