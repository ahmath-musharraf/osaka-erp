
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  Lock, 
  ArrowRightLeft, 
  Activity, 
  ShieldAlert, 
  Trophy,
  Zap,
  BarChart,
  Target,
  CloudLightning,
  AlertTriangle
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as ReBarChart, Bar, Cell } from 'recharts';
import { Branch, Transaction, Expense, UserRole, PaymentMethod, Buyer, AuditLog } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  expenses: Expense[];
  selectedBranch: Branch;
  role: UserRole;
  buyers?: Buyer[];
  auditLogs?: AuditLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, expenses, selectedBranch, role, auditLogs = [] }) => {
  if (role === UserRole.STAFF) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10 text-center font-['Inter']">
        <div className="p-6 bg-slate-50 rounded-full mb-6 text-slate-300"><Lock size={64} strokeWidth={1.5} /></div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm font-medium">Dashboards are restricted to Admin level access for financial security.</p>
      </div>
    );
  }

  const currentBranch = selectedBranch === Branch.ALL ? Branch.ALL : selectedBranch;

  const filteredTransactions = useMemo(() => 
    currentBranch === Branch.ALL ? transactions : transactions.filter(t => t.branch === currentBranch)
  , [transactions, currentBranch]);
    
  const filteredExpenses = useMemo(() => 
    currentBranch === Branch.ALL ? expenses : expenses.filter(e => e.branch === currentBranch)
  , [expenses, currentBranch]);

  const performanceScores = useMemo(() => {
    return Object.values(Branch).filter(b => b !== Branch.ALL).map(b => {
      const bSales = transactions.filter(t => t.branch === b).reduce((acc, t) => acc + t.totalAmount, 0);
      const bExpenses = expenses.filter(e => e.branch === b).reduce((acc, e) => acc + e.amount, 0);
      const bCredits = transactions.filter(t => t.branch === b && t.paymentMethod === PaymentMethod.CREDIT).reduce((acc, t) => acc + (t.totalAmount - t.paidAmount), 0);
      
      const revenueScore = Math.min((bSales / 100000) * 50, 50);
      const expenseEfficiency = Math.max(0, 25 - (bExpenses / (bSales || 1) * 100));
      const creditSafety = Math.max(0, 25 - (bCredits / (bSales || 1) * 100));
      
      return { 
        name: b.replace('Osaka ', ''), 
        score: Math.round(revenueScore + expenseEfficiency + creditSafety) 
      };
    }).sort((a, b) => b.score - a.score);
  }, [transactions, expenses]);

  const fraudAlerts = useMemo(() => {
    return auditLogs.filter(l => l.severity === 'CRITICAL' || l.severity === 'HIGH').slice(0, 6);
  }, [auditLogs]);

  const metrics = useMemo(() => {
    const totalSales = filteredTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const totalCreditIssued = filteredTransactions.filter(t => t.paymentMethod === PaymentMethod.CREDIT).reduce((acc, t) => acc + (t.totalAmount - t.paidAmount), 0);
    const totalCashIn = filteredTransactions.reduce((acc, t) => acc + t.paidAmount, 0);
    const totalExpensesValue = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netCash = totalCashIn - totalExpensesValue;

    return { totalSales, totalCreditIssued, totalCashIn, totalExpensesValue, netCash };
  }, [filteredTransactions, filteredExpenses, currentBranch]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 font-['Inter']">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
            {currentBranch === Branch.ALL ? "Enterprise Command" : "Branch Control Center"}
            <span className="flex items-center gap-2 bg-emerald-100 text-emerald-700 text-[10px] px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm font-black">
               <CloudLightning size={12} /> Sync Status: Verified
            </span>
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 flex items-center gap-2"><Activity size={12} className="text-blue-500" /> Unified Multi-Branch Financial Core</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Network Revenue" value={`Rs. ${metrics.totalSales.toLocaleString()}`} icon={<TrendingUp className="text-blue-600" />} subtitle="Combined POS Volume" color="bg-white" highlight="text-blue-600" />
        <StatCard title="Global Credit Risk" value={`Rs. ${metrics.totalCreditIssued.toLocaleString()}`} icon={<CreditCard className="text-red-600" />} subtitle="Accounts Receivable" color="bg-white" highlight="text-red-600" />
        <StatCard title="Master Net Cash" value={`Rs. ${metrics.netCash.toLocaleString()}`} icon={<ArrowRightLeft className="text-emerald-600" />} subtitle="Realized Profitability" color="bg-white" highlight="text-emerald-600" />
        <StatCard title="Elite Branch Score" value={`${performanceScores[0]?.score || 0}/100`} icon={<Trophy className="text-amber-500" />} subtitle={`Leading: ${performanceScores[0]?.name}`} color="bg-white" highlight="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Performance Scorecard Visualization */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="flex justify-between items-center mb-10 relative z-10">
              <h3 className="font-black text-slate-900 flex items-center gap-3 text-lg"><Target size={24} className="text-blue-600" /> Branch Balanced Scorecard</h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Recovery Mix Score
              </div>
           </div>
           
           <div className="space-y-6 relative z-10">
              {performanceScores.map((branch, idx) => (
                <div key={branch.name} className="flex items-center gap-6 group">
                   <div className="w-16 text-[10px] font-black text-slate-400 uppercase tracking-widest">{branch.name}</div>
                   <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 shadow-sm ${branch.score > 80 ? 'bg-emerald-500' : branch.score > 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                        style={{ width: `${branch.score}%` }}
                      ></div>
                   </div>
                   <div className="w-12 text-sm font-black text-slate-900 text-right">{branch.score}</div>
                   {idx === 0 && <Trophy className="text-amber-400" size={18} />}
                </div>
              ))}
           </div>
        </div>

        {/* Fraud Watch Panel */}
        <div className="lg:col-span-4 bg-slate-950 text-white p-10 rounded-[4rem] border border-white/5 shadow-2xl flex flex-col relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><ShieldAlert size={120} /></div>
           <h3 className="font-black text-red-500 flex items-center gap-3 text-lg mb-8 relative z-10"><AlertTriangle size={24} /> Forensic Fraud Watch</h3>
           <div className="flex-1 space-y-4 relative z-10 scrollbar-hide overflow-y-auto max-h-[400px]">
              {fraudAlerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 py-20">
                   <Zap size={48} className="text-slate-500 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Global Integrity Check: OK</p>
                </div>
              ) : (
                fraudAlerts.map(alert => (
                  <div key={alert.id} className="bg-white/5 p-5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                     <div className="flex justify-between mb-2">
                        <span className="text-[9px] font-black bg-red-600/20 text-red-400 px-3 py-1 rounded-full uppercase tracking-tighter">Violation</span>
                        <span className="text-[9px] font-black text-slate-500 uppercase">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                     </div>
                     <p className="text-xs font-black text-white leading-tight">{alert.action}</p>
                     <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{alert.target}</p>
                  </div>
                ))
              )}
           </div>
           <button className="mt-8 py-4 bg-white/5 border border-white/10 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all relative z-10">
              Audit Full Forensic Log
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 group">
           <h3 className="font-black text-2xl tracking-tighter mb-8 flex items-center gap-4 text-slate-950">
             <TrendingUp size={24} className="text-blue-600" /> Revenue Distribution
           </h3>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <ReBarChart data={performanceScores.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="score" radius={[10, 10, 0, 0]}>
                       {performanceScores.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#e2e8f0'} />
                       ))}
                    </Bar>
                 </ReBarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-blue-600 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><BarChart size={180} /></div>
           <div className="relative z-10">
              <h3 className="font-black text-lg mb-6 flex items-center gap-3 uppercase tracking-widest">Financial Liquidity Matrix</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
                    <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-2">Network Net Cash</p>
                    <h4 className="text-2xl font-black">Rs. {metrics.netCash.toLocaleString()}</h4>
                 </div>
                 <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
                    <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-2">Pending Expenses</p>
                    <h4 className="text-2xl font-black text-white/50">Rs. {metrics.totalExpensesValue.toLocaleString()}</h4>
                 </div>
              </div>
           </div>
           <div className="mt-8 relative z-10">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-white transition-all duration-1000" style={{ width: `${(metrics.netCash / (metrics.totalSales || 1)) * 100}%` }}></div>
              </div>
              <p className="text-[9px] font-black text-blue-100 mt-2 uppercase tracking-[0.2em]">Efficiency Coefficient: {Math.round((metrics.netCash / (metrics.totalSales || 1)) * 100)}%</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, subtitle, color, highlight }: any) => (
  <div className={`${color} p-8 rounded-[2.5rem] shadow-sm border transition-all duration-500 group hover:shadow-2xl hover:scale-[1.02] border-slate-100`}>
    <div className="flex justify-between items-start mb-6">
      <div className="p-4 rounded-2xl bg-slate-50 group-hover:bg-white shadow-xl transition-all">{icon}</div>
    </div>
    <div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
      <h4 className={`text-2xl font-black tracking-tighter ${highlight}`}>{value}</h4>
      <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">{subtitle}</p>
    </div>
  </div>
);

export default Dashboard;
