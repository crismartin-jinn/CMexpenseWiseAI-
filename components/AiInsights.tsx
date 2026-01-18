
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
    if (expenses.length > 0) {
      refreshInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses.length]);

  return (
    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
      {/* Abstract patterns */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <i className="fa-solid fa-sparkles text-xl"></i>
            </div>
            <h2 className="text-xl font-bold">AI Financial Coach</h2>
          </div>
          <button 
            onClick={refreshInsights}
            disabled={loading}
            className="text-xs font-medium bg-white/10 hover:bg-white/20 py-2 px-4 rounded-full border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-arrows-rotate"></i>}
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-4 py-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
              <div className="h-20 bg-white/10 rounded-2xl"></div>
              <div className="h-20 bg-white/10 rounded-2xl"></div>
              <div className="h-20 bg-white/10 rounded-2xl"></div>
            </div>
          </div>
        ) : insight ? (
          <div className="space-y-8">
            <p className="text-indigo-100 text-lg leading-relaxed font-medium">
              "{insight.summary}"
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {insight.suggestions.slice(0, 3).map((suggestion, idx) => (
                <div key={idx} className="bg-white/10 border border-white/10 p-4 rounded-2xl backdrop-blur-md hover:bg-white/20 transition-all group">
                  <div className="flex items-start gap-3">
                    <span className="bg-indigo-400/30 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full mt-0.5 font-bold group-hover:bg-indigo-300/40">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium leading-snug">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>

            {insight.topSpendingCategory && insight.topSpendingCategory !== "N/A" && (
              <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-200">
                <i className="fa-solid fa-fire"></i> Primary Focus: {insight.topSpendingCategory}
              </div>
            )}
          </div>
        ) : (
          <p className="text-indigo-200 italic">No insights available yet. Add some data to begin.</p>
        )}
      </div>
    </div>
  );
};

export default AiInsights;
