import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TELEKOS_API_KEY = process.env.TELEKOS_API_KEY;
const BASE_URL = 'https://api.telekos.my.id';

const getHeaders = () => ({
  'x-api-key': TELEKOS_API_KEY,
  'Content-Type': 'application/json'
});

const telekosService = {
  // Cek saldo Telekos
  async getBalance() {
    try {
      const response = await axios.get(`${BASE_URL}/api/balance`, { headers: getHeaders() });
      if (response.data.ok) {
        return response.data.saldo;
      }
      throw new Error(response.data.message || 'Gagal mengambil saldo Telekos');
    } catch (error) {
      throw new Error(`Telekos Error: ${error.message}`);
    }
  },

  // Ambil negara Telegram yang tersedia
  async getTgCountries() {
    try {
      const response = await axios.get(`${BASE_URL}/api/telegram/countries`, { headers: getHeaders() });
      if (response.data.ok) {
        return response.data.countries;
      }
      throw new Error(response.data.message || 'Gagal mengambil negara Telegram');
    } catch (error) {
      throw new Error(`Telekos Error: ${error.message}`);
    }
  },

  // Beli nomor Telegram
  async buyTgNumber(countryCode) {
    try {
      const response = await axios.post(`${BASE_URL}/api/telegram/order`, {
        country: countryCode
      }, { headers: getHeaders(), timeout: 70000 }); // timeout 70s karena dari telekos bisa up to 60s
      
      if (response.data.ok) {
        return {
          orderId: response.data.orderId,
          phone: response.data.phone,
          price: response.data.price // I assume it might return price or we just rely on country price
        };
      }
      throw new Error(response.data.error || response.data.message || 'Gagal membeli nomor Telegram');
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Error saat membeli nomor Telegram');
    }
  },

  // Ambil kode Telegram
  async getTgCode(orderId) {
    try {
      const response = await axios.post(`${BASE_URL}/api/telegram/code`, {
        orderId
      }, { headers: getHeaders() });
      
      if (!response.data.ok) {
        throw new Error(response.data.error || 'Gagal mengambil kode Telegram');
      }
      return response.data; // { ok, state: 'ok'/'waiting', code, time }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Error saat mengambil kode Telegram');
    }
  },

  // Cancel order (Mencoba pakai endpoint /api/cancel)
  async cancelOrder(activationId) {
    try {
      const response = await axios.post(`${BASE_URL}/api/cancel`, {
        activationId
      }, { headers: getHeaders() });
      
      if (response.data.ok) {
        return response.data; // { ok, refunded: true/false }
      }
      throw new Error(response.data.error || 'Gagal membatalkan order');
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Error saat membatalkan order');
    }
  }
};

export default telekosService;