
import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
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
  
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate() || 1;
  const targetPace = (budget.limit / daysInMonth) * currentDay;
  const isOverPacing = totalSpent > targetPace;

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
    const dayBudgetStep = budget.limit / daysInMonth;
    
    return Object.entries(data).map(([date, amount]) => {
      cumulative += amount;
      const d = new Date(date);
      const dayOfMonth = d.getDate();
      return {
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        "Actual Spend": cumulative,
        "Target Pace": dayBudgetStep * dayOfMonth,
        daily: amount
      };
    });
  }, [expenses, budget.limit, daysInMonth]);

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
            <span className="text-[10px] font-bold text-slate-400 uppercase">Budget Used</span>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-800">Spend Overview</h3>
          <p className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-900">${totalSpent.toFixed(0)}</span> of ${budget.limit.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Spending Pace Card */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-gauge-high text-indigo-500"></i>
              Spending Pace
            </h3>
            <p className="text-xs text-slate-500 font-medium">Comparing trend vs. budget</p>
          </div>
          <div className={`px-4 py-2 rounded-2xl flex items-center gap-3 border ${isOverPacing ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isOverPacing ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
            <span className={`text-xs font-black uppercase tracking-wider ${isOverPacing ? 'text-rose-700' : 'text-emerald-700'}`}>
              {isOverPacing ? 'Spending Too Fast' : 'Under Target Pace'}
            </span>
          </div>
        </div>

        {/* Stable Height Container for Recharts */}
        <div className="h-[250px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isOverPacing ? "#f43f5e" : "#6366f1"} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={isOverPacing ? "#f43f5e" : "#6366f1"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const actual = payload[0].value as number;
                    const target = payload[1].value as number;
                    const diff = actual - target;
                    return (
                      <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[160px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{payload[0].payload.date}</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-xs font-bold text-slate-600">Total Spent:</span>
                            <span className="text-xs font-black text-slate-900">${actual.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-xs font-bold text-slate-600">Ideal Target:</span>
                            <span className="text-xs font-black text-slate-400">${target.toFixed(2)}</span>
                          </div>
                          <div className={`pt-1.5 mt-1.5 border-t border-slate-50 flex justify-between items-center font-black text-xs ${diff > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            <span>{diff > 0 ? 'Over' : 'Safe'}:</span>
                            <span>${Math.abs(diff).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="Actual Spend" 
                stroke={isOverPacing ? "#f43f5e" : "#6366f1"} 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorActual)" 
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="Target Pace" 
                stroke="#cbd5e1" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                fill="transparent" 
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Daily Burn Rate</p>
            <p className="text-lg font-black text-slate-900">${(totalSpent / currentDay).toFixed(2)}<span className="text-[10px] text-slate-400 font-bold">/day</span></p>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Recommended Max</p>
            <p className="text-lg font-black text-slate-900">${((budget.limit - totalSpent) / Math.max(1, (daysInMonth - currentDay + 1))).toFixed(2)}<span className="text-[10px] text-slate-400 font-bold">/day</span></p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800">Category Breakdown</h3>
            <div className="hidden md:flex gap-2">
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
