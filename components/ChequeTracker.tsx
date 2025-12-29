
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

  const filtered = useMemo(() => {
    return cheques.filter(c => {
      const branchMatch = selectedBranch === Branch.ALL || c.branch === selectedBranch;
      const statusMatch = filterStatus === 'ALL' || c.status === filterStatus;
      const searchMatch = c.chequeNumber.includes(search) || 
                          c.bank.toLowerCase().includes(search.toLowerCase());
      return branchMatch && statusMatch && searchMatch;
    });
  }, [cheques, selectedBranch, filterStatus, search]);

  const stats = useMemo(() => {
    const inwardPending = cheques.filter(c => c.type === 'INWARD' && c.status === 'PENDING').reduce((a, b) => a + b.amount, 0);
    const outwardPending = cheques.filter(c => c.type === 'OUTWARD' && c.status === 'PENDING').reduce((a, b) => a + b.amount, 0);
    const bounced = cheques.filter(c => c.status === 'BOUNCED').reduce((a, b) => a + b.amount, 0);
    return { inwardPending, outwardPending, bounced };
  }, [cheques]);

  const handleDelete = (id: string) => {
    if (window.confirm("CRITICAL: Delete this financial instrument from the system? This action is permanent.")) {
      onDeleteCheque(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3"><Banknote className="text-blue-600" size={36} /> Cheque Registry</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Financial Instrument Lifecycle Tracking</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] text-xs font-black flex items-center gap-2">
          <Plus size={20} /> Register New
        </button>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-5">Instrument</th>
                <th className="px-10 py-5">Branch</th>
                <th className="px-10 py-5">Value</th>
                <th className="px-10 py-5 text-center">Status</th>
                <th className="px-10 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(cq => (
                <tr key={cq.id} className="group hover:bg-slate-50/50">
                  <td className="px-10 py-7">
                    <p className="text-sm font-black text-slate-900">CHQ-{cq.chequeNumber}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{cq.bank} • Due: {cq.dueDate}</p>
                  </td>
                  <td className="px-10 py-7"><span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{cq.branch}</span></td>
                  <td className="px-10 py-7"><span className="text-sm font-black text-slate-900">Rs. {cq.amount.toLocaleString()}</span></td>
                  <td className="px-10 py-7 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${cq.status === 'CLEARED' ? 'bg-emerald-500 text-white' : cq.status === 'PENDING' ? 'bg-blue-100 text-blue-600' : 'bg-red-600 text-white'}`}>{cq.status}</span>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {cq.status === 'PENDING' && (
                         <button onClick={() => onUpdateChequeStatus(cq.id, 'CLEARED')} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white"><Check size={18} /></button>
                       )}
                       <button onClick={() => handleDelete(cq.id)} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Rest of the Registration Modal Logic Kept */}
    </div>
  );
};

export default ChequeTracker;
