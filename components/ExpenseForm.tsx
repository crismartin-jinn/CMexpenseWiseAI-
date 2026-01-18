
import React, { useState } from 'react';
import { Category, Expense, ParsedExpense } from '../types';
import { parseRawExpense } from '../services/geminiService';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd }) => {
  const [isAiMode, setIsAiMode] = useState(false);
  const [smartInput, setSmartInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.OTHER);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onAdd({
      amount: parseFloat(amount),
      description,
      category,
      date
    });

    setAmount('');
    setDescription('');
    setCategory(Category.OTHER);
  };

  const handleAiParse = async () => {
    if (!smartInput.trim()) return;
    setIsLoading(true);
    try {
      const result: ParsedExpense = await parseRawExpense(smartInput);
      if (result.amount) setAmount(result.amount.toString());
      if (result.description) setDescription(result.description);
      if (result.category) setCategory(result.category);
      if (result.date) setDate(result.date);
      
      setIsAiMode(false);
      setSmartInput('');
    } catch (error) {
      console.error("AI parse error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setIsAiMode(false)}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${!isAiMode ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <i className="fa-solid fa-pen-to-square mr-2"></i> Manual
        </button>
        <button 
          onClick={() => setIsAiMode(true)}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${isAiMode ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Smart Add
        </button>
      </div>

      <div className="p-6">
        {isAiMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tell Gemini what you spent</label>
              <textarea
                value={smartInput}
                onChange={(e) => setSmartInput(e.target.value)}
                placeholder="e.g., 'Spent 45.50 on lunch at Chipotle yesterday'"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-24"
              />
            </div>
            <button
              onClick={handleAiParse}
              disabled={isLoading || !smartInput.trim()}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i> Analyzing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-magnifying-glass-chart"></i> Parse with AI
                </>
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you buy?"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Amount ($)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  {Object.values(Category).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 mt-2"
            >
              Add Expense
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ExpenseForm;
