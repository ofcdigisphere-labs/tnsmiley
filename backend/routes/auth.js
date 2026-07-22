import express from 'express';
import crypto from 'crypto';
import { db } from '../server.js';

const router = express.Router();

// Generate API Key
function generateApiKey() {
  return 'pk_' + crypto.randomBytes(32).toString('hex');
}
// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, businessName } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, and name are required' 
      });
    }

    // Check if user already exists
    const usersSnapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');
    
    if (usersSnapshot.exists()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Hash password (simple, in production use bcrypt)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Generate API Key
    const apiKey = generateApiKey();
    const userId = crypto.randomBytes(16).toString('hex');

    // Create user
    const userData = {
      userId,
      email,
      password: hashedPassword,
      name,
      businessName: businessName || name,
      apiKey,
      balance: 0, // Initial balance
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.ref(`users/${userId}`).set(userData);

    // Remove password from response
    delete userData.password;

    res.json({
      success: true,
      message: 'Registration successful',
      data: userData
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const usersSnapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');
    
    if (!usersSnapshot.exists()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Get user data
    let userData = null;
    usersSnapshot.forEach((child) => {
      userData = child.val();
    });

    // Verify password
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    if (userData.password !== hashedPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Remove password from response
    delete userData.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: userData
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get User Profile (requires userId)
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await db.ref(`users/${userId}`).once('value');
    const userData = snapshot.val();

    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    delete userData.password;

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Regenerate API Key
router.post('/regenerate-api-key', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const newApiKey = generateApiKey();

    await db.ref(`users/${userId}`).update({
      apiKey: newApiKey,
      updatedAt: Date.now()
    });

    res.json({
      success: true,
      message: 'API Key regenerated successfully',
      data: { apiKey: newApiKey }
    });

  } catch (error) {
    console.error('Regenerate API Key Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Transaction History (All types)
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch from topups
    const topupsSnap = await db.ref('topups').orderByChild('userId').equalTo(userId).once('value');
    
    // Fetch from telegram_orders
    const telegramSnap = await db.ref('telegram_orders').orderByChild('userId').equalTo(userId).once('value');
    
    // Fetch from payments (Merchant API)
    const paymentsSnap = await db.ref('payments').orderByChild('merchantId').equalTo(userId).once('value');

    const history = [];

    // Process topups
    if (topupsSnap.exists()) {
      topupsSnap.forEach((child) => {
        const data = child.val();
        history.push({
          id: data.orderId,
          type: 'topup',
          title: `Topup ${data.productName}`,
          amount: data.amount,
          status: data.status,
          date: data.createdAt,
          method: data.paymentMethod || 'qris'
        });
      });
    }

    // Process telegram orders
    if (telegramSnap.exists()) {
      telegramSnap.forEach((child) => {
        const data = child.val();
        history.push({
          id: data.orderId,
          type: 'telegram',
          title: `Nokos ${data.countryName}`,
          amount: data.price,
          status: data.status,
          date: data.createdAt,
          method: data.paymentMethod || 'qris'
        });
      });
    }

    // Process merchant payments
    if (paymentsSnap.exists()) {
      paymentsSnap.forEach((child) => {
        const data = child.val();
        history.push({
          id: data.transactionId,
          type: 'api_payment',
          title: `API Payment ${data.merchantOrderId}`,
          amount: data.amount,
          status: data.status,
          date: data.createdAt,
          method: 'qris'
        });
      });
    }

    // Sort by date descending (newest first)
    history.sort((a, b) => b.date - a.date);

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
