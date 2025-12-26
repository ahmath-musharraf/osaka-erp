
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Camera, 
  CheckCircle2, 
  Printer, 
  X, 
  User, 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  Wallet, 
  ImageIcon, 
  Filter, 
  Zap, 
  ArrowRight,
  Loader2,
  UserPlus,
  ShieldAlert,
  MessageCircle,
  MapPin,
  Download,
  Share2
} from 'lucide-react';
import { Item, Buyer, Branch, PaymentMethod, Transaction } from '../types';
import BillTemplate from './BillTemplate';
import { CATEGORIES } from '../constants';

interface POSProps {
  branch: Branch;
  items: Item[];
  buyers: Buyer[];
  onTransaction: (t: Transaction) => void;
  onAddBuyer?: (b: Buyer) => void;
  isOffline?: boolean;
}

const POS: React.FC<POSProps> = ({ branch, items, buyers, onTransaction, onAddBuyer, isOffline }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ item: Item; quantity: number }[]>([]);
  const [posMode, setPosMode] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [billImage, setBillImage] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [discount, setDiscount] = useState<string>('0');
  const [showBillPreview, setShowBillPreview] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (paymentMethod === PaymentMethod.CREDIT) {
      if (posMode === 'RETAIL' || !selectedBuyer) {
        setPaymentMethod(PaymentMethod.CASH);
      }
    }
  }, [posMode, selectedBuyer, paymentMethod]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, activeCategory]);

  const addToCart = (item: Item) => {
    if (item.stock <= 0) {
      alert("Item out of stock!");
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.item.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, curr) => {
      const price = posMode === 'WHOLESALE' ? curr.item.wholesalePrice : curr.item.retailPrice;
      return acc + (price * curr.quantity);
    }, 0);
  };

  const calculateTotal = () => Math.max(0, calculateSubtotal() - parseFloat(discount || '0'));

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);

    setTimeout(() => {
      const total = calculateTotal();
      const paid = paidAmount === '' ? total : parseFloat(paidAmount);
      
      const saleId = Math.random().toString(36).substr(2, 9);
      const transaction: Transaction = {
        id: saleId,
        branch,
        timestamp: new Date().toISOString(),
        type: posMode,
        buyerId: selectedBuyer?.id,
        items: cart.map(c => ({ 
          id: Math.random().toString(36).substr(2, 9),
          saleId: saleId,
          itemId: c.item.id, 
          quantity: c.quantity, 
          price: posMode === 'WHOLESALE' ? c.item.wholesalePrice : c.item.retailPrice 
        })),
        totalAmount: total,
        paidAmount: paid,
        discount: parseFloat(discount || '0'),
        tax: 0,
        paymentMethod,
        billImageUrl: billImage || undefined,
        status: paid >= total ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'UNPAID')
      };

      onTransaction(transaction);
      setShowBillPreview(transaction);
      setCart([]);
      setSelectedBuyer(null);
      setBillImage(null);
      setPaidAmount('');
      setDiscount('0');
      setIsProcessing(false);
    }, 800);
  };

  const generateShareText = (t: Transaction) => {
    const currentBuyer = buyers.find(b => b.id === t.buyerId);
    const itemsSummary = t.items.map(si => {
      const item = items.find(i => i.id === si.itemId);
      return `• ${item?.name} x ${si.quantity}: Rs.${(si.price * si.quantity).toLocaleString()}`;
    }).join('\n');

    return `🧾 *OSAKA GROUP INVOICE*\n\n` +
      `ID: #${t.id.toUpperCase()}\n` +
      `Date: ${new Date(t.timestamp).toLocaleDateString()}\n` +
      `Branch: ${t.branch}\n\n` +
      `*Items:*\n${itemsSummary}\n\n` +
      `*Total: Rs. ${t.totalAmount.toLocaleString()}*\n` +
      `Paid: Rs. ${t.paidAmount.toLocaleString()}\n` +
      `Balance: Rs. ${(t.totalAmount - t.paidAmount).toLocaleString()}\n\n` +
      `Thank you for your business!`;
  };

  const handleSendWhatsApp = () => {
    if (!showBillPreview) return;
    const currentBuyer = buyers.find(b => b.id === showBillPreview.buyerId);
    const targetPhone = currentBuyer?.whatsappNumber || currentBuyer?.phone;

    if (!targetPhone) {
      alert("No valid phone number found for this partner.");
      return;
    }

    const msg = generateShareText(showBillPreview);
    window.open(`https://wa.me/${targetPhone.replace(/\+/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (!showBillPreview) return;
    const shareText = generateShareText(showBillPreview);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Osaka Invoice #${showBillPreview.id}`,
          text: shareText,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert("Summary copied to clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const paymentIcons = {
    [PaymentMethod.CASH]: <Banknote size={16} />,
    [PaymentMethod.CARD]: <CreditCard size={16} />,
    [PaymentMethod.CREDIT]: <Wallet size={16} />,
    [PaymentMethod.CHEQUE]: <ImageIcon size={16} />,
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 overflow-hidden font-['Inter']">
      
      {/* Left Column: Product Selection */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => setPosMode('RETAIL')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${posMode === 'RETAIL' ? 'bg-white text-blue-600 shadow-md ring-1 ring-blue-500/20' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Retail
            </button>
            <button 
              onClick={() => setPosMode('WHOLESALE')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${posMode === 'WHOLESALE' ? 'bg-white text-blue-600 shadow-md ring-1 ring-blue-500/20' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Wholesale
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {['All', ...CATEGORIES].map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 active:scale-95'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-10 scrollbar-hide">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => addToCart(item)}
              className="bg-white p-3 rounded-[2rem] border border-slate-100 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col relative active:scale-[0.98]"
            >
              <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-slate-50 mb-4 relative">
                <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[8px] font-black uppercase shadow-sm ${item.stock < 10 ? 'bg-red-500 text-white' : 'bg-white/95 text-slate-900'}`}>
                  Qty: {item.stock}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-[11px] font-black text-slate-900 truncate px-1 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1 mt-0.5">{item.category}</p>
              </div>
              <div className="flex items-center justify-between mt-3 bg-slate-50 p-2.5 rounded-2xl group-hover:bg-blue-50 transition-colors">
                <span className="text-[13px] font-black text-slate-900">
                  Rs. {(posMode === 'WHOLESALE' ? item.wholesalePrice : item.retailPrice).toLocaleString()}
                </span>
                <div className="p-1.5 bg-white rounded-lg text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Plus size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Terminal Cart */}
      <div className="w-[380px] flex flex-col bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden print:hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
               <ShoppingBag size={20} />
             </div>
             <div>
                <h3 className="text-sm font-black text-slate-900 leading-none">Terminal Cart</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Osaka Node {branch.slice(-1)}</p>
             </div>
          </div>
        </div>

        {posMode === 'WHOLESALE' && (
          <div className="p-4 bg-slate-50/50 border-b border-slate-50">
             <select 
               className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
               value={selectedBuyer?.id || ''}
               onChange={(e) => setSelectedBuyer(buyers.find(b => b.id === e.target.value) || null)}
             >
                <option value="">Select Wholesale Partner...</option>
                {buyers.map(b => <option key={b.id} value={b.id}>[{b.osakaId}] {b.shopName}</option>)}
             </select>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-200 opacity-40">
              <Zap size={64} strokeWidth={1} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Queue is Empty</p>
            </div>
          ) : (
            cart.map(({ item, quantity }) => (
              <div key={item.id} className="flex gap-3 items-center p-3 rounded-2xl border border-slate-50 hover:border-blue-100 transition-all bg-white group/row">
                <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0">
                   <img src={item.images[0]} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-black text-slate-800 truncate leading-none mb-1">{item.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400">Rs. {(posMode === 'WHOLESALE' ? item.wholesalePrice : item.retailPrice).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl p-1">
                   <button onClick={() => updateCartQty(item.id, -1)} className="p-1 text-slate-400 hover:text-red-500 transition-colors active:scale-125"><Minus size={14}/></button>
                   <span className="text-[11px] font-black text-slate-900 w-5 text-center">{quantity}</span>
                   <button onClick={() => updateCartQty(item.id, 1)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors active:scale-125"><Plus size={14}/></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-200 hover:text-red-400 transition-colors ml-1 active:scale-110"><Trash2 size={16}/></button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-950 text-white rounded-t-[3.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] space-y-6">
          <div className="flex justify-between items-center px-2">
             <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Grand Total</span>
                <div className="text-3xl font-black text-white tracking-tighter flex items-center gap-1">
                   <span className="text-sm text-slate-500">Rs.</span>
                   {calculateTotal().toLocaleString()}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Paid Amount</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full bg-white/10 border border-white/5 rounded-2xl p-4 text-sm font-black text-white outline-none focus:bg-white/15 focus:border-blue-500 transition-all"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Discount</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full bg-white/10 border border-white/5 rounded-2xl p-4 text-sm font-black text-white outline-none focus:bg-white/15 focus:border-blue-500 transition-all"
                  value={discount === '0' ? '' : discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
             </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Object.values(PaymentMethod).map(method => {
              const isCredit = method === PaymentMethod.CREDIT;
              const isCreditRestricted = isCredit && (posMode === 'RETAIL' || !selectedBuyer);
              
              return (
                <button 
                  key={method} 
                  disabled={isCreditRestricted}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex flex-col items-center justify-center py-3.5 rounded-2xl gap-2 transition-all border active:scale-95 
                    ${paymentMethod === method ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/40' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}
                    ${isCreditRestricted ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                >
                  {paymentIcons[method]}
                  <span className="text-[8px] font-black uppercase tracking-tighter">
                    {method}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setBillImage(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${billImage ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
            >
              {billImage ? <CheckCircle2 size={16} /> : <Camera size={16} />}
              <span className="text-[10px] font-black uppercase tracking-widest">{billImage ? 'Proof Secured' : 'Attach Proof Photo'}</span>
            </button>
          </div>

          <button 
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCompleteSale}
            className={`w-full py-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 disabled:grayscale ${isProcessing ? 'bg-blue-800 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/40 hover:scale-[1.02]'}`}
          >
            {isProcessing ? (
              <><Loader2 size={18} className="animate-spin" />Processing...</>
            ) : (
              <>Finalize Transaction<ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>

      {/* Bill Preview Modal */}
      {showBillPreview && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300 print:bg-white print:p-0 print:block">
           <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col animate-in zoom-in-95 duration-500 scrollbar-hide print:shadow-none print:max-h-none print:w-full print:rounded-none">
              
              <div className="p-8 border-b border-slate-100 flex justify-between items-center print:hidden bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20"><CheckCircle2 size={24} /></div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">Invoice Complete</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Share or print records</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    {showBillPreview.buyerId && (
                      <button 
                        onClick={handleSendWhatsApp}
                        className="px-6 py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10"
                      >
                        <MessageCircle size={18} /> WhatsApp
                      </button>
                    )}
                    <button 
                      onClick={handleNativeShare}
                      className="px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/10"
                    >
                      <Share2 size={18} /> Share
                    </button>
                    <button 
                      onClick={handlePrint}
                      className="px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/10"
                    >
                      <Printer size={18} /> Print / Save
                    </button>
                    <button onClick={() => setShowBillPreview(null)} className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-red-600 transition-all active:scale-90 ml-2">
                      <X size={24} />
                    </button>
                 </div>
              </div>

              <div className="flex-1 p-10 lg:p-16 print:p-0">
                <BillTemplate 
                  transaction={showBillPreview} 
                  buyer={buyers.find(b => b.id === showBillPreview.buyerId)} 
                  items={items} 
                />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default POS;
