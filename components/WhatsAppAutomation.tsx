
import React, { useState, useMemo } from 'react';
import { 
  MessageCircle, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  User, 
  Banknote,
  Search,
  Settings2,
  ShieldAlert,
  History,
  ArrowLeft,
  Smartphone
} from 'lucide-react';
import { Buyer, Cheque, Branch, WhatsAppLog } from '../types';

interface WhatsAppAutomationProps {
  buyers: Buyer[];
  cheques: Cheque[];
  selectedBranch: Branch;
  whatsappLogs: WhatsAppLog[];
  onLogMessage: (log: WhatsAppLog) => void;
}

type TemplateType = 'FRIENDLY' | 'PROFESSIONAL' | 'LEGAL';

const WhatsAppAutomation: React.FC<WhatsAppAutomationProps> = ({ buyers, cheques, selectedBranch, whatsappLogs, onLogMessage }) => {
  const [search, setSearch] = useState('');
  const [templateType, setTemplateType] = useState<TemplateType>('PROFESSIONAL');
  const [viewLogs, setViewLogs] = useState(false);

  const upcomingReminders = useMemo(() => {
    const today = new Date();
    const results: any[] = [];

    buyers.forEach(b => {
      if (b.currentCredit > 0) {
        const branchMatch = selectedBranch === Branch.ALL || b.payments.some(p => p.branch === selectedBranch);
        if (branchMatch) {
          results.push({
            id: `buyer-${b.id}`,
            type: 'CREDIT',
            // Fix: Changed b.name to b.shopName as Buyer interface uses shopName
            name: b.shopName,
            phone: b.phone,
            whatsapp: b.whatsappNumber || b.phone,
            amount: b.currentCredit,
            date: b.dueDate || 'N/A',
            isOverdue: b.dueDate ? new Date(b.dueDate) < today : false
          });
        }
      }
    });

    cheques.filter(c => c.status === 'PENDING').forEach(c => {
      const branchMatch = selectedBranch === Branch.ALL || c.branch === selectedBranch;
      if (branchMatch) {
        const linkedBuyer = buyers.find(b => b.id === c.referenceId);
        results.push({
          id: `cheque-${c.id}`,
          type: 'CHEQUE',
          name: `${c.bank} (CHQ-${c.chequeNumber})`,
          phone: linkedBuyer?.phone || '',
          whatsapp: linkedBuyer?.whatsappNumber || linkedBuyer?.phone || '',
          amount: c.amount,
          date: c.dueDate,
          isOverdue: new Date(c.dueDate) < today,
          chequeType: c.type
        });
      }
    });

    return results.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [buyers, cheques, selectedBranch, search]);

  const generateMessage = (item: any) => {
    const branchName = selectedBranch === Branch.ALL ? "Osaka Main Group" : selectedBranch;
    const amountStr = `Rs. ${item.amount.toLocaleString()}`;
    
    if (item.type === 'CREDIT') {
      if (templateType === 'FRIENDLY') return `Hello ${item.name}! 😊 Hope you're doing well. Friendly reminder from ${branchName} regarding your outstanding of ${amountStr}. Please settle whenever convenient. Thanks!`;
      if (templateType === 'PROFESSIONAL') return `Dear ${item.name}, automated notice from ${branchName}. Outstanding credit: ${amountStr}, due on ${item.date}. Please ensure payment is processed. Regards.`;
      return `URGENT LEGAL NOTICE: ${item.name}, credit account at ${branchName} shows OVERDUE balance of ${amountStr}. Failure to settle may suspend privileges. Contact accounts immediately.`;
    } else {
       return `Notice from ${branchName}: Cheque ${item.name} for ${amountStr} clears on ${item.date}. Please ensure funds are available. Thank you.`;
    }
  };

  const handleSend = (item: any) => {
    const msg = generateMessage(item);
    const encodedMsg = encodeURIComponent(msg);
    const targetPhone = item.whatsapp || item.phone;
    
    onLogMessage({
      id: Math.random().toString(36).substr(2, 9),
      recipientName: item.name,
      recipientPhone: targetPhone,
      messageType: item.type === 'CREDIT' ? 'CREDIT_REMINDER' : 'CHEQUE_REMINDER',
      timestamp: new Date().toISOString(),
      status: 'SENT',
      branch: selectedBranch === Branch.ALL ? Branch.MAIN : selectedBranch
    });

    window.open(`https://wa.me/${targetPhone.replace('+', '')}?text=${encodedMsg}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3"><MessageCircle className="text-emerald-500" size={32} /> Communication Hub</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Omni-Channel Reminder Deployment Engine</p>
        </div>
        <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm gap-2">
           <button onClick={() => setViewLogs(!viewLogs)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewLogs ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              <History size={16} /> {viewLogs ? 'Return to Queue' : 'View Dispatch Logs'}
           </button>
           <div className="w-px h-10 bg-slate-100 mx-1"></div>
           {(['FRIENDLY', 'PROFESSIONAL', 'LEGAL'] as TemplateType[]).map(t => (
             <button key={t} onClick={() => setTemplateType(t)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${templateType === t ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Filter</label>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Identity lookup..." className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
                 </div>
              </div>
           </div>
           <div className="bg-emerald-950 text-white p-8 rounded-[3rem] shadow-2xl">
              <h4 className="text-xl font-black mb-4 tracking-tighter">Gateway Secured</h4>
              <p className="text-xs text-emerald-400/80 font-medium leading-relaxed mb-6">Osaka WhatsApp API is authenticated via cloud relay.</p>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                 <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400"><Smartphone size={20} /></div>
                 <div><p className="text-[10px] font-black uppercase tracking-widest">Signal</p><p className="text-xs font-black">Multi-Node: <span className="text-emerald-400">ACTIVE</span></p></div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-9">
           {viewLogs ? (
             <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right-10 duration-500">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Message Archive</h3>
                   <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full">{whatsappLogs.length} Records</span>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="px-10 py-5">Recipient</th>
                            <th className="px-10 py-5">Type</th>
                            <th className="px-10 py-5">Dispatch Time</th>
                            <th className="px-10 py-5 text-right">Gateway Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {whatsappLogs.map(log => (
                            <tr key={log.id}>
                               <td className="px-10 py-6">
                                  <p className="text-sm font-black text-slate-900">{log.recipientName}</p>
                                  <p className="text-[10px] text-slate-400 font-bold">{log.recipientPhone}</p>
                               </td>
                               <td className="px-10 py-6">
                                  <span className="text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full">{log.messageType.replace('_', ' ')}</span>
                               </td>
                               <td className="px-10 py-6 text-xs font-bold text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                               <td className="px-10 py-6 text-right">
                                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center justify-end gap-1"><CheckCircle2 size={12}/> {log.status}</span>
                               </td>
                            </tr>
                         ))}
                         {whatsappLogs.length === 0 && (
                            <tr><td colSpan={4} className="py-32 text-center opacity-30 italic">No historical dispatches found.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
           ) : (
             <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Dispatch Queue</h3>
                   <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full">{upcomingReminders.length} Active Targets</span>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="px-10 py-5">Partner Identity</th>
                            <th className="px-10 py-5">Exposure Value</th>
                            <th className="px-10 py-5">Due Status</th>
                            <th className="px-10 py-5 text-right">Dispatch</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {upcomingReminders.map(item => (
                            <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                               <td className="px-10 py-7">
                                  <div className="flex items-center gap-4">
                                     <div className={`p-3 rounded-2xl ${item.type === 'CREDIT' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{item.type === 'CREDIT' ? <User size={20}/> : <Banknote size={20}/>}</div>
                                     <div>
                                        <p className="text-sm font-black text-slate-900">{item.name}</p>
                                        <div className="flex items-center gap-2 text-slate-400">
                                           <Smartphone size={10} />
                                           <p className="text-[10px] font-bold uppercase tracking-widest">{item.whatsapp}</p>
                                        </div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-10 py-7"><span className="text-sm font-black text-slate-900">Rs. {item.amount.toLocaleString()}</span></td>
                               <td className="px-10 py-7">
                                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border w-fit ${item.isOverdue ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                     {item.date}
                                  </div>
                               </td>
                               <td className="px-10 py-7 text-right">
                                  <button onClick={() => handleSend(item)} className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-900/10"><Send size={18} /></button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppAutomation;
