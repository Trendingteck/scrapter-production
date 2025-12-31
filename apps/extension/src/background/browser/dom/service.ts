import { createLogger } from '@src/background/log';
import type { 
  BuildDomTreeArgs, 
  ScrapterElementNode, 
  ScrapterDOMState 
} from './views';
import { isNewTabPage } from '../util';

const logger = createLogger('DOMService');

// Define the raw shape coming from the window execution
interface RawScrapterResult {
  rootId: string;
  summary: string;
  map: Record<string, Omit<ScrapterElementNode, 'highlightIndex'> & { highlightIndex?: number }>;
}

declare global {
  interface Window {
    buildDomTree: (args: BuildDomTreeArgs) => RawScrapterResult;
    turn2Markdown: (selector?: string) => string;
  }
}

/**
 * Inject the processor script if not present
 */
export async function injectBuildDomTreeScripts(tabId: number) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => typeof window.buildDomTree === 'function',
    });

    if (results[0]?.result) return; // Already injected

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['buildDomTree.js'],
    });
    logger.debug(`Injected buildDomTree.js into tab ${tabId}`);
  } catch (err) {
    logger.warning(`Failed to inject script into tab ${tabId}:`, err);
  }
}

/**
 * Executes the DOM processing in the browser context
 */
export async function getClickableElements(
  tabId: number,
  url: string,
  showHighlightElements = true,
  focusElement = -1,
  viewportExpansion = 0,
  debugMode = false,
): Promise<Partial<ScrapterDOMState>> {
  
  // Fast exit for utility pages
  if (isNewTabPage(url) || url.startsWith('chrome://')) {
    return { summary: 'Browser System Page', map: new Map() };
  }

  await injectBuildDomTreeScripts(tabId);

  try {
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId },
      func: (args) => window.buildDomTree(args),
      args: [{
        showHighlightElements,
        focusHighlightIndex: focusElement,
        viewportExpansion,
        debugMode
      }]
    });

    const result = injectionResults[0]?.result as RawScrapterResult;

    if (!result || !result.map) {
      throw new Error('Invalid response from DOM processor');
    }

    // Convert Record<string, Node> to Map<number, Node> for efficient TS usage
    const selectorMap = new Map<number, ScrapterElementNode>();

    Object.entries(result.map).forEach(([key, rawNode]) => {
      // Ensure highlightIndex exists
      const index = rawNode.highlightIndex ?? parseInt(key);
      
      if (!isNaN(index)) {
        selectorMap.set(index, {
          ...rawNode,
          highlightIndex: index
        });
      }
    });

    return {
      rootId: result.rootId,
      summary: result.summary,
      map: selectorMap
    };

  } catch (error) {
    logger.error('Error executing buildDomTree:', error);
    return { summary: `Error analyzing page: ${String(error)}`, map: new Map() };
  }
}

export async function removeHighlights(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const overlay = document.getElementById('scrapter-highlight-overlay');
        if (overlay) overlay.remove();
      },
    });
  } catch (e) {
    // Ignore errors on closed tabs
  }
}

export async function getScrollInfo(tabId: number): Promise<[number, number, number]> {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({
      scrollY: window.scrollY,
      viewportHeight: window.visualViewport?.height || window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight
    })
  });

  const data = result[0]?.result;
  return data 
    ? [data.scrollY, data.viewportHeight, data.scrollHeight] 
    : [0, 0, 0];
}