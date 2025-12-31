import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

// Keep SolveButton logic internal to avoid resolving issues
interface SolveButtonProps {
    image: HTMLElement;
    input: HTMLInputElement;
}

const SolveButton: React.FC<SolveButtonProps> = ({ image, input }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'solving' | 'success' | 'error'>('idle');

    const handleSolve = async () => {
        setLoading(true);
        setStatus('solving');
        try {
            // Calculate coordinates relative to viewport for the screenshot
            const rect = image.getBoundingClientRect();
            const coordinates = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                pixelRatio: window.devicePixelRatio
            };

            // Send message to background to capture and solve
            const response = await chrome.runtime.sendMessage({
                type: 'SOLVE_CAPTCHA',
                coordinates
            });

            if (response && response.success && response.text) {
                // Simulate typing
                simulateTyping(input, response.text);
                setStatus('success');
            } else {
                console.error("Captcha solve failed", response?.error);
                setStatus('error');
            }
        } catch (error) {
            console.error("Captcha solve error", error);
            setStatus('error');
        } finally {
            setLoading(false);
            // Reset status after a delay
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <button
            onClick={handleSolve}
            disabled={loading}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: status === 'error' ? '#EF4444' : status === 'success' ? '#10B981' : '#EAB308',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                opacity: loading ? 0.8 : 1
            }}
        >
            {loading ? (
                <>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                    <span>Solving...</span>
                </>
            ) : status === 'success' ? (
                <span>✓ Solved</span>
            ) : status === 'error' ? (
                <span>⚠ Retry</span>
            ) : (
                <>
                    <span>✨</span>
                    <span>Solve</span>
                </>
            )}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </button>
    );
};

// Simulate human-like typing
function simulateTyping(input: HTMLInputElement, text: string) {
    input.focus();
    input.value = text;

    // Dispatch events to trigger framework bindings (React, Angular, etc.)
    const events = ['input', 'change', 'blur'];
    events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        input.dispatchEvent(event);
    });
}

// Configuration
const KEYWORDS = ['captcha', 'security', 'challenge', 'verify', 'code'];
const PROCESSED_ATTR = 'data-scrapter-captcha-id';

/**
 * Calculates Euclidean distance between two elements
 */
function getDistance(rect1: DOMRect, rect2: DOMRect) {
    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Mounts the React component next to the input
 */
function injectSolverUI(image: HTMLElement, input: HTMLInputElement) {
    // Avoid double injection
    if (image.hasAttribute(PROCESSED_ATTR)) return;
    const id = Math.random().toString(36).substr(2, 9);
    image.setAttribute(PROCESSED_ATTR, id);

    // Create a container positioned absolutely
    const container = document.createElement('div');
    const inputRect = input.getBoundingClientRect();

    // Position it slightly to the right of the input inside the input box
    container.style.position = 'absolute';
    container.style.top = `${window.scrollY + inputRect.top + (inputRect.height / 2) - 14}px`; // Center vertically approx
    container.style.left = `${window.scrollX + inputRect.right - 80}px`; // Inside right edge
    container.style.zIndex = '99999';

    document.body.appendChild(container);

    // Shadow DOM to protect styles
    const shadow = container.attachShadow({ mode: 'open' });

    const styleTag = document.createElement('style');
    styleTag.textContent = `
      /* Minimal reset for the button inside shadow DOM */
      :host { display: block; }
      * { box-sizing: border-box; font-family: sans-serif; }
    `;
    shadow.appendChild(styleTag);

    // Create Root and Render
    const root = createRoot(shadow);
    root.render(<SolveButton image={image} input={input} />);

    // Update position on scroll/resize
    const updatePos = () => {
        const rect = input.getBoundingClientRect();
        if (rect.width === 0) return; // Hidden
        container.style.top = `${window.scrollY + rect.top + (rect.height / 2) - 14}px`;
        container.style.left = `${window.scrollX + rect.right - 80}px`;
    };

    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
}

/**
 * Main Scanning Function
 */
export const findAndInjectCaptcha = () => {
    // 1. Find Images that look like Captchas
    const images = Array.from(document.querySelectorAll('img, canvas')) as HTMLElement[];
    const inputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])')) as HTMLInputElement[];

    images.forEach(img => {
        // Heuristic 1: Keywords in attributes
        const attrStr = (img.id + img.className + (img.getAttribute('alt') || '') + (img.getAttribute('src') || '')).toLowerCase();
        const isCaptcha = KEYWORDS.some(k => attrStr.includes(k));

        // Heuristic 2: Dimensions (Small but wide)
        const rect = img.getBoundingClientRect();
        const isRightSize = rect.width > 60 && rect.width < 300 && rect.height > 20 && rect.height < 150;

        if (isCaptcha || isRightSize) {
            // Find the closest input
            let bestInput: HTMLInputElement | null = null;
            let minDistance = 150; // Max pixels away

            inputs.forEach(input => {
                const inputRect = input.getBoundingClientRect();
                const dist = getDistance(rect, inputRect);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestInput = input;
                }
            });

            if (bestInput) {
                console.log('[Scrapter] Captcha pair found', img, bestInput);
                injectSolverUI(img, bestInput);
            }
        }
    });
};