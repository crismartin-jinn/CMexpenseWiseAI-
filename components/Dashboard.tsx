
import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Expense, Category } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../services/constants';

interface DashboardProps {
  expenses: Expense[];
}

const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

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
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    dates.forEach(date => {
      data[date] = 0;
    });

    expenses.forEach(e => {
      if (data[e.date] !== undefined) {
        data[e.date] += e.amount;
      }
    });

    return Object.entries(data).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      amount
    }));
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="bg-indigo-50 text-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <i className="fa-solid fa-chart-line text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-slate-800">No Data Yet</h3>
        <p className="text-slate-500 max-w-xs">Start adding expenses to see your spending visualizations here.</p>
      </div>
    );
  }

  const maxCategoryValue = Math.max(...categoryData.map(d => d.value));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Summary Cards */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spending</p>
          <p className="text-3xl font-extrabold text-slate-900">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Average Bill</p>
          <p className="text-3xl font-extrabold text-slate-900">
            ${(totalSpent / (expenses.length || 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Transactions</p>
          <p className="text-3xl font-extrabold text-slate-900">{expenses.length}</p>
        </div>
      </div>

      {/* Enhanced Category Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-pie-chart text-indigo-500"></i>
          Spending by Category
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
          {/* Donut Chart */}
          <div className="h-[200px] md:h-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="90%"
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] || '#ccc'} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
              <span className="text-lg font-extrabold text-slate-800">${totalSpent > 1000 ? (totalSpent/1000).toFixed(1) + 'k' : totalSpent.toFixed(0)}</span>
            </div>
          </div>

          {/* Ranked List with Progress Bars */}
          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {categoryData.map((item) => {
              const cat = item.name as Category;
              const percentage = ((item.value / totalSpent) * 100).toFixed(0);
              const barWidth = (item.value / maxCategoryValue) * 100;
              
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <span style={{ color: CATEGORY_COLORS[cat] }}>{CATEGORY_ICONS[cat]}</span>
                      <span className="truncate max-w-[100px]">{cat}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">${item.value.toFixed(0)}</span>
                      <span className="text-slate-400 text-xs ml-1">{percentage}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${barWidth}%`, 
                        backgroundColor: CATEGORY_COLORS[cat] 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spending Trend */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-indigo-500"></i>
          Weekly Flow
        </h3>
        <div className="h-[250px] md:h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#6366f1" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6, strokeWidth: 0 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
