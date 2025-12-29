
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
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Seller, Branch, PaymentMethod, LedgerEntry } from '../types';
import { CATEGORIES } from '../constants';

interface SupplierManagementProps {
  suppliers: Seller[];
  selectedBranch: Branch;
  onUpdateSupplier: (supplier: Seller) => void;
  onAddSupplier: (supplier: Seller) => void;
  onDeleteSupplier: (id: string) => void;
  onDeleteLedgerEntry?: (supplierId: string, entryId: string) => void;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({ 
  suppliers, 
  selectedBranch, 
  onUpdateSupplier, 
  onAddSupplier, 
  onDeleteSupplier,
  onDeleteLedgerEntry 
}) => {
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

  const handleDeletePartner = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete supplier "${name}"? This action will archive all their records.`)) {
      onDeleteSupplier(id);
      setSelectedSupplierId(null);
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    if (window.confirm("AUDIT ALERT: Are you sure you want to delete this ledger entry? Supplier balance will be adjusted automatically.")) {
      onDeleteLedgerEntry?.(selectedSupplier!.id, entryId);
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
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedSupplierId(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Global Supplier Registry
          </button>
          <button 
            onClick={() => handleDeletePartner(selectedSupplier.id, selectedSupplier.shopName)}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
          >
            <Trash2 size={16} /> Delete Supplier
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          <div className="xl:w-80 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center">
               <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 text-2xl font-black shadow-lg">{selectedSupplier.shopName.charAt(0)}</div>
               <h3 className="text-xl font-black text-slate-900">{selectedSupplier.shopName}</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedSupplier.category} Sector</p>
               <div className="mt-8 pt-8 border-t border-slate-50 text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding Debt</p>
                  <h4 className={`text-2xl font-black ${selectedSupplier.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Rs. {selectedSupplier.balance.toLocaleString()}</h4>
               </div>
               <div className="mt-8 space-y-3">
                  <button onClick={() => setActiveForm('BILL')} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 shadow-xl">Receive Stock</button>
                  <button onClick={() => setActiveForm('PAYMENT')} className="w-full py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white">Make Payment</button>
               </div>
            </div>

            {activeForm !== 'NONE' && (
               <div className="bg-blue-600 text-white p-8 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
                  <h4 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">{activeForm === 'BILL' ? <FileText size={18} /> : <DollarSign size={18} />}{activeForm === 'BILL' ? 'Stock Inward' : 'Outward Payment'}</h4>
                  <div className="space-y-4">
                     <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white font-black outline-none" placeholder="Amount Rs."/>
                     <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white font-black outline-none" placeholder="Reference #"/>
                     <div className="flex gap-3 pt-4"><button onClick={resetForm} className="flex-1 py-4 bg-white/10 rounded-2xl text-[10px] font-black uppercase">Cancel</button><button onClick={handleAction} className="flex-[2] py-4 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase shadow-xl">Confirm</button></div>
                  </div>
               </div>
            )}
          </div>

          <div className="flex-1 space-y-6">
             <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-10"><h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><History size={24} className="text-slate-400" /> Supply & Payment Ledger</h3></div>
                <div className="relative space-y-10 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
                   {selectedSupplier.ledger.map((entry) => (
                      <div key={entry.id} className="relative pl-16 group">
                         <div className={`absolute left-0 top-0 w-12 h-12 rounded-[1.25rem] flex items-center justify-center z-10 shadow-lg ${entry.type === 'PURCHASE_BILL' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>{entry.type === 'PURCHASE_BILL' ? <ArrowUpCircle size={22} /> : <ArrowDownCircle size={22} />}</div>
                         <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm group-hover:border-blue-100 transition-all">
                            <div className="flex justify-between items-start">
                               <div>
                                  <p className={`text-xs font-black uppercase tracking-widest ${entry.type === 'PURCHASE_BILL' ? 'text-red-600' : 'text-emerald-600'}`}>{entry.type === 'PURCHASE_BILL' ? 'Purchase Bill' : 'Settlement Made'}</p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">#{entry.reference || entry.id.slice(0, 6)} • {new Date(entry.timestamp).toLocaleString()}</p>
                               </div>
                               <div className="text-right flex flex-col items-end gap-2">
                                  <h4 className="text-lg font-black text-slate-900">Rs. {entry.amount.toLocaleString()}</h4>
                                  <div className="flex gap-2">
                                     <span className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-tight">@{entry.branch}</span>
                                     <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
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
        <button onClick={() => setIsAddingSupplier(true)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg">
          <Plus size={16} /> New Partner
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 pb-20">
        {filteredSuppliers.map(s => (
          <div key={s.id} onClick={() => setSelectedSupplierId(s.id)} className="bg-white p-3 rounded-[1.5rem] shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner mb-3"><Truck size={20} /></div>
            <h3 className="text-[10px] font-black text-slate-900 truncate leading-tight uppercase tracking-tighter">{s.shopName}</h3>
            <p className="text-[11px] font-black text-red-600 mt-2">Rs. {s.balance.toLocaleString()}</p>
            <button onClick={(e) => { e.stopPropagation(); handleDeletePartner(s.id, s.shopName); }} className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={12} /></button>
          </div>
        ))}
      </div>
      {/* New Supplier Modal Kept */}
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
