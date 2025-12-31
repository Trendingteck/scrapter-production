import { ImageMetadata } from '../../types';

// Constants
const HOVER_BORDER_STYLE = '4px solid #ea5b08ff'; // Gold 500
const OVERLAY_ID = 'scrapter-image-picker-overlay';

let isPickerActive = false;
let hoveredElement: HTMLElement | null = null;
let originalOutline = '';

/**
 * Identifies if an element is a valid image target
 */
const getImageSource = (el: HTMLElement): string | null => {
    // 1. Standard Image
    if (el instanceof HTMLImageElement && el.src) {
        return el.src;
    }
    
    // 2. SVG
    if (el instanceof SVGElement) {
        try {
            const svgString = new XMLSerializer().serializeToString(el);
            return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
        } catch { return null; }
    }

    // 3. Background Image
    const style = window.getComputedStyle(el);
    const bgImage = style.backgroundImage;
    if (bgImage && bgImage !== 'none' && bgImage.startsWith('url(')) {
        return bgImage.slice(4, -1).replace(/["']/g, "");
    }

    return null;
};

/**
 * Mouse Move Handler: Highlights valid targets
 */
const handleMouseMove = (e: MouseEvent) => {
    if (!isPickerActive) return;

    const target = e.target as HTMLElement;
    
    // Optimization: Don't re-process if we are on the same element
    if (hoveredElement === target) return;

    // Cleanup previous highlight
    if (hoveredElement) {
        hoveredElement.style.outline = originalOutline;
        hoveredElement.style.cursor = '';
    }

    const imgSrc = getImageSource(target);
    
    if (imgSrc) {
        hoveredElement = target;
        originalOutline = target.style.outline;
        
        target.style.outline = HOVER_BORDER_STYLE;
        target.style.outlineOffset = '-4px'; // Draw inside to avoid layout shift
        target.style.cursor = 'crosshair';
        
        // Optional: Show a tiny tooltip (implemented via simple title attribute for perf)
        target.title = `Scrapter: Select Image (${target.tagName})`;
    } else {
        hoveredElement = null;
    }
};

/**
 * Click Handler: Captures the image
 */
const handleClick = (e: MouseEvent) => {
    if (!isPickerActive || !hoveredElement) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const src = getImageSource(hoveredElement);

    if (src) {
        // Calculate dimensions
        const rect = hoveredElement.getBoundingClientRect();
        
        const metadata: ImageMetadata = {
            src: src,
            width: rect.width,
            height: rect.height,
            alt: hoveredElement.getAttribute('alt') || '',
            name: src.split('/').pop()?.split('?')[0] || 'selected-image',
            mimeType: 'image/unknown' // Basic default, receiver can sniff
        };

        // Send to Sidepanel
        chrome.runtime.sendMessage({
            type: 'IMAGE_PICKED',
            image: metadata
        });

        // Visual Feedback: Flash success color
        const oldOutline = hoveredElement.style.outline;
        hoveredElement.style.outline = '4px solid #22c55e'; // Green
        
        setTimeout(() => {
            disableImagePicker();
        }, 300);
    }
};

/**
 * Escape Key Handler: Cancel picking
 */
const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isPickerActive) {
        disableImagePicker();
    }
};

/**
 * Public: Enable the picking mode
 */
export const enableImagePicker = () => {
    if (isPickerActive) return;
    isPickerActive = true;
    
    // Add visual indicator for the user
    const banner = document.createElement('div');
    banner.id = OVERLAY_ID;
    Object.assign(banner.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '4px',
        backgroundColor: '#EAB308',
        zIndex: '2147483647',
        pointerEvents: 'none'
    });
    document.body.appendChild(banner);

    // Attach listeners with capture phase to override page events
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);
};

/**
 * Public: Disable the picking mode
 */
export const disableImagePicker = () => {
    isPickerActive = false;

    // Cleanup listeners
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('keydown', handleKeyDown, true);

    // Cleanup UI
    const banner = document.getElementById(OVERLAY_ID);
    if (banner) banner.remove();

    // Cleanup last highlighted element
    if (hoveredElement) {
        hoveredElement.style.outline = originalOutline;
        hoveredElement.style.cursor = '';
        hoveredElement = null;
    }
};