// src/client.js
import { createClient } from '@supabase/supabase-js'

const URL     = import.meta.env.VITE_SUPABASE_URL
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// DEBUG: confirm env vars are loaded
console.log('Supabase URL:', URL)
console.log('Supabase Key present?', !!API_KEY)

if (!URL || !API_KEY) {
  throw new Error(
    'Missing Supabase env vars! • Ensure .env at project root • Restart dev server'
  )
}

export const supabase = createClient(URL, API_KEY)
