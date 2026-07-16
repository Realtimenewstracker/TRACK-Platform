import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import News from '../models/News.js';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Maine isko ek single line mein double quotes ke sath kar diya hai taaki koi error na aaye
const SYSTEM_PROMPT = "You are the TRACK AI Market Assistant, a highly advanced quantitative analyst. Your goal is to answer user queries about the Indian Stock Market (NSE/BSE) based strictly on the recent news context provided. Format your response clearly. Use bullet points for readability. If mentioning a stock ticker, wrap it in brackets like [RELIANCE] or [TCS]. Always end your response with a Confidence Score (0-100%) based on the reliability of the data.";

router.post('/ask', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const relevantNews = await News.find(
      { $text: { $search: message }, isAnalyzed: true }
    )
    .limit(5)
    .select('title aiSummary positiveStocks negativeStocks importance');

    let contextStr = "RECENT RELEVANT PLATFORM DATA:\n";
    if (relevantNews.length === 0) {
      contextStr += "No highly relevant recent news found in the database. Use general market knowledge cautiously.\n";
    } else {
      relevantNews.forEach(news => {
        contextStr += "- News: " + news.title + "\n  Summary: " + news.aiSummary + "\n  Positive Impact: " + news.positiveStocks.join(', ') + "\n  Negative Impact: " + news.negativeStocks.join(', ') + "\n\n";
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    
    const finalPrompt = "User Query: " + message + "\n\n" + contextStr + "\n\nBased ONLY on the provided platform data and your internal financial logic, answer the user's query.";

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
      systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { temperature: 0.2 }
    });

    const aiResponse = result.response.text();

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
