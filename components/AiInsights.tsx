
import React, { useState, useEffect } from 'react';
import { Expense, SpendingInsight } from '../types';
import { analyzeSpending } from '../services/geminiService';

interface AiInsightsProps {
  expenses: Expense[];
}

const AiInsights: React.FC<AiInsightsProps> = ({ expenses }) => {
  const [insight, setInsight] = useState<SpendingInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshInsights = async () => {
    if (expenses.length === 0) return;
    setLoading(true);
    try {
      const data = await analyzeSpending(expenses);
      setInsight(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInsights();
  }, [expenses.length]);

  return (
    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
              <i className="fa-solid fa-wand-magic-sparkles text-xl text-indigo-100"></i>
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Financial Strategist</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-bold text-indigo-100/70 uppercase tracking-widest">Live Analysis</span>
              </div>
            </div>
          </div>
          <button 
            onClick={refreshInsights}
            disabled={loading}
            className="group bg-white/10 hover:bg-white/20 p-3 rounded-2xl border border-white/10 backdrop-blur-md transition-all active:scale-95"
          >
            <i className={`fa-solid fa-arrows-rotate text-sm ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}></i>
          </button>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-6 bg-white/10 rounded-lg w-3/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 bg-white/5 rounded-3xl"></div>
              <div className="h-24 bg-white/5 rounded-3xl"></div>
              <div className="h-24 bg-white/5 rounded-3xl"></div>
            </div>
          </div>
        ) : insight ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
               <div className="flex-grow">
                 <p className="text-lg font-medium text-indigo-50 leading-relaxed mb-6 italic">
                   "{insight.summary}"
                 </p>
                 <div className="flex flex-wrap gap-3">
                   {insight.suggestions.map((s, i) => (
                     <div key={i} className="flex items-center gap-2 bg-indigo-500/30 border border-white/10 px-4 py-2.5 rounded-2xl hover:bg-indigo-500/50 transition-all cursor-default">
                        <span className="text-indigo-200 font-black text-xs">{i+1}</span>
                        <span className="text-sm font-semibold">{s}</span>
                     </div>
                   ))}
                 </div>
               </div>

               {insight.forecastedTotal && (
                 <div className="flex-shrink-0 bg-white/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-xl min-w-[200px] flex flex-col items-center">
                    <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Month-End Forecast</span>
                    <span className="text-3xl font-black">${insight.forecastedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                       <div className="h-full bg-indigo-300 w-2/3 animate-progress-glow"></div>
                    </div>
                 </div>
               )}
            </div>

            {insight.anomalies && insight.anomalies.length > 0 && (
              <div className="flex items-center gap-4 bg-rose-500/20 border border-rose-500/20 p-4 rounded-2xl animate-fade-in">
                 <div className="w-10 h-10 rounded-xl bg-rose-500/40 flex items-center justify-center text-rose-200">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                 </div>
                 <div className="flex-grow">
                   <p className="text-xs font-black text-rose-200 uppercase tracking-widest mb-1">Unusual Activity Detected</p>
                   <p className="text-sm font-medium text-rose-50">{insight.anomalies[0]}</p>
                 </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-indigo-200/60 font-medium italic">Your spending pattern is quiet. Start adding data to generate strategy.</p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes progress-glow {
            0% { opacity: 0.5; transform: translateX(-100%); }
            50% { opacity: 1; transform: translateX(50%); }
            100% { opacity: 0.5; transform: translateX(100%); }
        }
        .animate-progress-glow {
            animation: progress-glow 3s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default AiInsights;
