
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Wallet, 
  FileText, 
  Truck, 
  LogOut,
  Building2,
  TrendingDown,
  History,
  ShieldCheck,
  MessageCircle,
  MapPin,
  X
} from 'lucide-react';
import { UserRole, Branch } from '../types';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  role: UserRole;
  selectedBranch: Branch;
  setSelectedBranch: (branch: Branch) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setTab, 
  role, 
  selectedBranch, 
  setSelectedBranch,
  onLogout,
  isOpen,
  onClose
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN] },
    { id: 'pos', label: 'POS Billing', icon: ShoppingCart, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.STAFF] },
    { id: 'inventory', label: 'Inventory', icon: Package, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN] },
    { id: 'buyers', label: 'Wholesale Buyers', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN] },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, roles: [UserRole.SUPER_ADMIN] },
    { id: 'expenses', label: 'Daily Costs', icon: TrendingDown, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN] },
    { id: 'cheques', label: 'Cheque Tracker', icon: Wallet, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN] },
    { id: 'automation', label: 'Reminders', icon: MessageCircle, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN] },
    { id: 'audit', label: 'Edit History', icon: History, roles: [UserRole.SUPER_ADMIN] },
    { id: 'reports', label: 'Full Reports', icon: FileText, roles: [UserRole.SUPER_ADMIN] },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className={`w-64 bg-slate-950 h-screen text-slate-300 flex flex-col fixed left-0 top-0 shadow-2xl z-50 border-r border-slate-800 transition-transform duration-500 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
            <Building2 className="text-blue-500" /> OSAKA
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Enterprise ERP</p>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="px-6 mb-8">
        <label className="text-[10px] font-bold text-slate-600 uppercase px-1 mb-2 block tracking-widest">
          {role === UserRole.SUPER_ADMIN ? 'Context Switcher' : 'Assigned Terminal'}
        </label>
        {role === UserRole.SUPER_ADMIN ? (
          <div className="relative">
            <select 
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 pl-10 text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none hover:bg-slate-800 transition-colors font-black uppercase tracking-tight"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value as Branch)}
            >
              {Object.values(Branch).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={14} />
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl text-xs font-black uppercase flex items-center gap-3 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="truncate">{selectedBranch}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
        {allowedItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setTab(item.id);
              if (onClose) onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              currentTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <item.icon size={18} strokeWidth={2.5} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-900 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner">
            <ShieldCheck size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-white truncate uppercase tracking-widest leading-none mb-1">
              {role === UserRole.SUPER_ADMIN ? 'ADMIN' : (role === UserRole.BRANCH_ADMIN ? 'MANAGER' : 'OPERATOR')}
            </p>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest truncate">Identity Verified</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 transition-all uppercase tracking-widest"
        >
          <LogOut size={16} />
          Logoff Node
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
