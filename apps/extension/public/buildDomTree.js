/**
 * Scrapter DOM Processor
 * A heuristic-based, flat-structure DOM analyzer for AI Agents.
 * Replaces the recursive tree walker with a layer-based approach.
 */
window.buildDomTree = (args = {
  showHighlightElements: true,
  focusHighlightIndex: -1,
  viewportExpansion: 0,
  debugMode: false,
}) => {
  const CONFIG = {
    // Interactive Elements Selector
    INTERACTIVE: [
      'a[href]', 'button', 'input', 'textarea', 'select', 'details', 'label[for]',
      '[tabindex]:not([tabindex="-1"])', '[onclick]',
      '[role="button"]', '[role="link"]', '[role="checkbox"]', '[role="switch"]',
      '[role="menuitem"]', '[role="option"]', '[role="combobox"]', '[role="textbox"]',
      '[aria-selected]', '[contenteditable="true"]', '.btn', '.button'
    ].join(','),

    // Semantic Containers (Cards, Rows, Items)
    CONTAINERS: [
      'article', 'li', 'tr', 'dt', 'dd',
      '[role="article"]', '[role="listitem"]', '[role="row"]', '[role="dialog"]',
      '.card', '.item', '.entry', '.product-item', '.result', '.g',
      '[data-semantics="card"]'
    ],

    // Layer Detection (Modals, Popups, Overlays)
    ZONES: [
      '[role="dialog"]', '[role="alertdialog"]', '.modal', '.popup', '.overlay',
      '[aria-modal="true"]', '.a-s-l' // .a-s-l is common for google overlays
    ],

    // Generic names that trigger "Fusion" with nearby text
    GENERIC_NAMES: [
      'icon', 'image', 'button', 'more', 'submit', 'menu', 'arrow',
      'chevron', 'search', 'save', 'send', 'filter', 'sort'
    ],

    // Colors for the Rainbow Overlay
    COLORS: ['#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#FFA500', '#00FFFF', '#FFFF00']
  };

  let idCounter = 0;
  let registry = {};
  let processedNodes = new Set();

  // --- 1. UTILS ---

  function cleanText(text) {
    if (!text) return '';
    return text.replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  function isRelevant(el) {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    if (style.display === 'none' || style.visibility === 'hidden') return false;

    // Opacity 0 Exception for specific inputs (file, checkbox, radio)
    if (style.opacity === '0') {
      if (el.tagName === 'INPUT' && (['checkbox', 'radio', 'file'].includes(el.type) || el.id)) return true;
      return false;
    }

    // Dimensions check (ignore tiny invisible elements unless they contain visible overflow)
    if (rect.width < 2 || rect.height < 2) {
      if (style.overflow !== 'hidden') return true;
      return false;
    }

    // Viewport Expansion check
    const expansion = args.viewportExpansion || 0;
    const viewportHeight = window.innerHeight;
    if (rect.bottom < -expansion || rect.top > viewportHeight + expansion) return false;

    return true;
  }

  function getZIndex(el) {
    const z = window.getComputedStyle(el).zIndex;
    return (z === 'auto' || isNaN(z)) ? 0 : parseInt(z);
  }

  function shortenUrl(url) {
    if (!url) return '';
    if (url.startsWith('data:')) return 'data:image...';
    if (url.length > 50) return url.substring(0, 25) + '...' + url.substring(url.length - 15);
    return url;
  }

  // --- 2. NAMING & STATE ---

  function getSmartName(el) {
    if (el.tagName === 'INPUT') {
      if (['button', 'submit', 'reset'].includes(el.type)) return el.value;
      if (['checkbox', 'radio'].includes(el.type)) return ''; // Wait for fusion with text
      return el.placeholder || el.value || '';
    }

    if (el.tagName === 'IMG' || el.getAttribute('role') === 'img') {
      let alt = cleanText(el.getAttribute('alt') || el.getAttribute('aria-label'));
      if (alt) return alt;
      const src = el.src || el.getAttribute('src');
      if (src && src.length < 100 && !src.startsWith('data:')) {
        const parts = src.split('/');
        const file = parts[parts.length - 1].split('?')[0].split('.')[0];
        if (file.length > 3 && !file.match(/^[a-f0-9\-_]+$/)) return `Img:${file}`;
      }
      return 'Image';
    }

    let text = cleanText(el.innerText || el.textContent);
    const aria = cleanText(el.getAttribute('aria-label') || el.getAttribute('title'));

    // Ghost Busting: If text is just a glyph or generic, prefer Aria
    const isGlyph = text.length < 3 && !text.match(/[a-zA-Z0-9]/);
    if ((!text || isGlyph || CONFIG.GENERIC_NAMES.some(g => text.toLowerCase().includes(g))) && aria) {
      return aria;
    }

    if (isGlyph) return 'Icon';
    return text;
  }

  function getXPath(el) {
    if (el.id) return `//*[@id="${el.id}"]`;
    const parts = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = el.previousSibling;
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === el.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      const tagName = el.tagName.toLowerCase();
      const pathPart = index > 1 ? `${tagName}[${index}]` : tagName;
      parts.unshift(pathPart);
      el = el.parentNode;
    }
    return parts.length ? `/${parts.join('/')}` : null;
  }

  function getStates(el) {
    let s = [];
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') s.push('[DISABLED]');
    if (el.required || el.getAttribute('aria-required') === 'true') s.push('[REQUIRED]');
    if (el.readOnly || el.getAttribute('aria-readonly') === 'true') s.push('[READONLY]');
    if (el.checked || el.getAttribute('aria-checked') === 'true') s.push('[CHECKED]');
    if (el.selected || el.getAttribute('aria-selected') === 'true') s.push('[SELECTED]');
    if (el.getAttribute('aria-expanded') === 'true') s.push('[EXPANDED]');

    if (el.tagName === 'INPUT') s.push(`[${el.type.toUpperCase()}]`);
    return s.join(' ');
  }

  // --- 3. FUSION ENGINE ---

  function fuseNodes(nodes) {
    if (nodes.length < 2) return nodes;
    const fused = [];
    let skipNext = false;

    for (let i = 0; i < nodes.length; i++) {
      if (skipNext) { skipNext = false; continue; }

      const curr = nodes[i];
      const next = (i + 1 < nodes.length) ? nodes[i + 1] : null;

      if (!next) { fused.push(curr); continue; }

      // Rule 1: Generic Interactive + Text -> Named Interactive
      if (curr.type === 'INT' && next.type === 'TEXT') {
        const isGeneric = !curr.name || curr.name === 'Icon' || curr.name === 'Image' || CONFIG.GENERIC_NAMES.includes(curr.name.toLowerCase());
        const isCheck = curr.tag === 'Checkbox' || curr.tag === 'Radio';

        if (isGeneric || isCheck) {
          curr.name = next.name; // Absorb text as name
          fused.push(curr);
          skipNext = true;
          continue;
        }
        // If interactive has name, append text if short
        if (next.name.length < 30) {
          curr.name = `${curr.name} | ${next.name}`;
          fused.push(curr);
          skipNext = true;
          continue;
        }
      }

      // Rule 2: Text + Input -> Named Input
      if (curr.type === 'TEXT' && next.type === 'INT') {
        if (['Input', 'Checkbox', 'Radio', 'Textarea'].includes(next.tag)) {
          if (!next.name) {
            next.name = curr.name;
            fused.push(next);
            skipNext = true;
            continue;
          }
        }
      }

      // Rule 3: Duplicate Icon Killer
      if (curr.type === 'INT' && next.type === 'INT') {
        if (curr.name === 'Icon' && next.name && next.name !== 'Icon') {
          // Current is useless icon, next is real button. Discard current.
          continue;
        }
      }

      fused.push(curr);
    }
    return fused;
  }

  // --- 4. MAIN PROCESSOR CLASS ---

  class ScrapterProcessor {
    process() {
      idCounter = 0;
      registry = {};
      processedNodes = new Set();

      const layers = this.identifyLayers();
      let outputText = "";

      // We also build a flat map for the backend to use
      let nodeMap = {};

      layers.forEach(layer => {
        outputText += this.renderLayer(layer);
      });

      this.drawOverlay();

      // Transform internal registry to serializable map for extension background
      for (const [id, data] of Object.entries(registry)) {
        if (data.type === 'INT') {
          nodeMap[id] = {
            tagName: data.el.tagName.toLowerCase(),
            highlightIndex: parseInt(id),
            attributes: {},
            xpath: data.xpath
          };
        }
      }

      return {
        rootId: '1', // Dummy ID for compatibility
        summary: outputText,
        map: nodeMap
      };
    }

    identifyLayers() {
      const layers = [];
      const allEls = document.querySelectorAll('*');

      allEls.forEach(el => {
        if (!isRelevant(el)) return;
        const style = window.getComputedStyle(el);

        const isZone = CONFIG.ZONES.some(s => el.matches(s));
        const isHighZ = (style.position === 'fixed' || style.position === 'absolute') && getZIndex(el) > 50;

        if (isZone || isHighZ) {
          if (!this.isInsideLayer(el, layers)) {
            layers.push({ root: el, name: this.getLayerName(el), z: getZIndex(el) });
            processedNodes.add(el);
          }
        }
      });
      layers.sort((a, b) => b.z - a.z);
      layers.push({ root: document.body, name: 'Main Page', z: 0 });
      return layers;
    }

    isInsideLayer(el, layers) {
      return layers.some(l => l.root.contains(el) && l.root !== el);
    }

    getLayerName(el) {
      if (el === document.body) return 'Main Page';
      const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
      if (aria) return `Modal: ${cleanText(aria)}`;
      return 'Overlay/Dialog';
    }

    renderLayer(layer) {
      let out = `\n--- ${layer.name} ---\n`;
      if (layer.root.scrollHeight > layer.root.clientHeight + 10) out += `[SCROLLABLE]\n`;

      const children = this.scanContainer(layer.root);
      children.forEach(node => out += this.nodeToString(node, 0));
      return out;
    }

    scanContainer(container) {
      const nodes = [];
      // 1. Find Semantic Groups (Cards, List Items)
      const potentialGroups = container.querySelectorAll(CONFIG.CONTAINERS.join(','));

      potentialGroups.forEach(gEl => {
        if (!isRelevant(gEl) || processedNodes.has(gEl)) return;

        // Ensure group belongs to this layer/zone
        const closestZone = gEl.closest(CONFIG.ZONES.join(','));
        const containerZone = container.closest(CONFIG.ZONES.join(','));
        if (closestZone !== containerZone && container !== document.body) return;

        const t = cleanText(gEl.innerText);
        if (t.length < 2) return; // Empty card

        processedNodes.add(gEl);

        const rawChildren = this.scanContent(gEl);
        const fusedChildren = fuseNodes(rawChildren);

        if (fusedChildren.length > 0) {
          nodes.push({ id: null, type: 'GROUP', children: fusedChildren });
        }
      });

      // 2. Find Orphans
      const rawOrphans = this.scanContent(container, true);
      nodes.push(...fuseNodes(rawOrphans));
      return nodes;
    }

    scanContent(root, isOrphanScan = false) {
      const results = [];

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          if (processedNodes.has(node) && node !== root) return NodeFilter.FILTER_REJECT;

          if (node.nodeType === Node.ELEMENT_NODE) {
            if (isRelevant(node)) {
              if (isOrphanScan && node.matches(CONFIG.CONTAINERS.join(','))) return NodeFilter.FILTER_REJECT;
              if (CONFIG.ZONES.some(z => node.matches(z)) && node !== root) return NodeFilter.FILTER_REJECT;
              return NodeFilter.FILTER_ACCEPT;
            } else {
              const s = window.getComputedStyle(node);
              if (s.display === 'none' || s.visibility === 'hidden') return NodeFilter.FILTER_REJECT;
              return NodeFilter.FILTER_SKIP;
            }
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      let textBuffer = [];
      const flushText = () => {
        const combined = textBuffer.join(' | ');
        if (combined.length > 1) results.push({ type: 'TEXT', name: combined });
        textBuffer = [];
      };

      let currentNode;
      while (currentNode = walker.nextNode()) {
        if (currentNode === root) continue;

        if (currentNode.nodeType === Node.TEXT_NODE) {
          const t = cleanText(currentNode.textContent);
          if (t.length > 1) textBuffer.push(t);
        }
        else if (currentNode.matches(CONFIG.INTERACTIVE) || currentNode.tagName === 'IMG') {
          flushText();

          const id = ++idCounter;
          const name = getSmartName(currentNode);
          const states = getStates(currentNode);
          let tag = currentNode.tagName.toLowerCase();

          // Normalize tag names for the LLM
          if (tag === 'a') tag = 'Link';
          else if (tag === 'img') tag = 'Image';
          else if (tag === 'input') tag = 'Input';
          else if (currentNode.role === 'checkbox') tag = 'Checkbox';
          else tag = 'Button';

          if (currentNode.type === 'checkbox') tag = 'Checkbox';
          if (currentNode.type === 'radio') tag = 'Radio';
          if (currentNode.tagName === 'SELECT') tag = 'Select';

          let attrs = states;
          if (currentNode.href) attrs += ` (href: ${shortenUrl(currentNode.href)})`;

          results.push({ id, type: 'INT', tag, name, attrs });

          registry[id] = {
            el: currentNode,
            type: 'INT',
            box: currentNode.getBoundingClientRect(),
            xpath: getXPath(currentNode)
          };

          // Mark descendants processed
          const descendants = currentNode.querySelectorAll('*');
          descendants.forEach(d => processedNodes.add(d));
          processedNodes.add(currentNode);
        }
      }
      flushText();
      return results;
    }

    nodeToString(node, depth) {
      const indent = "  ".repeat(depth);
      if (node.type === 'GROUP') {
        let out = `\n${indent}-- Card --\n`;
        node.children.forEach(c => out += this.nodeToString(c, depth + 1));
        return out;
      }
      if (node.type === 'TEXT') return `${indent}${node.name}\n`;

      let line = `${indent}[${node.id}] ${node.tag}`;
      if (node.name) line += ` "${node.name}"`;
      if (node.attrs) line += ` ${node.attrs}`;
      return line + "\n";
    }

    drawOverlay() {
      const HIGHLIGHT_CONTAINER_ID = 'scrapter-highlight-overlay';
      const old = document.getElementById(HIGHLIGHT_CONTAINER_ID);
      if (old) old.remove();

      if (!args.showHighlightElements) return;

      const ov = document.createElement('div');
      ov.id = HIGHLIGHT_CONTAINER_ID;
      Object.assign(ov.style, { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2147483647, pointerEvents: 'none' });

      for (let id in registry) {
        const r = registry[id];
        if (r.type === 'TEXT') continue;

        // Skip highlighting if off-screen (double check) or box is tiny
        if (r.box.width < 5 || r.box.height < 5) continue;

        const c = CONFIG.COLORS[id % CONFIG.COLORS.length];
        const box = document.createElement('div');

        // Adjust for scroll in fixed overlay? 
        // No, getBoundingClientRect is relative to viewport, and overlay is fixed to viewport.

        Object.assign(box.style, {
          position: 'absolute',
          border: `2px solid ${c}`,
          left: r.box.left + 'px',
          top: r.box.top + 'px',
          width: r.box.width + 'px',
          height: r.box.height + 'px',
          backgroundColor: 'rgba(0,0,0,0.02)'
        });

        if (r.type === 'INT') {
          const tag = document.createElement('span');
          tag.innerText = id;
          Object.assign(tag.style, {
            position: 'absolute',
            top: '-16px',
            left: '-2px',
            background: c,
            color: 'black',
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '1px 4px',
            borderRadius: '2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
          });
          box.appendChild(tag);
        }
        ov.appendChild(box);
      }
      document.body.appendChild(ov);
    }
  }

  // Use a global instance so we can access it later if needed
  window.ScrapterProcessor = new ScrapterProcessor();
  return window.ScrapterProcessor.process();
};