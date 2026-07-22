import '../config/env.js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

console.log('🧹 Starting Cleanup Script for Expired Transactions...\n');

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
const db = getDatabase();

async function cleanupExpiredPayments() {
  console.log('📊 Checking payments collection...');
  
  const paymentsSnapshot = await db.ref('payments').once('value');
  const payments = paymentsSnapshot.val() || {};
  
  let pendingCount = 0;
  let expiredCount = 0;
  let updatedCount = 0;
  
  const now = Date.now();
  const updates = {};
  
  for (const [transactionId, payment] of Object.entries(payments)) {
    if (payment.status === 'pending') {
      pendingCount++;
      
      // Check if expired (15 minutes = 900000 ms)
      const isExpired = now > payment.expiryTime;
      
      if (isExpired) {
        expiredCount++;
        updates[`payments/${transactionId}/status`] = 'expired';
        updates[`payments/${transactionId}/updatedAt`] = now;
        
        const createdAt = new Date(payment.createdAt);
        const expiryAt = new Date(payment.expiryTime);
        console.log(`  ⏰ Expired: ${transactionId}`);
        console.log(`     Created: ${createdAt.toLocaleString('id-ID')}`);
        console.log(`     Expired: ${expiryAt.toLocaleString('id-ID')}`);
        console.log(`     Amount: Rp ${payment.amount.toLocaleString('id-ID')}`);
      }
    }
  }
  
  if (Object.keys(updates).length > 0) {
    await db.ref().update(updates);
    updatedCount = expiredCount;
    console.log(`\n✅ Updated ${updatedCount} expired payments`);
  } else {
    console.log('\n✅ No expired payments found');
  }
  
  console.log(`\n📈 Summary (Payments):`);
  console.log(`   Total pending: ${pendingCount}`);
  console.log(`   Found expired: ${expiredCount}`);
  console.log(`   Updated: ${updatedCount}`);
  
  return { pendingCount, expiredCount, updatedCount };
}

async function cleanupExpiredTopups() {
  console.log('\n📊 Checking topups collection...');
  
  const topupsSnapshot = await db.ref('topups').once('value');
  const topups = topupsSnapshot.val() || {};
  
  let pendingCount = 0;
  let expiredCount = 0;
  let updatedCount = 0;
  
  const now = Date.now();
  const updates = {};
  
  for (const [orderId, topup] of Object.entries(topups)) {
    if (topup.status === 'pending') {
      pendingCount++;
      
      // Check if expired (15 minutes = 900000 ms)
      if (topup.expiryTime) {
        const isExpired = now > topup.expiryTime;
        
        if (isExpired) {
          expiredCount++;
          updates[`topups/${orderId}/status`] = 'expired';
          updates[`topups/${orderId}/updatedAt`] = now;
          
          const createdAt = new Date(topup.createdAt);
          const expiryAt = new Date(topup.expiryTime);
          console.log(`  ⏰ Expired: ${orderId}`);
          console.log(`     Created: ${createdAt.toLocaleString('id-ID')}`);
          console.log(`     Expired: ${expiryAt.toLocaleString('id-ID')}`);
          console.log(`     Amount: Rp ${topup.amount.toLocaleString('id-ID')}`);
        }
      }
    }
  }
  
  if (Object.keys(updates).length > 0) {
    await db.ref().update(updates);
    updatedCount = expiredCount;
    console.log(`\n✅ Updated ${updatedCount} expired topups`);
  } else {
    console.log('\n✅ No expired topups found');
  }
  
  console.log(`\n📈 Summary (Topups):`);
  console.log(`   Total pending: ${pendingCount}`);
  console.log(`   Found expired: ${expiredCount}`);
  console.log(`   Updated: ${updatedCount}`);
  
  return { pendingCount, expiredCount, updatedCount };
}

async function main() {
  try {
    const paymentStats = await cleanupExpiredPayments();
    const topupStats = await cleanupExpiredTopups();
    
    const totalUpdated = paymentStats.updatedCount + topupStats.updatedCount;
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 Cleanup Complete!`);
    console.log(`   Total transactions updated: ${totalUpdated}`);
    console.log(`${'='.repeat(50)}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup Error:', error);
    process.exit(1);
  }
}

main();
