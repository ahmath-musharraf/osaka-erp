
import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Clock, 
  MapPin, 
  AlertTriangle,
  Download,
  Terminal
} from 'lucide-react';
import { AuditLog, Branch } from '../types';

interface AuditLogsProps {
  logs: AuditLog[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<Branch>(Branch.ALL);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const branchMatch = branchFilter === Branch.ALL || log.branch === branchFilter;
      const searchMatch = 
        log.action.toLowerCase().includes(search.toLowerCase()) || 
        log.target.toLowerCase().includes(search.toLowerCase()) ||
        log.userId.toLowerCase().includes(search.toLowerCase());
      return branchMatch && searchMatch;
    });
  }, [logs, branchFilter, search]);

  const getSeverityStyles = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 text-white shadow-lg shadow-red-900/40 animate-pulse';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-blue-600 text-white';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
             <ShieldCheck className="text-blue-600" size={40} />
             System Audit Terminal
          </h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
             <Terminal size={12} className="text-blue-500" />
             Forensic Edit History • Global Network Accountability
          </p>
        </div>
        <div className="flex gap-4">
           <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest">
              <Download size={16} /> Export Forensic Dump
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center gap-6 bg-slate-50/30">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Filter by action, user ID, or target asset..." 
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-semibold transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value as Branch)}
              className="flex-1 md:flex-none bg-white border border-slate-200 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm"
            >
               {Object.values(Branch).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-5">Forensic Identifier</th>
                <th className="px-10 py-5">Identity & Branch</th>
                <th className="px-10 py-5">Action Matrix</th>
                <th className="px-10 py-5">Modification Delta</th>
                <th className="px-10 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map(log => (
                <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                     <div className="space-y-1">
                        <p className="text-xs font-black text-slate-900 font-mono tracking-tight">#{log.id.toUpperCase()}</p>
                        <div className="flex items-center gap-2 text-slate-400">
                           <Clock size={12} />
                           <span className="text-[10px] font-bold uppercase">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                           <User size={18} />
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-800">{log.userId}</p>
                           <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1">
                              <MapPin size={10} /> {log.branch}
                           </p>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{log.action}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 italic">{log.target}</p>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 min-w-[200px]">
                        <span className="text-xs font-bold text-red-500 line-through opacity-60">{log.oldValue || '∅'}</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        <span className="text-xs font-black text-emerald-600">{log.newValue || '∅'}</span>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getSeverityStyles(log.severity)}`}>
                        {log.severity}
                     </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-32 text-center opacity-20">
                      <ShieldCheck size={80} strokeWidth={1} className="mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-[0.3em]">No Forensic Evidence in Current Query</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Intelligence Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col justify-between group hover:shadow-2xl hover:shadow-slate-900/30 transition-all">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Critical Risk Events</h4>
            <div className="flex items-end justify-between">
               <h3 className="text-4xl font-black">{filteredLogs.filter(l => l.severity === 'CRITICAL').length}</h3>
               <div className="p-3 bg-red-600/20 text-red-500 rounded-2xl">
                  <AlertTriangle size={24} />
               </div>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col justify-between shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Branch Origin Mix</h4>
            <p className="text-xs font-bold text-slate-500 italic">Audit streams aggregated from 6 distributed nodes.</p>
         </div>
         <div className="bg-blue-600 p-8 rounded-[3rem] text-white flex flex-col justify-between shadow-xl shadow-blue-600/20">
            <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-6">Data Integrity Status</h4>
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
               <span className="text-sm font-black uppercase tracking-widest">Master Ledger Synced</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AuditLogs;
