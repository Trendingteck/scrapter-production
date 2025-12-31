import { ScrapterElementNode, ScrapterDOMState } from '../views';
import { DOMHistoryElement, HashedDomElement } from './view';

/**
 * Convert a DOM element to a history element
 */
export function convertDomElementToHistoryElement(domElement: ScrapterElementNode): DOMHistoryElement {
  return new DOMHistoryElement(
    domElement.tagName ?? '',
    domElement.xpath ?? '',
    domElement.highlightIndex ?? null,
    [], // Parent branch path not easily available in flattened tree
    domElement.attributes,
    false, // shadowRoot
    '', // cssSelector
    null, // pageCoordinates
    null, // viewportCoordinates
    domElement.viewport ? { width: domElement.viewport.width, height: domElement.viewport.height } : null,
  );
}

/**
 * Find a history element in the DOM tree
 */
export async function findHistoryElementInTree(
  domHistoryElement: DOMHistoryElement,
  state: ScrapterDOMState,
): Promise<ScrapterElementNode | null> {
  // 1. Try direct lookup if index exists
  if (domHistoryElement.highlightIndex !== null) {
    const node = state.map.get(domHistoryElement.highlightIndex);
    if (node) return node;
  }

  // 2. Fallback to hashing if index changed
  const hashedDomHistoryElement = await hashDomHistoryElement(domHistoryElement);

  for (const node of state.map.values()) {
    const hashedNode = await hashScrapterElement(node);
    if (
      hashedNode.attributesHash === hashedDomHistoryElement.attributesHash &&
      hashedNode.xpathHash === hashedDomHistoryElement.xpathHash
    ) {
      return node;
    }
  }

  return null;
}

/**
 * Hash a DOM history element
 */
async function hashDomHistoryElement(domHistoryElement: DOMHistoryElement): Promise<HashedDomElement> {
  const [attributesHash, xpathHash] = await Promise.all([
    _attributesHash(domHistoryElement.attributes),
    _xpathHash(domHistoryElement.xpath ?? ''),
  ]);
  return new HashedDomElement('', attributesHash, xpathHash);
}

/**
 * Hash a Scrapter element
 */
export async function hashScrapterElement(domElement: ScrapterElementNode): Promise<HashedDomElement> {
  const [attributesHash, xpathHash] = await Promise.all([
    _attributesHash(domElement.attributes),
    _xpathHash(domElement.xpath ?? ''),
  ]);
  return new HashedDomElement('', attributesHash, xpathHash);
}

/**
 * Create a hash from the element attributes
 */
async function _attributesHash(attributes: Record<string, string>): Promise<string> {
  const attributesString = Object.entries(attributes)
    .sort() // Ensure deterministic order
    .map(([key, value]) => `${key}=${value}`)
    .join('|');
  return _createSHA256Hash(attributesString);
}

/**
 * Create a hash from the element xpath
 */
async function _xpathHash(xpath: string): Promise<string> {
  return _createSHA256Hash(xpath);
}

/**
 * Create a SHA-256 hash from a string using Web Crypto API
 */
async function _createSHA256Hash(input: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return input; // Fallback if not in secure context
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * HistoryTreeProcessor namespace
 */
export const HistoryTreeProcessor = {
  convertDomElementToHistoryElement,
  findHistoryElementInTree,
  hashScrapterElement,
};
