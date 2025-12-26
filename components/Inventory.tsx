
import React, { useState, useRef, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Image as ImageIcon, 
  X, 
  CloudUpload, 
  Trash2, 
  Edit3, 
  Camera, 
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  Building2,
  AlertTriangle,
  Filter
} from 'lucide-react';
import { Item, Branch } from '../types';
import { CATEGORIES } from '../constants';

interface InventoryProps {
  items: Item[];
  onUpdateItems: (items: Item[]) => void;
  onDeleteItem: (id: string) => void;
  onTransferStock?: (itemId: string, targetBranch: Branch, quantity: number) => void;
  selectedBranch: Branch;
}

const Inventory: React.FC<InventoryProps> = ({ items, onUpdateItems, onDeleteItem, onTransferStock, selectedBranch }) => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [stockStatus, setStockStatus] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [viewingImages, setViewingImages] = useState<string[] | null>(null);
  const [transferringItem, setTransferringItem] = useState<Item | null>(null);
  const [transferQty, setTransferQty] = useState<string>('');
  const [targetBranch, setTargetBranch] = useState<Branch>(Branch.B1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || 
                           i.category.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCat === 'All' || i.category === activeCat;
      const matchesStock = stockStatus === 'ALL' ? true :
                          stockStatus === 'LOW' ? (i.stock > 0 && i.stock < 10) :
                          (i.stock <= 0);
      return matchesSearch && matchesCat && matchesStock;
    });
  }, [items, search, activeCat, stockStatus]);

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (items.find(i => i.id === editingItem.id)) {
      onUpdateItems(items.map(i => i.id === editingItem.id ? editingItem : i));
    } else {
      onUpdateItems([...items, editingItem]);
    }
    setEditingItem(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingItem) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingItem({
          ...editingItem,
          images: [...editingItem.images, reader.result as string]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransfer = () => {
    if (!transferringItem || !transferQty) return;
    const qty = parseInt(transferQty);
    if (isNaN(qty) || qty <= 0) return;
    if (qty > transferringItem.stock) {
      alert("Insufficient stock for this transfer!");
      return;
    }

    if (onTransferStock) {
      onTransferStock(transferringItem.id, targetBranch, qty);
    }
    setTransferringItem(null);
    setTransferQty('');
    alert(`${qty} units of ${transferringItem.name} successfully transferred to ${targetBranch}. Node sync complete.`);
  };

  const removeImage = (index: number) => {
    if (!editingItem) return;
    const newImages = [...editingItem.images];
    newImages.splice(index, 1);
    setEditingItem({ ...editingItem, images: newImages });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure? This item will be removed from all branch catalogs.")) {
      onDeleteItem(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-['Inter']">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Global Master Catalog</h2>
          <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.2em] mt-1">Unified Multi-Branch Node Redistribution System</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Query SKU Identity..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setEditingItem({ id: Math.random().toString(36).substr(2, 9), name: '', category: 'Grocery', wholesalePrice: 0, retailPrice: 0, stock: 0, images: [] })}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} /> New SKU
          </button>
        </div>
      </div>

      {/* Modern Filter Strip */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 pr-4 border-r border-slate-100 mr-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filters</span>
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
            onClick={() => setStockStatus('ALL')}
            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${stockStatus === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
           >
             All Stock
           </button>
           <button 
            onClick={() => setStockStatus('LOW')}
            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${stockStatus === 'LOW' ? 'bg-amber-500 text-white shadow-md' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
           >
             Low Stock
           </button>
           <button 
            onClick={() => setStockStatus('OUT')}
            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${stockStatus === 'OUT' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
           >
             Out of Stock
           </button>
        </div>
      </div>

      {/* High Density 10-Column Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3 pb-20">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-500 hover:shadow-xl transition-all relative overflow-hidden flex flex-col">
            
            {/* Action Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
               <div className="flex gap-1.5">
                  <button onClick={() => setViewingImages(item.images)} className="p-2 bg-white rounded-lg shadow text-slate-700 hover:text-blue-600 active:scale-90 transition-all"><Eye size={12} /></button>
                  <button onClick={() => setEditingItem(item)} className="p-2 bg-white rounded-lg shadow text-slate-700 hover:text-blue-600 active:scale-90 transition-all"><Edit3 size={12} /></button>
               </div>
               <div className="flex gap-1.5">
                  <button onClick={() => setTransferringItem(item)} className="p-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 active:scale-90 transition-all"><ArrowRightLeft size={12} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 active:scale-90 transition-all"><Trash2 size={12} /></button>
               </div>
            </div>

            <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-slate-50 border border-slate-100">
              <img src={item.images[0] || 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase shadow-sm ${item.stock <= 0 ? 'bg-red-600 text-white' : item.stock < 10 ? 'bg-amber-500 text-white' : 'bg-slate-900/80 text-white'}`}>
                {item.stock}
              </div>
            </div>
            
            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-slate-800 truncate leading-tight">{item.name}</h3>
               <div className="flex justify-between items-center pt-1 border-t border-slate-50">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{item.category}</span>
                  <span className="text-[10px] font-black text-blue-600">Rs.{item.retailPrice}</span>
               </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-20">
            <Package size={64} strokeWidth={1} className="mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">No Catalog Matches</p>
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {transferringItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xl shadow-blue-600/20"><ArrowRightLeft size={20} /></div>
                 <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Node Transfer</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Master Synchronization</p>
                 </div>
              </div>
              
              <div className="space-y-5">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Product Identity</p>
                    <p className="text-sm font-black text-slate-900">{transferringItem.name}</p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase mt-1">Current Pool: {transferringItem.stock} Units</p>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Destination Branch</label>
                    <select 
                      value={targetBranch}
                      onChange={(e) => setTargetBranch(e.target.value as Branch)}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10"
                    >
                       {Object.values(Branch).filter(b => b !== Branch.ALL).map(b => (
                         <option key={b} value={b}>{b}</option>
                       ))}
                    </select>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Units to Move</label>
                    <input 
                      type="number"
                      placeholder="Enter quantity..."
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10"
                      value={transferQty}
                      onChange={(e) => setTransferQty(e.target.value)}
                    />
                 </div>

                 <div className="flex gap-3 pt-2">
                    <button onClick={() => setTransferringItem(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest">Cancel</button>
                    <button onClick={handleTransfer} className="flex-[2] py-4 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Authorize & Sync</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Editing Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-xl font-black text-slate-900">{editingItem.name ? 'Edit Master SKU' : 'Establish New SKU'}</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Catalog Identity Management</p>
                 </div>
                 <button onClick={() => setEditingItem(null)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 transition-all active:scale-90"><X size={24} /></button>
              </div>

              <form onSubmit={handleSaveItem} className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-5">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">SKU Name</label>
                          <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}/>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Wholesale Basis</label>
                            <input type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10" value={editingItem.wholesalePrice} onChange={(e) => setEditingItem({...editingItem, wholesalePrice: Number(e.target.value)})}/>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Retail MSRP</label>
                            <input type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10" value={editingItem.retailPrice} onChange={(e) => setEditingItem({...editingItem, retailPrice: Number(e.target.value)})}/>
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Master Stock</label>
                          <input type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10" value={editingItem.stock} onChange={(e) => setEditingItem({...editingItem, stock: Number(e.target.value)})}/>
                       </div>
                    </div>
                    <div className="space-y-5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Digital Assets (Photos)</label>
                       <div className="grid grid-cols-3 gap-3">
                          {editingItem.images.map((img, idx) => (
                             <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-slate-100">
                                <img src={img} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-90"><X size={10} /></button>
                             </div>
                          ))}
                          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all bg-slate-50 group">
                             <CloudUpload size={20} className="group-hover:-translate-y-1 transition-transform" />
                             <span className="text-[7px] font-black uppercase">Attach</span>
                          </button>
                       </div>
                    </div>
                 </div>
                 <div className="pt-6 flex gap-4 border-t border-slate-100">
                    <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Discard</button>
                    <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-[0.98]">Authorize Global Sync</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {viewingImages && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 animate-in fade-in duration-300 backdrop-blur-sm flex flex-col">
           <div className="p-8 flex justify-end">
             <button onClick={() => setViewingImages(null)} className="text-white/50 hover:text-white transition-all active:scale-90"><X size={40} strokeWidth={1} /></button>
           </div>
           <div className="flex-1 flex items-center justify-center overflow-x-auto scrollbar-hide p-10 gap-8">
              {viewingImages.map((img, idx) => (
                 <div key={idx} className="flex-shrink-0 w-[400px] h-[550px] rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10">
                    <img src={img} className="w-full h-full object-cover" />
                 </div>
              ))}
              {viewingImages.length === 0 && (
                <div className="text-white/20 text-center font-black uppercase tracking-[0.5em]">No Digital Assets Attached</div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
