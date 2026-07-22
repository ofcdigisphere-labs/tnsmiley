import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables once at the very beginning
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Debug: Log if env vars are loaded
console.log('🔧 Environment Variables Loaded:');
console.log('- PAKASIR_SLUG:', process.env.PAKASIR_SLUG || '❌ MISSING');
console.log('- PAKASIR_API_KEY:', process.env.PAKASIR_API_KEY ? '✅ Set' : '❌ MISSING');
console.log('- OKECONNECT_MEMBER_ID:', process.env.OKECONNECT_MEMBER_ID || '❌ MISSING');
console.log('');

export default process.env;
