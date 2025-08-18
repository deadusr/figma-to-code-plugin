import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { MessagesFromPlugin } from '../types/messagesFromPlugin'
import App from './App.js'
import { create } from 'zustand'
import { Tags, TPageChildren } from '../types'
import { MessageToPlugin } from '../types/messagesToPlugin';
import { before, isEqual, sortBy } from 'lodash';
import { ColorInfo, ImageInfo } from '../plugin/codeGenerators/tags'

export const usePageChildrenStore = create<{ children: TPageChildren[] }>(() => ({ children: [] }))
export const usePageSelectionStore = create<{ nodeId: string | null, setSelectedNode: (nodeId: string) => void }>((set) => ({
  nodeId: null,
  setSelectedNode: (nodeId: string) => {
    set({ nodeId })
  }
}))

export const useCodeStore = create<{ html: string, css: string }>(() => ({ css: '', html: '' }))
export const useImagesStore = create<{ images: ImageInfo[] }>(() => ({ images: [] }));
export const useColorsStore = create<{ colors: ColorInfo[] }>(() => ({ colors: [] }));

export const useConfigsStore = create<{ tailwindColorPaleteId: string | null }>(() => ({ tailwindColorPaleteId: null }))


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


export const onSelectNode = (nodeId: string | null) => {
  const message: MessageToPlugin = {
    "message": "selectNodes",
    "value": {
      nodes: nodeId === null ? [] : [nodeId]
    }
  }
  parent.postMessage({ pluginMessage: message }, "*")
}

export const onToggleExpandNode = (nodeId: string) => {
  const message: MessageToPlugin = {
    "message": "toggleExpandNode",
    "value": {
      node: nodeId
    }
  }
  parent.postMessage({ pluginMessage: message }, "*")
}

export const onSetHtmlTagToNode = (nodeId: string, tag: string) => {
  const message: MessageToPlugin = {
    "message": "setHtmlTagToNode",
    "value": {
      node: nodeId,
      tag
    }
  }
  parent.postMessage({ pluginMessage: message }, "*")
}

export const onImportTailwindColors = () => {
  const message: MessageToPlugin = {
    "message": "importTailwindColors",
    value: null
  }
  parent.postMessage({ pluginMessage: message }, "*")
}


export const onRemoveTailwindColors = () => {
  const message: MessageToPlugin = {
    "message": "removeTailwindColors",
    value: null
  }
  parent.postMessage({ pluginMessage: message }, "*")
}

export const onNotify = (text: string) => {
  const message: MessageToPlugin = {
    "message": "notify",
    value: { message: text }
  }
  parent.postMessage({ pluginMessage: message }, "*")
}


onmessage = ({ data }: MessageEvent<{ pluginMessage: MessagesFromPlugin }>) => {
  const { message, value } = data.pluginMessage;

  switch (message) {
    case 'PageNode.updated':
      const { children } = usePageChildrenStore.getState();

      if (isEqual(children, value.children))
        break;

      usePageChildrenStore.setState({ children: value.children })
      break;

    case 'Selected.updated':
      const { setSelectedNode } = usePageSelectionStore.getState();
      const selectedNodeId = value.nodes.length > 0 ? value.nodes[0] : null;
      if (selectedNodeId !== null) {
        setSelectedNode(selectedNodeId);
      } else {
        usePageSelectionStore.setState({ nodeId: null });
      }
      break;

    case 'Code.updated':
      const { html, css, assets } = value;
      useCodeStore.setState({ html, css })
      useImagesStore.setState({ images: assets.images });
      useColorsStore.setState({ colors: assets.colors });
      break;

    case 'tailwindColorPalete.updated':
      console.log('updated');
      const { id } = value;
      useConfigsStore.setState({ tailwindColorPaleteId: id })
      break;
  }
}



