
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
  };

  const handleDelete = (id: string) => {
    if (window.confirm("CRITICAL: Delete this expense record from the branch ledger?")) {
      onDeleteExpense(id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProofImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3"><TrendingDown className="text-red-500" size={32} /> Operational Costs</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Branch-Wise Expense Ledger</p>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><DollarSign size={20} /></div>
           <div><p className="text-lg font-black text-slate-900 leading-none">Rs. {filteredExpenses.reduce((acc, e) => acc + e.amount, 0).toLocaleString()}</p><p className="text-[8px] font-black text-slate-400 uppercase mt-1">Total Period Cost</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-950 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tight"><Plus className="text-blue-400" /> Record Outflow</h3>
            <div className="space-y-5">
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none"/>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black outline-none"/>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none">
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              <button onClick={() => fileInputRef.current?.click()} className={`w-full py-5 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${proofImage ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                {proofImage ? <CheckCircle2 size={20} /> : <Camera size={20} />}
                <span className="text-xs font-black uppercase tracking-widest">{proofImage ? 'Evidence Ready' : 'Capture Proof'}</span>
              </button>
              <button onClick={handleAdd} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all">Authorize Entry</button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-8">
           <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between"><h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Ledger Entries</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="px-10 py-5">Entry</th>
                      <th className="px-10 py-5">Branch</th>
                      <th className="px-10 py-5">Value</th>
                      <th className="px-10 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredExpenses.map(exp => (
                      <tr key={exp.id} className="group hover:bg-slate-50/50">
                        <td className="px-10 py-7">
                          <p className="text-sm font-black text-slate-800 leading-tight">{exp.description}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{exp.timestamp} • {exp.category}</p>
                        </td>
                        <td className="px-10 py-7"><span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-tight">{exp.branch}</span></td>
                        <td className="px-10 py-7"><span className="text-sm font-black text-red-600">Rs. {exp.amount.toLocaleString()}</span></td>
                        <td className="px-10 py-7 text-right">
                           <button onClick={() => handleDelete(exp.id)} className="p-3 text-slate-300 hover:text-red-500 bg-transparent hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
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
