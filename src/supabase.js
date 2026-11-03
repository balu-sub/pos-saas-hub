import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcrndfislsbxzzkfrawp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8eYBVChz4IW8bLEM6IhjaA_aB5HsJkR';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
