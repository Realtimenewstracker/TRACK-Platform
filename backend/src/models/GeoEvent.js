```javascript
import mongoose from 'mongoose';

const geoEventSchema = new mongoose.Schema({
  // The headline/title of the geopolitical event
  title: { 
    type: String, 
    required: true 
  },
  
  // Categorization for styling the UI nodes (Red for CRISIS, Blue for POLICY, etc.)
  type: { 
    type: String, 
    enum: ['CRISIS', 'POLICY', 'TRADE', 'GROWTH'], 
    required: true 
  },
  
  // Text string of the location (e.g., "Red Sea / Suez")
  location: { 
    type: String, 
    required: true 
  },
  
  // Coordinates for plotting on the SVG map (Uses 0-100% relative positioning)
  coordinates: {
    x: { type: Number, required: true }, 
    y: { type: Number, required: true }  
  },
  
  // The severity of the event's market impact
  impact: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] 
  },
  
  // Whether this event is currently ongoing and should be shown on the map
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // The structured AI intelligence extracted by Gemini
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

// Index to quickly fetch only active events for the map API
geoEventSchema.index({ isActive: 1 });

export default mongoose.model('GeoEvent', geoEventSchema);


```
