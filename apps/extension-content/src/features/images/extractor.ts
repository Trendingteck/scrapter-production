import { ImageMetadata } from '../../types';

// Configuration constants
const MIN_IMAGE_WIDTH = 10;
const MIN_IMAGE_HEIGHT = 10;
const MAX_SCROLL_ATTEMPTS = 15;
const SCROLL_DELAY_MS = 400;

// Supported image extensions regex
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|tif|tiff|apng|jfif|pjpeg|pjp|avif)$/i;

// State tracking
const foundImageUrls = new Set<string>();
let isScanning = false;

/**
 * Helper: Recursively find elements including those inside Shadow DOMs
 */
const querySelectorAllShadows = (selector: string, root: ParentNode = document.body): Element[] => {
    if (!root) return [];

    // Get elements in current root
    const currentLevelElements = Array.from(root.querySelectorAll(selector));

    // Find all shadow hosts in current root
    const allElements = Array.from(root.querySelectorAll('*'));
    const shadowHosts = allElements.filter(el => el.shadowRoot);

    // Recursively check shadow roots
    const shadowElements = shadowHosts.flatMap(host => 
        querySelectorAllShadows(selector, host.shadowRoot!)
    );

    return [...currentLevelElements, ...shadowElements];
};

/**
 * Helper: Resolve relative URLs to absolute
 */
const resolveUrl = (url: string): string | null => {
    try {
        if (!url || url.startsWith('data:')) return url; // Return data URIs as is
        return new URL(url, window.location.href).href;
    } catch {
        return null;
    }
};

/**
 * Perform a single pass scan of the DOM
 */
const performScan = (): number => {
    let newCount = 0;

    const addUrl = (url: string | null) => {
        const absoluteUrl = url ? resolveUrl(url) : null;
        if (absoluteUrl && !foundImageUrls.has(absoluteUrl)) {
            foundImageUrls.add(absoluteUrl);
            newCount++;
        }
    };

    // 1. Scan standard IMG and SOURCE tags
    const images = querySelectorAllShadows('img, source') as Array<HTMLImageElement | HTMLSourceElement>;
    images.forEach(el => {
        if ('src' in el && el.src) addUrl(el.src);
        if ('currentSrc' in el && el.currentSrc) addUrl(el.currentSrc);
        if ('srcset' in el && el.srcset) {
            el.srcset.split(',').forEach(src => {
                const url = src.trim().split(/\s+/)[0];
                addUrl(url);
            });
        }
        
        // Check Lazy Loading Attributes
        ['data-src', 'data-original', 'data-lazy-src', 'data-bg'].forEach(attr => {
            addUrl(el.getAttribute(attr));
        });
    });

    // 2. Scan CSS Background Images
    const allElements = querySelectorAllShadows('*') as HTMLElement[];
    allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        
        if (bgImage && bgImage !== 'none') {
            const matches = bgImage.match(/url\(['"]?(.*?)['"]?\)/g);
            matches?.forEach(match => {
                const url = match.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
                addUrl(url);
            });
        }
    });

    // 3. Scan SVG elements (convert to Base64)
    const svgs = querySelectorAllShadows('svg') as SVGElement[];
    svgs.forEach(svg => {
        // Only grab SVGs that look like substantial images
        const rect = svg.getBoundingClientRect();
        if (rect.width > 20 && rect.height > 20) {
            try {
                const svgString = new XMLSerializer().serializeToString(svg);
                const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
                addUrl(base64);
            } catch (e) {
                // Ignore serialization errors
            }
        }
    });

    // 4. Scan Accessible Iframes (Same Origin)
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc) {
                // Recursive call could be implemented here, but simple query selector for now
                doc.querySelectorAll('img').forEach(img => addUrl(img.src));
            }
        } catch {
            // Blocked by Cross-Origin
        }
    });

    return newCount;
};

/**
 * Validates an image URL by loading it and checking dimensions
 */
const validateImage = (url: string): Promise<ImageMetadata | null> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            if (img.naturalWidth >= MIN_IMAGE_WIDTH && img.naturalHeight >= MIN_IMAGE_HEIGHT) {
                // Heuristic for naming
                let name = 'image';
                try {
                    if (!url.startsWith('data:')) {
                        const filename = new URL(url).pathname.split('/').pop();
                        name = filename || 'image';
                    }
                } catch {}

                resolve({
                    src: url,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    alt: '', // Contextual alt text could be fetched if we passed the element ref
                    name: name,
                    mimeType: url.startsWith('data:') ? url.split(';')[0].split(':')[1] : 'image/jpeg' // Fallback
                });
            } else {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
};

/**
 * Main Entry Point: Orchestrates scrolling, scanning, and validation
 */
export const runImageExtractor = async (): Promise<ImageMetadata[]> => {
    if (isScanning) throw new Error("Scan already in progress");
    isScanning = true;
    foundImageUrls.clear();

    // Notify UI scan started
    chrome.runtime.sendMessage({ type: 'IMAGE_SCAN_PROGRESS', status: 'started' });

    try {
        let scrollCount = 0;
        let lastScrollY = -1;
        let noNewCount = 0;

        // 1. Scroll & Scan Loop
        while (scrollCount < MAX_SCROLL_ATTEMPTS) {
            const newFound = performScan();
            
            // Notify UI of raw finding count
            chrome.runtime.sendMessage({ 
                type: 'IMAGE_SCAN_PROGRESS', 
                status: 'scanning', 
                count: foundImageUrls.size 
            });

            if (newFound === 0) noNewCount++;
            else noNewCount = 0;

            // Break if we are just scrolling and finding nothing new
            if (noNewCount >= 2) break;

            lastScrollY = window.scrollY;
            window.scrollBy(0, window.innerHeight * 0.8);
            await new Promise(r => setTimeout(r, SCROLL_DELAY_MS));

            // End of page check
            if (window.scrollY === lastScrollY) {
                // One final scan at the very bottom
                performScan();
                break;
            }
            scrollCount++;
        }

        // 2. Validation Phase
        const rawUrls = Array.from(foundImageUrls);
        chrome.runtime.sendMessage({ 
            type: 'IMAGE_SCAN_PROGRESS', 
            status: 'validating', 
            total: rawUrls.length 
        });

        const validationPromises = rawUrls.map(validateImage);
        const results = await Promise.all(validationPromises);
        
        const validImages = results.filter((img): img is ImageMetadata => img !== null);

        isScanning = false;
        return validImages;

    } catch (e) {
        isScanning = false;
        throw e;
    }
};