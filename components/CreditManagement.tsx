import React, { useState, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  Phone, 
  CreditCard, 
  Calendar, 
  MessageCircle, 
  MoreVertical, 
  ExternalLink, 
  ArrowLeft,
  DollarSign,
  History,
  TrendingUp,
  Download,
  Image as ImageIcon,
  CheckCircle,
  Building2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  X,
  Filter,
  MapPin,
  User as UserIcon,
  StickyNote
} from 'lucide-react';
import { Buyer, Branch, PaymentMethod, Transaction, BuyerPayment } from '../types';

interface CreditManagementProps {
  buyers: Buyer[];
  transactions: Transaction[];
  selectedBranch: Branch;
  onUpdateBuyer: (buyer: Buyer) => void;
  onAddBuyer: (buyer: Buyer) => void;
}

const CreditManagement: React.FC<CreditManagementProps> = ({ buyers, transactions, selectedBranch, onUpdateBuyer, onAddBuyer }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OVER' | 'NEAR' | 'HEALTHY'>('ALL');
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isAddingBuyer, setIsAddingBuyer] = useState(false);

  // New Buyer Form State
  const [newBuyer, setNewBuyer] = useState<Partial<Buyer>>({
    shopName: '',
    contactName: '',
    location: '',
    phone: '',
    whatsappNumber: '',
    creditLimit: 50000,
    currentCredit: 0,
    remarks: ''
  });

  const filteredBuyers = useMemo(() => {
    return buyers.filter(b => {
      const matchesSearch = b.shopName.toLowerCase().includes(search.toLowerCase()) || 
                           b.contactName.toLowerCase().includes(search.toLowerCase()) ||
                           b.phone.includes(search) ||
                           b.osakaId.toLowerCase().includes(search.toLowerCase()) ||
                           b.location.toLowerCase().includes(search.toLowerCase());
      
      const utilization = (b.currentCredit / (b.creditLimit || 1));
      const matchesStatus = statusFilter === 'ALL' ? true :
                           statusFilter === 'OVER' ? utilization > 1 :
                           statusFilter === 'NEAR' ? (utilization > 0.8 && utilization <= 1) :
                           utilization <= 0.8;
      
      return matchesSearch && matchesStatus;
    });
  }, [buyers, search, statusFilter]);

  const selectedBuyer = buyers.find(b => b.id === selectedBuyerId);
  const buyerTransactions = transactions.filter(t => t.buyerId === selectedBuyerId);

  const calculateAging = (buyerId: string) => {
    const now = new Date();
    const specificTransactions = transactions.filter(t => t.buyerId === buyerId && t.status !== 'PAID');
    
    let tier1 = 0; // 0-30
    let tier2 = 0; // 31-60
    let tier3 = 0; // 61+

    specificTransactions.forEach(t => {
      const diffTime = Math.abs(now.getTime() - new Date(t.timestamp).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const unpaid = t.totalAmount - t.paidAmount;

      if (diffDays <= 30) tier1 += unpaid;
      else if (diffDays <= 60) tier2 += unpaid;
      else tier3 += unpaid;
    });

    return { tier1, tier2, tier3 };
  };

  const getBranchExposure = (buyerId: string) => {
    const specificTransactions = transactions.filter(t => t.buyerId === buyerId && t.status !== 'PAID');
    const exposure: Record<string, number> = {};
    
    specificTransactions.forEach(t => {
      exposure[t.branch] = (exposure[t.branch] || 0) + (t.totalAmount - t.paidAmount);
    });

    return Object.entries(exposure).sort((a, b) => b[1] - a[1]);
  };

  const handleRecordPayment = () => {
    if (!selectedBuyer || !paymentAmount || parseFloat(paymentAmount) <= 0) return;

    const amount = parseFloat(paymentAmount);
    const newPayment: BuyerPayment = {
      id: Math.random().toString(36).substr(2, 9),
      buyerId: selectedBuyer.id,
      amount: amount,
      branch: selectedBranch === Branch.ALL ? Branch.MAIN : selectedBranch,
      method: paymentMethod,
      timestamp: new Date().toISOString()
    };

    const updatedBuyer: Buyer = {
      ...selectedBuyer,
      currentCredit: Math.max(0, selectedBuyer.currentCredit - amount),
      payments: [newPayment, ...selectedBuyer.payments]
    };

    onUpdateBuyer(updatedBuyer);
    setPaymentAmount('');
    alert(`Payment of Rs. ${amount.toLocaleString()} recorded at ${newPayment.branch}`);
  };

  const handleRegisterBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuyer.shopName || !newBuyer.phone) return;

    const nextId = buyers.length + 1001;
    const buyer: Buyer = {
      id: Math.random().toString(36).substr(2, 9),
      osakaId: `OSA-${nextId}`,
      shopName: newBuyer.shopName!,
      contactName: newBuyer.contactName || 'Unspecified',
      location: newBuyer.location || 'Unspecified',
      phone: newBuyer.phone!,
      whatsappNumber: newBuyer.whatsappNumber || newBuyer.phone!,
      creditLimit: Number(newBuyer.creditLimit || 50000),
      currentCredit: 0,
      payments: [],
      remarks: newBuyer.remarks
    };

    onAddBuyer(buyer);
    setIsAddingBuyer(false);
    setNewBuyer({ shopName: '', contactName: '', location: '', phone: '', whatsappNumber: '', creditLimit: 50000, currentCredit: 0, remarks: '' });
  };

  const sendWhatsAppReminder = (buyer: Buyer) => {
    const phone = buyer.whatsappNumber || buyer.phone;
    const msg = `Hello ${buyer.contactName} from ${buyer.shopName}, reminder from Osaka. Global Credit: Rs. ${buyer.currentCredit.toLocaleString()}. Total Limit: Rs. ${buyer.creditLimit.toLocaleString()}. Please settle dues soon. Thank you!`;
    window.open(`https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (selectedBuyerId && selectedBuyer) {
    const aging = calculateAging(selectedBuyer.id);
    const exposure = getBranchExposure(selectedBuyer.id);
    const isOverLimit = selectedBuyer.currentCredit > selectedBuyer.creditLimit;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-500">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedBuyerId(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Back to Global Ledger
          </button>
          {isOverLimit && (
            <div className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-900/40 animate-pulse">
               <ShieldAlert size={16} /> Credit Violation: Immediate Action Required
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Profile & Action */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-8 rounded-[3rem] shadow-sm border transition-all duration-500 ${isOverLimit ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
              <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-3xl font-black shadow-inner ${isOverLimit ? 'bg-red-600 text-white shadow-red-900/20' : 'bg-blue-600 text-white shadow-blue-900/20'}`}>
                {selectedBuyer.shopName.charAt(0)}
              </div>
              <h3 className="text-2xl font-black text-slate-900 text-center">{selectedBuyer.shopName}</h3>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-sm">
                   <UserIcon size={16} className="text-blue-500" />
                   <span>{selectedBuyer.contactName}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-400 font-medium text-xs">
                   <MapPin size={16} className="text-red-400" />
                   <span>{selectedBuyer.location}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm font-bold text-slate-600">{selectedBuyer.phone}</p>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <MessageCircle size={14} fill="currentColor" />
                    <p className="text-[10px] font-black uppercase tracking-widest">{selectedBuyer.whatsappNumber}</p>
                  </div>
                </div>
              </div>

              {selectedBuyer.remarks && (
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-[11px] text-slate-500 flex gap-3">
                   <StickyNote size={16} className="text-slate-400 flex-shrink-0" />
                   <p>{selectedBuyer.remarks}</p>
                </div>
              )}
              
              <div className="mt-8 pt-8 border-t border-slate-200/50 space-y-5">
                <div>
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                    <span>Outstanding Utilization</span>
                    <span className={isOverLimit ? 'text-red-600 font-black' : 'text-blue-600'}>
                      {Math.round((selectedBuyer.currentCredit / (selectedBuyer.creditLimit || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden p-1 border border-slate-300/50 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isOverLimit ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(100, (selectedBuyer.currentCredit / (selectedBuyer.creditLimit || 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-3">
                     <p className={`text-sm font-black ${isOverLimit ? 'text-red-600' : 'text-slate-900'}`}>Rs. {selectedBuyer.currentCredit.toLocaleString()}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cap: {selectedBuyer.creditLimit.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => sendWhatsAppReminder(selectedBuyer)}
                className={`w-full mt-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl ${isOverLimit ? 'bg-red-600 text-white shadow-red-900/20' : 'bg-emerald-50 text-white shadow-emerald-500/20 hover:bg-emerald-600'}`}
              >
                <MessageCircle size={16} /> Send Collection Notice
              </button>
            </div>

            <div className="bg-slate-950 text-white p-8 rounded-[3rem] shadow-2xl">
              <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <DollarSign size={18} className="text-blue-400" />
                Cross-Branch Payment
              </h4>
              <div className="space-y-4">
                <input 
                  type="number"
                  placeholder="Settlement amount..."
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  {Object.values(PaymentMethod).map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                </select>
                <button 
                  onClick={handleRecordPayment}
                  className="w-full bg-blue-600 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30"
                >
                  Confirm Settlement
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Ledger & Intelligence */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Branch-Wise Exposure</h4>
                  <div className="space-y-4">
                    {exposure.map(([branch, amount]) => (
                       <div key={branch} className="flex justify-between items-center group">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
                             <span className="text-xs font-bold text-slate-700">{branch}</span>
                          </div>
                          <span className="text-sm font-black text-slate-900">Rs. {amount.toLocaleString()}</span>
                       </div>
                    ))}
                    {exposure.length === 0 && <p className="text-xs text-slate-300 italic">No branch transactions</p>}
                  </div>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Aging Distribution</h4>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-500">Current (0-30d)</span>
                        <span className="text-sm font-black">Rs. {aging.tier1.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-orange-400">Aging (31-60d)</span>
                        <span className="text-sm font-black">Rs. {aging.tier2.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-red-600">Critical (61d+)</span>
                        <span className="text-sm font-black text-red-600">Rs. {aging.tier3.toLocaleString()}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <History size={24} className="text-blue-600" />
                      Global Master Ledger
                   </h3>
                </div>

                <div className="relative space-y-8 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                   {[
                     ...buyerTransactions.map(t => ({ ...t, activityType: 'BILL' })),
                     ...selectedBuyer.payments.map(p => ({ ...p, activityType: 'PAYMENT' }))
                   ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((activity) => {
                      const isBill = 'activityType' in activity && activity.activityType === 'BILL';
                      const act = activity as any;
                      
                      return (
                        <div key={act.id} className="relative pl-16 group">
                           <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl flex items-center justify-center z-10 shadow-lg transition-transform group-hover:scale-110 ${isBill ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {isBill ? <TrendingUp size={20} /> : <CheckCircle size={20} />}
                           </div>
                           <div className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all ${isBill ? 'bg-white border-slate-50' : 'bg-emerald-50/20 border-emerald-100'}`}>
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                       {isBill ? `Wholesale Invoice #${act.id.slice(0, 6)}` : `Global Settlement #${act.id.slice(0, 6)}`}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(act.timestamp).toLocaleString()}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className={`text-lg font-black ${isBill ? 'text-slate-900' : 'text-emerald-600'}`}>
                                       {isBill ? `Rs. ${act.totalAmount.toLocaleString()}` : `- Rs. ${act.amount.toLocaleString()}`}
                                    </p>
                                    <span className="inline-block px-3 py-1 bg-white rounded-full text-[9px] font-black text-slate-400 uppercase tracking-tight mt-1 border border-slate-100">
                                       Osaka @ {act.branch}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      );
                   })}
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const overLimitCount = buyers.filter(b => b.currentCredit > b.creditLimit).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Market Credit Ecosystem</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">6 Branches • Unified Debt Control</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><ShieldAlert size={20} /></div>
             <div>
                <p className="text-lg font-black text-red-600 leading-none">{overLimitCount}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Over-Limit Alerts</p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Query buyer identity, shop, or location across network..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-semibold transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddingBuyer(true)}
            className="px-6 py-4 bg-blue-600 rounded-2xl text-xs font-black uppercase text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <UserPlus size={18} /> New Partner
          </button>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-slate-50">
           <div className="flex items-center gap-2 pr-4 border-r border-slate-100 mr-2">
              <Filter size={14} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Credit Status</span>
           </div>
           <button 
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
           >
             All Partners
           </button>
           <button 
            onClick={() => setStatusFilter('OVER')}
            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'OVER' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
           >
             Over-Limit
           </button>
           <button 
            onClick={() => setStatusFilter('NEAR')}
            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'NEAR' ? 'bg-amber-500 text-white shadow-md' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
           >
             Near-Limit (&gt;80%)
           </button>
           <button 
            onClick={() => setStatusFilter('HEALTHY')}
            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'HEALTHY' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
           >
             Healthy Credit
           </button>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-10 py-5">Partner Profile</th>
                <th className="px-10 py-5">Location</th>
                <th className="px-10 py-5">Global Exposure</th>
                <th className="px-10 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBuyers.map(buyer => {
                const utilization = (buyer.currentCredit / (buyer.creditLimit || 1));
                const isOverLimit = utilization > 1;
                const isNearLimit = utilization > 0.8 && utilization <= 1;
                
                return (
                  <tr key={buyer.id} className="group hover:bg-slate-50/70 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-inner transition-transform group-hover:scale-110 ${isOverLimit ? 'bg-red-600 text-white' : isNearLimit ? 'bg-amber-500 text-white' : 'bg-blue-50 text-blue-600'}`}>
                          {buyer.shopName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">{buyer.shopName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter flex items-center gap-1">
                            {buyer.contactName} • [{buyer.osakaId}]
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-2 text-slate-500">
                          <MapPin size={12} className="text-slate-300" />
                          <span className="text-xs font-medium">{buyer.location}</span>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="w-64">
                        <div className="flex justify-between text-[9px] mb-2 font-black uppercase tracking-widest">
                          <span className="text-slate-400">Limit: Rs. {buyer.creditLimit.toLocaleString()}</span>
                          <span className={isOverLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-blue-600'}>
                            Rs. {buyer.currentCredit.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                          <div 
                            className={`h-full transition-all duration-1000 ${isOverLimit ? 'bg-red-600' : isNearLimit ? 'bg-amber-500' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min(100, utilization * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => setSelectedBuyerId(buyer.id)}
                        className={`p-3 rounded-2xl transition-all shadow-sm ${isOverLimit ? 'bg-red-600 text-white' : isNearLimit ? 'bg-amber-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredBuyers.length === 0 && (
                <tr>
                   <td colSpan={4} className="py-20 text-center opacity-20 italic text-xs uppercase font-black tracking-widest">
                      No matching partners found
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Partner Modal */}
      {isAddingBuyer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20">
                       <UserPlus size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">Wholesale Partner</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unified Identity Registration</p>
                    </div>
                 </div>
                 <button onClick={() => setIsAddingBuyer(false)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-600 transition-all">
                    <X size={20} />
                 </button>
              </div>
              
              <form onSubmit={handleRegisterBuyer} className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Shop / Business Name</label>
                      <input 
                        type="text" required
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10"
                        placeholder="e.g. City Traders"
                        value={newBuyer.shopName}
                        onChange={(e) => setNewBuyer({...newBuyer, shopName: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Person</label>
                      <input 
                        type="text" required
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10"
                        placeholder="e.g. Mr. Saman"
                        value={newBuyer.contactName}
                        onChange={(e) => setNewBuyer({...newBuyer, contactName: e.target.value})}
                      />
                   </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Shop Location / Address</label>
                    <input 
                      type="text" required
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
                      placeholder="e.g. No 12, Highlevel Rd, Colombo 06"
                      value={newBuyer.location}
                      onChange={(e) => setNewBuyer({...newBuyer, location: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                       <input 
                         type="text" required
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10"
                         placeholder="+94"
                         value={newBuyer.phone}
                         onChange={(e) => setNewBuyer({...newBuyer, phone: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-emerald-600 flex items-center gap-1">
                          <MessageCircle size={10} /> WhatsApp Number
                       </label>
                       <input 
                         type="text" required
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10"
                         placeholder="+94"
                         value={newBuyer.whatsappNumber}
                         onChange={(e) => setNewBuyer({...newBuyer, whatsappNumber: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Credit Cap (Rs.)</label>
                    <input 
                      type="number" required
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10"
                      value={newBuyer.creditLimit}
                      onChange={(e) => setNewBuyer({...newBuyer, creditLimit: Number(e.target.value)})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Remarks (Optional)</label>
                    <textarea 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 h-24 resize-none"
                      placeholder="Enter internal notes, payment preferences etc..."
                      value={newBuyer.remarks}
                      onChange={(e) => setNewBuyer({...newBuyer, remarks: e.target.value})}
                    />
                 </div>
                 <button 
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all mt-4"
                 >
                    Establish Osaka Identity
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default CreditManagement;
