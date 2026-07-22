import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { db } from '../server.js';
import pakasirService from '../services/pakasir.js';

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
    const usersSnapshot = await db.ref('users').orderByChild('apiKey').equalTo(apiKey).once('value');
    
    if (!usersSnapshot.exists()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid API Key' 
      });
    }

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

    req.merchant = userData;
    next();
  } catch (error) {
    console.error('API Key Verification Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Create Payment (Generate QRIS)
router.post('/create', verifyApiKey, async (req, res) => {
  try {
    const { amount, orderId, customerName, customerEmail, customerPhone } = req.body;

    // Validation
    if (!amount || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'amount and orderId are required' 
      });
    }

    if (amount < 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Minimum amount is Rp 1.000' 
      });
    }

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create QRIS via Pakasir
    const qrisData = await pakasirService.createQris(transactionId, amount);

    if (!qrisData.payment || !qrisData.payment.payment_number) {
      throw new Error('Failed to generate QRIS');
    }

    // Generate QR code image
    const qrCodeDataUrl = await QRCode.toDataURL(qrisData.payment.payment_number, { 
      width: 400,
      margin: 2 
    });

    // Calculate expiry (15 minutes)
    const expiryTime = Date.now() + (15 * 60 * 1000);

    // Save to Firebase
    const paymentData = {
      transactionId,
      merchantId: req.merchant.userId,
      merchantOrderId: orderId,
      amount,
      totalPayment: qrisData.payment.total_payment,
      fee: qrisData.payment.fee || 0,
      status: 'pending',
      qrisNumber: qrisData.payment.payment_number,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
      customerPhone: customerPhone || null,
      expiryTime,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.ref(`payments/${transactionId}`).set(paymentData);

    res.json({
      success: true,
      data: {
        transactionId,
        orderId,
        amount,
        totalPayment: qrisData.payment.total_payment,
        fee: qrisData.payment.fee,
        qrCodeDataUrl,
        qrisString: qrisData.payment.payment_number,
        expiryTime,
        expiresIn: 900 // seconds (15 minutes)
      }
    });

  } catch (error) {
    console.error('Create Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check Payment Status
router.get('/status/:transactionId', verifyApiKey, async (req, res) => {
  try {
    const { transactionId } = req.params;

    const snapshot = await db.ref(`payments/${transactionId}`).once('value');
    const paymentData = snapshot.val();

    if (!paymentData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    // Verify merchant ownership
    if (paymentData.merchantId !== req.merchant.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access to this transaction' 
      });
    }

    // Check if expired (15 minutes = 900000 ms)
    const isExpired = Date.now() > paymentData.expiryTime;
    
    if (isExpired && paymentData.status === 'pending') {
      await db.ref(`payments/${transactionId}`).update({ 
        status: 'expired',
        updatedAt: Date.now()
      });
      
      console.log(`⏰ Payment ${transactionId} marked as expired`);
      
      return res.json({ 
        success: true, 
        data: { 
          transactionId,
          status: 'expired',
          amount: paymentData.amount,
          merchantOrderId: paymentData.merchantOrderId
        } 
      });
    }

    // If already completed/failed, return cached status
    if (['completed', 'failed', 'expired', 'cancelled'].includes(paymentData.status)) {
      return res.json({ 
        success: true, 
        data: { 
          transactionId,
          status: paymentData.status,
          amount: paymentData.amount,
          totalPayment: paymentData.totalPayment,
          merchantOrderId: paymentData.merchantOrderId,
          paidAt: paymentData.paidAt || null
        } 
      });
    }

    // Check real status from Pakasir
    try {
      const pakasirStatus = await pakasirService.checkStatus(transactionId, paymentData.amount);

      if (pakasirStatus.transaction?.status === 'completed') {
        // Update to completed
        await db.ref(`payments/${transactionId}`).update({ 
          status: 'completed',
          paidAt: Date.now(),
          updatedAt: Date.now()
        });

        // Update merchant balance - Add the amount received (not including fee)
        const merchantSnapshot = await db.ref(`users/${paymentData.merchantId}`).once('value');
        const merchantData = merchantSnapshot.val();
        const currentBalance = merchantData.balance || 0;
        const receivedAmount = paymentData.amount; // Amount that merchant receives

        await db.ref(`users/${paymentData.merchantId}`).update({
          balance: currentBalance + receivedAmount,
          updatedAt: Date.now()
        });

        console.log(`✅ Merchant balance updated: +${receivedAmount} (Total: ${currentBalance + receivedAmount})`);

        return res.json({ 
          success: true, 
          data: { 
            transactionId,
            status: 'completed',
            amount: paymentData.amount,
            totalPayment: paymentData.totalPayment,
            merchantOrderId: paymentData.merchantOrderId,
            paidAt: Date.now()
          } 
        });
      } else if (['expired', 'cancel', 'failed'].includes(pakasirStatus.transaction?.status)) {
        await db.ref(`payments/${transactionId}`).update({ 
          status: 'failed',
          updatedAt: Date.now()
        });
        
        return res.json({ 
          success: true, 
          data: { 
            transactionId,
            status: 'failed',
            amount: paymentData.amount,
            merchantOrderId: paymentData.merchantOrderId
          } 
        });
      }
    } catch (pakasirError) {
      console.error('Pakasir check error:', pakasirError);
      // Continue with current status if Pakasir check fails
    }

    // Still pending
    res.json({ 
      success: true, 
      data: { 
        transactionId,
        status: paymentData.status,
        amount: paymentData.amount,
        totalPayment: paymentData.totalPayment,
        merchantOrderId: paymentData.merchantOrderId,
        expiresAt: paymentData.expiryTime
      } 
    });

  } catch (error) {
    console.error('Check Status Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel Payment
router.post('/cancel/:transactionId', verifyApiKey, async (req, res) => {
  try {
    const { transactionId } = req.params;

    const snapshot = await db.ref(`payments/${transactionId}`).once('value');
    const paymentData = snapshot.val();

    if (!paymentData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    // Verify merchant ownership
    if (paymentData.merchantId !== req.merchant.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    if (paymentData.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel non-pending transaction' 
      });
    }

    // Cancel on Pakasir
    try {
      await pakasirService.cancelTransaction(transactionId, paymentData.amount);
    } catch (error) {
      console.error('Pakasir cancel error:', error);
    }

    // Update Firebase
    await db.ref(`payments/${transactionId}`).update({ 
      status: 'cancelled',
      updatedAt: Date.now()
    });

    res.json({ 
      success: true, 
      message: 'Payment cancelled successfully',
      data: {
        transactionId,
        status: 'cancelled'
      }
    });

  } catch (error) {
    console.error('Cancel Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
