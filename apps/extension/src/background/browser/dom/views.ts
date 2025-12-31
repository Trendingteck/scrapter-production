/**
 * Common attributes to include in the DOM summary for the LLM
 */
export const DEFAULT_INCLUDE_ATTRIBUTES = [
  'title',
  'type',
  'name',
  'value',
  'placeholder',
  'aria-label',
  'role',
  'href',
  'src',
  'alt',
];

/**
 * Configuration passed to the injected script
 */
export interface BuildDomTreeArgs {
  showHighlightElements: boolean;
  focusHighlightIndex: number;
  viewportExpansion: number;
  debugMode: boolean;
}

/**
 * Represents a single interactive element extracted from the DOM.
 * This matches the structure in 'registry' from buildDomTree.js
 */
export interface ScrapterElementNode {
  tagName: string;
  highlightIndex: number; // The [ID] shown to the LLM
  attributes: Record<string, string>;
  xpath: string; // The precise path to locate this element

  // Optional metadata for debugging or specific actions
  isVisible?: boolean;
  isInteractive?: boolean;
  isInViewport?: boolean;
  viewport?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * The simplified State object.
 * The Monolithic Agent consumes 'summary' for reasoning,
 * and uses 'map' to lookup element details when executing actions.
 */
export interface ScrapterDOMState {
  rootId: string;
  summary: string; // The formatted text prompt for the LLM
  map: Map<number, ScrapterElementNode>; // Fast lookup: ID -> Element Data

  // Metadata
  tabId: number;
  url: string;
  title: string;
  screenshot?: string | null; // Base64

  // Scroll metrics
  scrollY: number;
  scrollHeight: number;
  visualViewportHeight: number;
}

/**
 * Alias for ScrapterDOMState to support legacy code
 */
export type DOMState = ScrapterDOMState;

/**
 * Default empty state to prevent null crashes
 */
export const EMPTY_DOM_STATE: ScrapterDOMState = {
  rootId: '0',
  summary: 'Page not loaded.',
  map: new Map(),
  tabId: 0,
  url: '',
  title: '',
  scrollY: 0,
  scrollHeight: 0,
  visualViewportHeight: 0
};

// Configuration defaults for the browser context
export const DEFAULT_BROWSER_CONTEXT_CONFIG = {
  minimumWaitPageLoadTime: 0.5,
  waitForNetworkIdlePageLoadTime: 1.0,
  maximumWaitPageLoadTime: 10.0,
  waitBetweenActions: 1.0,
  browserWindowSize: { width: 1280, height: 800 },
  viewportExpansion: 500, // Look a bit above/below viewport
  allowedUrls: [] as string[],
  deniedUrls: [] as string[],
  displayHighlights: true,
  homePageUrl: 'about:blank',
  includeDynamicAttributes: true,
};

export type BrowserContextConfig = typeof DEFAULT_BROWSER_CONTEXT_CONFIG;
export type TabInfo = { id: number; url: string; title: string };