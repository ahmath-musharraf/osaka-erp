
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_ADMIN = 'BRANCH_ADMIN',
  STAFF = 'STAFF'
}

export enum Branch {
  ALL = 'All Branches',
  MAIN = 'Osaka Main Shop',
  B1 = 'Osaka 1',
  B2 = 'Osaka 2',
  B3 = 'Osaka 3',
  B4 = 'Osaka 4',
  B5 = 'Osaka 5'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  CREDIT = 'CREDIT',
  CHEQUE = 'CHEQUE'
}

export type SyncStatus = 'SYNCED' | 'OFFLINE_PENDING' | 'SYNCING';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  branch: Branch;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  images: string[];
}

export interface BuyerPayment {
  id: string;
  buyerId: string;
  amount: number;
  branch: Branch;
  method: PaymentMethod;
  timestamp: string;
  receiptImage?: string;
}

export interface Buyer {
  id: string;
  osakaId: string;
  shopName: string;
  contactName: string;
  location: string;
  phone: string;
  whatsappNumber: string;
  creditLimit: number;
  currentCredit: number;
  dueDate?: string;
  payments: BuyerPayment[]; 
  remarks?: string;
}

export interface Seller {
  id: string;
  shopName: string;
  contactName: string;
  location: string;
  phone: string;
  whatsappNumber: string;
  category: string;
  balance: number;
  ledger: LedgerEntry[];
  remarks?: string;
}

export interface LedgerEntry {
  id: string;
  sellerId: string;
  type: 'PURCHASE_BILL' | 'PAYMENT';
  amount: number;
  timestamp: string;
  branch: Branch;
  method?: PaymentMethod;
  reference?: string;
  imageUrl?: string;
}

export interface Transaction {
  id: string;
  branch: Branch;
  timestamp: string;
  buyerId?: string;
  type: 'WHOLESALE' | 'RETAIL';
  items: SaleItem[];
  totalAmount: number;
  paidAmount: number;
  discount: number;
  tax: number;
  paymentMethod: PaymentMethod;
  billImageUrl?: string;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  isFlagged?: boolean;
}

export interface SaleItem {
  id: string;
  saleId: string;
  itemId: string;
  quantity: number;
  price: number;
}

export interface Expense {
  id: string;
  branch: Branch;
  description: string;
  amount: number;
  category: string;
  proofImageUrl?: string;
  timestamp: string;
}

export interface Cheque {
  id: string;
  branch: Branch;
  chequeNumber: string;
  bank: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'CLEARED' | 'BOUNCED';
  type: 'INWARD' | 'OUTWARD';
  referenceId: string;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userRole: UserRole;
  branch: Branch;
  action: string;
  target: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface WhatsAppLog {
  id: string;
  recipientName: string;
  recipientPhone: string;
  messageType: 'CREDIT_REMINDER' | 'CHEQUE_REMINDER' | 'PAYMENT_CONFIRMATION';
  timestamp: string;
  status: 'SENT';
  branch: Branch;
}