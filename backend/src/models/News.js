import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  // --- RAW RSS DATA ---
  title: { type: String, required: true },
  originalUrl: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  publishDate: { type: Date, required: true },
  rawContent: { type: String }, 
  
  // --- AI ANALYSIS DATA ---
  isAnalyzed: { type: Boolean, default: false },
  aiSummary: { type: String },
  confidenceScore: { type: Number, min: 0, max: 100 },
  importance: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
  positiveStocks: [{ type: String }], 
  negativeStocks: [{ type: String }],
  affectedSectors: [{ type: String }], 
  countries: [{ type: String }],
  themes: [{ type: String }], 
  reason: { type: String } 
}, { 
  timestamps: true 
});

// --- INDEXES FOR QUERY PERFORMANCE ---
newsSchema.index({ publishDate: -1 });
newsSchema.index({ originalUrl: 1 });
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

// Explicitly define and export the model to prevent ESM import errors
const News = mongoose.model('News', newsSchema);
export default News;
