import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// ป้องกัน App Crash (หน้าขาว) ถ้าใส่ URL ไม่ถูกต้องหรือยังไม่ได้ใส่
let isValidUrl = false;
try {
  if (supabaseUrl) {
    new URL(supabaseUrl);
    isValidUrl = true;
  }
} catch (e) {
  console.error("Invalid Supabase URL format.");
}

if (!isValidUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing or invalid Supabase environment variables. Please add them to .env.local!');
}

// ถ้า URL ไม่ถูกต้อง จะสร้าง Dummy Object ไปก่อน เพื่อไม่ให้หน้าเว็บขาว
export const supabase = isValidUrl 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : ({
      auth: {
        signUp: async () => ({ data: null, error: { message: "Supabase is not configured yet." } }),
        signInWithPassword: async () => ({ data: null, error: { message: "Supabase is not configured yet." } })
      }
    } as any);

