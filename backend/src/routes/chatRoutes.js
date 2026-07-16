```javascript
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import News from '../models/News.js';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are the TRACK AI Market Assistant, a highly advanced quantitative analyst.
Your goal is to answer user queries about the Indian Stock Market (NSE/BSE) based strictly on the recent news context provided.
Format your response clearly. Use bullet points for readability.
If mentioning a stock ticker, wrap it in brackets like [RELIANCE] or [TCS].
Always end your response with a "Confidence Score" (0-100%) based on the reliability of the data.
`;

router.post('/ask', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1. RAG Retrieval Phase: Search MongoDB for relevant recent news
    // This utilizes the Text Index we set up in the News.js model
    const relevantNews = await News.find(
      { $text: { $search: message }, isAnalyzed: true }
    )
    .limit(5)
    .select('title aiSummary positiveStocks negativeStocks importance');

    // 2. Convert DB results into a context string
    let contextStr = "RECENT RELEVANT PLATFORM DATA:\n";
    if (relevantNews.length === 0) {
      contextStr += "No highly relevant recent news found in the database. Use general market knowledge cautiously.\n";
    } else {
      relevantNews.forEach(news => {
        contextStr += `- News: ${news.title}\n  Summary: ${news.aiSummary}\n  Positive Impact: ${news.positiveStocks.join(', ')}\n  Negative Impact: ${news.negativeStocks.join(', ')}\n\n`;
      });
    }

    // 3. Generation Phase: Send prompt + context to Gemini
    // Using gemini-1.5-pro or flash depending on your preference for speed vs complex reasoning
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    
    const finalPrompt = `
      User Query: "${message}"
      
      ${contextStr}
      
      Based ONLY on the provided platform data and your internal financial logic, answer the user's query.
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
      systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { temperature: 0.2 } // Low temperature for factual, analytical responses
    });

    const aiResponse = result.response.text();

    // 4. Return the AI's response along with the sources it used
    res.json({
      reply: aiResponse,
      sources: relevantNews.map(n => n.title) 
    });

  } catch (error) {
    console.error("[Chat API Error]:", error);
    res.status(500).json({ error: "Failed to process AI query. Please try again." });
  }
});

export default router;


```
