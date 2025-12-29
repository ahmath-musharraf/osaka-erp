
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import CreditManagement from './components/CreditManagement';
import SupplierManagement from './components/SupplierManagement';
import ChequeTracker from './components/ChequeTracker';
import ExpenseTracker from './components/ExpenseTracker';
import AuditLogs from './components/AuditLogs';
import Inventory from './components/Inventory';
import WhatsAppAutomation from './components/WhatsAppAutomation';
import Reports from './components/Reports';
import { UserRole, Branch, Transaction, Expense, Buyer, Seller, Cheque, Item, AuditLog, WhatsAppLog, SyncStatus } from './types';
import { INITIAL_BUYERS, INITIAL_SUPPLIERS, INITIAL_ITEMS, INITIAL_AUDIT_LOGS } from './constants';
import { dbService, CloudData } from './services/dbService';
import { 
  Building2, 
  ShieldCheck, 
  WifiOff, 
  Wifi, 
  Store, 
  User as UserIcon, 
  ChevronRight, 
  ArrowLeft, 
  MapPin, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2,
  Menu,
  X,
  Smartphone,
  Calendar as CalendarIcon,
  Clock as ClockIcon
} from 'lucide-react';

const App: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState<UserRole | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch>(Branch.ALL);
  const [loginStep, setLoginStep] = useState<'ROLE' | 'BRANCH' | 'CREDENTIALS'>('ROLE');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('SYNCED');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State for Database Collections
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>(INITIAL_BUYERS);
  const [suppliers, setSuppliers] = useState<Seller[]>(INITIAL_SUPPLIERS);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Real-time Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close sidebar on tab change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);

  // Load Data from Database on Mount
  useEffect(() => {
    const initData = async () => {
      setIsInitialLoading(true);
      const data = await dbService.loadAllData();
      if (data.transactions) setTransactions(data.transactions);
      if (data.items) setItems(data.items);
      if (data.expenses) setExpenses(data.expenses);
      if (data.buyers) setBuyers(data.buyers);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.cheques) setCheques(data.cheques);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.whatsappLogs) setWhatsappLogs(data.whatsappLogs);
      setIsInitialLoading(false);
    };
    initData();
  }, []);

  // Auto-Sync Logic
  useEffect(() => {
    if (isInitialLoading || !isLoggedIn) return;

    const performSync = async () => {
      setSyncStatus('SYNCING');
      const data: CloudData = {
        transactions,
        items,
        expenses,
        buyers,
        suppliers: suppliers,
        cheques,
        auditLogs,
        whatsappLogs
      };
      const success = await dbService.syncData(data);
      setSyncStatus(success ? 'SYNCED' : 'OFFLINE_PENDING');
    };

    const debounce = setTimeout(performSync, 1000);
    return () => clearTimeout(debounce);
  }, [transactions, items, expenses, buyers, suppliers, cheques, auditLogs, whatsappLogs, isLoggedIn, isInitialLoading]);

  const getRequiredPassword = (r: UserRole, b: Branch) => {
    if (r === UserRole.SUPER_ADMIN) return 'osaka@admin';
    const branchKeys: Record<string, string> = { [Branch.MAIN]: 'main', [Branch.B1]: 'b1', [Branch.B2]: 'b2', [Branch.B3]: 'b3', [Branch.B4]: 'b4', [Branch.B5]: 'b5' };
    const key = branchKeys[b];
    if (r === UserRole.BRANCH_ADMIN) return `manager@${key}`;
    if (r === UserRole.STAFF) return `staff@${key}`;
    return 'osaka@secure';
  };

  const logAction = useCallback((action: string, target: string, oldValue?: string, newValue?: string, severity: AuditLog['severity'] = 'LOW') => {
    if (!role) return;
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: role === UserRole.SUPER_ADMIN ? 'Osaka-Master' : `Osaka-${selectedBranch}`,
      userRole: role,
      branch: selectedBranch,
      action,
      target,
      oldValue,
      newValue,
      timestamp: new Date().toISOString(),
      severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [role, selectedBranch]);

  const handleTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
    if (t.isFlagged) logAction('CRITICAL: FRAUD ALERT', `High Discount Sale ${t.id}`, 'N/A', `Rs. ${t.discount}`, 'CRITICAL');
    else logAction('POS Transaction', `Order: ${t.id}`, 'N/A', `Value: Rs. ${t.totalAmount}`, 'LOW');
    
    setItems(prevItems => prevItems.map(item => {
      const soldItem = t.items.find(si => si.itemId === item.id);
      if (soldItem) return { ...item, stock: Math.max(0, item.stock - soldItem.quantity) };
      return item;
    }));

    if (t.buyerId && t.type === 'WHOLESALE') {
      setBuyers(prev => prev.map(b => {
        if (b.id === t.buyerId) {
          const unpaid = t.totalAmount - t.paidAmount;
          return { ...b, currentCredit: b.currentCredit + unpaid };
        }
        return b;
      }));
    }
  };

  const handleImportBackup = (data: CloudData) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.items) setItems(data.items);
    if (data.expenses) setExpenses(data.expenses);
    if (data.buyers) setBuyers(data.buyers);
    if (data.suppliers) setSuppliers(data.suppliers);
    if (data.cheques) setCheques(data.cheques);
    if (data.auditLogs) setAuditLogs(data.auditLogs);
    if (data.whatsappLogs) setWhatsappLogs(data.whatsappLogs);
    
    logAction('System Restore', 'Master Database', 'Multiple Collections', 'Imported from Backup', 'HIGH');
  };

  const renderContent = () => {
    if (!role) return null;
    const activeBranch = selectedBranch === Branch.ALL ? Branch.MAIN : selectedBranch;

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} expenses={expenses} buyers={buyers} selectedBranch={selectedBranch} role={role} auditLogs={auditLogs} />;
      case 'pos':
        return (
          <POS 
            branch={activeBranch} 
            items={items} 
            buyers={buyers} 
            onTransaction={handleTransaction} 
            onAddBuyer={(b) => setBuyers(prev => [...prev, b])}
          />
        );
      case 'inventory':
        return (
          <Inventory 
            items={items} 
            onUpdateItems={(newItems) => { setItems(newItems); logAction('Inventory Update', 'Global Catalog', 'Many', 'Update', 'MEDIUM'); }} 
            onDeleteItem={(id) => { setItems(prev => prev.filter(i => i.id !== id)); logAction('Item Deletion', `ID: ${id}`, 'Existing', 'None', 'HIGH'); }}
            selectedBranch={selectedBranch} 
          />
        );
      case 'buyers':
        return (
          <CreditManagement 
            buyers={buyers} 
            transactions={transactions} 
            selectedBranch={selectedBranch} 
            onUpdateBuyer={(b) => setBuyers(prev => prev.map(old => old.id === b.id ? b : old))} 
            onAddBuyer={(b) => setBuyers(prev => [...prev, b])} 
            onDeleteBuyer={(id) => { 
              setBuyers(prev => prev.filter(b => b.id !== id)); 
              logAction('Buyer Deletion', `ID: ${id}`, 'Existing Partner', 'Deleted', 'HIGH'); 
            }}
            onDeleteTransaction={(id) => {
              const targetT = transactions.find(t => t.id === id);
              if (targetT && targetT.buyerId) {
                setBuyers(prev => prev.map(b => b.id === targetT.buyerId ? { ...b, currentCredit: Math.max(0, b.currentCredit - (targetT.totalAmount - targetT.paidAmount)) } : b));
              }
              setTransactions(prev => prev.filter(t => t.id !== id));
              logAction('Transaction Deletion', `ID: ${id}`, 'Wholesale Bill', 'Deleted', 'HIGH');
            }}
            onDeletePayment={(buyerId, paymentId) => {
              setBuyers(prev => prev.map(b => {
                if (b.id === buyerId) {
                  const p = b.payments.find(p => p.id === paymentId);
                  return { ...b, currentCredit: b.currentCredit + (p?.amount || 0), payments: b.payments.filter(p => p.id !== paymentId) };
                }
                return b;
              }));
              logAction('Payment Deletion', `ID: ${paymentId}`, 'Buyer Settlement', 'Deleted', 'HIGH');
            }}
            onTransaction={handleTransaction} 
          />
        );
      case 'suppliers':
        return (
          <SupplierManagement 
            suppliers={suppliers} 
            selectedBranch={selectedBranch} 
            onUpdateSupplier={(s) => setSuppliers(prev => prev.map(old => old.id === s.id ? s : old))} 
            onAddSupplier={(s) => setSuppliers(prev => [...prev, s])} 
            onDeleteSupplier={(id) => {
              setSuppliers(prev => prev.filter(s => s.id !== id));
              logAction('Supplier Deletion', `ID: ${id}`, 'Existing Seller', 'Deleted', 'HIGH');
            }}
            onDeleteLedgerEntry={(supplierId, entryId) => {
              setSuppliers(prev => prev.map(s => {
                if (s.id === supplierId) {
                  const entry = s.ledger.find(e => e.id === entryId);
                  const amount = entry?.amount || 0;
                  const newBalance = entry?.type === 'PURCHASE_BILL' ? s.balance - amount : s.balance + amount;
                  return { ...s, balance: newBalance, ledger: s.ledger.filter(e => e.id !== entryId) };
                }
                return s;
              }));
              logAction('Ledger Entry Deletion', `ID: ${entryId}`, 'Supplier Transaction', 'Deleted', 'HIGH');
            }}
          />
        );
      case 'cheques':
        return <ChequeTracker selectedBranch={selectedBranch} cheques={cheques} onAddCheque={(c) => setCheques([...cheques, c])} onUpdateChequeStatus={(id, s) => setCheques(prev => prev.map(c => c.id === id ? {...c, status: s} : c))} onDeleteCheque={(id) => { setCheques(prev => prev.filter(c => c.id !== id)); logAction('Cheque Deletion', `ID: ${id}`, 'Financial Instrument', 'Deleted', 'HIGH'); }} />;
      case 'expenses':
        return <ExpenseTracker expenses={expenses} onAddExpense={(e) => setExpenses([e, ...expenses])} onDeleteExpense={(id) => { setExpenses(prev => prev.filter(e => e.id !== id)); logAction('Expense Deletion', `ID: ${id}`, 'Daily Cost Record', 'Deleted', 'HIGH'); }} selectedBranch={selectedBranch} />;
      case 'automation':
        return <WhatsAppAutomation buyers={buyers} cheques={cheques} selectedBranch={selectedBranch} whatsappLogs={whatsappLogs} onLogMessage={(l) => setWhatsappLogs([l, ...whatsappLogs])} />;
      case 'audit':
        return <AuditLogs logs={auditLogs} />;
      case 'reports':
        return (
          <Reports 
            transactions={transactions} 
            items={items} 
            buyers={buyers} 
            expenses={expenses} 
            suppliers={suppliers}
            cheques={cheques}
            auditLogs={auditLogs}
            whatsappLogs={whatsappLogs}
            onImportBackup={handleImportBackup}
          />
        );
      default:
        return <Dashboard transactions={transactions} expenses={expenses} buyers={buyers} selectedBranch={selectedBranch} role={role} auditLogs={auditLogs} />;
    }
  };

  const handleRoleSelection = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setLoginError('');
    if (selectedRole === UserRole.SUPER_ADMIN) { setSelectedBranch(Branch.ALL); setLoginStep('CREDENTIALS'); }
    else { setLoginStep('BRANCH'); }
  };

  const handleBranchSelection = (branch: Branch) => { setSelectedBranch(branch); setLoginStep('CREDENTIALS'); };

  const handleLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    const requiredPass = getRequiredPassword(role, selectedBranch);
    if (password === requiredPass) {
      setIsLoggedIn(true);
      if (role === UserRole.STAFF) setActiveTab('pos');
      else setActiveTab('dashboard');
    } else {
      setLoginError(`Invalid access credentials for ${selectedBranch}.`);
    }
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-['Inter']">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <Building2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={32} />
        </div>
        <h2 className="mt-8 text-white font-black uppercase tracking-[0.4em] text-sm animate-pulse">Establishing Cloud Bridge</h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase mt-2 tracking-widest text-center">Handshaking with Neon PostgreSQL...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-['Inter'] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600/10 blur-[150px] rounded-full"></div>
        <div className="w-full max-w-2xl bg-white rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-10 md:mb-12 text-center md:text-left">
            <div>
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-blue-600/30 mx-auto md:mx-0">
                <Building2 className="text-white" size={32} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">OSAKA <span className="text-blue-600">ERP</span></h1>
              <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.4em] mt-2">Enterprise Access Shield</p>
            </div>
            <div className="flex flex-col items-center md:items-end mt-6 md:mt-0">
               <div className="flex gap-1.5 mb-2">
                  <div className={`w-2 h-2 rounded-full ${loginStep === 'ROLE' ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                  <div className={`w-2 h-2 rounded-full ${loginStep === 'BRANCH' ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                  <div className={`w-2 h-2 rounded-full ${loginStep === 'CREDENTIALS' ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Handshake Phase: {loginStep}</p>
            </div>
          </div>

          {loginStep === 'ROLE' ? (
            <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                <button onClick={() => handleRoleSelection(UserRole.SUPER_ADMIN)} className="w-full p-6 md:p-8 bg-slate-950 text-white rounded-[2rem] md:rounded-[2.5rem] font-black text-sm hover:bg-blue-600 transition-all flex items-center justify-between group shadow-xl">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="p-3 md:p-4 bg-white/10 rounded-2xl"><ShieldCheck size={20} /></div>
                    <div className="text-left"><span className="block text-sm md:text-base uppercase tracking-widest">Super Admin</span><span className="text-[10px] text-slate-400 font-bold uppercase">Master Clearance</span></div>
                  </div>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => handleRoleSelection(UserRole.BRANCH_ADMIN)} className="w-full p-6 md:p-8 bg-slate-50 text-slate-900 rounded-[2rem] md:rounded-[2.5rem] font-black text-sm hover:bg-slate-100 transition-all flex items-center justify-between group border border-slate-100">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="p-3 md:p-4 bg-blue-600/10 text-blue-600 rounded-2xl"><UserIcon size={20} /></div>
                    <div className="text-left"><span className="block text-sm md:text-base uppercase tracking-widest">Branch Admin</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Shop Manager</span></div>
                  </div>
                  <ChevronRight size={18} />
                </button>
                <button onClick={() => handleRoleSelection(UserRole.STAFF)} className="w-full p-6 md:p-8 bg-slate-50 text-slate-900 rounded-[2rem] md:rounded-[2.5rem] font-black text-sm hover:bg-slate-100 transition-all flex items-center justify-between group border border-slate-100">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="p-3 md:p-4 bg-emerald-600/10 text-emerald-600 rounded-2xl"><Store size={20} /></div>
                    <div className="text-left"><span className="block text-sm md:text-base uppercase tracking-widest">Staff / Cashier</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Terminal Mode</span></div>
                  </div>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ) : loginStep === 'BRANCH' ? (
             <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                <div className="mb-4">
                  <button type="button" onClick={() => setLoginStep('ROLE')} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 mb-4 flex items-center gap-1"><ArrowLeft size={12}/> Back to Roles</button>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900">Select Operating Node</h2>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Authorized role: {role?.replace('_', ' ')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                   {Object.values(Branch).filter(b => b !== Branch.ALL).map(b => (
                      <button 
                        key={b} 
                        onClick={() => handleBranchSelection(b)}
                        className="p-4 md:p-6 bg-slate-50 border-2 border-slate-100 hover:border-blue-600 hover:bg-white rounded-[1.5rem] md:rounded-[2rem] text-left transition-all group"
                      >
                         <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <MapPin size={16} />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-tight text-slate-900 leading-tight">{b}</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Terminal Node</p>
                      </button>
                   ))}
                </div>
             </div>
          ) : (
            <form onSubmit={handleLoginAttempt} className="space-y-6 md:space-y-8 animate-in slide-in-from-right-10 duration-500">
              <div className="mb-4">
                <button type="button" onClick={() => role === UserRole.SUPER_ADMIN ? setLoginStep('ROLE') : setLoginStep('BRANCH')} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 mb-4 flex items-center gap-1"><ArrowLeft size={12}/> Change {role === UserRole.SUPER_ADMIN ? 'Role' : 'Node'}</button>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">Authenticate Level</h2>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Identity: {role?.replace('_', ' ')} @ {selectedBranch}</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    placeholder="Security Access Key" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-6 md:px-8 py-4 md:py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] md:rounded-[2rem] text-sm font-black outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {loginError && (
                  <div className="flex items-center gap-3 bg-red-50 p-4 md:p-5 rounded-[1.5rem] border border-red-100 animate-in shake duration-300">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                    <p className="text-[10px] font-black text-red-600 uppercase leading-tight">{loginError}</p>
                  </div>
                )}
              </div>
              <button type="submit" className="w-full py-5 md:py-6 bg-slate-950 text-white rounded-[1.5rem] md:rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-blue-600 transition-all">Verify Handshake</button>
            </form>
          )}
          
          <div className="mt-8 md:mt-12 text-center pt-8 border-t border-slate-50">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Osaka Multi-Branch Cloud Auth Active</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentTab={activeTab} 
        setTab={setActiveTab} 
        role={role} 
        selectedBranch={selectedBranch} 
        setSelectedBranch={setSelectedBranch} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => { setIsLoggedIn(false); setRole(null); setLoginStep('ROLE'); setPassword(''); setSelectedBranch(Branch.ALL); }} 
      />
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-500 lg:ml-64`}>
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-900"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black tracking-tighter uppercase text-slate-900">{activeTab.replace('-', ' ')}</h1>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
             {role === UserRole.SUPER_ADMIN ? 'SA' : (role === UserRole.BRANCH_ADMIN ? 'BA' : 'ST')}
          </div>
        </header>

        <div className="p-6 md:p-10 flex-1 flex flex-col">
          <header className="hidden lg:flex justify-between items-center mb-12">
            <div className="flex items-center gap-6">
               <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900">
                  {activeTab.replace('-', ' ')}
               </h1>
               <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${syncStatus === 'SYNCED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : syncStatus === 'SYNCING' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {syncStatus === 'SYNCING' ? <Loader2 size={14} className="animate-spin" /> : syncStatus === 'SYNCED' ? <Wifi size={14} /> : <WifiOff size={14} />} 
                    {syncStatus === 'SYNCING' ? 'Database Syncing' : syncStatus === 'SYNCED' ? 'Cloud Connected' : 'Sync Error'}
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border-r border-slate-100 pr-3">
                        <CalendarIcon size={14} className="text-blue-500" />
                        {formattedDate}
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 pl-1">
                        <ClockIcon size={14} className="text-indigo-500" />
                        {formattedTime}
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-4 pl-3 pr-6 py-2.5 rounded-[2rem] shadow-sm border bg-white border-slate-100">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg bg-slate-900">
                 {role === UserRole.SUPER_ADMIN ? 'SA' : (role === UserRole.BRANCH_ADMIN ? 'BA' : 'ST')}
              </div>
              <div className="text-left">
                 <p className="text-sm font-black leading-tight text-slate-900">
                    {role === UserRole.SUPER_ADMIN ? 'Osaka HQ' : selectedBranch}
                 </p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                    {role.replace('_', ' ')}
                 </p>
              </div>
            </div>
          </header>
          
          <div className="flex-1">{renderContent()}</div>

          <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-100 mb-6 lg:mb-0">
            <div className="flex items-center gap-4 text-center md:text-left">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Osaka Enterprise System • Secure Global Ledger</p>
            </div>
            <div className="flex items-center gap-4 md:gap-6 flex-col md:flex-row">
               <p className="text-[10px] text-slate-400 uppercase tracking-widest text-center">
                 Developed by <a href="https://mushieditz.vercel.app/" target="_blank" className="font-black text-slate-900 hover:text-blue-600 transition-colors">Mushi Editz</a>
               </p>
               <div className="hidden md:block w-px h-4 bg-slate-200" />
               <p className="text-[10px] text-slate-400 font-bold uppercase text-center">© {new Date().getFullYear()} Osaka Group Holdings</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
