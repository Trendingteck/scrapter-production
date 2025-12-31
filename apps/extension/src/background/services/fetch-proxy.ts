import { createLogger } from '../log';

const logger = createLogger('FetchProxy');

export interface FetchResult {
  success: boolean;
  data?: string; // Base64 Data URL
  error?: string;
}

/**
 * Fetches a URL and converts it to a Base64 Data URL.
 * Runs in background context to bypass CORS restrictions present in content scripts.
 */
export async function fetchImageAsBase64(url: string): Promise<FetchResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const base64Data = await blobToBase64(blob);

    return {
      success: true,
      data: base64Data
    };

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error('Fetch Proxy Error:', msg, { url });
    return { success: false, error: msg };
  }
}

/**
 * Helper to convert Blob to Base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to convert blob to base64 string'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}