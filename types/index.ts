import { SceneNodeType } from './figmaTypes'

export type TPageChildren = {
    id: string,
    name: string,
    type: SceneNodeType,
    parentIds: string[],
    hasChildren: boolean,

    tag: GeneratedTagType
}


export type GeneratedTagType = {
    tag: string,
    childrenDisabled: boolean,
}

export const TAGS = ["svg", "div", "img", 'p', 'span'] as const;

export type Tags = typeof TAGS[number];