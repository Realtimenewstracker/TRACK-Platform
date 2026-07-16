import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// 1. Initialize Gemini API (Requires GEMINI_API_KEY in your .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Define the exact JSON structure we expect the AI to return
const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { 
      type: SchemaType.STRING, 
      description: "A concise 2-sentence summary of the news and its immediate implications." 
    },
    importance: { 
      type: SchemaType.STRING, 
      description: "Must be exactly one of: LOW, MEDIUM, HIGH, CRITICAL" 
    },
    confidenceScore: { 
      type: SchemaType.NUMBER, 
      description: "An integer from 0 to 100 representing AI confidence in this analysis." 
    },
    positiveStocks: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING },
      description: "Indian stock tickers (NSE/BSE) that will positively benefit. Empty array if none." 
    },
    negativeStocks: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING },
      description: "Indian stock tickers (NSE/BSE) that will be negatively impacted. Empty array if none." 
    },
    affectedSectors: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING },
      description: "Sectors like IT, Banking, Pharma, Energy, Logistics, etc." 
    },
    countries: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING },
      description: "Countries directly involved in the news event."
    },
    themes: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING },
      description: "Macro themes e.g., Rate Cuts, Inflation, Capex, War, Trade." 
    },
    reason: { 
      type: SchemaType.STRING, 
      description: "Detailed logical explanation of WHY the market and specific stocks will react this way." 
    }
  },
  required: [
    "summary", "importance", "confidenceScore", 
    "positiveStocks", "negativeStocks", "affectedSectors", "reason"
  ]
};

// 3. Configure the Gemini Model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
    temperature: 0.1, 
  }
});

// Cleaned up System Instruction without backticks
const SYSTEM_INSTRUCTION = "You are a Senior Quantitative Analyst and Indian Stock Market Expert at a top-tier hedge fund. Your job is to analyze global and domestic news articles and determine their direct impact on the Indian Stock Market (NSE/BSE). Identify specific companies, sectors, and macroeconomic themes. Provide a highly logical rationale for your decisions. If an event has no impact on Indian markets, set importance to LOW and leave stock arrays empty. Always output valid JSON that adheres to the requested schema.";

/**
 * Takes raw news text and sends it to Gemini for structured analysis.
 * @param {string} title - The headline of the article
 * @param {string} content - The body or summary of the article
 * @returns {Object} - The parsed JSON data adhering to the responseSchema
 */
export const analyzeNewsArticle = async (title, content) => {
  try {
    // Cleaned up prompt without backticks
    const prompt = "Analyze the following financial news event based on the system instructions.\n\nTITLE: " + title + "\nCONTENT: " + content;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { role: 'system', parts: [{ text: SYSTEM_INSTRUCTION }] }
    });

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);
    
    return parsedData;
  } catch (error) {
    console.error("[AI Service Error] Failed to analyze article via Gemini API:", error.message);
    throw error;
  }
};
