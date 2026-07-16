import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['STOCK_MENTION', 'MACRO_THEME', 'PORTFOLIO_RISK'], 
    required: true 
  },
  targetTickers: [{ 
    type: String 
  }],
  targetTheme: { 
    type: String 
  },
  minImportance: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

alertSchema.index({ isActive: 1 });
alertSchema.index({ userId: 1 });

// Explicitly define and export to prevent ESM import errors
const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
