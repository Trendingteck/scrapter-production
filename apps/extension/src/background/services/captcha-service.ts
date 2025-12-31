import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { createLogger } from "../log";

const logger = createLogger('CaptchaService');

interface Coordinates {
    x: number;
    y: number;
    width: number;
    height: number;
    pixelRatio: number;
}

export class CaptchaService {
    private model: ChatGoogleGenerativeAI;

    constructor(apiKey: string) {
        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash", // Vision capable
            apiKey: apiKey,
            temperature: 0,
        });
    }

    async solve(screenshotDataUrl: string, coords: Coordinates): Promise<string> {
        try {
            // 1. Crop
            const croppedBase64 = await this.cropImage(screenshotDataUrl, coords);

            // 2. Prepare Prompt
            const message = new HumanMessage({
                content: [
                    {
                        type: "text",
                        text: "This is a captcha image. Output ONLY the text or characters found in the image. Do not include any explanation.",
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: croppedBase64,
                        },
                    },
                ],
            });

            // 3. Call AI
            const response = await this.model.invoke([message]);
            const text = response.content.toString().trim();

            logger.info('Captcha Solved:', text);
            return text;

        } catch (error) {
            logger.error('Captcha Solve Failed:', error);
            throw error;
        }
    }

    private async cropImage(dataUrl: string, rect: Coordinates): Promise<string> {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);

        // Adjust for pixel density if screen capturer returns physical pixels (captureVisibleTab usually does)
        // captureVisibleTab returns image at device pixel ratio resolution usually.
        // Rect from boundingClientRect is logical pixels.
        // We multiply rect by pixelRatio.

        const { x, y, width, height, pixelRatio } = rect;
        const sx = x * pixelRatio;
        const sy = y * pixelRatio;
        const sWidth = width * pixelRatio;
        const sHeight = height * pixelRatio;

        // Safety Check bounds
        if (sx < 0 || sy < 0 || sx + sWidth > bitmap.width || sy + sHeight > bitmap.height) {
            logger.warning('Crop bounds warning', { sx, sy, sWidth, sHeight, bmW: bitmap.width, bmH: bitmap.height });
        }

        const canvas = new OffscreenCanvas(sWidth, sHeight);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("No OffscreenCanvas context");

        ctx.drawImage(bitmap, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

        const croppedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(croppedBlob);
        });
    }
}
