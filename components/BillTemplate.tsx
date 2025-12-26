
import React from 'react';
import { Building2, MapPin, Phone, User, Globe, Hash, Calendar, ShoppingBag, ExternalLink } from 'lucide-react';
import { Transaction, Branch, Buyer, Item } from '../types';

interface BillTemplateProps {
  transaction: Transaction;
  buyer?: Buyer;
  items: Item[];
}

const BillTemplate: React.FC<BillTemplateProps> = ({ transaction, buyer, items }) => {
  const getBranchDetails = (branch: Branch) => {
    const details = {
      [Branch.MAIN]: { address: 'No 45, Main St, Colombo 11', phone: '+94 11 2345 678' },
      [Branch.B1]: { address: 'Osaka Plaza, Galle Rd, Colombo 03', phone: '+94 11 2345 671' },
      [Branch.B2]: { address: 'Sector 4, Negombo Road, Wattala', phone: '+94 11 2345 672' },
      [Branch.B3]: { address: 'Market Square, Kandy Road, Kadawatha', phone: '+94 11 2345 673' },
      [Branch.B4]: { address: 'Station Rd, Bambalapitiya', phone: '+94 11 2345 674' },
      [Branch.B5]: { address: 'Hill Street, Dehiwala', phone: '+94 11 2345 675' },
      [Branch.ALL]: { address: 'Osaka Corporate HQ, Colombo', phone: '+94 11 0000 000' },
    };
    return details[branch] || details[Branch.MAIN];
  };

  const branchInfo = getBranchDetails(transaction.branch);

  return (
    <div className="bg-white p-12 max-w-[800px] mx-auto shadow-2xl rounded-[3rem] border border-slate-100 font-['Inter'] print:shadow-none print:p-0 print:m-0 print:border-none print:rounded-none">
      <style>{`
        @media print {
          body { background: white !important; }
          .print-bg-blue { background-color: #3b82f6 !important; -webkit-print-color-adjust: exact; }
          .print-bg-slate { background-color: #0f172a !important; -webkit-print-color-adjust: exact; }
          .print-bg-emerald { background-color: #10b981 !important; -webkit-print-color-adjust: exact; }
          .print-text-white { color: white !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white print-bg-slate print-text-white">
              <Building2 size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">OSAKA <span className="text-blue-600">GROUP</span></h1>
          </div>
          <div className="space-y-1 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
            <p className="flex items-center gap-2 text-slate-900"><MapPin size={12} className="text-blue-600" /> {branchInfo.address}</p>
            <p className="flex items-center gap-2"><Phone size={12} className="text-blue-600" /> {branchInfo.phone}</p>
            <p className="flex items-center gap-2"><Globe size={12} className="text-blue-600" /> WWW.OSAKA-NETWORK.COM</p>
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="bg-slate-950 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] inline-block mb-4 print-bg-slate print-text-white">
            Official {transaction.type} Invoice
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-2">
            Invoice No: <span className="text-slate-900 text-sm">#{transaction.id.toUpperCase()}</span>
          </p>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-2">
            Date: <span className="text-slate-900">{new Date(transaction.timestamp).toLocaleDateString()}</span>
          </p>
        </div>
      </div>

      {/* Buyer & Transaction Details */}
      <div className="grid grid-cols-2 gap-10 py-10 border-b border-slate-100">
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Billing To:</h4>
          {buyer ? (
            <div className="space-y-2">
              <p className="text-xl font-black text-slate-900">{buyer.shopName}</p>
              <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                 <User size={14} className="text-blue-500" /> {buyer.contactName}
              </p>
              <p className="text-xs font-medium text-slate-500 flex items-start gap-2">
                 <MapPin size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> {buyer.location}
              </p>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-xl w-fit text-[10px] font-black uppercase tracking-widest border border-blue-100 mt-2">
                Osaka ID: {buyer.osakaId}
              </div>
              <p className="text-sm font-bold text-slate-500 mt-1">{buyer.phone}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xl font-black text-slate-900 italic">Walk-in Retail Customer</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Register: {transaction.branch}</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Intelligence:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Method</p>
              <p className="text-xs font-black text-slate-900">{transaction.paymentMethod}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Status</p>
              <p className={`text-xs font-black ${transaction.status === 'PAID' ? 'text-emerald-600' : 'text-red-600'}`}>
                {transaction.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-10">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-6 py-4 bg-slate-50 rounded-l-2xl">Description</th>
              <th className="px-6 py-4 bg-slate-50 text-center">Qty</th>
              <th className="px-6 py-4 bg-slate-50 text-center">Unit Price</th>
              <th className="px-6 py-4 bg-slate-50 rounded-r-2xl text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items.map((saleItem, index) => {
              const itemData = items.find(i => i.id === saleItem.itemId);
              return (
                <tr key={index} className="group">
                  <td className="px-6 py-5 border-b border-slate-50">
                    <p className="text-sm font-black text-slate-900">{itemData?.name || 'Unknown Item'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{itemData?.category}</p>
                  </td>
                  <td className="px-6 py-5 border-b border-slate-50 text-center text-sm font-black text-slate-600">
                    {saleItem.quantity}
                  </td>
                  <td className="px-6 py-5 border-b border-slate-50 text-center text-sm font-black text-slate-600">
                    Rs. {saleItem.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 border-b border-slate-50 text-right text-sm font-black text-slate-900">
                    Rs. {(saleItem.price * saleItem.quantity).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end pt-10">
        <div className="w-80 space-y-4">
          <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-4">
            <span className="uppercase tracking-widest text-[10px]">Subtotal Value</span>
            <span>Rs. {(transaction.totalAmount + transaction.discount - transaction.tax).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-4">
            <span className="uppercase tracking-widest text-[10px]">Network Discount</span>
            <span className="text-red-500">- Rs. {transaction.discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-4">
            <span className="uppercase tracking-widest text-[10px]">Value Added Tax</span>
            <span>+ Rs. {transaction.tax.toLocaleString()}</span>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="flex justify-between items-center bg-slate-950 text-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/10 print-bg-slate print-text-white">
            <span className="font-black uppercase tracking-[0.2em] text-[10px]">Grand Total</span>
            <span className="text-2xl font-black">Rs. {transaction.totalAmount.toLocaleString()}</span>
          </div>
          {transaction.paidAmount < transaction.totalAmount && (
             <div className="flex justify-between items-center bg-red-50 text-red-600 p-6 rounded-[2rem] border border-red-100">
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Total Balance Due</span>
                <span className="text-xl font-black italic">Rs. {(transaction.totalAmount - transaction.paidAmount).toLocaleString()}</span>
             </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 border-t border-slate-100 pt-10 text-center space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Thank you for partnering with Osaka</p>
        <div className="flex justify-center gap-10">
           <div className="text-center">
              <div className="w-20 h-20 border-2 border-slate-100 rounded-2xl mx-auto mb-2 flex items-center justify-center text-slate-100">
                 <ShoppingBag size={40} />
              </div>
              <p className="text-[8px] font-black text-slate-300 uppercase">Seal of Auth</p>
           </div>
           <div className="text-center">
              <div className="w-20 h-20 border-2 border-slate-100 rounded-2xl mx-auto mb-2 flex flex-col items-center justify-center p-2">
                 <div className="w-full h-1 bg-slate-100 mb-1" />
                 <div className="w-full h-1 bg-slate-100 mb-1" />
                 <div className="w-full h-1 bg-slate-100 mb-1" />
                 <div className="w-full h-1 bg-slate-100 mb-1" />
              </div>
              <p className="text-[8px] font-black text-slate-300 uppercase">Digital Signature</p>
           </div>
        </div>
        <p className="text-[8px] font-bold text-slate-300 max-w-md mx-auto leading-relaxed">
          THIS IS A COMPUTER GENERATED INVOICE RECORDED IN THE OSAKA CLOUD LEDGER SYSTEM. ANY ALTERATIONS WITHOUT ADMINISTRATIVE APPROVAL ARE SUBJECT TO FORENSIC AUDIT.
        </p>
        
        <div className="pt-6 mt-6 border-t border-slate-50 print:block">
          <p className="text-[9px] text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
            Invoice engine by <span className="font-black text-slate-600">Mushi Editz</span> • mushieditz.vercel.app
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillTemplate;
