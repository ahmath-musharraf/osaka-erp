import React, { useState, useRef, useMemo } from 'react';
import { 
  Search, 
  Truck, 
  Phone, 
  Plus, 
  ArrowLeft, 
  History, 
  DollarSign, 
  FileText, 
  ChevronRight, 
  Camera, 
  CheckCircle, 
  Image as ImageIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  X,
  MessageCircle,
  Building2,
  Filter,
  MapPin,
  User as UserIcon,
  StickyNote,
  Eye,
  Maximize2,
  CheckCircle2
} from 'lucide-react';
import { Seller, Branch, PaymentMethod, LedgerEntry } from '../types';
import { CATEGORIES } from '../constants';

interface SupplierManagementProps {
  suppliers: Seller[];
  selectedBranch: Branch;
  onUpdateSupplier: (supplier: Seller) => void;
  onAddSupplier: (supplier: Seller) => void;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({ suppliers, selectedBranch, onUpdateSupplier, onAddSupplier }) => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [balanceFilter, setBalanceFilter] = useState<'ALL' | 'DEBT' | 'SETTLED'>('ALL');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<'NONE' | 'BILL' | 'PAYMENT'>('NONE');
  const [amount, setAmount] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [billImage, setBillImage] = useState<string | null>(null);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Supplier Form State
  const [newSupplier, setNewSupplier] = useState<Partial<Seller>>({
    shopName: '',
    contactName: '',
    location: '',
    phone: '',
    whatsappNumber: '',
    category: 'Grocery',
    balance: 0,
    remarks: ''
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = s.shopName.toLowerCase().includes(search.toLowerCase()) || 
                           s.contactName.toLowerCase().includes(search.toLowerCase()) || 
                           s.location.toLowerCase().includes(search.toLowerCase()) || 
                           s.category.toLowerCase().includes(search.toLowerCase()) ||
                           s.phone.includes(search) ||
                           s.whatsappNumber.includes(search);
      const matchesCat = activeCat === 'All' || s.category === activeCat;
      const matchesBalance = balanceFilter === 'ALL' ? true :
                            balanceFilter === 'DEBT' ? s.balance > 0 :
                            s.balance <= 0;
      return matchesSearch && matchesCat && matchesBalance;
    });
  }, [suppliers, search, activeCat, balanceFilter]);

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  const handleAction = () => {
    if (!selectedSupplier || !amount) return;

    const val = parseFloat(amount);
    const newEntry: LedgerEntry = {
      id: Math.random().toString(36).substr(2, 9),
      sellerId: selectedSupplier.id,
      type: activeForm === 'BILL' ? 'PURCHASE_BILL' : 'PAYMENT',
      amount: val,
      timestamp: new Date().toISOString(),
      branch: selectedBranch === Branch.ALL ? Branch.MAIN : selectedBranch,
      reference: reference,
      method: activeForm === 'PAYMENT' ? paymentMethod : undefined,
      imageUrl: billImage || undefined
    };

    const updatedSupplier: Seller = {
      ...selectedSupplier,
      balance: activeForm === 'BILL' ? selectedSupplier.balance + val : selectedSupplier.balance - val,
      ledger: [newEntry, ...selectedSupplier.ledger]
    };

    onUpdateSupplier(updatedSupplier);
    resetForm();
    alert(`${activeForm === 'BILL' ? 'Purchase Bill' : 'Payment'} recorded successfully.`);
  };

  const handleRegisterSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.shopName || !newSupplier.phone) return;

    const seller: Seller = {
      id: Math.random().toString(36).substr(2, 9),
      shopName: newSupplier.shopName!,
      contactName: newSupplier.contactName || 'Unspecified',
      location: newSupplier.location || 'Unspecified',
      phone: newSupplier.phone!,
      whatsappNumber: newSupplier.whatsappNumber || newSupplier.phone!,
      category: newSupplier.category!,
      balance: 0,
      ledger: [],
      remarks: newSupplier.remarks
    };

    onAddSupplier(seller);
    setIsAddingSupplier(false);
    setNewSupplier({ shopName: '', contactName: '', location: '', phone: '', whatsappNumber: '', category: 'Grocery', balance: 0, remarks: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setActiveForm('NONE');
    setAmount('');
    setReference('');
    setBillImage(null);
  };

  const sendWhatsAppConfirmation = (seller: Seller, lastEntry: LedgerEntry) => {
    const phone = seller.whatsappNumber || seller.phone;
    const msg = `Osaka Business Notice: Recorded a ${lastEntry.type.replace('_', ' ')} of Rs. ${lastEntry.amount.toLocaleString()} for ${seller.shopName}. Current Balance: Rs. ${seller.balance.toLocaleString()}. Thank you!`;
    window.open(`https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (selectedSupplierId && selectedSupplier) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 font-['Inter']">
        <button 
          onClick={() => setSelectedSupplierId(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Global Supplier Registry
        </button>

        <div className="flex flex-col xl:flex-row gap-8">
          <div className="xl:w-80 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
               <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 text-2xl font-black shadow-lg">
                  {selectedSupplier.shopName.charAt(0)}
               </div>
               <h3 className="text-xl font-black text-slate-900 text-center">{selectedSupplier.shopName}</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mt-1">{selectedSupplier.category} Sector</p>
               
               <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-sm">
                     <UserIcon size={16} className="text-blue-500" />
                     <span>{selectedSupplier.contactName}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-slate-400 font-medium text-xs">
                     <MapPin size={16} className="text-red-400" />
                     <span>{selectedSupplier.location}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs font-bold text-slate-500">{selectedSupplier.phone}</p>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <MessageCircle size={14} fill="currentColor" />
                      <p className="text-[10px] font-black uppercase tracking-widest">{selectedSupplier.whatsappNumber}</p>
                    </div>
                  </div>
               </div>

               {selectedSupplier.remarks && (
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-[11px] text-slate-500 flex gap-3">
                   <StickyNote size={16} className="text-slate-400 flex-shrink-0" />
                   <p>{selectedSupplier.remarks}</p>
                </div>
              )}

               <div className="mt-8 pt-8 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding Debt</p>
                  <h4 className={`text-2xl font-black ${selectedSupplier.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    Rs. {selectedSupplier.balance.toLocaleString()}
                  </h4>
               </div>

               <div className="mt-8 space-y-3">
                  <button 
                    onClick={() => setActiveForm('BILL')}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10"
                  >
                    Receive Stock (Record Bill)
                  </button>
                  <button 
                    onClick={() => setActiveForm('PAYMENT')}
                    className="w-full py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                  >
                    Make Payment
                  </button>
               </div>
            </div>

            {activeForm !== 'NONE' && (
               <div className="bg-blue-600 text-white p-8 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
                  <h4 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                     {activeForm === 'BILL' ? <FileText size={18} /> : <DollarSign size={18} />}
                     {activeForm === 'BILL' ? 'Stock Inward' : 'Outward Payment'}
                  </h4>
                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1 block">Value (Rs.)</label>
                        <input 
                          type="number" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white font-black outline-none placeholder:text-blue-300/50"
                          placeholder="0.00"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1 block">Reference (INV/CHQ #)</label>
                        <input 
                          type="text" 
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white font-black outline-none placeholder:text-blue-300/50"
                          placeholder="e.g. INV-102"
                        />
                     </div>
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
                        className={`w-full py-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all group/upbtn ${billImage ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/20 hover:border-white'}`}
                     >
                        {billImage ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Image Attached</span>
                            <X size={12} className="hover:text-red-500" onClick={(e) => { e.stopPropagation(); setBillImage(null); }} />
                          </div>
                        ) : (
                          <>
                            <Camera size={20} className="group-hover/upbtn:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Attach Invoice / Receipt Photo</span>
                          </>
                        )}
                     </button>
                     <div className="flex gap-3 pt-4">
                        <button onClick={resetForm} className="flex-1 py-4 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                        <button onClick={handleAction} className="flex-[2] py-4 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Confirm & Sync</button>
                     </div>
                  </div>
               </div>
            )}
          </div>

          <div className="flex-1 space-y-6">
             <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <History size={24} className="text-slate-400" />
                      Supply & Payment Ledger
                   </h3>
                </div>

                <div className="relative space-y-10 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
                   {selectedSupplier.ledger.map((entry, idx) => (
                      <div key={entry.id} className="relative pl-16 group">
                         <div className={`absolute left-0 top-0 w-12 h-12 rounded-[1.25rem] flex items-center justify-center z-10 shadow-lg transition-all group-hover:scale-110 ${entry.type === 'PURCHASE_BILL' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                            {entry.type === 'PURCHASE_BILL' ? <ArrowUpCircle size={22} /> : <ArrowDownCircle size={22} />}
                         </div>
                         <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm group-hover:border-blue-100 transition-all">
                            <div className="flex justify-between items-start">
                               <div>
                                  <div className="flex items-center gap-2">
                                     <p className={`text-xs font-black uppercase tracking-widest ${entry.type === 'PURCHASE_BILL' ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {entry.type === 'PURCHASE_BILL' ? 'Purchase Bill' : 'Settlement Made'}
                                     </p>
                                     <span className="text-[10px] font-bold text-slate-300">#{entry.reference || entry.id.slice(0, 6)}</span>
                                  </div>
                                  <p className="text-sm font-black text-slate-900 mt-1">{entry.type === 'PURCHASE_BILL' ? `Inward stock batch @ ${entry.branch}` : `Payment from ${entry.branch} via ${entry.method}`}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-tighter">{new Date(entry.timestamp).toLocaleString()}</p>
                                  
                                  {entry.imageUrl ? (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                      <button 
                                        onClick={() => setPreviewImage(entry.imageUrl)}
                                        className="w-16 h-16 rounded-2xl border border-slate-200 overflow-hidden relative group/img shadow-sm hover:border-blue-500 transition-all flex-shrink-0"
                                      >
                                        <img src={entry.imageUrl} className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-all" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover/img:bg-transparent">
                                          <Maximize2 size={14} className="text-white drop-shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                        </div>
                                      </button>
                                      <div className="flex flex-col justify-center">
                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{entry.type === 'PURCHASE_BILL' ? 'Inbound Invoice' : 'Outbound Receipt'} Proof</span>
                                         <button 
                                            onClick={() => setPreviewImage(entry.imageUrl)}
                                            className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase flex items-center gap-1 mt-1"
                                          >
                                            <Eye size={12}/> View High-Res
                                          </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mt-4">
                                       <button 
                                        onClick={() => {
                                          fileInputRef.current?.click();
                                          // Note: This button links to the hidden file input used for the active form.
                                          // In a real database scenario, this would trigger an update specific to this ledger ID.
                                        }}
                                        className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 hover:text-blue-600 border border-dashed border-slate-200 px-3 py-1.5 rounded-lg transition-all"
                                       >
                                          <Camera size={12} /> Link Missing Proof
                                       </button>
                                    </div>
                                  )}
                               </div>
                               <div className="text-right flex flex-col items-end gap-2">
                                  <h4 className="text-lg font-black text-slate-900">Rs. {entry.amount.toLocaleString()}</h4>
                                  <button 
                                    onClick={() => sendWhatsAppConfirmation(selectedSupplier, entry)}
                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                  >
                                    <MessageCircle size={14} />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
        
        {/* Full Image Preview Modal */}
        {previewImage && (
           <div 
             className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300"
             onClick={() => setPreviewImage(null)}
           >
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-90"
              >
                <X size={32} strokeWidth={1.5} />
              </button>
              <div 
                className="max-w-5xl max-h-full overflow-hidden rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-center bg-white/5"
                onClick={(e) => e.stopPropagation()}
              >
                 <img src={previewImage} className="max-w-full max-h-[85vh] object-contain" />
              </div>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-['Inter']">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Supply Network</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Vendor & Seller Credit Control</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Query network by identity, shop or location..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddingSupplier(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} /> New Partner
          </button>
        </div>
      </div>

      {/* Modern Filter Strip */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 pr-4 border-r border-slate-100 mr-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Industry & Debt</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
          {['All', ...CATEGORIES].map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCat(cat)}
              className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeCat === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-slate-200 mx-2" />
        <div className="flex gap-1.5">
           <button 
            onClick={() => setBalanceFilter('ALL')}
            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${balanceFilter === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
           >
             All Partners
           </button>
           <button 
            onClick={() => setBalanceFilter('DEBT')}
            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${balanceFilter === 'DEBT' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
           >
             With Debt
           </button>
           <button 
            onClick={() => setBalanceFilter('SETTLED')}
            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${balanceFilter === 'SETTLED' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
           >
             Settled
           </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 pb-20">
        {filteredSuppliers.map(s => (
          <div 
            key={s.id}
            onClick={() => setSelectedSupplierId(s.id)}
            className="bg-white p-3 rounded-[1.5rem] shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center overflow-hidden"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner mb-3">
              <Truck size={20} />
            </div>
            <div className="w-full overflow-hidden">
               <h3 className="text-[10px] font-black text-slate-900 truncate leading-tight uppercase tracking-tighter">{s.shopName}</h3>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.category}</p>
               <div className="mt-3 pt-3 border-t border-slate-50">
                  <p className="text-[11px] font-black text-red-600">Rs. {s.balance.toLocaleString()}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Supplier Modal */}
      {isAddingSupplier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20">
                       <Building2 size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">Partner Node</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Supply Integration</p>
                    </div>
                 </div>
                 <button onClick={() => setIsAddingSupplier(false)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-600 transition-all">
                    <X size={20} />
                 </button>
              </div>
              
              <form onSubmit={handleRegisterSupplier} className="p-10 space-y-6 overflow-y-auto scrollbar-hide">
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Shop / Entity Name</label>
                      <input 
                        type="text" required
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10"
                        placeholder="e.g. Global Imports"
                        value={newSupplier.shopName}
                        onChange={(e) => setNewSupplier({...newSupplier, shopName: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Representative</label>
                      <input 
                        type="text" required
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10"
                        placeholder="e.g. Mr. Seneviratne"
                        value={newSupplier.contactName}
                        onChange={(e) => setNewSupplier({...newSupplier, contactName: e.target.value})}
                      />
                   </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Warehouse / Office Location</label>
                    <input 
                      type="text" required
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
                      placeholder="e.g. Colombo 01"
                      value={newSupplier.location}
                      onChange={(e) => setNewSupplier({...newSupplier, location: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Link</label>
                       <input 
                         type="text" required
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10"
                         placeholder="+94"
                         value={newSupplier.phone}
                         onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Industry Category</label>
                       <select 
                         className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10"
                         value={newSupplier.category}
                         onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})}
                       >
                         {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Notes (Optional)</label>
                    <textarea 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 h-24 resize-none"
                      placeholder="Payment terms, delivery schedules etc..."
                      value={newSupplier.remarks}
                      onChange={(e) => setNewSupplier({...newSupplier, remarks: e.target.value})}
                    />
                 </div>
                 <button 
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all mt-4"
                 >
                    Establish Partner Identity
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
