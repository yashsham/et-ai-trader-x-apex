import { createClient } from '@supabase/supabase-js'

// Supabase public credentials — the anon key is a public client-side key
// designed for use with Row Level Security (RLS). Safe to include here.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string)
  || 'https://pymmyhcxjxoopihhiwcr.supabase.co'
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bW15aGN4anhvb3BpaGhpd2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTIzMjQsImV4cCI6MjA4OTM4ODMyNH0.8BHoRkqn_7wMZWExI4dKMDk-2TU9Nvoxz_C3vJjgiWA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Type definitions matching DB schema ──────────────────────────
export interface AnalysisResult {
  id: string
  symbol: string
  decision: 'BUY' | 'SELL' | 'HOLD' | 'UNKNOWN'
  decision_output: string
  portfolio: Record<string, unknown>
  created_at: string
}

export interface WatchlistItem {
  id: string
  symbol: string
  added_at: string
}

export interface AuditLog {
  id: string
  event_type: string
  severity: string
  user_id: string
  details: Record<string, unknown>
  created_at: string
}

export interface UserSettings {
  id: string
  full_name: string
  email: string
  timezone: string
  notifications: boolean
}

// ── Helper functions ─────────────────────────────────────────────
export async function getAnalysisHistory(symbol: string, limit = 10): Promise<AnalysisResult[]> {
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('symbol', symbol.toUpperCase())
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[Supabase] getAnalysisHistory error:', error)
    return []
  }
  return data ?? []
}

export async function getAllAnalyses(limit = 50): Promise<AnalysisResult[]> {
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[Supabase] getAllAnalyses error:', error)
    return []
  }
  return data ?? []
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .order('added_at', { ascending: false })

  if (error) {
    console.error('[Supabase] getWatchlist error:', error)
    return []
  }
  return data ?? []
}

export async function addToWatchlist(symbol: string): Promise<WatchlistItem | null> {
  const { data, error } = await supabase
    .from('watchlist')
    .upsert({ symbol: symbol.toUpperCase() }, { onConflict: 'symbol' })
    .select()
    .single()

  if (error) {
    console.error('[Supabase] addToWatchlist error:', error)
    return null
  }
  return data
}

export async function removeFromWatchlist(symbol: string): Promise<boolean> {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('symbol', symbol.toUpperCase())

  if (error) {
    console.error('[Supabase] removeFromWatchlist error:', error)
    return false
  }
  return true
}

// ── Settings ─────────────────────────────────────────────────────
export async function getSettings(userId = 'default_user'): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[Supabase] getSettings error:', error)
    return null
  }
  return data
}

export async function updateSettings(settings: Partial<UserSettings>, userId = 'default_user'): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ id: userId, ...settings }, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('[Supabase] updateSettings error:', error)
    return null
  }
  return data
}
