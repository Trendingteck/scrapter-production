import { mountOverlay } from './VideoOverlay';

const OBSERVED_VIDEOS = new WeakSet<HTMLVideoElement>();
let observer: MutationObserver | null = null;

const attachToVideo = (video: HTMLVideoElement) => {
    if (OBSERVED_VIDEOS.has(video)) return;
    
    // Filter out tiny videos (ads, previews)
    const rect = video.getBoundingClientRect();
    if (rect.width < 150 || rect.height < 150) return;

    OBSERVED_VIDEOS.add(video);

    // Ensure parent is positioned so our absolute overlay sits correctly
    const parent = video.parentElement;
    if (parent) {
        const style = window.getComputedStyle(parent);
        if (style.position === 'static') {
            parent.style.position = 'relative';
        }
        
        // Create container for React Root
        const container = document.createElement('div');
        container.className = 'scrapter-video-overlay-root';
        container.style.position = 'absolute';
        container.style.inset = '0';
        container.style.zIndex = '2147483647'; // Max z-index
        container.style.pointerEvents = 'none'; // Default pass-through
        
        parent.appendChild(container);
        
        // Mount React
        mountOverlay(container, video);
    }
};

const scan = () => {
    document.querySelectorAll('video').forEach(attachToVideo);
};

export const initVideoObserver = () => {
    scan();
    observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
};