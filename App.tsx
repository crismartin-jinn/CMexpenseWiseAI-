
import React, { useState, useEffect, useCallback } from 'react';
import { Expense, Category, Budget } from './types';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import AiInsights from './components/AiInsights';
import { fetchExpenses, insertExpense, removeExpense, getSupabase, checkConnection } from './services/supabaseService';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dbError, setDbError] = useState<{msg: string, code?: string} | null>(null);
  const [budget, setBudget] = useState<Budget>({ limit: 2500, period: 'monthly' });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const conn = await checkConnection();
      if (!conn.connected) {
        setDbStatus('error');
        setDbError({ msg: conn.error || "Connection failed", code: conn.code });
      } else {
        setDbStatus('connected');
        setDbError(null);
      }
      
      const data = await fetchExpenses();
      if (data && data.length > 0) {
        setExpenses(data);
      }
    } catch (err: any) {
      setDbStatus('error');
      setDbError({ msg: "Critical database failure" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const client = getSupabase();
    if (client) {
      const channel = client.channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => loadData())
        .subscribe();
      return () => { client.removeChannel(channel); };
    }
  }, [loadData]);

  const addExpense = async (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
    setIsSyncing(true);
    try {
      const savedExpense = await insertExpense(newExpense);
      if (savedExpense) {
        setExpenses(prev => [savedExpense, ...prev]);
        setDbStatus('connected');
      } else {
        const localExpense: Expense = {
          ...newExpense,
          id: `local-${Date.now()}`,
          createdAt: Date.now()
        };
        setExpenses(prev => [localExpense, ...prev]);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteExpense = async (id: string) => {
    setIsSyncing(true);
    try {
      if (id.startsWith('local-')) {
        setExpenses(prev => prev.filter(e => e.id !== id));
      } else {
        const success = await removeExpense(id);
        if (success) setExpenses(prev => prev.filter(e => e.id !== id));
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-chart-pie text-lg"></i>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900">
                  CMexpenseWise<span className="text-indigo-600">AI</span>
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Smart Ledger</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2">
                {dbStatus === 'connected' ? (
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Cloud Synchronized</span>
                  </div>
                ) : (
                  <div className="group relative">
                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 cursor-help">
                      <i className="fa-solid fa-cloud-slash text-amber-500 text-xs"></i>
                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Local Session</span>
                    </div>
                    {dbError && (
                      <div className="absolute top-full right-0 mt-3 w-80 p-5 bg-slate-900 text-white rounded-3xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-[60] pointer-events-auto">
                        <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                          <i className="fa-solid fa-circle-info"></i> Database Connection
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed mb-4">{dbError.msg}</p>
                        {dbError.code && (
                          <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Run this in Supabase SQL Editor:</p>
                            <pre className="text-[9px] bg-black/40 p-3 rounded-xl overflow-x-auto text-indigo-300 border border-white/5">
                              {dbError.code}
                            </pre>
                            <button 
                              onClick={() => navigator.clipboard.writeText(dbError.code!)}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-bold transition-colors"
                            >
                              Copy SQL Script
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {isSyncing && <i className="fa-solid fa-rotate text-indigo-400 animate-spin"></i>}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <AiInsights expenses={expenses} />
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financial Hub</h2>
                <p className="text-sm text-slate-500 font-medium">Monitoring your monthly spending patterns</p>
              </div>
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 px-4">
                 <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Budget Goal</span>
                   <span className="text-sm font-black text-indigo-600">${budget.limit.toLocaleString()}</span>
                 </div>
                 <button 
                  onClick={() => {
                    const val = prompt("Set new monthly budget limit:", budget.limit.toString());
                    if (val && !isNaN(parseFloat(val))) setBudget({ ...budget, limit: parseFloat(val) });
                  }}
                  className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-600 transition-colors flex items-center justify-center"
                 >
                   <i className="fa-solid fa-sliders text-xs"></i>
                 </button>
              </div>
            </div>

            <Dashboard expenses={expenses} budget={budget} />
            <ExpenseList expenses={expenses} onDelete={deleteExpense} />
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-1 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40">
                <ExpenseForm onAdd={addExpense} />
              </div>
              
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                   <i className="fa-solid fa-lightbulb text-6xl"></i>
                </div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-bolt-lightning text-amber-400"></i>
                  Smart Prompting
                </h3>
                <p className="text-indigo-100/70 text-sm leading-relaxed mb-4">
                  "Spent $15.50 on a latte and bagel this morning"
                </p>
                <div className="h-px bg-white/10 w-full mb-4"></div>
                <p className="text-[11px] font-medium text-indigo-300">
                  Gemini will extract amount, category, and date automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
