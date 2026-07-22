#!/bin/bash

# ==============================================
# Konfigurasi - UBAH SESUAI VPS KAMU!
# ==============================================
PROJECT_PATH="/home/israa/project/tnsmiley"  # Ganti dengan path project di VPS
PM2_BACKEND="backend-tnsmiley"                   # Ganti dengan nama process PM2 backend
PM2_FRONTEND="frontend-tnsmiley"                 # Ganti dengan nama process PM2 frontend

# ==============================================
# Script Deploy - JANGAN UBAH KECUALI MAU EDIT
# ==============================================
echo ""
echo "🚀 ======================================"
echo "🚀 MEMULAI DEPLOY OTOMATIS"
echo "🚀 ======================================"
echo ""

# Pindah ke direktori project
cd $PROJECT_PATH || { echo "❌ Gagal masuk ke direktori project"; exit 1; }

echo "📥 Pulling kode terbaru dari GitHub..."
git pull origin main || { echo "❌ Gagal pull dari GitHub"; exit 1; }

echo ""
echo "🔧 Memperbarui dependencies Backend..."
cd $PROJECT_PATH/backend || { echo "❌ Gagal masuk ke direktori backend"; exit 1; }
npm install || { echo "❌ Gagal install dependencies backend"; exit 1; }

echo ""
echo "🔨 Membuild Frontend..."
cd $PROJECT_PATH/frontend || { echo "❌ Gagal masuk ke direktori frontend"; exit 1; }
npm install || { echo "❌ Gagal install dependencies frontend"; exit 1; }
npm run build || { echo "❌ Gagal build frontend"; exit 1; }

echo ""
echo "🔄 Merestart PM2 Services..."
pm2 restart $PM2_BACKEND || { echo "⚠️ Gagal restart backend (mungkin process belum ada)"; }
pm2 restart $PM2_FRONTEND || { echo "⚠️ Gagal restart frontend (mungkin process belum ada)"; }

echo ""
echo "✅ ======================================"
echo "✅ DEPLOY SELESAI!"
echo "✅ ======================================"
echo ""
