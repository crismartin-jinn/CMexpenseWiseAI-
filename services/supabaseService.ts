
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Expense } from '../types';

const supabaseUrl = "https://camlgpfnssryqrrpxamg.supabase.co";
const MANUAL_KEY_FALLBACK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhbWxncGZuc3NyeXFycnB4YW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Mjg0OTIsImV4cCI6MjA4NDMwNDQ5Mn0.lDEt2scLRWtGhcyhgNFURyBIQlHotJX04Cmnz9lAOnI"; 

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;
  
  const envKey = (process.env as any).API_KEY; 
  const supabaseAnonKey = MANUAL_KEY_FALLBACK || envKey;

  if (!supabaseAnonKey || supabaseAnonKey.length < 20) return null;

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
    return null;
  }
};

export const checkConnection = async (): Promise<{connected: boolean, error?: string}> => {
  const client = getSupabase();
  if (!client) return { connected: false, error: "Supabase client not initialized. Check your API keys." };
  
  try {
    // Attempt to query the table schema or a single row
    const { error } = await client.from('expenses').select('id').limit(1);
    
    if (error) {
      // Specific error code for "Relation does not exist" (Table missing)
      if (error.code === 'PGRST116' || error.message.includes('relation "expenses" does not exist')) {
        return { connected: true, error: "Table 'expenses' does not exist. Please run the SQL setup script in your Supabase dashboard." };
      }
      return { connected: false, error: `Database error: ${error.message}` };
    }
    return { connected: true };
  } catch (e: any) {
    return { connected: false, error: `Connection failed: ${e.message}` };
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
    
    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      id: item.id,
      amount: parseFloat(item.amount),
      date: item.date,
      category: item.category,
      description: item.description,
      createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now()
    })) as Expense[];
  } catch (error) {
    console.error('Fetch Error:', error);
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

    if (error) throw error;
    
    return { 
      ...data, 
      amount: parseFloat(data.amount),
      createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now() 
    } as Expense;
  } catch (error) {
    console.error('Insert Error:', error);
    return null;
  }
};

export const removeExpense = async (id: string): Promise<boolean> => {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('expenses').delete().eq('id', id);
    return !error;
  } catch (error) {
    return false;
  }
};
