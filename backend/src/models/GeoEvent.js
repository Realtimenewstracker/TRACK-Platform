import mongoose from 'mongoose';

const geoEventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['CRISIS', 'POLICY', 'TRADE', 'GROWTH'], 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  coordinates: {
    x: { type: Number, required: true }, 
    y: { type: Number, required: true }  
  },
  impact: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  aiAnalysis: {
    summary: String,
    confidence: Number,
    sectors: [{ type: String }],
    positiveStocks: [{ type: String }],
    negativeStocks: [{ type: String }],
    logic: String
  }
}, { 
  timestamps: true 
});

geoEventSchema.index({ isActive: 1 });

// Explicitly define and export to prevent ESM import errors
const GeoEvent = mongoose.model('GeoEvent', geoEventSchema);
export default GeoEvent;
