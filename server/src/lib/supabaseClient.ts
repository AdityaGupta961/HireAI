import { createClient } from '@supabase/supabase-js';
require("dotenv").config();

const PROJECT_URL = process.env.PROJECT_URL!;
const PUBLIC_ANON_KEY = process.env.PUBLIC_ANON_KEY!;
export const supabase = createClient(PROJECT_URL, PUBLIC_ANON_KEY);