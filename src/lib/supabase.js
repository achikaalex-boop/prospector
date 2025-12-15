import { createClient } from '@supabase/supabase-js'

// Remplacez ces valeurs par vos propres clés Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Vérifier si les valeurs sont des placeholders
const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
                     supabaseUrl !== 'YOUR_SUPABASE_URL' &&
                     supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' &&
                     supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'

// Utiliser une URL et clé valides même si non configurées (pour éviter les erreurs)
const finalUrl = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co'
const finalKey = isConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase = createClient(finalUrl, finalKey)

// Avertir en console si Supabase n'est pas configuré
if (!isConfigured && import.meta.env.DEV) {
  console.warn('⚠️ Supabase n\'est pas configuré. Veuillez créer un fichier .env avec vos clés Supabase.')
  console.warn('L\'application fonctionnera en mode démo mais les fonctionnalités nécessitant Supabase ne seront pas disponibles.')
}

