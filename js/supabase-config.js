/**
 * CodeCastic — Supabase Backend Configuration
 * 
 * Instructions:
 * 1. Create a free project at https://supabase.com
 * 2. Copy your Project URL & Anon Key from Settings -> API
 * 3. Replace the placeholder strings below with your actual credentials.
 */

var SUPABASE_URL = "https://tkpuycjpsffetvhtqoqa.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcHV5Y2pwc2ZmZXR2aHRxb3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNzIyMjQsImV4cCI6MjEwNDY0ODIyNH0.KEh3j41NL9KVKLVTwu7973fF6lWfKj42rKA_ijY9sQc";

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
