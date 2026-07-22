# 🧹 Cleanup Scripts

## cleanup-expired.js

Script untuk membersihkan transaksi pending yang sudah expired (lebih dari 15 menit).

### Cara Pakai:

```bash
cd backend
npm run cleanup
```

### Apa yang dilakukan script ini?

1. **Check Payments Collection:**
   - Cari semua transaksi dengan status `pending`
   - Check apakah sudah lewat `expiryTime`
   - Update status jadi `expired`

2. **Check Topups Collection:**
   - Cari semua topup dengan status `pending`
   - Check apakah sudah lewat `expiryTime`
   - Update status jadi `expired`

3. **Summary Report:**
   - Total pending transactions
   - Total expired transactions found
   - Total transactions updated

### Kapan Harus Dijalankan?

- **Manual:** Jalankan sesekali untuk cleanup transaksi lama
- **Cron Job:** Setup cron job untuk auto-cleanup tiap hari
- **One-time:** Setelah ada bug/downtime yang bikin banyak transaksi pending

### Example Output:

```
🧹 Starting Cleanup Script for Expired Transactions...

📊 Checking payments collection...
  ⏰ Expired: TXN1783070123456ABCD
     Created: 06/07/2026, 10:00:00
     Expired: 06/07/2026, 10:15:00
     Amount: Rp 50.000

✅ Updated 5 expired payments

📈 Summary (Payments):
   Total pending: 8
   Found expired: 5
   Updated: 5

📊 Checking topups collection...
✅ No expired topups found

📈 Summary (Topups):
   Total pending: 2
   Found expired: 0
   Updated: 0

==================================================
🎉 Cleanup Complete!
   Total transactions updated: 5
==================================================
```

### Setup Cron Job (Linux/Mac):

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 1 AM
0 1 * * * cd /path/to/backend && npm run cleanup >> /var/log/cleanup-expired.log 2>&1
```

### Setup Task Scheduler (Windows):

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 1:00 AM
4. Action: Start a program
   - Program: `cmd.exe`
   - Arguments: `/c cd D:\Project\kiro\tnsmiley\backend && npm run cleanup`

### Notes:

- Script tidak akan delete data, hanya update status
- Safe untuk dijalankan kapan aja
- Idempotent: boleh dijalankan berkali-kali tanpa side effect
- Log output untuk audit trail
