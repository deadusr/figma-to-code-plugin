import { concat, flatten } from 'lodash';
import { Tags, TPageChildren } from '../types/index';
import { MessageFromPluginPayload, MessageFromPluginType, } from '../types/messagesFromPlugin'
import { MessageToPlugin, } from '../types/messagesToPlugin'
import generateTagFromNode, { ColorInfo, ImageInfo, TagData } from './codeGenerators/tags/index';

const nodesToHtmlTagMap = new Map<string, Tags | null>();
const expandedNodesMap = new Map<string, string[]>();

const main = async () => {
    figma.showUI(__html__, { themeColors: true, width: 300, height: 900 });


    await figma.currentPage.loadAsync();

    updateLayersUI();


    figma.ui.onmessage = async (message: MessageToPlugin) => {
        switch (message.message) {
            case 'selectNodes':
                await selectNodes(message.value.nodes)
                break;

            case 'toggleExpandNode':
                await toggleExpandNode(message.value.node)
                updateLayersUI()
                break;

            case 'setHtmlTagToNode':
                nodesToHtmlTagMap.set(message.value.node, message.value.tag)
                updateLayersUI()
                break;

        }
    }

    figma.on("selectionchange", async () => {
        console.log(figma.currentPage.selection[0]);

        sendMessageToUI("Selected.updated", { nodes: figma.currentPage.selection.map(el => el.id) })

        updateCodeUI();
    })

    figma.currentPage.on("nodechange", (e) => {
        updateLayersUI();
        updateCodeUI();
    })
}

const updateLayersUI = async () => {
    const children = await generateLayers()
    sendMessageToUI("PageNode.updated", { "children": children })
}

const updateCodeUI = async () => {
    const node = figma.currentPage.selection[0];
    if (node === null)
        return;

    const result = await generateCode(node);
    const data = {
        html: result.html,
        assets: result.assets,
        css: result.assets.styles

    }
    sendMessageToUI('Code.updated', data);
}


const generateCode = async (node: SceneNode): Promise<{ html: string, assets: { images: ImageInfo[], colors: ColorInfo[], styles: string } }> => {

    const userTag = nodesToHtmlTagMap.get(node.id) || null;
    const { initialData: { childrenDisabled }, getDeferredData } = await generateTagFromNode(node, userTag);
    const tagData = await getDeferredData();

    const generateChildren = !childrenDisabled && 'children' in node;

    if (generateChildren) {
        const children = await Promise.all(node.children.map(generateCode));
        const childrenHtml = children.map(el => el.html).join('\n')
        const childrenStyles = children.map(el => el.assets.styles).join('\n');
        const childrenColors = flatten(children.map(el => el.assets.colors));
        const childrenImages = flatten(children.map(el => el.assets.images));

        const html = generateHtml(tagData, childrenHtml);
        const rootImages = generateImages(tagData);
        const colors = concat(generateColors(tagData), childrenColors);
        const styles = [childrenStyles, tagData.styles].filter(el => !!el).join('\n');

        return {
            html,
            assets: {
                images: concat(childrenImages, rootImages),
                colors,
                styles
            }
        }
    }


    const html = generateHtml(tagData);
    const images = generateImages(tagData);
    const colors = generateColors(tagData);
    const styles = tagData.styles || "";

    return {
        html,
        assets: {
            images,
            colors,
            styles
        }
    }
}


const generateImages = ({ children, images }: TagData): ImageInfo[] => {

    const childsAssets = children !== undefined
        ? children.map(generateImages)
        : [];

    return concat(flatten(childsAssets), images)
}

const generateColors = ({ colors, children }: TagData): ColorInfo[] => {

    const childsColors = children !== undefined
        ? children.map(generateColors)
        : [];

    return concat(flatten(childsColors), colors)
}


const generateHtml = (data: TagData, insideHtml: string = ''): string => {

    if (data.html) return data.html;

    const childsHtml = data.children !== undefined
        ? data.children.map(el => generateHtml(el)).join('\n')
        : '';

    const props = data.tagProps !== undefined ? data.tagProps.map(el => `${el.name}${el.value === true ? "" : `=${el.value}`}`).join(' ') : "";

    const htmlStr =
        `<${data.tag} ${props ? `${props} ` : ""}class="${data.className}">${data.content ? `\n${data.content}` : ""}${insideHtml ? `\n${insideHtml}` : ""}${childsHtml ? `\n${childsHtml}` : ""}\n</${data.tag}>`;
    return htmlStr;
}


const generateLayers = async () => {
    let children: TPageChildren[] = [];
    const nodes = [...figma.currentPage.children].reverse();
    const promises = nodes.map(async node => {
        const hasChildren = 'children' in node && node.children.length !== 0;
        const userTag = nodesToHtmlTagMap.get(node.id) || null;
        const tag = (await generateTagFromNode(node, userTag)).initialData;


        children.push({
            id: node.id,
            name: node.name,
            type: node.type,
            hasChildren,
            parentIds: node.parent ? [node.parent.id] : [],
            tag
        })

        if (hasChildren) {
            const childrenTags = await generateChildrenTags(node.children, node.id, expandedNodesMap);
            childrenTags.forEach(child => {
                const parentIds = node.parent ? [node.parent.id] : [];
                child.parentIds.forEach(id => parentIds.push(id))
                child.parentIds = parentIds;
                children.push(child);
            })
        }
    })


    await Promise.all(promises);

    return children;
}


const generateChildrenTags = async (children: readonly SceneNode[], rootId: string, expandedNodesMap: Map<string, string[]>): Promise<readonly TPageChildren[]> => {
    let foundChildren: TPageChildren[] = [];
    const childrenIds = expandedNodesMap.get(rootId);

    if (childrenIds === undefined) return [];

    const promises = children.map(async node => {
        const hasChildren = 'children' in node && node.children.length !== 0;
        const userTag = nodesToHtmlTagMap.get(node.id) || null;
        const tag = (await generateTagFromNode(node, userTag)).initialData;

        foundChildren.push({
            id: node.id,
            name: node.name,
            type: node.type,
            hasChildren,
            parentIds: [rootId],
            tag
        });

        if (hasChildren && childrenIds.includes(node.id)) {
            const children = await generateChildrenTags(node.children, node.id, expandedNodesMap);
            children.forEach(child => {
                const parentIds = [rootId];
                child.parentIds.forEach(id => parentIds.push(id))
                child.parentIds = parentIds;
                foundChildren.push(child);
            })
        }
    })


    await Promise.all(promises);

    return foundChildren;
}

const selectNodes = async (ids: string[]) => {
    if (ids.length === 0) {
        figma.currentPage.selection = [];
        return
    }

    const node = await figma.getNodeByIdAsync(ids[0]);
    if (node !== null)
        figma.currentPage.selection = [node as SceneNode];
}

const toggleExpandNode = async (id: string) => {
    const node = await figma.getNodeByIdAsync(id);
    if (node === null) return;

    const isExpanded = expandedNodesMap.get(node.id) !== undefined;
    if (isExpanded)
        collapseNode(node);
    else expandNode(node)

}

const expandNode = (node: BaseNode) => {
    const hasChildren = 'children' in node && node.children.length !== 0;
    if (!hasChildren) return;

    const children = node.children.map(el => el.id);
    expandedNodesMap.set(node.id, children);
}

const collapseNode = (node: BaseNode) => {
    expandedNodesMap.delete(node.id);
}


const sendMessageToUI = <T extends MessageFromPluginType>(message: T, value: MessageFromPluginPayload[T]) => {
    figma.ui.postMessage({
        message,
        value
    })
}


main();
