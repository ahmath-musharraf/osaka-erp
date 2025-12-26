
import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Plus, 
  DollarSign, 
  Camera, 
  FileText, 
  Trash2, 
  ExternalLink, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from 'recharts';
import { Expense, Branch } from '../types';

interface ExpenseTrackerProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  selectedBranch: Branch;
}

const CATEGORIES = ['Rent', 'Utilities', 'Transport', 'Salary', 'Marketing', 'Maintenance', 'Other'];
const CATEGORY_COLORS: Record<string, string> = {
  'Rent': '#3b82f6',
  'Utilities': '#f59e0b',
  'Transport': '#10b981',
  'Salary': '#8b5cf6',
  'Marketing': '#ec4899',
  'Maintenance': '#64748b',
  'Other': '#94a3b8'
};

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ expenses, onAddExpense, onDeleteExpense, selectedBranch }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredExpenses = useMemo(() => {
    return selectedBranch === Branch.ALL 
      ? expenses 
      : expenses.filter(e => e.branch === selectedBranch);
  }, [expenses, selectedBranch]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + e.amount;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  // Mock monthly data for comparison chart
  const monthlyComparisonData = [
    { name: 'Mar', amount: 45000 },
    { name: 'Apr', amount: 52000 },
    { name: 'May', amount: 48000 },
    { name: 'Jun', amount: filteredExpenses.reduce((acc, e) => acc + e.amount, 0) },
  ];

  const handleAdd = () => {
    if (!description || !amount) return;
    
    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      branch: selectedBranch === Branch.ALL ? Branch.MAIN : selectedBranch,
      description,
      amount: parseFloat(amount),
      category,
      proofImageUrl: proofImage || undefined,
      timestamp: new Date().toISOString().split('T')[0]
    };
    
    onAddExpense(newExpense);
    setDescription('');
    setAmount('');
    setProofImage(null);
    setIsRecording(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
             <TrendingDown className="text-red-500" size={32} />
             Operational Costs
          </h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Branch-Wise Expense Ledger & Evidence</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                <DollarSign size={20} />
              </div>
              <div>
                 <p className="text-lg font-black text-slate-900 leading-none">
                    Rs. {filteredExpenses.reduce((acc, e) => acc + e.amount, 0).toLocaleString()}
                 </p>
                 <p className="text-[8px] font-black text-slate-400 uppercase mt-1 tracking-widest">Total Period Cost</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recording Panel */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-950 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
            
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tight">
              <Plus className="text-blue-400" />
              Record Outflow
            </h3>
            
            <div className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Description</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. June Electricity Bill"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-white/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Amount (Rs)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-5 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${proofImage ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10 text-slate-400 hover:border-blue-500 hover:text-blue-500'}`}
                >
                  {proofImage ? <CheckCircle2 size={20} /> : <Camera size={20} />}
                  <span className="text-xs font-black uppercase tracking-widest">{proofImage ? 'Voucher Attached' : 'Capture Bill Proof'}</span>
                </button>

                <button 
                  onClick={handleAdd}
                  disabled={!description || !amount}
                  className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:bg-blue-500 hover:scale-[1.02] active:scale-95 disabled:opacity-20 disabled:grayscale transition-all"
                >
                  Authorize Entry
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <PieChartIcon size={14} /> Category Weighted Outflow
             </h4>
             <div className="space-y-4">
                {categoryData.length === 0 ? (
                  <p className="text-xs text-slate-300 italic text-center py-10">No category data logged</p>
                ) : (
                  categoryData.map((d) => (
                    <div key={d.name} className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                        <span className="text-slate-600">{d.name}</span>
                        <span className="text-slate-900">Rs. {d.value.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-1000"
                          style={{ 
                            width: `${(d.value / filteredExpenses.reduce((acc, e) => acc + e.amount, 0)) * 100}%`,
                            backgroundColor: CATEGORY_COLORS[d.name] || '#3b82f6'
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Intelligence & History */}
        <div className="xl:col-span-2 space-y-8">
           {/* Monthly Comparison Chart */}
           <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="font-black text-slate-900 flex items-center gap-3 text-lg">
                    <Calendar size={24} className="text-blue-600" />
                    Expense Velocity Matrix
                 </h3>
                 <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <button className="px-5 py-2 text-[10px] font-black bg-white rounded-lg shadow-sm text-blue-600 uppercase tracking-widest">Monthly Trend</button>
                    <button className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Mix</button>
                 </div>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}}
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 800 }}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                       {monthlyComparisonData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === monthlyComparisonData.length - 1 ? '#ef4444' : '#e2e8f0'} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-2">
                 <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                    <ArrowUpRight size={14} />
                 </div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Projected Month End: <span className="text-slate-900 font-black">Rs. 58,200</span> 
                    <span className="ml-2 text-red-500">(+12% vs last month)</span>
                 </p>
              </div>
           </div>

           {/* Expense Table */}
           <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                 <div className="relative w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Filter entries..." 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                 </div>
                 <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all">
                    <Filter size={18} />
                 </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="px-10 py-5">Entry Details</th>
                      <th className="px-10 py-5 text-center">Branch</th>
                      <th className="px-10 py-5">Value</th>
                      <th className="px-10 py-5">Evidence</th>
                      <th className="px-10 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center opacity-20">
                          <FileText size={64} className="mx-auto mb-4" />
                          <p className="text-xs font-black uppercase tracking-[0.3em]">No Expense Records Found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map(exp => (
                        <tr key={exp.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-7">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm" style={{ backgroundColor: `${CATEGORY_COLORS[exp.category]}15`, color: CATEGORY_COLORS[exp.category] }}>
                                  {exp.category.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-800 leading-tight">{exp.description}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                                     <Calendar size={10} /> {exp.timestamp} • {exp.category}
                                  </p>
                               </div>
                            </div>
                          </td>
                          <td className="px-10 py-7 text-center">
                             <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-tight">
                                {exp.branch}
                             </span>
                          </td>
                          <td className="px-10 py-7">
                             <span className="text-sm font-black text-red-600">Rs. {exp.amount.toLocaleString()}</span>
                          </td>
                          <td className="px-10 py-7">
                             {exp.proofImageUrl ? (
                                <button className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden relative group/img shadow-inner border border-slate-200">
                                   <img src={exp.proofImageUrl} className="w-full h-full object-cover opacity-50 group-hover/img:opacity-100 transition-all duration-300" />
                                   <ExternalLink size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover/img:opacity-100 drop-shadow-md" />
                                </button>
                             ) : (
                                <div className="text-[10px] font-black text-red-400 uppercase tracking-tighter flex items-center gap-1">
                                   No Proof
                                </div>
                             )}
                          </td>
                          <td className="px-10 py-7 text-right">
                             <button 
                               onClick={() => onDeleteExpense(exp.id)}
                               className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                             >
                                <Trash2 size={18} />
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
