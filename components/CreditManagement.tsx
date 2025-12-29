
import React, { useState, useMemo, useRef } from 'react';
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
  StickyNote,
  Eye,
  Maximize2,
  Camera,
  CheckCircle2,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import { Buyer, Branch, PaymentMethod, Transaction, BuyerPayment } from '../types';

interface CreditManagementProps {
  buyers: Buyer[];
  transactions: Transaction[];
  selectedBranch: Branch;
  onUpdateBuyer: (buyer: Buyer) => void;
  onAddBuyer: (buyer: Buyer) => void;
  onDeleteBuyer: (id: string) => void;
  onDeleteTransaction?: (id: string) => void;
  onDeletePayment?: (buyerId: string, paymentId: string) => void;
  onTransaction?: (t: Transaction) => void; 
}

const CreditManagement: React.FC<CreditManagementProps> = ({ 
  buyers, 
  transactions, 
  selectedBranch, 
  onUpdateBuyer, 
  onAddBuyer, 
  onDeleteBuyer, 
  onDeleteTransaction,
  onDeletePayment,
  onTransaction 
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OVER' | 'NEAR' | 'HEALTHY'>('ALL');
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  
  // Action Panel State
  const [actionType, setActionType] = useState<'PAYMENT' | 'BILL'>('PAYMENT');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [reference, setReference] = useState<string>('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  
  const [isAddingBuyer, setIsAddingBuyer] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleProcessAction = () => {
    if (!selectedBuyer || !amount || parseFloat(amount) <= 0) return;
    const val = parseFloat(amount);

    if (actionType === 'PAYMENT') {
      const newPayment: BuyerPayment = {
        id: Math.random().toString(36).substr(2, 9),
        buyerId: selectedBuyer.id,
        amount: val,
        branch: selectedBranch === Branch.ALL ? Branch.MAIN : selectedBranch,
        method: paymentMethod,
        timestamp: new Date().toISOString(),
        receiptImage: attachedImage || undefined
      };

      const updatedBuyer: Buyer = {
        ...selectedBuyer,
        currentCredit: Math.max(0, selectedBuyer.currentCredit - val),
        payments: [newPayment, ...selectedBuyer.payments]
      };
      onUpdateBuyer(updatedBuyer);
      alert(`Payment of Rs. ${val.toLocaleString()} recorded.`);
    } else {
      // Create a manual transaction
      const manualBill: Transaction = {
        id: `M-${Math.random().toString(36).substr(2, 6)}`,
        branch: selectedBranch === Branch.ALL ? Branch.MAIN : selectedBranch,
        timestamp: new Date().toISOString(),
        buyerId: selectedBuyer.id,
        type: 'WHOLESALE',
        items: [], // Manual entry doesn't require individual items
        totalAmount: val,
        paidAmount: 0,
        discount: 0,
        tax: 0,
        paymentMethod: PaymentMethod.CREDIT,
        billImageUrl: attachedImage || undefined,
        status: 'UNPAID'
      };

      const updatedBuyer: Buyer = {
        ...selectedBuyer,
        currentCredit: selectedBuyer.currentCredit + val
      };
      
      // Update local storage/state via parent
      if (onTransaction) onTransaction(manualBill);
      onUpdateBuyer(updatedBuyer);
      alert(`Manual Bill of Rs. ${val.toLocaleString()} recorded.`);
    }

    setAmount('');
    setAttachedImage(null);
    setReference('');
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePartner = (id: string, name: string) => {
    if (window.confirm(`CRITICAL ACTION: Are you sure you want to delete ${name}? This will remove them from the global registry.`)) {
      onDeleteBuyer(id);
      setSelectedBuyerId(null);
    }
  };

  const handleDeleteHistoryItem = (activity: any) => {
    const isBill = 'activityType' in activity && activity.activityType === 'BILL';
    const msg = isBill ? "Delete this Wholesale Invoice and adjust outstanding credit?" : "Delete this Settlement Record and reinstate original debt?";
    
    if (window.confirm(`AUDIT ALERT: ${msg}`)) {
      if (isBill) {
        onDeleteTransaction?.(activity.id);
      } else {
        onDeletePayment?.(selectedBuyer!.id, activity.id);
      }
    }
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
      <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-500 pb-20">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedBuyerId(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Back to Global Ledger
          </button>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => handleDeletePartner(selectedBuyer.id, selectedBuyer.shopName)}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
              >
                <Trash2 size={16} /> Delete Partner
              </button>
            {isOverLimit && (
              <div className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-900/40 animate-pulse">
                 <ShieldAlert size={16} /> Credit Violation
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
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
              </div>

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
                className={`w-full mt-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl ${isOverLimit ? 'bg-red-600 text-white shadow-red-900/20' : 'bg-emerald-50 text-emerald-600 shadow-emerald-500/10 hover:bg-emerald-600 hover:text-white'}`}
              >
                <MessageCircle size={16} /> Send Collection Notice
              </button>
            </div>

            <div className="bg-slate-950 text-white p-8 rounded-[3rem] shadow-2xl space-y-6">
              <div className="flex bg-white/5 p-1 rounded-2xl">
                 <button 
                  onClick={() => setActionType('PAYMENT')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${actionType === 'PAYMENT' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                    <CheckCircle2 size={14} /> Settlement
                 </button>
                 <button 
                  onClick={() => setActionType('BILL')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${actionType === 'BILL' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                    <Plus size={14} /> Manual Bill
                 </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount (Rs.)</label>
                   <input type="number" placeholder="Enter value..." value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <button onClick={() => fileInputRef.current?.click()} className={`w-full py-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all group/btn ${attachedImage ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-500'}`}>
                  {attachedImage ? <span className="text-[10px] font-black uppercase tracking-widest">Image Attached</span> : <Camera size={20} />}
                </button>
                <button onClick={handleProcessAction} className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${actionType === 'PAYMENT' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                  Authorize {actionType === 'PAYMENT' ? 'Settlement' : 'Invoice'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><History size={24} className="text-blue-600" /> Global Master Ledger</h3>
                </div>

                <div className="relative space-y-8 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                   {[
                     ...buyerTransactions.map(t => ({ ...t, activityType: 'BILL' })),
                     ...selectedBuyer.payments.map(p => ({ ...p, activityType: 'PAYMENT' }))
                   ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((activity) => {
                      const isBill = 'activityType' in activity && activity.activityType === 'BILL';
                      const act = activity as any;
                      const imageUrl = isBill ? act.billImageUrl : act.receiptImage;
                      
                      return (
                        <div key={act.id} className="relative pl-16 group">
                           <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl flex items-center justify-center z-10 shadow-lg transition-transform group-hover:scale-110 ${isBill ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {isBill ? <TrendingUp size={20} /> : <CheckCircle size={20} />}
                           </div>
                           <div className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all ${isBill ? 'bg-white border-slate-50' : 'bg-emerald-50/20 border-emerald-100'}`}>
                              <div className="flex justify-between items-start mb-2">
                                 <div className="flex-1">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{isBill ? 'Wholesale Invoice' : 'Settlement'}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(act.timestamp).toLocaleString()} • #{act.id.slice(0, 8).toUpperCase()}</p>
                                    {imageUrl && (
                                      <button onClick={() => setPreviewImage(imageUrl)} className="mt-4 w-12 h-12 rounded-xl border border-slate-200 overflow-hidden"><img src={imageUrl} className="w-full h-full object-cover" /></button>
                                    )}
                                 </div>
                                 <div className="text-right flex flex-col items-end gap-2">
                                    <p className={`text-lg font-black ${isBill ? 'text-slate-900' : 'text-emerald-600'}`}>{isBill ? `Rs. ${act.totalAmount.toLocaleString()}` : `- Rs. ${act.amount.toLocaleString()}`}</p>
                                    <div className="flex gap-2">
                                       <span className="px-3 py-1 bg-white rounded-full text-[9px] font-black text-slate-400 uppercase border border-slate-100">@{act.branch}</span>
                                       <button onClick={() => handleDeleteHistoryItem(activity)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                    </div>
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
        {previewImage && <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8" onClick={() => setPreviewImage(null)}><img src={previewImage} className="max-w-full max-h-[85vh] object-contain" /></div>}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Market Credit Ecosystem</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">6 Branches • Unified Debt Control</p>
        </div>
        <button onClick={() => setIsAddingBuyer(true)} className="px-6 py-4 bg-blue-600 rounded-2xl text-xs font-black uppercase text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center gap-2">
          <UserPlus size={18} /> New Partner
        </button>
      </div>

      <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Query partner..." className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold outline-none" value={search} onChange={(e) => setSearch(e.target.value)}/>
          </div>
          <div className="flex gap-2">
            {['ALL', 'OVER', 'NEAR'].map(status => (
              <button key={status} onClick={() => setStatusFilter(status as any)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>{status}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-10 py-5">Partner</th>
                <th className="px-10 py-5">Exposure</th>
                <th className="px-10 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBuyers.map(buyer => (
                <tr key={buyer.id} className="group hover:bg-slate-50/70 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${buyer.currentCredit > buyer.creditLimit ? 'bg-red-600 text-white' : 'bg-blue-50 text-blue-600'}`}>{buyer.shopName.charAt(0)}</div>
                      <div><p className="text-sm font-black text-slate-900">{buyer.shopName}</p><p className="text-[10px] text-slate-400 font-bold">{buyer.osakaId}</p></div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="w-48">
                      <div className="flex justify-between text-[9px] mb-2 font-black uppercase tracking-widest"><span className="text-slate-400">Limit: Rs. {buyer.creditLimit.toLocaleString()}</span><span className={buyer.currentCredit > buyer.creditLimit ? 'text-red-600' : 'text-blue-600'}>Rs. {buyer.currentCredit.toLocaleString()}</span></div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${buyer.currentCredit > buyer.creditLimit ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${Math.min(100, (buyer.currentCredit / buyer.creditLimit) * 100)}%` }}/></div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleDeletePartner(buyer.id, buyer.shopName)} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                      <button onClick={() => setSelectedBuyerId(buyer.id)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><ExternalLink size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* New Partner Modal Logic Kept */}
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
