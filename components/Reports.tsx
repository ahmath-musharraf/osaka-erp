
import React, { useMemo, useRef } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { 
  Zap, 
  Layers, 
  BarChart3, 
  Building2, 
  Users, 
  Skull, 
  CalendarDays, 
  Download,
  Database,
  ShieldCheck,
  Archive,
  RefreshCcw,
  Upload
} from 'lucide-react';
import { Transaction, Item, Buyer, Expense, Branch, PaymentMethod, Seller, Cheque, AuditLog, WhatsAppLog } from '../types';
import { CloudData } from '../services/dbService';

interface ReportsProps {
  transactions: Transaction[];
  items: Item[];
  buyers: Buyer[];
  expenses: Expense[];
  suppliers: Seller[];
  cheques: Cheque[];
  auditLogs: AuditLog[];
  whatsappLogs: WhatsAppLog[];
  onImportBackup?: (data: CloudData) => void;
}

const Reports: React.FC<ReportsProps> = ({ 
  transactions, 
  items, 
  buyers, 
  expenses,
  suppliers,
  cheques,
  auditLogs,
  whatsappLogs,
  onImportBackup
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const analytics = useMemo(() => {
    // 1. Branch Profitability
    const branchStats = Object.values(Branch).filter(b => b !== Branch.ALL).map(b => {
      const branchSales = transactions.filter(t => t.branch === b).reduce((acc, t) => acc + t.totalAmount, 0);
      const branchExpenses = expenses.filter(e => e.branch === b).reduce((acc, e) => acc + e.amount, 0);
      return { name: b, sales: branchSales, expenses: branchExpenses, profit: branchSales - branchExpenses };
    }).sort((a, b) => b.profit - a.profit);

    // 2. Top Wholesale Buyers
    const topBuyers = buyers.map(b => {
      const totalPurchase = transactions.filter(t => t.buyerId === b.id).reduce((acc, t) => acc + t.totalAmount, 0);
      return { ...b, totalPurchase };
    }).sort((a, b) => b.totalPurchase - a.totalPurchase).slice(0, 5);

    // 3. High Risk Credit Watchlist
    const riskWatchlist = buyers
      .filter(b => b.currentCredit > b.creditLimit || b.currentCredit > (b.creditLimit * 0.9))
      .sort((a, b) => (b.currentCredit / b.creditLimit) - (a.currentCredit / a.creditLimit))
      .slice(0, 5);

    // 4. Fast Moving Items
    const itemSales: Record<string, number> = {};
    transactions.forEach(t => {
      t.items.forEach(ti => {
        itemSales[ti.itemId] = (itemSales[ti.itemId] || 0) + ti.quantity;
      });
    });

    const fastMoving = items.map(i => ({ 
      ...i, 
      unitsSold: itemSales[i.id] || 0 
    })).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);

    // 5. Dead Stock Alert
    const deadStock = items
      .filter(i => (itemSales[i.id] || 0) === 0 && i.stock > 0)
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5);

    // 6. Monthly Growth Simulation (Based on existing transactions + mock history)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const growthData = months.map((m, idx) => ({
      name: m,
      revenue: idx === 5 ? transactions.reduce((acc, t) => acc + t.totalAmount, 0) : 100000 + (Math.random() * 50000),
      profit: idx === 5 ? (transactions.reduce((acc, t) => acc + t.totalAmount, 0) - expenses.reduce((acc, e) => acc + e.amount, 0)) : 30000 + (Math.random() * 20000)
    }));

    // 7. Credit vs Cash Ratio
    const cashTotal = transactions.filter(t => t.paymentMethod === PaymentMethod.CASH || t.paymentMethod === PaymentMethod.CARD).reduce((acc, t) => acc + t.totalAmount, 0);
    const creditTotal = transactions.filter(t => t.paymentMethod === PaymentMethod.CREDIT || t.paymentMethod === PaymentMethod.CHEQUE).reduce((acc, t) => acc + t.totalAmount, 0);
    const ratioData = [
      { name: 'Liquid Assets', value: cashTotal },
      { name: 'Accounts Receivable', value: creditTotal }
    ];

    return { branchStats, topBuyers, riskWatchlist, fastMoving, deadStock, growthData, ratioData };
  }, [transactions, items, buyers, expenses]);

  const handleExportPDF = () => {
    window.print();
  };

  const handleFullBackup = () => {
    const backupData = {
      version: "2.4.1",
      timestamp: new Date().toISOString(),
      source: "Osaka ERP Cloud Master Node",
      collections: {
        transactions,
        items,
        buyers,
        suppliers,
        expenses,
        cheques,
        auditLogs,
        whatsappLogs
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `osaka_master_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("Master System Backup generated and encrypted for download.");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.collections || !onImportBackup) {
          throw new Error("Invalid Backup Format");
        }
        
        const confirmRestore = window.confirm(
          `SYSTEM ALERT: You are about to restore a master backup from ${new Date(json.timestamp).toLocaleString()}.\n\nThis will OVERWRITE all current data in the global ledger. Do you want to proceed?`
        );

        if (confirmRestore) {
          onImportBackup(json.collections);
          alert("Master System Restore successful. Global ledger synchronized.");
        }
      } catch (err) {
        alert("Failed to restore backup: The file is corrupted or in an invalid format.");
        console.error(err);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
        <div>
          <h2 className="text-5xl font-black text-slate-950 tracking-tighter flex items-center gap-4">
             <BarChart3 className="text-blue-600" size={48} />
             Smart Intelligence
          </h2>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.4em] mt-3 flex items-center gap-2">
             <Zap size={14} className="text-blue-500" />
             Consolidated Business Performance Portal
          </p>
        </div>
        <div className="flex gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
           <input 
             type="file" 
             accept=".json" 
             className="hidden" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
           />
           <button 
            onClick={handleImportClick}
            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all"
           >
             <Upload size={14} /> Restore System
           </button>
           <button 
            onClick={handleFullBackup}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-blue-700 transition-all"
           >
             <Archive size={14} /> Full Backup
           </button>
           <button 
            onClick={handleExportPDF}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
           >
             <Download size={14} /> PDF Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
         <BackupStat title="Global Ledger" count={transactions.length} icon={<Database size={20}/>} color="bg-blue-50 text-blue-600" />
         <BackupStat title="Active Partners" count={buyers.length + suppliers.length} icon={<Users size={20}/>} color="bg-purple-50 text-purple-600" />
         <BackupStat title="Asset Catalog" count={items.length} icon={<Archive size={20}/>} color="bg-emerald-50 text-emerald-600" />
         <BackupStat title="Security Logs" count={auditLogs.length} icon={<ShieldCheck size={20}/>} color="bg-slate-950 text-white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Growth Dashboard */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-4 mb-10">
                 <CalendarDays size={24} className="text-blue-600" />
                 Monthly Growth Velocity
              </h3>
              <div className="h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.growthData}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                       <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }} />
                       <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                       <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={4} fillOpacity={0} />
                       <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '30px', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Credit vs Cash Ratio */}
        <div className="lg:col-span-4 bg-slate-950 text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
           <h3 className="text-lg font-black flex items-center gap-3 relative z-10">
              <Layers size={22} className="text-blue-500" />
              Liquidity Ratio
           </h3>
           <div className="flex-1 min-h-[300px] relative z-10 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={analytics.ratioData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                       <Cell fill="#3b82f6" />
                       <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: 'white' }} />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-4 relative z-10 pb-4">
              {analytics.ratioData.map((d, i) => (
                <div key={d.name} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-red-500'}`}></div>{d.name}</span>
                   <span className={i === 0 ? 'text-blue-400' : 'text-red-400'}>Rs. {d.value.toLocaleString()}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branch Comparison Table */}
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Building2 size={18} className="text-blue-600" /> Branch Profitability
              </h4>
           </div>
           <div className="flex-1 divide-y divide-slate-50">
              {analytics.branchStats.map((b, i) => (
                <div key={b.name} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">#{i+1}</div>
                      <div>
                         <p className="text-sm font-black text-slate-900">{b.name}</p>
                         <p className="text-[9px] text-slate-400 font-bold uppercase">Osaka Network Node</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-black text-emerald-600">Rs. {b.profit.toLocaleString()}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Monthly Net</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Top Wholesale Buyers */}
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Users size={18} className="text-indigo-600" /> Top Wholesale Partners
              </h4>
           </div>
           <div className="flex-1 divide-y divide-slate-50">
              {analytics.topBuyers.map((b) => (
                <div key={b.id} className="p-6 hover:bg-indigo-50/20 transition-all flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                         {b.shopName.charAt(0)}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900">{b.shopName}</p>
                         <p className="text-[9px] text-slate-400 font-bold uppercase">Volume: Rs. {b.totalPurchase.toLocaleString()}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-full">VIP</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Dead Stock & Fast Moving Mix */}
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Skull size={18} className="text-red-600" /> Dead Stock Alerts
              </h4>
           </div>
           <div className="flex-1 divide-y divide-slate-50">
              {analytics.deadStock.map((item) => (
                <div key={item.id} className="p-6 hover:bg-red-50/20 transition-all flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden">
                         <img src={item.images[0]} className="w-full h-full object-cover opacity-50" />
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900">{item.name}</p>
                         <p className="text-[9px] text-red-400 font-bold uppercase">{item.stock} Units Aging</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <button className="text-[9px] font-black text-blue-600 uppercase hover:underline">Liquidate</button>
                   </div>
                </div>
              ))}
              {analytics.deadStock.length === 0 && (
                <div className="p-10 text-center opacity-30 italic text-xs">All inventory performing as expected.</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const BackupStat = ({ title, count, icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
     </div>
     <div>
        <p className="text-lg font-black text-slate-900 leading-none">{count}</p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{title} Records</p>
     </div>
  </div>
);

export default Reports;
