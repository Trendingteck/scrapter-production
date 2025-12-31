import { initVideoObserver } from './features/video/observer';
import { runImageExtractor } from './features/images/extractor';
import { enableImagePicker, disableImagePicker } from './features/images/picker';
import { ExtensionMessage } from './types';
import { findAndInjectCaptcha } from './features/captcha/detector';

export const initCaptchaFeature = () => {
    // Run on load
    findAndInjectCaptcha();

    // Run on DOM mutations (for SPAs)
    let timeout: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = setTimeout(findAndInjectCaptcha, 1000); // Debounce
    });

    observer.observe(document.body, { childList: true, subtree: true });
};

console.log('[Scrapter] Content Script Active');

// 1. Initialize Passive Features (Observers)
// These run automatically to detect videos and captchas as the user browses
initVideoObserver();
initCaptchaFeature();

// 2. Message Router
// Handles on-demand commands from the Sidepanel or Background
chrome.runtime.onMessage.addListener((request: ExtensionMessage, sender, sendResponse) => {

    switch (request.type) {
        // --- Image Features ---
        case 'EXTRACT_IMAGES':
            runImageExtractor()
                .then(images => {
                    chrome.runtime.sendMessage({ type: 'IMAGES_EXTRACTED', images });
                })
                .catch(err => console.error("Extraction failed", err));
            break;

        case 'ENABLE_PICKER':
            enableImagePicker();
            break;

        case 'DISABLE_PICKER':
            disableImagePicker();
            break;

        // --- Future Features can go here ---
    }

    // Return true to indicate async response if needed (standard Chrome behavior)
    return true;
});