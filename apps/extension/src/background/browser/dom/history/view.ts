export interface CoordinateSet {
  x: number;
  y: number;
}

export interface ViewportInfo {
  width: number;
  height: number;
}

/**
 * Represents a historical element for tracking across page changes.
 * Consumed by history/service.ts and BrowserStateHistory.
 */
export class DOMHistoryElement {
  constructor(
    public tagName: string,
    public xpath: string,
    public highlightIndex: number | null,
    public entireParentBranchPath: string[],
    public attributes: Record<string, string>,
    public shadowRoot: boolean = false,
    public cssSelector?: string,
    public pageCoordinates?: CoordinateSet | null,
    public viewportCoordinates?: CoordinateSet | null,
    public viewportInfo?: ViewportInfo | null,
  ) { }
}

/**
 * Helper for hashed element identification
 */
export class HashedDomElement {
  constructor(
    public branchPathHash: string,
    public attributesHash: string,
    public xpathHash: string,
  ) { }
}