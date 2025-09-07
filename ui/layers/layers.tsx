import { JSX, useCallback, useRef } from "react";
import { TPageChildren } from "../../types";
import Icon from "../components/icon"
import { onToggleExpandNode, onSelectNode, usePageChildrenStore, usePageSelectionStore, onSetHtmlTagToNode } from "../main"
import Layer from "./components/layer"

const Layers = () => {
    const clearSelection = () => {
        onSelectNode(null);
    }

    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section className="group flex flex-col">
            <div className="group flex items-center h-6  border-b border-border">
                <button className="flex items-center justify-center w-3 h-5 flex-shrink-0 outline-none">
                    <Icon className='text-icon-tertiary hidden! group-hover:block!' icon="chevron.down.16" />
                </button>
                <span className="text-body-medium font-strong">Layers</span>
            </div>

            <div ref={containerRef} onClick={clearSelection} className="group flex flex-col hover:[&::-webkit-scrollbar-thumb]:bg-bg-inverse/30 overflow-scroll h-[390px]">
                <div className="w-fit min-w-full h-fit">
                    <LayersComponent containerRef={containerRef} />
                </div>
            </div>
        </section>
    )
}

const LayersComponent = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
    const { children } = usePageChildrenStore();
    const store = usePageSelectionStore();






    const toRender: JSX.Element[] = [];


    const onSelect = (id: string) => {
        store.setSelectedNode(id)
        onSelectNode(id)
    }

    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const selected = store.nodeId === child.id;
        const nextChild = children[i + 1];

        const isExpanded = nextChild !== undefined && nextChild.parentIds.length > child.parentIds.length;

        if (selected) {
            let idx = i + 1;
            while (children[idx] && children[idx].parentIds.includes(child.id)) {
                idx += 1;
            }

            const hasSelectedChilds = idx > i + 1;

            const childChildren = hasSelectedChilds ? children.slice(i + 1, idx) : [];

            const content = (
                <div className={`w-fit min-w-full ml-2.5 mt-[0.2rem] ${hasSelectedChilds ? "bg-bg-selected-secondary rounded-medium" : ""}`}>
                    <LayerComponent containerRef={containerRef} expanded={isExpanded} className="-top-[0.2rem] -mb-[0.2rem]" key={child.id} node={child} onSelect={onSelect} selected="main" />

                    {hasSelectedChilds ? (
                        childChildren.map((el, idx) => {
                            const nextChild = childChildren[idx + 1];
                            const isExpanded = nextChild !== undefined && nextChild.parentIds.length > el.parentIds.length;
                            return (
                                <LayerComponent containerRef={containerRef} expanded={isExpanded} key={el.id} node={el} onSelect={onSelect} selected="parent" />
                            )
                        })
                    ) : null}
                </div>
            )

            toRender.push(
                content
            )

            if (hasSelectedChilds)
                i = idx - 1;

        } else {
            toRender.push(<LayerComponent containerRef={containerRef} expanded={isExpanded} className="ml-2.5" key={child.id} node={child} onSelect={onSelect} />)
        }

    }

    return toRender;
}



type LayerComponentProps = {
    node: TPageChildren,
    selected?: "main" | "parent" | "none",
    onSelect: (id: string) => void,
    expanded: boolean,
    className?: string,
    containerRef: React.RefObject<HTMLDivElement | null>
}


const LayerComponent = ({ node, onSelect, selected = "none", expanded, containerRef, className }: LayerComponentProps,) => {

    const onToggle = () => {
        onToggleExpandNode(node.id)
    }

    const onChangeTag = (tag: string) => {
        onSetHtmlTagToNode(node.id, tag);
    }

    const type = node.isImage ? "IMAGE" : node.type;

    const onClick = useCallback(() => {
        onSelect(node.id);
    }, [onSelect, node.id]);

    return (
        <Layer
            level={node.parentIds.length}
            expandable={node.hasChildren}
            expanded={expanded}
            selected={selected}
            name={node.name}
            type={type}
            tag={node.tag.tag}
            className={className}
            containerRef={containerRef}
            onClick={onClick}
            onToggleExpand={onToggle}
            onChangeTag={onChangeTag}
        />
    )
}

export default Layers