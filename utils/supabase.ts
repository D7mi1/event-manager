import { createClient } from '@supabase/supabase-js';

// نستخدم علامة || لوضع قيمة احتياطية تمنع توقف البناء
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://temporary-placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "temporary-placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey);