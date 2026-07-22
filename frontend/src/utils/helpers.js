/**
 * Format number to Rupiah currency
 */
export const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate time left in minutes
 */
export const getTimeLeft = (expiryTimestamp) => {
  const now = Date.now();
  const diff = expiryTimestamp - now;
  
  if (diff <= 0) return 0;
  
  return Math.floor(diff / 60000); // Convert to minutes
};

/**
 * Format timestamp to readable date/time
 */
export const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Validate phone number (Indonesian format)
 */
export const validatePhoneNumber = (phone) => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if starts with 08 or 62
  if (cleaned.startsWith('08')) {
    return cleaned.length >= 10 && cleaned.length <= 13;
  } else if (cleaned.startsWith('62')) {
    return cleaned.length >= 11 && cleaned.length <= 14;
  }
  
  return false;
};
