
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Expense } from '../types';

/**
 * SQL for Supabase Editor:
 * 
 * CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
 * CREATE TABLE expenses (
 *   id uuid primary key default uuid_generate_v4(),
 *   amount numeric not null,
 *   date text not null,
 *   category text not null,
 *   description text,
 *   created_at timestamp with time zone default now()
 * );
 * ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow public access" ON expenses FOR ALL USING (true);
 */

const supabaseUrl = "https://camlgpfnssryqrrpxamg.supabase.co";
const supabaseAnonKey = "sb_publishable_yteBZWJ5_2w1lZiZPa6zAw_QwVnrXdp";

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  } catch (e: any) {
    console.error("Supabase Init Error:", e?.message || JSON.stringify(e));
    return null;
  }
};

export const checkConnection = async (): Promise<{connected: boolean; error?: string; code?: string}> => {
  const client = getSupabase();
  if (!client) return { connected: false, error: "Supabase client not initialized" };
  try {
    const { error } = await client.from('expenses').select('id').limit(1);
    if (error) {
      const msg = error.message || JSON.stringify(error);
      if (msg.includes("relation \"expenses\" does not exist")) {
        return { 
          connected: false, 
          error: "The 'expenses' table is missing from your database.",
          code: `CREATE TABLE expenses (\n  id uuid primary key default uuid_generate_v4(),\n  amount numeric not null,\n  date text not null,\n  category text not null,\n  description text,\n  created_at timestamp with time zone default now()\n);`
        };
      }
      return { connected: false, error: msg };
    }
    return { connected: true };
  } catch (e: any) {
    return { connected: false, error: e?.message || "Network Error" };
  }
};

export const fetchExpenses = async (): Promise<Expense[]> => {
  const client = getSupabase();
  if (!client) return [];
  try {
    const { data, error } = await client
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) return [];
    
    return (data || []).map((item: any) => ({
      id: item.id,
      amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount,
      date: item.date,
      category: item.category,
      description: item.description || '',
      createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now()
    })) as Expense[];
  } catch {
    return [];
  }
};

export const insertExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense | null> => {
  const client = getSupabase();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) return null;
    return { 
      ...data, 
      amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
      createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now() 
    } as Expense;
  } catch {
    return null;
  }
};

export const removeExpense = async (id: string): Promise<boolean> => {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('expenses').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
};
