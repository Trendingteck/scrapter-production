import { ScrapterElementNode, ScrapterDOMState } from '../views';
import { hashScrapterElement } from '../history/service';

/**
 * Get all clickable elements hashes in the current state
 */
export async function getClickableElementsHashes(state: ScrapterDOMState): Promise<Set<string>> {
  const clickableElements = Array.from(state.map.values());
  const hashPromises = clickableElements.map(element => hashScrapterElement(element));
  const hashedElements = await Promise.all(hashPromises);
  const hashes = hashedElements.map(h => `${h.attributesHash}-${h.xpathHash}`);
  return new Set(hashes);
}

/**
 * ClickableElementProcessor namespace for backward compatibility
 */
export const ClickableElementProcessor = {
  getClickableElementsHashes,
};
