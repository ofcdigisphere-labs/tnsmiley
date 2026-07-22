import express from 'express';
import { db } from '../server.js';

const router = express.Router();

// Middleware to verify API Key
async function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({ 
      success: false, 
      message: 'API Key is required' 
    });
  }

  try {
    // Find user by API key
    const usersSnapshot = await db.ref('users').orderByChild('apiKey').equalTo(apiKey).once('value');
    
    if (!usersSnapshot.exists()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid API Key' 
      });
    }

    // Get user data
    let userData = null;
    usersSnapshot.forEach((child) => {
      userData = { ...child.val(), userId: child.key };
    });

    if (!userData.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'API Key is inactive' 
      });
    }

    req.user = userData;
    next();
  } catch (error) {
    console.error('API Key Verification Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get Transaction History
router.get('/transactions', verifyApiKey, async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit = 50, status } = req.query;

    let query = db.ref('payments').orderByChild('merchantId').equalTo(userId);

    const snapshot = await query.limitToLast(parseInt(limit)).once('value');
    const transactions = [];

    snapshot.forEach((child) => {
      const data = child.val();
      if (!status || data.status === status) {
        transactions.push({
          transactionId: child.key,
          ...data
        });
      }
    });

    // Sort by createdAt descending
    transactions.sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Transaction Stats
router.get('/stats', verifyApiKey, async (req, res) => {
  try {
    const { userId } = req.user;

    const snapshot = await db.ref('payments').orderByChild('merchantId').equalTo(userId).once('value');
    
    const stats = {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      totalAmount: 0,
      totalRevenue: 0
    };

    snapshot.forEach((child) => {
      const data = child.val();
      stats.total++;
      
      if (data.status === 'completed') {
        stats.completed++;
        stats.totalAmount += data.amount || 0;
        stats.totalRevenue += data.fee || 0; // Revenue from fee
      } else if (data.status === 'pending') {
        stats.pending++;
      } else if (['failed', 'expired', 'cancelled'].includes(data.status)) {
        stats.failed++;
      }
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Transaction Detail
router.get('/transactions/:transactionId', verifyApiKey, async (req, res) => {
  try {
    const { transactionId } = req.params;

    const snapshot = await db.ref(`payments/${transactionId}`).once('value');
    const transaction = snapshot.val();

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    // Verify ownership
    if (transaction.merchantId !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    res.json({
      success: true,
      data: {
        transactionId,
        ...transaction
      }
    });

  } catch (error) {
    console.error('Get Transaction Detail Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
