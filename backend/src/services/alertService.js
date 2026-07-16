import Alert from '../models/Alert.js';
import Notification from '../models/Notification.js';
import { getIo } from '../server.js';

/**
 * Helper function to rank importance for threshold logic.
 * Allows us to evaluate rules like "Only alert me if impact is HIGH or greater".
 */
const getImportanceValue = (importance) => {
  const ranks = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
  return ranks[importance] || 0;
};

/**
 * Triggered by the aiQueue whenever a new article is fully analyzed.
 * Evaluates the enriched article against all active user alerts.
 * * @param {Object} analyzedArticle - The MongoDB document of the newly analyzed news
 */
export const evaluateNewsAlerts = async (analyzedArticle) => {
  try {
    // 1. Fetch all active alerts from the database
    // Note for scaling: In a production environment with 100k+ users, 
    // you would cache these rules in Redis to avoid hitting MongoDB on every news article.
    const activeAlerts = await Alert.find({ isActive: true });

    for (const alert of activeAlerts) {
      let isTriggered = false;
      let triggerReason = "";

      // --- LOGIC 1: Stock Specific Alert ---
      if (alert.type === 'STOCK_MENTION' && alert.targetTickers && alert.targetTickers.length > 0) {
        // Check if any of the user's watched tickers appear in the AI's positive/negative arrays
        const mentionedPositively = alert.targetTickers.some(ticker => 
          analyzedArticle.positiveStocks.includes(ticker)
        );
        const mentionedNegatively = alert.targetTickers.some(ticker => 
          analyzedArticle.negativeStocks.includes(ticker)
        );

        if (mentionedPositively || mentionedNegatively) {
          isTriggered = true;
          const context = mentionedPositively ? "POSITIVE" : "NEGATIVE";
          triggerReason = "Your watched stock(s) were mentioned in a " + context + " context regarding: " + analyzedArticle.title;
        }
      }

      // --- LOGIC 2: Macro Theme Alert ---
      if (alert.type === 'MACRO_THEME' && alert.targetTheme) {
        // Check if the article's themes or sectors match the user's target
        const matchesTheme = analyzedArticle.themes.includes(alert.targetTheme);
        const matchesSector = analyzedArticle.affectedSectors.includes(alert.targetTheme);

        if (matchesTheme || matchesSector) {
          // Check severity threshold if the user specified one (e.g., "Only alert if HIGH or CRITICAL")
          const articleSeverity = getImportanceValue(analyzedArticle.importance);
          const requiredSeverity = alert.minImportance ? getImportanceValue(alert.minImportance) : 1;

          if (articleSeverity >= requiredSeverity) {
            isTriggered = true;
            triggerReason = "High-importance event detected regarding " + alert.targetTheme + ": " + analyzedArticle.title;
          }
        }
      }

      // --- LOGIC 3: Deliver the Notification ---
      if (isTriggered) {
        // Create and save the notification record in the database
        const notification = new Notification({
          userId: alert.userId,
          alertId: alert._id,
          title: "Alert Triggered: " + alert.name,
          message: triggerReason,
          relatedArticleId: analyzedArticle._id,
          type: analyzedArticle.importance || 'MEDIUM', 
          isRead: false
        });

        await notification.save();

        // Push to the specific user in real-time via Socket.IO
        const io = getIo();
        if (io) {
          // In server.js, users join a room matching their MongoDB userId
          io.to(alert.userId.toString()).emit('new_notification', notification);
        }
      }
    }
  } catch (error) {
    console.error("[Alert Engine Error]: Failed to evaluate alerts for article:", error.message);
  }
};
      
