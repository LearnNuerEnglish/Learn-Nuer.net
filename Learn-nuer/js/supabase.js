import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://xgqmiervjiilufszooom.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_aP0rSAB9NNOMjZHGLt-ixg_dbo5LqIM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);