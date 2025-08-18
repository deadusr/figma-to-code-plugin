import { Tags } from "./index";

export const messages = ["selectNodes", "toggleExpandNode", "setHtmlTagToNode", "importTailwindColors", "removeTailwindColors", "notify"] as const;
export type MessageToPluginType = typeof messages[number];

// 2) map each message to the type you want in `value`
interface MessageToPluginPayload {
    "selectNodes": {
        nodes: string[]
    };
    "toggleExpandNode": {
        node: string
    },
    "setHtmlTagToNode": {
        node: string,
        tag: string
    }

    "importTailwindColors": null,
    "removeTailwindColors": null,
    "notify": {
        message: string
    }

}

export type MessageToPlugin = {
    [T in MessageToPluginType]: { message: T; value: MessageToPluginPayload[T] }
}[MessageToPluginType];

export type TMessageToPlugin<K extends MessageToPluginType> = {
    message: K;
    value: MessageToPluginPayload[K];
};