import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { db } from '../server.js';
import pakasirService from '../services/pakasir.js';
import okeconnectService from '../services/okeconnect.js';

const router = express.Router();

// Get available products for specific e-wallet
router.get('/products/:ewallet', async (req, res) => {
  try {
    const { ewallet } = req.params;
    const products = await okeconnectService.getAvailableProducts(ewallet);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create topup order with balance payment (for logged in users)
router.post('/create-with-balance', async (req, res) => {
  try {
    const { productCode, productName, amount, phoneNumber, email, userId } = req.body;

    // Validation
    if (!productCode || !amount || !phoneNumber || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Check user balance
    const userSnapshot = await db.ref(`users/${userId}`).once('value');
    const userData = userSnapshot.val();

    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const currentBalance = userData.balance || 0;

    if (currentBalance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: `Saldo tidak cukup. Saldo Anda: Rp ${currentBalance.toLocaleString('id-ID')}` 
      });
    }

    const orderId = `TOPBAL${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Deduct balance immediately
    const newBalance = currentBalance - amount;
    await db.ref(`users/${userId}`).update({
      balance: newBalance,
      updatedAt: Date.now()
    });

    console.log(`💰 Balance deducted: ${userId} - Rp ${amount} (Remaining: Rp ${newBalance})`);

    // Save topup order
    const topupData = {
      orderId,
      userId,
      productCode,
      productName: productName || productCode,
      phoneNumber,
      email: email || null,
      amount,
      paymentMethod: 'balance',
      status: 'processing',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.ref(`topups/${orderId}`).set(topupData);

    // Process topup immediately to OkeConnect
    try {
      console.log(`📞 Calling OkeConnect: ${productCode} -> ${phoneNumber}`);
      
      const topupResult = await okeconnectService.processTopup(
        productCode,
        phoneNumber,
        orderId
      );

      console.log('OkeConnect Initial Response:', topupResult);

      // Poll OkeConnect status
      let attempts = 0;
      const maxAttempts = 20;

      const checkOkeStatus = async () => {
        if (attempts >= maxAttempts) {
          // Timeout - refund balance
          await db.ref(`users/${userId}`).update({
            balance: currentBalance, // Refund
            updatedAt: Date.now()
          });
          await db.ref(`topups/${orderId}`).update({ 
            status: 'failed',
            failureReason: 'Timeout',
            refunded: true,
            updatedAt: Date.now()
          });
          throw new Error('Topup timeout - Balance refunded');
        }

        const statusCheck = await okeconnectService.checkTopupStatus(
          productCode,
          phoneNumber,
          orderId
        );

        if (statusCheck.status === 'SUKSES') {
          await db.ref(`topups/${orderId}`).update({ 
            status: 'completed',
            serialNumber: statusCheck.sn,
            completedAt: Date.now(),
            updatedAt: Date.now()
          });
          return { status: 'completed', serialNumber: statusCheck.sn };
        } else if (statusCheck.status === 'GAGAL') {
          // Failed - refund balance
          await db.ref(`users/${userId}`).update({
            balance: currentBalance, // Refund
            updatedAt: Date.now()
          });
          await db.ref(`topups/${orderId}`).update({ 
            status: 'failed',
            failureReason: statusCheck.message || 'Topup failed',
            refunded: true,
            updatedAt: Date.now()
          });
          return { status: 'failed', refunded: true };
        } else {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 5000));
          return checkOkeStatus();
        }
      };

      const finalStatus = await checkOkeStatus();
      
      return res.json({ 
        success: true, 
        data: {
          orderId,
          ...finalStatus,
          newBalance
        }
      });

    } catch (error) {
      console.error('OkeConnect Processing Error:', error);
      
      // Refund balance on error
      await db.ref(`users/${userId}`).update({
        balance: currentBalance,
        updatedAt: Date.now()
      });

      await db.ref(`topups/${orderId}`).update({ 
        status: 'failed',
        failureReason: error.message,
        refunded: true,
        updatedAt: Date.now()
      });

      return res.status(500).json({ 
        success: false, 
        message: error.message + ' - Balance refunded'
      });
    }

  } catch (error) {
    console.error('Create Topup with Balance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create topup order and generate QRIS
router.post('/create', async (req, res) => {
  try {
    const { productCode, productName, amount, phoneNumber, email } = req.body;

    // Validation
    if (!productCode || !amount || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const orderId = `TOP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create QRIS payment via Pakasir
    const qrisData = await pakasirService.createQris(orderId, amount);

    if (!qrisData.payment || !qrisData.payment.payment_number) {
      throw new Error('Failed to generate QRIS');
    }

    // Generate QR code image
    const qrCodeDataUrl = await QRCode.toDataURL(qrisData.payment.payment_number, { 
      width: 400,
      margin: 2 
    });

    // Calculate expiry (15 minutes from now)
    const expiryTime = Date.now() + (15 * 60 * 1000);

    // Save to Firebase
    const topupData = {
      orderId,
      productCode,
      productName: productName || productCode,
      phoneNumber,
      email: email || null,
      amount,
      status: 'pending',
      qrisNumber: qrisData.payment.payment_number,
      totalPayment: qrisData.payment.total_payment,
      expiryTime,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.ref(`topups/${orderId}`).set(topupData);

    res.json({
      success: true,
      data: {
        orderId,
        qrCodeDataUrl,
        qrisNumber: qrisData.payment.payment_number,
        totalPayment: qrisData.payment.total_payment,
        expiryTime
      }
    });

  } catch (error) {
    console.error('Create Topup Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check payment status
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get topup data from Firebase
    const snapshot = await db.ref(`topups/${orderId}`).once('value');
    const topupData = snapshot.val();

    if (!topupData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if expired (15 minutes = 900000 ms)
    const isExpired = Date.now() > topupData.expiryTime;
    
    if (isExpired && topupData.status === 'pending') {
      await db.ref(`topups/${orderId}`).update({ 
        status: 'expired',
        updatedAt: Date.now()
      });
      
      console.log(`⏰ Topup ${orderId} marked as expired`);
      
      return res.json({ 
        success: true, 
        data: { status: 'expired' } 
      });
    }

    // If already completed or failed, return cached status
    if (['completed', 'failed', 'expired'].includes(topupData.status)) {
      return res.json({ 
        success: true, 
        data: { 
          status: topupData.status,
          serialNumber: topupData.serialNumber || null
        } 
      });
    }

    // Check payment status from Pakasir
    const paymentStatus = await pakasirService.checkStatus(orderId, topupData.amount);

    if (paymentStatus.transaction?.status === 'completed') {
      
      // Cek apakah sudah pernah processing sebelumnya
      if (topupData.status === 'processing') {
        // Masih processing, return status processing
        return res.json({ 
          success: true, 
          data: { status: 'processing' } 
        });
      }

      // Payment completed, process topup to OkeConnect
      await db.ref(`topups/${orderId}`).update({ 
        status: 'processing',
        updatedAt: Date.now()
      });

      console.log(`🔄 Processing topup for ${orderId}`);

      try {
        // Process topup via OkeConnect
        console.log(`📞 Calling OkeConnect: ${topupData.productCode} -> ${topupData.phoneNumber}`);
        
        const topupResult = await okeconnectService.processTopup(
          topupData.productCode,
          topupData.phoneNumber,
          orderId
        );

        console.log('OkeConnect Initial Response:', topupResult);

        // Poll OkeConnect status
        let attempts = 0;
        const maxAttempts = 20; // 20 attempts x 5 seconds = 100 seconds max

        const checkOkeStatus = async () => {
          if (attempts >= maxAttempts) {
            throw new Error('Topup timeout');
          }

          const statusCheck = await okeconnectService.checkTopupStatus(
            topupData.productCode,
            topupData.phoneNumber,
            orderId
          );

          if (statusCheck.status === 'SUKSES') {
            await db.ref(`topups/${orderId}`).update({ 
              status: 'completed',
              serialNumber: statusCheck.sn,
              completedAt: Date.now(),
              updatedAt: Date.now()
            });
            return { status: 'completed', serialNumber: statusCheck.sn };
          } else if (statusCheck.status === 'GAGAL') {
            await db.ref(`topups/${orderId}`).update({ 
              status: 'failed',
              failureReason: statusCheck.message || 'Topup failed',
              updatedAt: Date.now()
            });
            return { status: 'failed' };
          } else {
            // Still processing, wait and retry
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000));
            return checkOkeStatus();
          }
        };

        const finalStatus = await checkOkeStatus();
        return res.json({ success: true, data: finalStatus });

      } catch (error) {
        console.error('OkeConnect Processing Error:', error);
        await db.ref(`topups/${orderId}`).update({ 
          status: 'failed',
          failureReason: error.message,
          updatedAt: Date.now()
        });
        return res.json({ success: true, data: { status: 'failed' } });
      }

    } else if (['expired', 'cancel', 'failed'].includes(paymentStatus.transaction?.status)) {
      await db.ref(`topups/${orderId}`).update({ 
        status: 'failed',
        updatedAt: Date.now()
      });
      return res.json({ success: true, data: { status: 'failed' } });
    }

    // Still pending payment
    res.json({ 
      success: true, 
      data: { status: topupData.status } 
    });

  } catch (error) {
    console.error('Check Status Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel topup
router.post('/cancel/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const snapshot = await db.ref(`topups/${orderId}`).once('value');
    const topupData = snapshot.val();

    if (!topupData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (topupData.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel order in current status' 
      });
    }

    // Cancel on Pakasir
    await pakasirService.cancelTransaction(orderId, topupData.amount);

    // Update Firebase
    await db.ref(`topups/${orderId}`).update({ 
      status: 'cancelled',
      updatedAt: Date.now()
    });

    res.json({ success: true, message: 'Order cancelled' });

  } catch (error) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
