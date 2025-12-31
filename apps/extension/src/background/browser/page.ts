import 'webextension-polyfill';
import {
  connect,
  ExtensionTransport,
  type ProtocolType,
  type KeyInput,
} from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';
import type { Browser } from 'puppeteer-core/lib/esm/puppeteer/api/Browser.js';
import type { Page as PuppeteerPage } from 'puppeteer-core/lib/esm/puppeteer/api/Page.js';
import type { ElementHandle } from 'puppeteer-core/lib/esm/puppeteer/api/ElementHandle.js';

import {
  getClickableElements,
  removeHighlights,
  getScrollInfo,
} from './dom/service';

import {
  type ScrapterDOMState,
  type ScrapterElementNode,
  EMPTY_DOM_STATE,
  DEFAULT_BROWSER_CONTEXT_CONFIG,
  type BrowserContextConfig,
  type DOMState
} from './dom/views';

import { createLogger } from '@src/background/log';
import { isUrlAllowed } from './util';

const logger = createLogger('ScrapterPage');

export function build_initial_state(): ScrapterDOMState {
  return { ...EMPTY_DOM_STATE };
}

export default class Page {
  private _tabId: number;
  private _browser: Browser | null = null;
  private _puppeteerPage: PuppeteerPage | null = null;
  private _config: BrowserContextConfig;

  // The Monolithic State
  private _state: ScrapterDOMState;

  private _validWebPage = false;

  constructor(tabId: number, url: string, title: string, config: Partial<BrowserContextConfig> = {}) {
    this._tabId = tabId;
    this._config = { ...DEFAULT_BROWSER_CONTEXT_CONFIG, ...config };
    this._state = { ...EMPTY_DOM_STATE, tabId, url, title };

    const lowerCaseUrl = url.trim().toLowerCase();
    this._validWebPage = (
      !!tabId &&
      lowerCaseUrl.startsWith('http') &&
      !lowerCaseUrl.startsWith('https://chromewebstore.google.com')
    );
  }

  get tabId() { return this._tabId; }
  get state() { return this._state; }
  get attached() { return !!this._puppeteerPage; }

  // --- Connection Management ---

  async attachPuppeteer(): Promise<boolean> {
    if (!this._validWebPage || this._puppeteerPage) return !!this._puppeteerPage;

    logger.info(`Attaching Puppeteer to tab ${this._tabId}`);
    try {
      const browser = await connect({
        transport: await ExtensionTransport.connectTab(this._tabId),
        defaultViewport: null,
        protocol: 'cdp' as ProtocolType,
      });
      this._browser = browser;
      const [page] = await browser.pages();
      this._puppeteerPage = page;

      // Inject standard evasions
      await this._puppeteerPage.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });

      return true;
    } catch (e) {
      logger.error('Failed to attach Puppeteer', e);
      return false;
    }
  }

  async detachPuppeteer(): Promise<void> {
    if (this._browser) {
      await this._browser.disconnect();
      this._browser = null;
      this._puppeteerPage = null;
      this._state = { ...EMPTY_DOM_STATE, tabId: this._tabId };
    }
  }

  // --- State Synchronization ---

  async getState(useVision = false): Promise<ScrapterDOMState> {
    if (!this._validWebPage) return this._state;

    // 1. Wait for stability
    await this.waitForPageLoad();

    // 2. Clear previous highlights visually
    await this.removeHighlight();

    // 3. Inject & Run Processor
    const domResult = await getClickableElements(
      this._tabId,
      this.url(),
      this._config.displayHighlights || useVision,
      -1,
      this._config.viewportExpansion
    );

    // 4. Capture Vision (if enabled)
    const screenshot = useVision ? await this.takeScreenshot() : null;

    // 5. Get Scroll State
    const [scrollY, vHeight, scrollHeight] = await getScrollInfo(this._tabId);

    // 6. Update Internal State
    this._state = {
      ...this._state,
      rootId: domResult.rootId || '0',
      summary: domResult.summary || '',
      map: domResult.map || new Map(),
      url: this.url(),
      title: await this.title(),
      screenshot,
      scrollY,
      visualViewportHeight: vHeight,
      scrollHeight
    };

    return this._state;
  }

  async getCachedState(): Promise<ScrapterDOMState> {
    return this._state;
  }

  // --- Interaction Logic ---

  async locateElement(node: ScrapterElementNode): Promise<ElementHandle | null> {
    if (!this._puppeteerPage) throw new Error("Puppeteer not connected");

    if (node.xpath) {
      try {
        // Robust XPath selection
        const element = await this._puppeteerPage.$(`xpath/${node.xpath}`);
        if (element) {
          return element as ElementHandle;
        }
      } catch (e) {
        logger.warning(`Failed to locate via XPath: ${node.xpath}`, e);
      }
    }

    // Fallback: Try searching by unique attributes if XPath fails (optional)
    return null;
  }

  async clickElementNode(useVision: boolean, node: ScrapterElementNode): Promise<void> {
    const handle = await this.locateElement(node);
    if (!handle) throw new Error(`Element [${node.highlightIndex}] not found in DOM`);

    await this.scrollIntoView(handle);
    await handle.click();

    // Wait slightly for reactions
    await new Promise(r => setTimeout(r, 500));
  }

  async inputTextElementNode(useVision: boolean, node: ScrapterElementNode, text: string): Promise<void> {
    const handle = await this.locateElement(node);
    if (!handle) throw new Error(`Element [${node.highlightIndex}] not found`);

    await this.scrollIntoView(handle);

    // Clear and Type
    await handle.evaluate((el: any) => { el.value = ''; el.innerText = ''; });
    await handle.type(text, { delay: 50 });

    // Trigger events
    await handle.evaluate((el) => {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  async scrollIntoView(handle: ElementHandle) {
    try {
      await handle.scrollIntoView();
    } catch (e) {
      // Fallback
      await handle.evaluate(el => el.scrollIntoView({ block: 'center' }));
    }
  }

  // --- Utilities ---

  async takeScreenshot(): Promise<string> {
    if (!this._puppeteerPage) return '';
    return await this._puppeteerPage.screenshot({
      encoding: 'base64',
      type: 'jpeg',
      quality: 60,
      optimizeForSpeed: true
    }) as string;
  }

  url() {
    return this._puppeteerPage?.url() || this._state.url;
  }

  async title() {
    return this._puppeteerPage ? await this._puppeteerPage.title() : this._state.title;
  }

  async removeHighlight() {
    await removeHighlights(this._tabId);
  }

  async waitForPageLoad() {
    // Simple heuristic wait
    await new Promise(r => setTimeout(r, this._config.minimumWaitPageLoadTime * 1000));
  }

  // Direct Action Passthroughs
  async navigateTo(url: string) {
    if (!this._puppeteerPage) return;
    if (!isUrlAllowed(url, this._config.allowedUrls, this._config.deniedUrls)) throw new Error("URL Blocked");
    await this._puppeteerPage.goto(url);
  }

  async goBack() { await this._puppeteerPage?.goBack(); }

  async sendKeys(keys: string) {
    if (!this._puppeteerPage) return;
    // Basic mapping, can be expanded
    const k = keys.toLowerCase() === 'enter' ? 'Enter' : keys;
    await this._puppeteerPage.keyboard.press(k as KeyInput);
  }

  async scrollToPercent(percent: number) {
    if (!this._puppeteerPage) return;
    await this._puppeteerPage.evaluate((p) => {
      window.scrollTo({
        top: document.body.scrollHeight * (p / 100),
        behavior: 'smooth'
      });
    }, percent);
  }

  async scrollToText(text: string, occurrence = 1): Promise<boolean> {
    if (!this._puppeteerPage) return false;
    // Using Puppeteer's text selector engine
    const element = await this._puppeteerPage.$(`xpath///*[contains(text(), '${text}')]`);
    if (element) {
      await this.scrollIntoView(element as ElementHandle);
      return true;
    }
    return false;
  }
}