```javascript
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // The user who receives this notification
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // The specific Alert Rule that triggered this notification
  alertId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Alert' 
  },
  
  // Notification headline
  title: { 
    type: String, 
    required: true 
  },
  
  // Detailed explanation of why it was triggered
  message: { 
    type: String, 
    required: true 
  },
  
  // Link to the specific news article that caused the trigger (for deep linking)
  relatedArticleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'News' 
  },
  
  // Urgency level (Used to style the badge in the UI)
  type: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 
    default: 'LOW' 
  },
  
  // Read state to control the red notification dot in the UI
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// Indexes for fast querying (e.g., fetching a user's unread notifications instantly)
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);

```
