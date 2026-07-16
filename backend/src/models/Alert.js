```javascript
import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  // Link this alert to a specific user
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Name of the alert rule (e.g., "Oil Price Spike Watchdog")
  name: { 
    type: String, 
    required: true 
  },
  
  // The type of logic to evaluate
  type: { 
    type: String, 
    enum: ['STOCK_MENTION', 'MACRO_THEME', 'PORTFOLIO_RISK'], 
    required: true 
  },
  
  // If type is STOCK_MENTION, which tickers to watch (e.g., ["RELIANCE", "TCS"])
  targetTickers: [{ 
    type: String 
  }],
  
  // If type is MACRO_THEME, which theme to watch (e.g., "Crude Oil", "RBI Rates")
  targetTheme: { 
    type: String 
  },
  
  // Minimum severity level required to trigger the alert
  minImportance: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] 
  },
  
  // Toggle to turn the alert on or off without deleting it
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

// Index to quickly find active alerts when processing new articles
alertSchema.index({ isActive: 1 });
alertSchema.index({ userId: 1 });

export default mongoose.model('Alert', alertSchema);


```
