import type { CoordinateSet, ViewportInfo } from './history/view';

export interface BuildDomTreeArgs {
  showHighlightElements: boolean;
  focusHighlightIndex: number;
  viewportExpansion: number;
  debugMode?: boolean;
  startId?: number;
  startHighlightIndex?: number;
}

export interface RawDomElementNode {
  tagName: string;
  highlightIndex: number;
  attributes: Record<string, string>;
  xpath: string;
  children?: string[];
  isVisible?: boolean;
  isInteractive?: boolean;
  isTopElement?: boolean;
  isInViewport?: boolean;
  shadowRoot?: boolean;
}

export interface RawDomTextNode {
  type: 'TEXT_NODE';
  text: string;
  isVisible: boolean;
}

export type RawDomTreeNode = RawDomElementNode | RawDomTextNode;

// Matches the new output format from ScrapterProcessor
export interface BuildDomTreeResult {
  rootId: string; // Dummy '1'
  summary: string; // The text prompt for LLM
  map: Record<string, RawDomElementNode>;
  perfMetrics?: any;
}