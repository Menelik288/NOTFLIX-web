import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzyxefwwkqjrmtlogngz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6eXhlZnd3a3Fqcm10bG9nbmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTUxNzQsImV4cCI6MjA4ODEzMTE3NH0.F08RLlMGphOaDn1HnBSze-BDRqwN1gFHIrI9DqVTS10';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Attempting to get media reviews...");
  try {
    const { data, error } = await supabase.rpc('get_media_reviews', { m_id: 12345 });
    if (error) {
      console.log("RPC get_media_reviews failed:", error);
    } else {
      console.log("RPC get_media_reviews success:", data);
    }
  } catch (err) {
    console.log("Exception:", err);
  }
}

test();
