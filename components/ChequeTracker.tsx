
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MoreVertical, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Filter, 
  DollarSign, 
  Banknote, 
  X,
  Check,
  ShieldAlert,
  Building2,
  Trash2,
  StickyNote
} from 'lucide-react';
import { Cheque, Branch } from '../types';

interface ChequeTrackerProps {
  selectedBranch: Branch;
  cheques: Cheque[];
  onAddCheque: (cheque: Cheque) => void;
  onUpdateChequeStatus: (id: string, status: Cheque['status']) => void;
  onDeleteCheque: (id: string) => void;
}

const ChequeTracker: React.FC<ChequeTrackerProps> = ({ 
  selectedBranch, 
  cheques, 
  onAddCheque, 
  onUpdateChequeStatus,
  onDeleteCheque
}) => {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State
  const [newCheque, setNewCheque] = useState<Partial<Cheque>>({
    chequeNumber: '',
    bank: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    type: 'INWARD',
    status: 'PENDING',
    referenceId: '',
    remarks: ''
  });

  const filtered = useMemo(() => {
    return cheques.filter(c => {
      const branchMatch = selectedBranch === Branch.ALL || c.branch === selectedBranch;
      const statusMatch = filterStatus === 'ALL' || c.status === filterStatus;
      const searchMatch = c.chequeNumber.includes(search) || 
                          c.bank.toLowerCase().includes(search.toLowerCase()) ||
                          (c.remarks && c.remarks.toLowerCase().includes(search.toLowerCase()));
      return branchMatch && statusMatch && searchMatch;
    });
  }, [cheques, selectedBranch, filterStatus, search]);

  const stats = useMemo(() => {
    const inwardPending = cheques.filter(c => c.type === 'INWARD' && c.status === 'PENDING').reduce((a, b) => a + b.amount, 0);
    const outwardPending = cheques.filter(c => c.type === 'OUTWARD' && c.status === 'PENDING').reduce((a, b) => a + b.amount, 0);
    const bounced = cheques.filter(c => c.status === 'BOUNCED').reduce((a, b) => a + b.amount, 0);
    return { inwardPending, outwardPending, bounced };
  }, [cheques]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheque.chequeNumber || !newCheque.bank || !newCheque.amount) return;

    const cheque: Cheque = {
      id: Math.random().toString(36).substr(2, 9),
      branch: selectedBranch === Branch.ALL ? Branch.MAIN : selectedBranch,
      chequeNumber: newCheque.chequeNumber!,
      bank: newCheque.bank!,
      amount: Number(newCheque.amount!),
      dueDate: newCheque.dueDate!,
      status: 'PENDING',
      type: newCheque.type as 'INWARD' | 'OUTWARD',
      referenceId: newCheque.referenceId || 'MANUAL',
      remarks: newCheque.remarks
    };

    onAddCheque(cheque);
    setIsAdding(false);
    setNewCheque({
      chequeNumber: '',
      bank: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      type: 'INWARD',
      status: 'PENDING',
      referenceId: '',
      remarks: ''
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
             <Banknote className="text-blue-600" size={36} />
             Banking & Cheque Registry
          </h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Financial Instrument Lifecycle Tracking</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] text-xs font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10"
        >
          <Plus size={20} />
          Register New Instrument
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
               <ArrowDownLeft size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Receivables</span>
          </div>
          <div>
             <h4 className="text-3xl font-black text-slate-900 tracking-tighter">Rs. {stats.inwardPending.toLocaleString()}</h4>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Pending Inward Clearance</p>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
               <ArrowUpRight size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor Payables</span>
          </div>
          <div>
             <h4 className="text-3xl font-black text-slate-900 tracking-tighter">Rs. {stats.outwardPending.toLocaleString()}</h4>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Pending Outward Settlement</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12">
            <ShieldAlert size={120} />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
               <AlertCircle size={24} />
            </div>
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Risk Exposure</span>
          </div>
          <div>
             <h4 className="text-3xl font-black text-red-600 tracking-tighter">Rs. {stats.bounced.toLocaleString()}</h4>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Total Bounced Value</p>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center gap-6 bg-slate-50/30">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by cheque number, bank or remarks..." 
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-semibold transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 md:flex-none bg-white border border-slate-200 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="ALL">All Lifecycle Stages</option>
              <option value="PENDING">Pending</option>
              <option value="CLEARED">Cleared</option>
              <option value="BOUNCED">Bounced</option>
            </select>
            <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm transition-all">
               <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-5">Instrument Details</th>
                <th className="px-10 py-5">Remarks</th>
                <th className="px-10 py-5">Branch</th>
                <th className="px-10 py-5">Value</th>
                <th className="px-10 py-5 text-center">System Status</th>
                <th className="px-10 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center opacity-20">
                    <Banknote size={80} strokeWidth={1} className="mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">No Financial Instruments Logged</p>
                  </td>
                </tr>
              ) : (
                filtered.map(cq => (
                  <tr key={cq.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 shadow-sm ${cq.type === 'INWARD' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {cq.type === 'INWARD' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">CHQ-{cq.chequeNumber}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">{cq.bank}</p>
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] font-black text-slate-500 uppercase">
                             <Calendar size={12} className="text-slate-300" />
                             Due: {cq.dueDate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7 max-w-[200px]">
                        {cq.remarks ? (
                          <div className="flex items-start gap-2 group/rem">
                             <StickyNote size={14} className="text-slate-300 mt-0.5 flex-shrink-0" />
                             <p className="text-[11px] font-medium text-slate-500 italic leading-snug line-clamp-2 group-hover/rem:line-clamp-none">
                               {cq.remarks}
                             </p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300 uppercase font-black">None</span>
                        )}
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{cq.branch}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className="text-sm font-black text-slate-900 tracking-tight">Rs. {cq.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-10 py-7 text-center">
                      {cq.status === 'CLEARED' ? (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10">
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : cq.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-200">
                          <Clock size={12} /> In Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-900/10">
                          <AlertCircle size={12} /> Bounced
                        </span>
                      )}
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {cq.status === 'PENDING' && (
                           <>
                             <button 
                               onClick={() => onUpdateChequeStatus(cq.id, 'CLEARED')}
                               className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                               title="Approve Clearance"
                             >
                                <Check size={18} />
                             </button>
                             <button 
                               onClick={() => onUpdateChequeStatus(cq.id, 'BOUNCED')}
                               className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                               title="Report Dishonor"
                             >
                                <ShieldAlert size={18} />
                             </button>
                           </>
                         )}
                         <button 
                           onClick={() => onDeleteCheque(cq.id)}
                           className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                         >
                            <Trash2 size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20">
                       <Building2 size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">Register Instrument</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Manual Entry Mode</p>
                    </div>
                 </div>
                 <button onClick={() => setIsAdding(false)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-600 transition-all">
                    <X size={20} />
                 </button>
              </div>
              
              <form onSubmit={handleRegister} className="p-10 space-y-6 overflow-y-auto scrollbar-hide">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Instrument Type</label>
                       <div className="flex bg-slate-100 p-1 rounded-2xl">
                          <button 
                            type="button"
                            onClick={() => setNewCheque({...newCheque, type: 'INWARD'})}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newCheque.type === 'INWARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                          >
                             Inward
                          </button>
                          <button 
                            type="button"
                            onClick={() => setNewCheque({...newCheque, type: 'OUTWARD'})}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newCheque.type === 'OUTWARD' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}
                          >
                             Outward
                          </button>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount (Rs.)</label>
                       <input 
                         type="number"
                         required
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                         placeholder="0.00"
                         value={newCheque.amount || ''}
                         onChange={(e) => setNewCheque({...newCheque, amount: Number(e.target.value)})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cheque Number</label>
                       <input 
                         type="text"
                         required
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                         placeholder="XXXXXX"
                         value={newCheque.chequeNumber}
                         onChange={(e) => setNewCheque({...newCheque, chequeNumber: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bank Name</label>
                       <input 
                         type="text"
                         required
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                         placeholder="Enter Bank..."
                         value={newCheque.bank}
                         onChange={(e) => setNewCheque({...newCheque, bank: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Due Date</label>
                       <input 
                         type="date"
                         required
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                         value={newCheque.dueDate}
                         onChange={(e) => setNewCheque({...newCheque, dueDate: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reference ID</label>
                       <input 
                         type="text"
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                         placeholder="Buyer/Supplier ID"
                         value={newCheque.referenceId}
                         onChange={(e) => setNewCheque({...newCheque, referenceId: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cheque Remarks (Optional)</label>
                    <textarea 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all h-24 resize-none"
                      placeholder="Enter internal notes, linked invoices, or clearing instructions..."
                      value={newCheque.remarks}
                      onChange={(e) => setNewCheque({...newCheque, remarks: e.target.value})}
                    />
                 </div>

                 <button 
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all mt-4"
                 >
                    Authorize & Secure Instrument
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ChequeTracker;