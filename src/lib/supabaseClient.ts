import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Supabase URL must start with http/https. We format it safely here to prevent parser crashes.
const formattedUrl = supabaseUrl
  ? supabaseUrl.startsWith("http")
    ? supabaseUrl
    : `https://${supabaseUrl}`
  : "https://placeholder.supabase.co"; // safe fallback to prevent client initialization crashes

export const supabase = createClient(formattedUrl, supabaseAnonKey);
