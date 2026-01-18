
import React, { useState, useEffect } from 'react';
import { Expense } from './types';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import AiInsights from './components/AiInsights';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('spendwise_expenses');
    if (saved) {
      setExpenses(JSON.parse(saved));
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('spendwise_expenses', JSON.stringify(expenses));
    }
  }, [expenses, isInitialized]);

  const addExpense = (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
    const expenseWithId: Expense = {
      ...newExpense,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setExpenses(prev => [expenseWithId, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Top Header */}
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
              <span className="hidden sm:inline-flex text-xs font-semibold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                Dashboard V1.0
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Stats & List */}
          <div className="lg:col-span-8 space-y-8">
            <AiInsights expenses={expenses} />
            <Dashboard expenses={expenses} />
            <ExpenseList expenses={expenses} onDelete={deleteExpense} />
          </div>

          {/* Right Side: Sticky Add Form */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="flex flex-col gap-2 mb-2">
                <h2 className="text-lg font-bold text-slate-900">Track New Spend</h2>
                <p className="text-sm text-slate-500">Add manually or use AI to parse natural language notes.</p>
              </div>
              <ExpenseForm onAdd={addExpense} />
              
              {/* Quick Tips Box */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Smart Hack</h4>
                <p className="text-sm leading-relaxed text-slate-300">
                  Try saying things like <span className="text-indigo-400 italic font-medium">"25 bucks for gas on tuesday"</span> in the AI tab to save time!
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-14 h-14 bg-indigo-600 rounded-full text-white shadow-2xl shadow-indigo-400 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <i className="fa-solid fa-plus text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default App;
