import { useEffect, useRef, useState } from "react";
import { SceneNodeType } from "../../../types/figmaTypes";
import Icon from "../../components/icon";
import { TIcons } from "../../components/icon/iconsTypes";
import LayerName from "./layerName";


type LayerType = SceneNodeType | "IMAGE";


type Props = {
    selected?: "parent" | "main" | "none",
    expanded?: boolean,
    expandable?: boolean,
    type: LayerType,
    level: number,
    lastChild?: boolean,
    name: string,
    tag: string,
    containerRef: React.RefObject<HTMLDivElement | null>,
    className?: string,
    onClick: () => void,
    onToggleExpand: () => void,
    onChangeTag: (value: string) => void,
}

const IconToType: { [value in LayerType]: TIcons } = {
    "BOOLEAN_OPERATION": "boolean.union.16",
    "COMPONENT": "component.16",
    "COMPONENT_SET": "componentset.16",
    "ELLIPSE": "ellipse.16",
    "FRAME": "frame.16",
    "GROUP": "group.16",
    "INSTANCE": "instance.16",
    "LINE": "line.16",
    "PAGE": "page.16",
    "POLYGON": "polygon.16",
    "RECTANGLE": "rectangle.16",
    "STAR": "star.16",
    "TEXT": "text.16",
    "VECTOR": "complex.vector.16",
    "IMAGE": "image.16",

    "CODE_BLOCK": "warning.16",
    "CONNECTOR": "warning.16",
    "DOCUMENT": "warning.16",
    "EMBED": "warning.16",
    "HIGHLIGHT": "warning.16",
    "INTERACTIVE_SLIDE_ELEMENT": "warning.16",
    "LINK_UNFURL": "warning.16",
    "MEDIA": "warning.16",
    "SECTION": "warning.16",
    "SHAPE_WITH_TEXT": "warning.16",
    "SLICE": "warning.16",
    "SLIDE": "warning.16",
    "SLIDE_GRID": "warning.16",
    "SLIDE_ROW": "warning.16",
    "STAMP": "warning.16",
    "STICKY": "warning.16",
    "TABLE": "warning.16",
    "TABLE_CELL": "warning.16",
    "WASHI_TAPE": "warning.16",
    "WIDGET": "warning.16",

    "TEXT_PATH": "warning.16",
    "TRANSFORM_GROUP": "warning.16",
}


const Layer = ({ selected = "none", type, level, expanded, expandable, name, tag, containerRef, className, onClick, onToggleExpand, onChangeTag }: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const icon = IconToType[type];
    const isComponentOrInstance = ["COMPONENT", "COMPONENT_SET", "INSTANCE"].includes(type);
    const ml = (level - 1) * 24;

    useEffect(() => {
        if (ref.current !== null && containerRef.current !== null && selected === "main") {
            const rect = ref.current.getBoundingClientRect();
            const isInViewport = rect.top >= 0 && rect.bottom <= containerRef.current.clientHeight;

            console.log({ isInViewport });

            if (!isInViewport) {
                const top = ref.current.offsetTop - (containerRef.current.clientHeight / 2);
                containerRef.current.scroll({ top })
            }

        }

    }, [ref, containerRef, selected])


    const toggle = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();

        onToggleExpand();
    }

    const click = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();

        onClick();
    }

    return (
        <div ref={ref} onClick={click} style={{ paddingLeft: `${ml}px` }} className={`group/item relative flex items-center h-5 pr-3 cursor-default ${isComponentOrInstance ? "text-text-component" : "text-text"} ${className}`}>
            <div className="relative">
                <LayerName tag={tag} onChangeTag={onChangeTag} icon={icon} name={name} component={isComponentOrInstance} />

                {expandable
                    ? <button onClick={toggle} className="z-20 absolute -left-2.5 top-0 bottom-0 flex items-center justify-center w-3 h-full outline-none">
                        <Icon className={`text-icon-tertiary hidden! group-hover:block! ${expanded ? "" : "-rotate-90"}`} icon={"chevron.down.16"} />
                    </button>
                    : null
                }
            </div>

            <div className={`z-10 absolute top-1 left-0 w-full h-4 
            ${selected === "main" ? `bg-bg-selected group-hover/item:bg-bg-selected-hover ${expanded ? "rounded-t-medium" : "rounded-medium"}` : selected === "parent" ? "rounded-medium group-hover/item:bg-bg-selected-hover" : "rounded-medium group-hover/item:bg-bg-hover"}
            `} />

        </div>

    )
}

export default Layer;