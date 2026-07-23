import '../config/env.js'; // Load env first!
import axios from 'axios';

const OKECONNECT_BASE_URL = 'https://b2b.okeconnect.com/trx-v2';

class OkeConnectService {
  constructor() {
    this.memberId = process.env.OKECONNECT_MEMBER_ID;
    this.password = process.env.OKECONNECT_PASSWORD;
    this.pin = process.env.OKECONNECT_PIN;
    
    console.log('🔍 OkeConnect Service Initialized:');
    console.log('- Member ID:', this.memberId || '❌ MISSING');
  }

  // Calculate profit based on tiered system
  calculateProfit(basePrice) {
    if (basePrice <= 500000) {
      // 0 - 500k = +2k
      return 2000;
    } else {
      // >500k = +5k
      return 5000;
    }
  }

  // Map product/service types to OkeConnect filter
  getProductFilter(type) {
    const cleanType = type.toLowerCase();
    const filterMap = {
      // E-Wallet
      dana: (item) => item.kode.startsWith('D') && item.kategori === 'DOMPET DIGITAL',
      gopay: (item) => item.kode.startsWith('GPY'),
      ovo: (item) => item.kode.startsWith('OVO'),
      shopeepay: (item) => item.kode.startsWith('SHP'),
      linkaja: (item) => item.kode.startsWith('LINK'),

      // Games (Contoh kode awalan: ML untuk Mobile Legends, FF untuk Free Fire, PUBGM untuk PUBG, dll)
      'mobile-legends': (item) => item.kode.startsWith('ML') || item.kategori?.toLowerCase().includes('mobile legends'),
      'free-fire': (item) => item.kode.startsWith('FF') || item.kategori?.toLowerCase().includes('free fire'),
      'pubg-mobile': (item) => item.kode.startsWith('PUBG') || item.kategori?.toLowerCase().includes('pubg'),
      'genshin-impact': (item) => item.kode.startsWith('GI') || item.kategori?.toLowerCase().includes('genshin'),
      'valorant': (item) => item.kode.startsWith('VAL') || item.kategori?.toLowerCase().includes('valorant'),
      
      // Pulsa (Berdasarkan operator seluler umum di Indonesia)
      telkomsel: (item) => item.kode.startsWith('S') && (item.kategori === 'PULSA' || item.kategori === 'TELKOMSEL'),
      indosat: (item) => item.kode.startsWith('I') && (item.kategori === 'PULSA' || item.kategori === 'INDOSAT'),
      xl: (item) => item.kode.startsWith('X') && (item.kategori === 'PULSA' || item.kategori === 'XL'),
      tri: (item) => item.kode.startsWith('A') && (item.kategori === 'PULSA' || item.kategori === 'TRI'),
      smartfren: (item) => item.kode.startsWith('SM') && (item.kategori === 'PULSA' || item.kategori === 'SMARTFREN'),

      // Internet / Paket Data
      'data-telkomsel': (item) => item.kode.startsWith('DT') || item.kategori?.toLowerCase().includes('data telkomsel'),
      'data-indosat': (item) => item.kode.startsWith('DI') || item.kategori?.toLowerCase().includes('data indosat'),
      'data-xl': (item) => item.kode.startsWith('DX') || item.kategori?.toLowerCase().includes('data xl'),
    };
    
    return filterMap[cleanType];
  }

  async getAvailableProducts(serviceType) {
    try {
      // Fetch dari OkeConnect price list API
      const response = await axios.get('https://okeconnect.com/harga/json', {
        params: {
          id: '905ccd028329b0a'
        },
        timeout: 10000 // 10 second timeout
      });

      const allProducts = response.data;

      if (!Array.isArray(allProducts)) {
        throw new Error('Invalid response from OkeConnect');
      }

      // Filter berdasarkan service/product type
      const filter = this.getProductFilter(serviceType);
      if (!filter) {
        throw new Error('Invalid service or product type');
      }

      const filteredProducts = allProducts.filter(filter);

      // Jika produk kosong dari API, gunakan fallback
      if (filteredProducts.length === 0) {
        console.warn(`⚠️ Products for ${serviceType} empty from API, using fallback...`);
        return this.getFallbackProducts(serviceType);
      }

      // Sort by price (ascending)
      filteredProducts.sort((a, b) => {
        const priceA = Number(a.harga.replace(/[^0-9.-]+/g, ''));
        const priceB = Number(b.harga.replace(/[^0-9.-]+/g, ''));
        return priceA - priceB;
      });

      // Map ke format yang dibutuhkan + add profit
      return filteredProducts
        .filter(item => item.status === '1') // Only available products
        .map(item => {
          const basePrice = Number(item.harga.replace(/[^0-9.-]+/g, ''));
          const profit = this.calculateProfit(basePrice);
          const finalPrice = basePrice + profit;

          // Clean product name
          let productName = item.keterangan;
          if (productName.includes('H2H')) {
            productName = productName.replace('Customer H2H ', '');
          } else {
            productName = productName.replace('Customer ', '');
          }

          return {
            productCode: item.kode,
            productName: productName,
            amount: finalPrice,
            basePrice: basePrice,
            profit: profit,
            label: `Rp ${finalPrice.toLocaleString('id-ID')}`,
            description: productName,
            status: item.status,
            category: item.kategori
          };
        });

    } catch (error) {
      console.error('OkeConnect Get Products Error:', error.message);
      
      // Fallback to hardcoded products if OkeConnect down
      console.warn('⚠️ Using fallback hardcoded products');
      return this.getFallbackProducts(serviceType);
    }
  }

  // Fallback products when OkeConnect is down or empty
  getFallbackProducts(serviceType) {
    const cleanType = serviceType.toLowerCase();
    const fallbackData = {
      // E-Wallet
      dana: [
        { code: 'D10', name: 'DANA 10.000', base: 10000 },
        { code: 'D20', name: 'DANA 20.000', base: 20000 },
        { code: 'D50', name: 'DANA 50.000', base: 50000 },
        { code: 'D100', name: 'DANA 100.000', base: 100000 },
      ],
      gopay: [
        { code: 'GPY10', name: 'GoPay 10.000', base: 10000 },
        { code: 'GPY50', name: 'GoPay 50.000', base: 50000 },
      ],
      ovo: [
        { code: 'OVO10', name: 'OVO 10.000', base: 10000 },
        { code: 'OVO50', name: 'OVO 50.000', base: 50000 },
      ],
      shopeepay: [
        { code: 'SHP10', name: 'ShopeePay 10.000', base: 10000 },
        { code: 'SHP50', name: 'ShopeePay 50.000', base: 50000 },
      ],
      linkaja: [
        { code: 'LINK10', name: 'LinkAja 10.000', base: 10000 },
        { code: 'LINK50', name: 'LinkAja 50.000', base: 50000 },
      ],

      // Games Fallback
      'mobile-legends': [
        { code: 'ML86', name: '86 Diamonds Mobile Legends', base: 19000 },
        { code: 'ML172', name: '172 Diamonds Mobile Legends', base: 38000 },
        { code: 'ML257', name: '257 Diamonds Mobile Legends', base: 57000 },
      ],
      'free-fire': [
        { code: 'FF70', name: '70 Diamonds Free Fire', base: 10000 },
        { code: 'FF140', name: '140 Diamonds Free Fire', base: 20000 },
      ],
      'pubg-mobile': [
        { code: 'PUBG60', name: '60 UC PUBG Mobile', base: 15000 },
      ],

      // Pulsa Fallback
      telkomsel: [
        { code: 'S5', name: 'Telkomsel 5.000', base: 5800 },
        { code: 'S10', name: 'Telkomsel 10.000', base: 10800 },
        { code: 'S20', name: 'Telkomsel 20.000', base: 20500 },
        { code: 'S50', name: 'Telkomsel 50.000', base: 49500 },
      ],
      indosat: [
        { code: 'I5', name: 'Indosat 5.000', base: 6000 },
        { code: 'I10', name: 'Indosat 10.000', base: 11000 },
      ],

      // Internet / Paket Data Fallback
      'data-telkomsel': [
        { code: 'DT1GB', name: 'Telkomsel Internet Flash 1GB', base: 15000 },
        { code: 'DT5GB', name: 'Telkomsel Internet Flash 5GB', base: 45000 },
      ]
    };

    const products = fallbackData[cleanType] || [];
    
    return products.map(item => {
      const profit = this.calculateProfit(item.base);
      const finalPrice = item.base + profit;

      return {
        productCode: item.code,
        productName: item.name,
        amount: finalPrice,
        basePrice: item.base,
        profit: profit,
        label: `Rp ${finalPrice.toLocaleString('id-ID')}`,
        description: item.name,
        status: '1',
        category: 'DIGITAL PRODUCT'
      };
    });
  }

  async processTopup(productCode, destination, refId) {
    try {
      const response = await axios.get(OKECONNECT_BASE_URL, {
        params: {
          product: productCode,
          dest: destination,
          refID: refId,
          memberID: this.memberId,
          pin: this.pin,
          password: this.password
        }
      });
      return response.data;
    } catch (error) {
      console.error('OkeConnect Process Topup Error:', error.response?.data || error.message);
      throw new Error('Failed to process topup');
    }
  }

  async checkTopupStatus(productCode, destination, refId) {
    try {
      const response = await axios.get(OKECONNECT_BASE_URL, {
        params: {
          memberID: this.memberId,
          pin: this.pin,
          password: this.password,
          product: productCode,
          dest: destination,
          refID: refId
        }
      });
      return response.data;
    } catch (error) {
      console.error('OkeConnect Check Status Error:', error.response?.data || error.message);
      throw new Error('Failed to check topup status');
    }
  }
}

export default new OkeConnectService();
