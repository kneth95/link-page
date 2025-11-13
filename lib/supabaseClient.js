import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tivmmjeukvkwlydvunqr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpdm1tamV1a3Zrd2x5ZHZ1bnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTI5MTAsImV4cCI6MjA3NDQ2ODkxMH0.SxnQ5jvy4y9Hl97n3R-cLnQT69MLU9narXtM_5cGM_c";

export const supabase = createClient(supabaseUrl, supabaseKey);