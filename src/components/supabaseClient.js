import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://llmvoxuaxvjjzqwtppdk.supabase.co'; // Replace with your project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbXZveHVheHZqanpxd3RwcGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTMxNzgsImV4cCI6MjA3MTg4OTE3OH0.t8uDBhyM8cjxoQsPI4DxR1lqSRrvuBYUWgh-PQOE2ok'; // Replace with your project's anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);