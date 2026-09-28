import { GoogleGenerativeAI } from "@google/generative-ai";

interface SummaryOptions {
  maxLength?: number;
}

export class GeminiService {
  private model: any;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_API_KEY || '';
    if (this.apiKey) {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

  async summarizeEmail(body: string, options: SummaryOptions = {}): Promise<string> {
    // If no API key, use fallback truncation
    if (!this.apiKey) {
      return this.truncateSummary(body, options.maxLength ?? 100);
    }

    try {
      const prompt = `Please provide a concise summary of the following email in 2-3 sentences. Focus on the key points and action items if any:\n\n${body}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the text and ensure it's not too long
      return this.cleanSummary(text, options.maxLength);
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to truncation on error
      return this.truncateSummary(body, options.maxLength ?? 100);
    }
  }

  private truncateSummary(body: string, maxLength: number): string {
    // Remove HTML tags if present
    const cleanBody = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    
    // Truncate to maxLength and add ellipsis if needed
    if (cleanBody.length <= maxLength) {
      return cleanBody;
    }
    
    return cleanBody.substring(0, maxLength).trim() + '...';
  }

  private cleanSummary(text: string, maxLength?: number): string {
    // Remove extra whitespace
    let clean = text.replace(/\s+/g, ' ').trim();
    
    // If maxLength is specified, truncate
    if (maxLength && clean.length > maxLength) {
      clean = clean.substring(0, maxLength).trim() + '...';
    }
    
    return clean;
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();
