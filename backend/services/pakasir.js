import '../config/env.js'; // Load env first!
import axios from 'axios';

const PAKASIR_BASE_URL = 'https://app.pakasir.com/api';

class PakasirService {
  constructor() {
    this.slug = process.env.PAKASIR_SLUG;
    this.apiKey = process.env.PAKASIR_API_KEY;
    
    console.log('🔍 Pakasir Service Initialized:');
    console.log('- Slug:', this.slug || '❌ MISSING');
    console.log('- ApiKey:', this.apiKey ? '✅ Set' : '❌ MISSING');
    
    if (!this.slug || !this.apiKey) {
      console.error('⚠️ WARNING: Pakasir credentials not found in .env');
    }
  }

  async createQris(orderId, amount) {
    try {
      const payload = {
        project: this.slug,
        order_id: orderId,
        amount: amount,
        api_key: this.apiKey
      };

      console.log('Pakasir Create Request:', JSON.stringify(payload, null, 2));

      const response = await axios({
        method: 'POST',
        url: `${PAKASIR_BASE_URL}/transactioncreate/qris`,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500
      });
      
      console.log('Pakasir Response Status:', response.status);
      console.log('Pakasir Response Data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.error('❌ Pakasir Request Timeout (30s)');
      }
      console.error('❌ Pakasir Create QRIS Error:', error.response?.data || error.message);
      throw new Error('Failed to create QRIS payment');
    }
  }

  async checkStatus(orderId, amount) {
    try {
      const params = {
        project: this.slug,        // lowercase!
        order_id: orderId,         // snake_case!
        amount: amount,
        api_key: this.apiKey       // snake_case!
      };

      const response = await axios.get(`${PAKASIR_BASE_URL}/transactiondetail`, { params });
      return response.data;
    } catch (error) {
      console.error('Pakasir Check Status Error:', error.response?.data || error.message);
      throw new Error('Failed to check payment status');
    }
  }

  async cancelTransaction(orderId, amount) {
    try {
      const payload = {
        project: this.slug,        // lowercase!
        order_id: orderId,         // snake_case!
        amount: amount,
        api_key: this.apiKey       // snake_case!
      };

      const response = await axios.post(`${PAKASIR_BASE_URL}/transactioncancel`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Pakasir Cancel Error:', error.response?.data || error.message);
      throw new Error('Failed to cancel transaction');
    }
  }
}

export default new PakasirService();
