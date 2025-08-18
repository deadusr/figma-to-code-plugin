import { PartialResult } from "../../../types/utils";
import { GeneratedTagType, Tags } from "../../../types/index";
import generateStylesFromTextNode from "../css/text/textNodeGenerator";
import { RGBAToHexA } from "../../utils/colors";
import { concat, flatten } from "lodash";
import generateStylesFromTextSegment from "../css/text/textSegmentGenerator";
import generateStylesFromFrame from "../css/frame/FrameNodeGenerator";
import generateStylesFromImage from "../css/image/imageNodeGenerator";
import generateStylesFromBgImage from "../css/image/bgImageNodeGenerator";
import generateStylesFromIcon from "../css/icon/iconNodeGenerator";
import { addClassToSvgString } from "../../utils/common";
import { generateProps } from "../components/index";


export type ImageInfo = {
    name: string,
    imageHash: string,
    src: string,
    base64Src: string
}

export type ColorInfo = {
    value: string,
    name: string
}

type BaseData = {
    images: ImageInfo[],
    colors: ColorInfo[],
};

export type TagBasedData = BaseData & {
    tag: string; // 'tag' is REQUIRED here
    className: string;
    styles: string,
    tagProps: { name: string; value: string | boolean }[];
    content?: string | null;
    children?: TagData[]; // The type can be recursive
    html?: never;         // 'html' is FORBIDDEN
};

export type HtmlBasedData = BaseData & {
    html: string;      // 'html' is REQUIRED here
    tag?: never;       // 'tag' and its related props are FORBIDDEN
    className?: never;
    styles?: never,
    tagProps?: never;
    content?: never;
    children?: never;
};

export type TagData = TagBasedData | HtmlBasedData;

const FONT_PROPS = [
    "fontName",
    "fontSize",
    "fontWeight",
    "letterSpacing",
    "lineHeight",
    "textCase",
    "textDecoration",
    "textDecorationColor",
    "textDecorationStyle",
    "textDecorationThickness",
    "fills",
    "textStyleId",
    "fillStyleId",
    "listOptions",
    "listSpacing",
    "indentation",
    "paragraphIndent",
    "paragraphSpacing",
    "hyperlink",
    "openTypeFeatures",
    "boundVariables",
    "textStyleOverrides",
] as const;



const generateTagFromNode = (node: SceneNode, userTag: Tags | null): PartialResult<GeneratedTagType, TagData> => {
    const filename = node.name.replace(/\s/g, '');

    switch (node.type) {

        case 'BOOLEAN_OPERATION':
        case "ELLIPSE":
        case 'POLYGON':
        case 'RECTANGLE':
        case 'VECTOR':
            return {
                initialData: {
                    tag: userTag || 'svg',
                    childrenDisabled: true,
                },
                getDeferredData: async () => {
                    let html = await node.exportAsync({ format: "SVG_STRING" });

                    const colors = await getColorVariables(node);
                    if (colors.length === 1) {
                        const color = colors[0];
                        const regex = new RegExp(color.value, 'gi');
                        html = html.replace(regex, "currentColor");

                        const colorName = `text-${color.name}`;
                        html = addClassToSvgString(html, colorName)
                    }

                    return {
                        html,
                        images: [],
                        colors,
                    }
                }
            }

        case 'COMPONENT':
            return {
                initialData: {
                    tag: 'Component',
                    childrenDisabled: false,
                },
                getDeferredData: async () => {
                    const { className, assets } = await generateStylesFromFrame(node);
                    return {
                        tag: userTag || 'div',
                        className,
                        styles: assets.styles,
                        tagProps: [],
                        images: [],
                        colors: assets.colors,
                    }
                }
            }

        case 'INSTANCE':
            return {
                initialData: {
                    tag: node.name,
                    childrenDisabled: true,
                },
                getDeferredData: async () => {
                    let componentName = "";
                    let props: {
                        name: string;
                        value: string | boolean;
                    }[] = [];

                    const mainComponent = await node.getMainComponentAsync();
                    if (mainComponent === null)
                        throw new Error(`Component from instance ${node.name} was not found`);

                    if (mainComponent !== null && mainComponent.parent !== null && mainComponent.parent.type === "COMPONENT_SET") {
                        componentName = mainComponent.parent.name;
                    } else {
                        componentName = mainComponent.name;
                    }

                    if (mainComponent.variantProperties !== null) {
                        props = generateProps(node.componentProperties);
                    }


                    return {
                        tag: componentName,
                        className: "",
                        styles: "",
                        tagProps: props,
                        images: [],
                        colors: [],
                    }
                }
            }

        case 'FRAME':
            const imagePaint = node.fills !== figma.mixed ? node.fills.find(el => el.type === "IMAGE") : undefined;
            const hasImageInside = imagePaint !== undefined && imagePaint.imageHash !== null;
            const hasContentInside = node.children.length !== 0;
            const isIcon = node.isAsset && node.fills !== figma.mixed && !hasImageInside;

            const type = isIcon ? "ICON" : hasImageInside ? hasContentInside ? "BG_IMAGE" : "IMAGE" : "FRAME";

            switch (type) {
                case 'FRAME':
                    return {
                        initialData: {
                            tag: userTag || 'div',
                            childrenDisabled: false,
                        },
                        getDeferredData: async () => {
                            const { className, assets } = await generateStylesFromFrame(node);
                            return {
                                tag: userTag || 'div',
                                className,
                                styles: assets.styles,
                                tagProps: [],
                                images: [],
                                colors: assets.colors,
                            }
                        }
                    }
                case 'IMAGE':
                    return {
                        initialData: {
                            tag: userTag || 'img',
                            childrenDisabled: true,
                        },
                        getDeferredData: async () => {
                            const imageHash = imagePaint!.imageHash!;
                            const src = `/images/${filename}.png`
                            const image = figma.getImageByHash(imageHash);
                            let base64Src = '';
                            const { className } = await generateStylesFromImage(node);
                            if (image !== null) {
                                const bytes = await image.getBytesAsync();
                                if (bytes !== undefined) {
                                    const base64 = figma.base64Encode(bytes);
                                    base64Src = `data:image/png;base64,${base64}`;
                                }
                            }

                            return {
                                tag: userTag || 'img',
                                className,
                                styles: '',
                                tagProps: [{ name: 'src', value: src }],
                                images: [
                                    {
                                        name: node.name,
                                        imageHash,
                                        src,
                                        base64Src
                                    }
                                ],
                                colors: []
                            }
                        }
                    }

                case 'BG_IMAGE':
                    return {
                        initialData: {
                            tag: userTag || 'div',
                            childrenDisabled: false,
                        },
                        getDeferredData: async () => {
                            const imageHash = imagePaint!.imageHash!;
                            const src = `/images/${filename}.png`
                            const image = figma.getImageByHash(imageHash);
                            let base64Src = '';
                            const { className } = await generateStylesFromBgImage(node, src);
                            if (image !== null) {
                                const bytes = await image.getBytesAsync();
                                if (bytes !== undefined) {
                                    const base64 = figma.base64Encode(bytes);
                                    base64Src = `data:image/png;base64,${base64}`;
                                }
                            }

                            return {
                                tag: userTag || 'div',
                                className,
                                styles: '',
                                tagProps: [],
                                images: [
                                    {
                                        name: node.name,
                                        imageHash,
                                        src,
                                        base64Src
                                    }
                                ],
                                colors: [],
                            }
                        }
                    }

                case 'ICON':
                    return {
                        initialData: {
                            tag: userTag || 'svg',
                            childrenDisabled: true,
                        },
                        getDeferredData: async () => {
                            let html = await node.exportAsync({ format: "SVG_STRING" });

                            const colors = await getIconColorVariables(node);
                            if (colors.length === 1) {
                                const color = colors[0];
                                const regex = new RegExp(color.value, 'gi');
                                html = html.replace(regex, "currentColor");

                                const colorName = `text-${color.name}`;
                                html = addClassToSvgString(html, colorName)
                            }

                            return {
                                html,
                                images: [],
                                colors,
                            }
                        }
                    }
            }

        case 'TEXT':
            const segments = node.getStyledTextSegments(FONT_PROPS);
            if (segments.length > 1) {

                return {
                    initialData: {
                        tag: userTag || 'p',
                        childrenDisabled: true,
                    },
                    getDeferredData: async () => {

                        const { className, assets } = await generateStylesFromTextNode(node);

                        const promises = segments.map(async segment => {
                            const { className, assets } = await generateStylesFromTextSegment(segment, node);
                            return ({
                                tag: 'span' as Tags,
                                tagProps: [],
                                content: segment.characters,
                                className,
                                styles: "",
                                images: [],
                                colors: assets.colors,
                            })
                        })

                        const children = await Promise.all(promises)

                        return {
                            tag: userTag || 'p',
                            tagProps: [],
                            className: className,
                            styles: '',
                            children,
                            images: [],
                            colors: assets.colors,
                        }
                    }
                }
            }

            return {
                initialData: {
                    tag: userTag || 'p',
                    childrenDisabled: true,
                },
                getDeferredData: async () => {
                    const { className, assets } = await generateStylesFromTextNode(node);

                    return {
                        tag: userTag || 'p',
                        className,
                        tagProps: [],
                        styles: assets.styles,
                        content: node.characters,
                        images: [],
                        colors: assets.colors
                    }
                }
            }

        default:
            return {
                initialData: {
                    tag: userTag || 'div',
                    childrenDisabled: false,
                },
                getDeferredData: async () => {
                    return {
                        tag: userTag || 'div',
                        className: '',
                        styles: '',
                        tagProps: [],
                        images: [],
                        colors: [],
                    }
                }
            }
    }
}


const getColorVariables = async (node: SceneNode) => {
    const colors: ColorInfo[] = [];

    if (node.boundVariables !== undefined) {

        const fills = concat(node.boundVariables.fills || [], node.boundVariables.textRangeFills || []);

        const promises = fills.map(async variable => {
            const color = await figma.variables.getVariableByIdAsync(variable.id);
            if (color !== null && color.resolvedType === "COLOR") {
                const value = color.resolveForConsumer(node).value as RGB | RGBA;
                const hex = RGBAToHexA(value);
                colors.push({ name: color.name, value: hex });
            }
        })
        await Promise.all(promises);
    }

    return colors;
}


const getIconColorVariables = async (node: SceneNode) => {
    const colors: ColorInfo[] = [];

    if (node.type === "VECTOR" || node.type === "BOOLEAN_OPERATION" || node.type === "ELLIPSE" || node.type === "POLYGON" || node.type === "RECTANGLE") {

        if (node.boundVariables !== undefined) {

            const fills = concat(node.boundVariables.fills || [], node.boundVariables.textRangeFills || []);

            const promises = fills.map(async variable => {
                const color = await figma.variables.getVariableByIdAsync(variable.id);
                if (color !== null && color.resolvedType === "COLOR") {
                    const value = color.resolveForConsumer(node).value as RGB | RGBA;
                    const hex = RGBAToHexA(value);
                    colors.push({ name: color.name, value: hex });
                }
            })
            await Promise.all(promises);

        }
    } else {
        if ('children' in node) {
            const promises = node.children.map(getIconColorVariables);
            const childColors = flatten(await Promise.all(promises));
            childColors.forEach(el => colors.push(el));
        }
    }

    return colors;

}

export default generateTagFromNode;