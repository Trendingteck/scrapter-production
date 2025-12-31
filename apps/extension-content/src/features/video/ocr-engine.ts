import Tesseract from 'tesseract.js';

export interface BoundingBox {
    text: string;
    confidence: number;
    // Normalized coordinates (0 to 1) relative to the video element
    box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
    translatedText?: string;
}

/**
 * Captures the current frame from a video element and runs local OCR.
 */
export async function runLocalOCR(video: HTMLVideoElement): Promise<BoundingBox[]> {
    if (!video.videoWidth || !video.videoHeight) return [];

    // 1. Capture Frame to Off-screen Canvas
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error("Could not create canvas context");

    // Draw the current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Run Tesseract (Fast Mode)
    // We use the data URL from the canvas
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    const result = await Tesseract.recognize(
        dataUrl,
        'eng',
        {
            logger: m => console.debug('[Tesseract]', m) // Optional logging
        }
    );

    // 3. Map results to Normalized Bounding Boxes
    // Tesseract gives absolute pixels (x, y, w, h). We need normalized (0-1) for the UI overlay.
    const width = video.videoWidth;
    const height = video.videoHeight;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result.data as any).words.map((w: any) => {
        const { x0, y0, x1, y1 } = w.bbox;
        return {
            text: w.text,
            confidence: w.confidence,
            box_2d: [
                y0 / height, // ymin
                x0 / width,  // xmin
                y1 / height, // ymax
                x1 / width   // xmax
            ]
        };
    });
}