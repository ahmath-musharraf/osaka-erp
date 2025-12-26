
import React from 'react';
import { Building2, MapPin, Phone, User, Globe, ShoppingBag } from 'lucide-react';
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
    <div className="bg-white p-12 max-w-[800px] mx-auto shadow-2xl rounded-[3rem] border border-slate-100 font-['Inter'] print:shadow-none print:p-8 print:m-0 print:border-none print:rounded-none print:w-full print:max-w-none">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact; 
          }
          .print-bg-slate { background-color: #0f172a !important; color: white !important; }
          .print-bg-blue { background-color: #2563eb !important; color: white !important; }
          .print-text-slate { color: #0f172a !important; }
          .print-border-slate { border-color: #0f172a !important; }
        }
      `}</style>
      
      {/* Header Section */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 print-border-slate">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-white print-bg-slate">
              <Building2 size={32} />
            </div>
            <div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter print-text-slate">OSAKA <span className="text-blue-600">GROUP</span></h1>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Enterprise Solutions</p>
            </div>
          </div>
          <div className="space-y-1 text-slate-500 font-bold text-[11px] uppercase tracking-widest print-text-slate">
            <p className="flex items-center gap-2"><MapPin size={12} className="text-blue-600" /> {branchInfo.address}</p>
            <p className="flex items-center gap-2"><Phone size={12} className="text-blue-600" /> {branchInfo.phone}</p>
            <p className="flex items-center gap-2"><Globe size={12} className="text-blue-600" /> WWW.OSAKA-NETWORK.COM</p>
          </div>
        </div>
        <div className="text-right space-y-3">
          <div className="bg-slate-950 text-white px-8 py-3 rounded-2xl text-[12px] font-black uppercase tracking-[0.4em] inline-block mb-4 print-bg-slate">
            Tax Invoice
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-2">
            Invoice No: <span className="text-slate-900 text-lg print-text-slate">#{transaction.id.toUpperCase()}</span>
          </p>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-2">
            Date Issued: <span className="text-slate-900 print-text-slate">{new Date(transaction.timestamp).toLocaleDateString()}</span>
          </p>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-2">
            Branch: <span className="text-slate-900 print-text-slate">{transaction.branch}</span>
          </p>
        </div>
      </div>

      {/* Bill Information */}
      <div className="grid grid-cols-2 gap-10 py-12 border-b border-slate-100 print-border-slate">
        <div>
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Recipient Details:</h4>
          {buyer ? (
            <div className="space-y-2">
              <p className="text-2xl font-black text-slate-900 print-text-slate">{buyer.shopName}</p>
              <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                 <User size={14} className="text-blue-500" /> {buyer.contactName}
              </p>
              <p className="text-xs font-medium text-slate-500 flex items-start gap-2">
                 <MapPin size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> {buyer.location}
              </p>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl w-fit text-[10px] font-black uppercase tracking-widest border border-blue-100 mt-2 print-bg-blue print:text-white">
                Osaka ID: {buyer.osakaId}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-2xl font-black text-slate-900 italic print-text-slate">Walk-in Retail Sale</p>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Public Cash Terminal</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Financial Overview:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 print:bg-white print:border-slate-200">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Payment Basis</p>
              <p className="text-sm font-black text-slate-900 print-text-slate">{transaction.paymentMethod}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 print:bg-white print:border-slate-200">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Ledger Status</p>
              <p className={`text-sm font-black ${transaction.status === 'PAID' ? 'text-emerald-600' : 'text-red-600'}`}>
                {transaction.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="py-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-[11px] font-black uppercase tracking-widest border-b-2 border-slate-950 print-border-slate">
              <th className="px-6 py-4">Item Catalog Description</th>
              <th className="px-6 py-4 text-center">Qty</th>
              <th className="px-6 py-4 text-center">Rate</th>
              <th className="px-6 py-4 text-right">Extended Total</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items.map((saleItem, index) => {
              const itemData = items.find(i => i.id === saleItem.itemId);
              return (
                <tr key={index} className="border-b border-slate-50 print-border-slate">
                  <td className="px-6 py-6">
                    <p className="text-[13px] font-black text-slate-900 print-text-slate">{itemData?.name || 'Stock Item'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{itemData?.category}</p>
                  </td>
                  <td className="px-6 py-6 text-center text-[13px] font-black text-slate-600">
                    {saleItem.quantity}
                  </td>
                  <td className="px-6 py-6 text-center text-[13px] font-black text-slate-600">
                    Rs. {saleItem.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-6 text-right text-[13px] font-black text-slate-900 print-text-slate">
                    Rs. {(saleItem.price * saleItem.quantity).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end pt-8">
        <div className="w-80 space-y-4">
          <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-4">
            <span className="uppercase tracking-widest text-[10px]">Sub-Total Value</span>
            <span className="print-text-slate">Rs. {(transaction.totalAmount + transaction.discount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-4">
            <span className="uppercase tracking-widest text-[10px]">Authorized Discount</span>
            <span className="text-red-500">- Rs. {transaction.discount.toLocaleString()}</span>
          </div>
          <div className="h-px bg-slate-200" />
          <div className="flex justify-between items-center bg-slate-950 text-white p-6 rounded-[2rem] shadow-xl print-bg-slate print:text-white">
            <span className="font-black uppercase tracking-[0.2em] text-[11px]">Payable Total</span>
            <span className="text-2xl font-black">Rs. {transaction.totalAmount.toLocaleString()}</span>
          </div>
          {transaction.paidAmount < transaction.totalAmount && (
             <div className="flex justify-between items-center bg-red-50 text-red-600 p-6 rounded-[2rem] border border-red-100 print:bg-white print:border-red-600 print-text-slate">
                <span className="font-black uppercase tracking-[0.2em] text-[11px]">Balance Due</span>
                <span className="text-xl font-black italic">Rs. {(transaction.totalAmount - transaction.paidAmount).toLocaleString()}</span>
             </div>
          )}
        </div>
      </div>

      {/* Terms & Authorization */}
      <div className="mt-20 border-t-2 border-slate-900 pt-10 text-center space-y-6 print-border-slate">
        <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] print-text-slate">Osaka Group Quality Guarantee</p>
        <div className="flex justify-center gap-16">
           <div className="text-center">
              <div className="w-24 h-24 border-2 border-slate-100 rounded-2xl mx-auto mb-3 flex items-center justify-center text-slate-100 print:border-slate-200">
                 <ShoppingBag size={48} />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Office Seal</p>
           </div>
           <div className="text-center">
              <div className="w-48 h-24 border-2 border-slate-100 rounded-2xl mx-auto mb-3 flex flex-col items-center justify-end p-4 print:border-slate-200">
                 <div className="w-full h-px bg-slate-300" />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Authorized Signature</p>
           </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 print:bg-white print:border-slate-200">
          <p className="text-[9px] font-bold text-slate-400 max-w-lg mx-auto leading-relaxed text-center uppercase">
            This invoice is a digitally signed ledger entry from the Osaka ERP Cloud. Any discrepancies must be reported within 24 hours. Electronic records are subject to Osaka Group financial audit.
          </p>
        </div>
        
        <div className="pt-10 mt-10 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-[0.2em]">
          <p>Node: {transaction.branch}</p>
          <p>Engine: Osaka ERP v2.5</p>
          <p>Auth: {transaction.id.slice(0,8)}</p>
        </div>
      </div>
    </div>
  );
};

export default BillTemplate;
