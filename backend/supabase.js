// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PROJECT_URL;
const supabaseAnonKey = process.env.API_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

