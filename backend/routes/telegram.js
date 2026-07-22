import express from 'express';
import QRCode from 'qrcode';
import { db } from '../server.js';
import pakasirService from '../services/pakasir.js';
import telekosService from '../services/telekos.js';

const router = express.Router();

// Get available telegram countries
router.get('/countries', async (req, res) => {
  try {
    const countries = await telekosService.getTgCountries();
    // Add 5k profit to each country's price
    const countriesWithProfit = countries.map(country => ({
      ...country,
      originalPrice: country.price, // Keep original for backend logic if needed
      price: country.price + 5000   // Price shown to user & charged to them
    }));
    res.json({ success: true, data: countriesWithProfit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create telegram order with balance (logged in user)
router.post('/create-with-balance', async (req, res) => {
  try {
    const { countryCode, countryName, price, userId } = req.body;

    if (!countryCode || !price || !userId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check user existence
    const userSnapshot = await db.ref(`users/${userId}`).once('value');
    if (!userSnapshot.exists()) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check Telekos balance (using the actual cost we pay them, not what we charge user)
    const telekosBalance = await telekosService.getBalance();
    const costPrice = price - 5000;
    if (telekosBalance < costPrice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mohon maaf, saldo sistem tidak mencukupi untuk memproses pesanan ini.' 
      });
    }

    // Deduct balance atomically
    const balanceRef = db.ref(`users/${userId}/balance`);
    const txResult = await balanceRef.transaction((current) => {
      if ((current || 0) >= price) {
        return current - price;
      }
      return undefined; // Abort
    });

    if (!txResult.committed) {
      return res.status(400).json({ 
        success: false, 
        message: 'Saldo tidak cukup atau transaksi dibatalkan.' 
      });
    }

    const newBalance = txResult.snapshot.val();
    await db.ref(`users/${userId}`).update({ updatedAt: Date.now() });

    const localOrderId = `TG${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Save initial order
    const orderData = {
      orderId: localOrderId,
      userId,
      countryCode,
      countryName,
      price,
      paymentMethod: 'balance',
      status: 'processing',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.ref(`telegram_orders/${localOrderId}`).set(orderData);

    // Call Telekos in background to prevent timeout
    telekosService.buyTgNumber(countryCode).then(async (telekosOrder) => {
      // Update with telekos info
      await db.ref(`telegram_orders/${localOrderId}`).update({
        telekosOrderId: telekosOrder.orderId,
        phoneNumber: telekosOrder.phone,
        status: 'waiting_code',
        updatedAt: Date.now()
      });
    }).catch(async (error) => {
      // Refund user balance
      const userRef = db.ref(`users/${userId}`);
      const snapshot = await userRef.once('value');
      const user = snapshot.val();
      if (user) {
        await userRef.update({
          balance: (user.balance || 0) + price,
          updatedAt: Date.now()
        });
      }

      await db.ref(`telegram_orders/${localOrderId}`).update({ 
        status: 'failed',
        failureReason: error.message,
        refunded: true,
        updatedAt: Date.now()
      });
    });

    return res.json({ 
      success: true, 
      data: {
        orderId: localOrderId,
        status: 'processing',
        newBalance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create telegram order with QRIS
router.post('/create', async (req, res) => {
  try {
    const { countryCode, countryName, price, userId } = req.body;

    if (!countryCode || !price) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check Telekos balance
    const telekosBalance = await telekosService.getBalance();
    const costPrice = price - 5000;
    if (telekosBalance < costPrice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mohon maaf, saldo sistem tidak mencukupi untuk memproses pesanan ini.' 
      });
    }

    const localOrderId = `TG${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create QRIS payment via Pakasir
    const qrisData = await pakasirService.createQris(localOrderId, price);

    if (!qrisData.payment || !qrisData.payment.payment_number) {
      throw new Error('Failed to generate QRIS');
    }

    const qrCodeDataUrl = await QRCode.toDataURL(qrisData.payment.payment_number, { 
      width: 400, margin: 2 
    });

    const expiryTime = Date.now() + (15 * 60 * 1000); // 15 mins

    const orderData = {
      orderId: localOrderId,
      userId: userId || 'guest',
      countryCode,
      countryName,
      price,
      status: 'pending',
      qrisNumber: qrisData.payment.payment_number,
      totalPayment: qrisData.payment.total_payment,
      expiryTime,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.ref(`telegram_orders/${localOrderId}`).set(orderData);

    res.json({
      success: true,
      data: {
        orderId: localOrderId,
        qrCodeDataUrl,
        qrisNumber: qrisData.payment.payment_number,
        totalPayment: qrisData.payment.total_payment,
        expiryTime
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check status (mainly for QRIS payment -> Telekos trigger)
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const snapshot = await db.ref(`telegram_orders/${orderId}`).once('value');
    const orderData = snapshot.val();

    if (!orderData) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If it's already past pending state, just return it
    if (orderData.status !== 'pending') {
      return res.json({ success: true, data: orderData });
    }

    // Check if expired
    if (Date.now() > orderData.expiryTime) {
      await db.ref(`telegram_orders/${orderId}`).update({ status: 'expired', updatedAt: Date.now() });
      orderData.status = 'expired';
      return res.json({ success: true, data: orderData });
    }

    // Check payment status from Pakasir
    const paymentStatus = await pakasirService.checkStatus(orderId, orderData.price);

    if (paymentStatus.transaction?.status === 'completed') {
      // Payment completed, trigger Telekos in background
      await db.ref(`telegram_orders/${orderId}`).update({ status: 'processing', updatedAt: Date.now() });
      
      telekosService.buyTgNumber(orderData.countryCode).then(async (telekosOrder) => {
        await db.ref(`telegram_orders/${orderId}`).update({
          telekosOrderId: telekosOrder.orderId,
          phoneNumber: telekosOrder.phone,
          status: 'waiting_code',
          updatedAt: Date.now()
        });
      }).catch(async (error) => {
        await db.ref(`telegram_orders/${orderId}`).update({ 
          status: 'failed',
          failureReason: error.message,
          updatedAt: Date.now()
        });
      });

      orderData.status = 'processing';
      return res.json({ success: true, data: orderData });
    } else if (['expired', 'cancel', 'failed'].includes(paymentStatus.transaction?.status)) {
      await db.ref(`telegram_orders/${orderId}`).update({ status: 'failed', updatedAt: Date.now() });
      orderData.status = 'failed';
      return res.json({ success: true, data: orderData });
    }

    res.json({ success: true, data: orderData });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check OTP code
router.get('/code/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const snapshot = await db.ref(`telegram_orders/${orderId}`).once('value');
    const orderData = snapshot.val();

    if (!orderData || !orderData.telekosOrderId) {
      return res.status(404).json({ success: false, message: 'Invalid order or Telekos ID not found' });
    }

    if (orderData.status === 'completed') {
      return res.json({ success: true, data: { state: 'ok', code: orderData.otpCode } });
    }

    const codeResponse = await telekosService.getTgCode(orderData.telekosOrderId);
    
    if (codeResponse.state === 'ok' && codeResponse.code) {
      await db.ref(`telegram_orders/${orderId}`).update({
        status: 'completed',
        otpCode: codeResponse.code,
        completedAt: Date.now(),
        updatedAt: Date.now()
      });
    } else if (codeResponse.state === 'expired' || codeResponse.state === 'cancel') {
      await db.ref(`telegram_orders/${orderId}`).update({
        status: 'failed',
        failureReason: 'Order expired or cancelled from Telekos',
        refunded: orderData.userId && orderData.userId !== 'guest',
        updatedAt: Date.now()
      });

      // Refund to user balance if applicable
      if (orderData.userId && orderData.userId !== 'guest') {
        await db.ref(`users/${orderData.userId}/balance`).transaction((current) => (current || 0) + orderData.price);
        await db.ref(`users/${orderData.userId}`).update({ updatedAt: Date.now() });
      }
    }

    res.json({ success: true, data: codeResponse });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel order and refund
router.post('/cancel/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body;

    const snapshot = await db.ref(`telegram_orders/${orderId}`).once('value');
    const orderData = snapshot.val();

    if (!orderData) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderData.userId && orderData.userId !== 'guest' && orderData.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Bukan orderan lu ngab!' });
    }

    if (orderData.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Sudah selesai, gabisa dicancel!' });
    }

    // If pending (QRIS not paid yet)
    if (orderData.status === 'pending') {
      await pakasirService.cancelTransaction(orderId, orderData.price);
      await db.ref(`telegram_orders/${orderId}`).update({ status: 'cancelled', updatedAt: Date.now() });
      return res.json({ success: true, message: 'Order QRIS cancelled' });
    }

    // If waiting code (Telekos already hit)
    if (orderData.status === 'waiting_code') {
      if (!orderData.telekosOrderId) {
        return res.status(400).json({ success: false, message: 'Telekos ID missing' });
      }

      // Cancel on Telekos
      try {
        await telekosService.cancelOrder(orderData.telekosOrderId);
      } catch (err) {
        console.error('Telekos cancel error:', err.message);
        // We still proceed to local refund because we assume it failed or user forces cancel.
        // Actually if Telekos refuses, maybe we shouldn't refund? 
        // But user said "auto cancel and refund". We'll just refund local balance if paymentMethod was balance.
      }

      await db.ref(`telegram_orders/${orderId}`).update({ status: 'cancelled', updatedAt: Date.now() });

      // Refund if paid via balance or if it was a QRIS payment that we want to refund to balance
      if (orderData.userId && orderData.userId !== 'guest') {
        await db.ref(`users/${orderData.userId}/balance`).transaction((current) => (current || 0) + orderData.price);
        await db.ref(`users/${orderData.userId}`).update({ updatedAt: Date.now() });
      }

      return res.json({ success: true, message: 'Order dibatalkan dan direfund.' });
    }

    return res.status(400).json({ success: false, message: 'Order tidak bisa dicancel di status ini.' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;