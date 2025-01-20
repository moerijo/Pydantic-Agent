import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhibdcxecefvguwzzrda.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoaWJkY3hlY2Vmdmd1d3p6cmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNjE1NzMsImV4cCI6MjA1MjkzNzU3M30.VG9tIr0j99oLrPhKpsaf5_u7EABv_HvkGzcQQm35Glc';

export const supabase = createClient(supabaseUrl, supabaseKey);