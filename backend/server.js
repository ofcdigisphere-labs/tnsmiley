import './config/env.js'; // Load env first!
import express from 'express';
import cors from 'cors';
import os from 'os';
import axios from 'axios';
import crypto from 'crypto';
import { exec } from 'child_process';
import path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import topupRoutes from './routes/topup.js';
import authRoutes from './routes/auth.js';
import merchantRoutes from './routes/merchant.js';
import paymentRoutes from './routes/payment.js';
import telegramRoutes from './routes/telegram.js';

const app = express();

// Middleware
app.use(cors());
// Raw body middleware untuk webhook (harus sebelum express.json())
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Firebase Admin initialization
const firebaseConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
};

initializeApp(firebaseConfig);

export const db = getDatabase();

// GitHub Webhook Route
app.post('/api/webhook/deploy', (req, res) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const signatureHeader = req.headers['x-hub-signature-256'];
  
  if (!signatureHeader) {
    return res.status(403).send('Missing signature');
  }

  // Verifikasi signature GitHub
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(req.body).digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(digest))) {
    return res.status(403).send('Invalid signature');
  }

  // Jalankan script deploy secara async
  const scriptPath = path.join(process.cwd(), '..', 'deploy.sh');
  console.log(`🚀 Triggering deploy script: ${scriptPath}`);
  
  exec(scriptPath, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Deploy error: ${error.message}`);
      return;
    }
    console.log(`✅ Deploy output:\n${stdout}`);
    if (stderr) console.error(`⚠️ Deploy stderr:\n${stderr}`);
  });

  res.status(200).send('Deploy started');
});

// Routes
app.use('/api/topup', topupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/telegram', telegramRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

// Helper function to get local IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Helper function to get public IP
async function getPublicIP() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json', {
      timeout: 5000
    });
    return response.data.ip;
  } catch (error) {
    // Fallback to alternative service
    try {
      const response = await axios.get('https://icanhazip.com', {
        timeout: 5000
      });
      return response.data.trim();
    } catch (fallbackError) {
      return 'Unable to fetch';
    }
  }
}

app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 PayQRIS Backend Server Started!');
  console.log('='.repeat(60));
  
  const localIP = getLocalIP();
  const publicIP = await getPublicIP();
  
  console.log('\n📡 Server Information:');
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  
  console.log('\n🌐 Access URLs:');
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${localIP}:${PORT}`);
  
  if (publicIP !== 'Unable to fetch') {
    console.log(`   Public:  http://${publicIP}:${PORT}`);
    console.log(`\n💡 Tip: Public IP hanya bisa diakses jika port ${PORT} di-forward/open`);
  } else {
    console.log(`   Public:  ❌ Unable to fetch public IP`);
  }
  
  console.log('\n📚 API Endpoints:');
  console.log(`   Health:   GET  /api/health`);
  console.log(`   Auth:     POST /api/auth/register, /login`);
  console.log(`   Payment:  POST /api/payment/create`);
  console.log(`   Topup:    POST /api/topup/create`);
  console.log(`   Merchant: GET  /api/merchant/stats`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Server ready to accept connections');
  console.log('='.repeat(60) + '\n');
});