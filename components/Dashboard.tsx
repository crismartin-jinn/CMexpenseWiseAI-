
import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Expense, Category, Budget } from '../types';
import { CATEGORY_COLORS } from '../services/constants';

interface DashboardProps {
  expenses: Expense[];
  budget: Budget;
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, budget }) => {
  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const budgetUsage = (totalSpent / budget.limit) * 100;
  
  const statusColor = useMemo(() => {
    if (budgetUsage > 100) return 'text-rose-600';
    if (budgetUsage > 80) return 'text-amber-600';
    return 'text-emerald-600';
  }, [budgetUsage]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(e => {
      data[e.category] = (data[e.category] || 0) + e.amount;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const dailyData = useMemo(() => {
    const data: Record<string, number> = {};
    const dates = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    dates.forEach(date => data[date] = 0);
    expenses.forEach(e => {
      if (data[e.date] !== undefined) data[e.date] += e.amount;
    });

    let cumulative = 0;
    return Object.entries(data).map(([date, amount]) => {
      cumulative += amount;
      return {
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        amount,
        cumulative
      };
    });
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center transition-all hover:border-indigo-300">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-200 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
          <i className="fa-solid fa-chart-line text-3xl"></i>
        </div>
        <h3 className="text-xl font-bold text-slate-800">Financial Insights Await</h3>
        <p className="text-slate-400 text-sm max-w-xs mt-2">Log your daily spending to see AI-powered charts and savings opportunities.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Budget Status Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
        <div className="relative mb-4">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
            <circle 
              cx="64" 
              cy="64" 
              r="58" 
              stroke="currentColor" 
              strokeWidth="12" 
              fill="transparent" 
              strokeDasharray={364.4} 
              strokeDashoffset={364.4 - (364.4 * Math.min(budgetUsage, 100)) / 100}
              strokeLinecap="round"
              className={`${statusColor.replace('text', 'stroke')} transition-all duration-1000 ease-in-out`} 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black ${statusColor}`}>{Math.round(budgetUsage)}%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Used</span>
          </div>
        </div>
        <h3 className="font-bold text-slate-800">Monthly Budget</h3>
        <p className="text-sm text-slate-500 mt-1">${totalSpent.toFixed(0)} of ${budget.limit.toFixed(0)}</p>
      </div>

      {/* Spending Trend */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-arrow-trend-up text-indigo-500"></i>
            Spending Velocity
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">Last 14 Days</span>
        </div>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: '700' }}
              />
              <Area type="monotone" dataKey="cumulative" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categories */}
      <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800">Category Breakdown</h3>
            <div className="flex gap-2">
                {categoryData.slice(0, 3).map(c => (
                    <div key={c.name} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-500 border border-slate-100">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c.name as Category] }} />
                        {c.name}
                    </div>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categoryData.map(c => (
                <div key={c.name} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all cursor-default group">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{c.name}</p>
                    <p className="text-lg font-black text-slate-900 mt-1">${c.value.toLocaleString()}</p>
                    <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                        <div 
                            className="h-full rounded-full transition-all duration-1000" 
                            style={{ 
                                width: `${(c.value / totalSpent) * 100}%`,
                                backgroundColor: CATEGORY_COLORS[c.name as Category]
                            }} 
                        />
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
