import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://caeimiygjylczdyqveqj.supabase.co', // Supabase URL
  'sb_publishable_oPdW233USzhha9CwnK9R-w_4i7dzJKj' // Publishable API Key
);

export { supabase };
