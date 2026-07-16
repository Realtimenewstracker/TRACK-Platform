```javascript
import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  // --- RAW RSS DATA (Populated by Feature 1) ---
  title: { type: String, required: true },
  originalUrl: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  publishDate: { type: Date, required: true },
  rawContent: { type: String }, // Raw fetched text snippet from the RSS feed
  
  // --- AI ANALYSIS DATA (Populated by Feature 2) ---
  isAnalyzed: { type: Boolean, default: false },
  aiSummary: { type: String },
  confidenceScore: { type: Number, min: 0, max: 100 },
  importance: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
  positiveStocks: [{ type: String }], // Array of NSE/BSE tickers
  negativeStocks: [{ type: String }],
  affectedSectors: [{ type: String }], // e.g., ["IT", "Banking"]
  countries: [{ type: String }],
  themes: [{ type: String }], // e.g., ["Rate Cuts", "War"]
  reason: { type: String } // AI logical explanation
}, { 
  timestamps: true 
});

// --- INDEXES FOR QUERY PERFORMANCE ---

// 1. Chronological sorting for the Live News Feed
newsSchema.index({ publishDate: -1 });

// 2. Fast deduplication check during continuous RSS ingestion
newsSchema.index({ originalUrl: 1 });

// 3. Text search index for the RAG AI Chat (Feature 7 & 9)
// This allows the backend to instantly search for keywords when a user asks a question
newsSchema.index(
  { 
    title: 'text', 
    aiSummary: 'text', 
    affectedSectors: 'text', 
    themes: 'text' 
  },
  {
    name: "News_Text_Index",
    weights: {
      title: 10,
      themes: 5,
      affectedSectors: 5,
      aiSummary: 2
    }
  }
);

export default mongoose.model('News', newsSchema);

```
