Import '../config/env.js'; // Load env first!
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

  // Map e-wallet types to OkeConnect filter
  getProductFilter(ewalletType) {
    const filterMap = {
      dana: (item) => item.kode.startsWith('D') && item.kategori === 'DOMPET DIGITAL',
      gopay: (item) => item.kode.startsWith('GPY'),
      ovo: (item) => item.kode.startsWith('OVO'),
      shopeepay: (item) => item.kode.startsWith('SHP'),
      linkaja: (item) => item.kode.startsWith('LINK')
    };
    return filterMap[ewalletType.toLowerCase()];
  }

  async getAvailableProducts(ewalletType) {
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

      // Filter berdasarkan e-wallet type
      const filter = this.getProductFilter(ewalletType);
      if (!filter) {
        throw new Error('Invalid e-wallet type');
      }

      const filteredProducts = allProducts.filter(filter);

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
      return this.getFallbackProducts(ewalletType);
    }
  }

  // Fallback products when OkeConnect is down
  getFallbackProducts(ewalletType) {
    const fallbackData = {
      dana: [
        { code: 'D10', name: 'DANA 10.000', base: 10000 },
        { code: 'D15', name: 'DANA 15.000', base: 15000 },
        { code: 'D20', name: 'DANA 20.000', base: 20000 },
        { code: 'D25', name: 'DANA 25.000', base: 25000 },
        { code: 'D50', name: 'DANA 50.000', base: 50000 },
        { code: 'D75', name: 'DANA 75.000', base: 75000 },
        { code: 'D100', name: 'DANA 100.000', base: 100000 },
        { code: 'D150', name: 'DANA 150.000', base: 150000 },
        { code: 'D200', name: 'DANA 200.000', base: 200000 },
        { code: 'D300', name: 'DANA 300.000', base: 300000 },
      ],
      gopay: [
        { code: 'GPY10', name: 'GoPay 10.000', base: 10000 },
        { code: 'GPY20', name: 'GoPay 20.000', base: 20000 },
        { code: 'GPY25', name: 'GoPay 25.000', base: 25000 },
        { code: 'GPY50', name: 'GoPay 50.000', base: 50000 },
        { code: 'GPY100', name: 'GoPay 100.000', base: 100000 },
        { code: 'GPY150', name: 'GoPay 150.000', base: 150000 },
        { code: 'GPY200', name: 'GoPay 200.000', base: 200000 },
      ],
      ovo: [
        { code: 'OVO10', name: 'OVO 10.000', base: 10000 },
        { code: 'OVO20', name: 'OVO 20.000', base: 20000 },
        { code: 'OVO25', name: 'OVO 25.000', base: 25000 },
        { code: 'OVO50', name: 'OVO 50.000', base: 50000 },
        { code: 'OVO100', name: 'OVO 100.000', base: 100000 },
        { code: 'OVO150', name: 'OVO 150.000', base: 150000 },
        { code: 'OVO200', name: 'OVO 200.000', base: 200000 },
      ],
      shopeepay: [
        { code: 'SHP10', name: 'ShopeePay 10.000', base: 10000 },
        { code: 'SHP20', name: 'ShopeePay 20.000', base: 20000 },
        { code: 'SHP25', name: 'ShopeePay 25.000', base: 25000 },
        { code: 'SHP50', name: 'ShopeePay 50.000', base: 50000 },
        { code: 'SHP100', name: 'ShopeePay 100.000', base: 100000 },
        { code: 'SHP150', name: 'ShopeePay 150.000', base: 150000 },
        { code: 'SHP200', name: 'ShopeePay 200.000', base: 200000 },
      ],
      linkaja: [
        { code: 'LINK10', name: 'LinkAja 10.000', base: 10000 },
        { code: 'LINK20', name: 'LinkAja 20.000', base: 20000 },
        { code: 'LINK25', name: 'LinkAja 25.000', base: 25000 },
        { code: 'LINK50', name: 'LinkAja 50.000', base: 50000 },
        { code: 'LINK100', name: 'LinkAja 100.000', base: 100000 },
        { code: 'LINK150', name: 'LinkAja 150.000', base: 150000 },
        { code: 'LINK200', name: 'LinkAja 200.000', base: 200000 },
      ]
    };

    const products = fallbackData[ewalletType.toLowerCase()] || [];
    
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
        category: 'DOMPET DIGITAL'
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
