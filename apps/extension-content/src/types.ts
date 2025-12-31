export interface ImageMetadata {
  src: string;
  width: number;
  height: number;
  alt: string;
  name: string;
  mimeType: string;
  dataUrl?: string; // Optional, populated after proxy fetch
}

export interface VideoFrameData {
  imageUrl: string; // Base64
  timestamp: number;
  method: 'canvas' | 'screenshot';
}

export interface CaptchaRequest {
  type: 'SOLVE_CAPTCHA_REQUEST';
  payload: {
    x: number;
    y: number;
    width: number;
    height: number;
    pixelRatio: number;
  };
}

// Message payloads
export type ExtensionMessage = 
  | { type: 'EXTRACT_IMAGES' }
  | { type: 'IMAGES_EXTRACTED'; images: ImageMetadata[] }
  | { type: 'ENABLE_PICKER' }
  | { type: 'DISABLE_PICKER' }
  | { type: 'IMAGE_PICKED'; image: ImageMetadata }
  | { type: 'VIDEO_OCR_SCAN'; crop?: any }
  | { type: 'VIDEO_FRAME_CAPTURED'; data: VideoFrameData }
  | { type: 'CORRECT_OCR_TEXT'; texts: string[] }
  | { type: 'TRANSLATE_OCR_TEXT'; texts: string[] };