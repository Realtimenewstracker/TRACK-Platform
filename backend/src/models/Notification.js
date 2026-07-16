import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  alertId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Alert' 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  relatedArticleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'News' 
  },
  type: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 
    default: 'LOW' 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// Explicitly define and export to prevent ESM import errors
const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
