const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL ||"https://llmvoxuaxvjjzqwtppdk.supabase.co";  
const SUPABASE_KEY = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbXZveHVheHZqanpxd3RwcGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTMxNzgsImV4cCI6MjA3MTg4OTE3OH0.t8uDBhyM8cjxoQsPI4DxR1lqSRrvuBYUWgh-PQOE2ok";  

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = { supabase };
