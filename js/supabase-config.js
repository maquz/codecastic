/**
 * CodeCastic — Supabase Backend Configuration
 * 
 * Instructions:
 * 1. Create a free project at https://supabase.com
 * 2. Copy your Project URL & Anon Key from Settings -> API
 * 3. Replace the placeholder strings below with your actual credentials.
 */

var SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL_HERE";
var SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";

var supabaseClient = null;

if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined' && SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL_HERE") {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabaseClient;
    console.log("⚡ Supabase Backend Client Connected Successfully!");
  } catch (e) {
    console.warn("Supabase initialization deferred:", e);
  }
}
