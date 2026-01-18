
import React, { useState, useEffect, useCallback } from 'react';
import { Expense } from './types';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import AiInsights from './components/AiInsights';
import { fetchExpenses, insertExpense, removeExpense, getSupabase, checkConnection } from './services/supabaseService';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connStatus, setConnStatus] = useState<{connected: boolean, error?: string}>({ connected: false });

  const loadData = useCallback(async () => {
    const status = await checkConnection();
    setConnStatus(status);
    
    if (status.connected && !status.error) {
      setIsLoading(true);
      try {
        const data = await fetchExpenses();
        setExpenses(data);
      } catch (err) {
        console.error("Load failed", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    const client = getSupabase();
    if (client) {
      const channel = client.channel('db-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'expenses' 
        }, () => {
          loadData();
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [loadData]);

  const addExpense = async (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
    setIsSyncing(true);
    try {
      const savedExpense = await insertExpense(newExpense);
      if (savedExpense) {
        setExpenses(prev => [savedExpense, ...prev]);
      } else {
        alert("Could not save. Is the 'expenses' table created in Supabase?");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteExpense = async (id: string) => {
    setIsSyncing(true);
    if (await removeExpense(id)) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
    setIsSyncing(false);
  };

  const isFullyConnected = connStatus.connected && !connStatus.error;

  return (
    <div className="min-h-screen pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">CMexpenseWise<span className="text-indigo-600">AI</span></span>
            </div>
            <div className="flex items-center gap-4">
              {isSyncing && (
                <span className="text-xs text-indigo-500 animate-pulse font-medium">
                  <i className="fa-solid fa-cloud-arrow-up mr-1"></i> Syncing...
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!isFullyConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <div className="bg-amber-50 text-amber-600 w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-xl">
              <i className="fa-solid fa-database text-4xl"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Database Not Found</h2>
            <p className="text-slate-500 max-w-lg mb-10 text-lg leading-relaxed">
              Your API key works, but the <code className="bg-slate-100 px-2 py-1 rounded text-indigo-600 font-mono">expenses</code> table is missing. 
              Run the following SQL in your Supabase SQL Editor:
            </p>
            
            <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl text-left w-full max-w-2xl shadow-2xl relative group">
              <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap text-indigo-300">
{`CREATE TABLE expenses (
  id uuid primary key default uuid_generate_v4(),
  amount numeric not null,
  date text not null,
  category text not null,
  description text,
  created_at timestamp with time zone default now()
);`}
              </pre>
              <button 
                onClick={() => loadData()}
                className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                I've run the SQL - Try Again
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-96">
             <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
             <p className="text-slate-500 font-medium">Fetching your records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <AiInsights expenses={expenses} />
              <Dashboard expenses={expenses} />
              <ExpenseList expenses={expenses} onDelete={deleteExpense} />
            </div>
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-circle-plus text-indigo-500"></i>
                  New Transaction
                </h2>
                <ExpenseForm onAdd={addExpense} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
