import axios from 'axios';

const BASE = process.env.API_URL || 'http://localhost:3001';

async function hit(path: string, token?: string) {
  try {
    const { data, status } = await axios.get(`${BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    console.log(`✅ GET ${path} -> ${status}`, JSON.stringify(data).slice(0, 500));
  } catch (e: any) {
    const res = e?.response;
    console.error(`❌ GET ${path} -> ${res?.status || 'ERR'}`);
    console.error(JSON.stringify(res?.data || e.message, null, 2));
  }
}

(async () => {
  console.log('🔍 DIAGNÓSTICO DE API ENDPOINTS');
  console.log('================================');
  
  await hit('/diag');
  await hit('/health');
  await hit('/catalog/public/test');
  await hit('/catalog/public/categories');
  await hit('/catalog/public/products');
  await hit('/catalog/public/spaces');
  await hit('/catalog/public/combos');
})();





