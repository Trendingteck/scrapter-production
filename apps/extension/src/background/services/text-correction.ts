import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

export class TextCorrectionService {
  private model: ChatGoogleGenerativeAI;

  constructor(apiKey: string) {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0,
    });
  }

  /**
   * Combined Correction + Translation Logic
   * If targetLanguage is provided, it corrects AND translates in one go.
   * If not, it just corrects.
   */
  async processText(texts: string[], targetLanguage?: string): Promise<string[]> {
    const action = targetLanguage 
      ? `Correct any OCR errors and then TRANSLATE to ${targetLanguage}.`
      : `Correct any OCR errors (typos, '1' vs 'l', broken code).`;

    const prompt = `
      You are an expert Video OCR post-processor.
      
      Input: A JSON array of raw text strings extracted from a video.
      Task: ${action}
      
      Rules:
      1. If the text looks like Programming Code, DO NOT translate commands/syntax, only comments.
      2. If the text is a UI element (Run, Stop, File), use appropriate technical terminology.
      3. Return ONLY a valid JSON string array. Maintain exact order.
      
      Input Array: ${JSON.stringify(texts)}
    `;

    try {
      const response = await this.model.invoke([new HumanMessage(prompt)]);
      const cleanJson = response.content.toString()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("AI Processing failed:", e);
      // Fallback: If AI fails, return original text so the UI doesn't break
      return texts; 
    }
  }
}