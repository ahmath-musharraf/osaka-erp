
import { Item, Buyer, Branch, Seller, UserRole, PaymentMethod, AuditLog } from './types';

export const INITIAL_ITEMS: Item[] = [
  { 
    id: '1', 
    name: 'Premium Jasmine Rice 5kg', 
    category: 'Grains', 
    wholesalePrice: 450, 
    retailPrice: 520, 
    stock: 120, 
    images: [
      'https://picsum.photos/seed/rice1/400/500',
      'https://picsum.photos/seed/rice2/400/500',
      'https://picsum.photos/seed/rice3/400/500'
    ] 
  },
  { 
    id: '2', 
    name: 'Refined Sugar 1kg', 
    category: 'Grocery', 
    wholesalePrice: 110, 
    retailPrice: 135, 
    stock: 500, 
    images: ['https://picsum.photos/seed/sugar1/400/500'] 
  },
  { 
    id: '3', 
    name: 'Refined Oil 1L', 
    category: 'Grocery', 
    wholesalePrice: 180, 
    retailPrice: 210, 
    stock: 300, 
    images: ['https://picsum.photos/seed/oil1/400/500', 'https://picsum.photos/seed/oil2/400/500'] 
  },
  { 
    id: '4', 
    name: 'Organic Wheat Flour 10kg', 
    category: 'Grains', 
    wholesalePrice: 320, 
    retailPrice: 380, 
    stock: 80, 
    images: ['https://picsum.photos/seed/flour1/400/500'] 
  },
];

export const INITIAL_BUYERS: Buyer[] = [
  { 
    id: 'b1', 
    osakaId: 'OSA-1001',
    shopName: 'Ali Traders', 
    contactName: 'Mr. Ali Hassan',
    location: 'Fort, Colombo 11',
    phone: '+94771234567', 
    whatsappNumber: '+94771234567',
    creditLimit: 50000, 
    currentCredit: 12000, 
    dueDate: '2024-06-15',
    remarks: 'Long-term partner, prefers weekend deliveries.',
    payments: [
      { id: 'p1', buyerId: 'b1', amount: 5000, branch: Branch.MAIN, method: PaymentMethod.CASH, timestamp: '2024-05-10T10:00:00Z' },
      { id: 'p2', buyerId: 'b1', amount: 3000, branch: Branch.B2, method: PaymentMethod.CHEQUE, timestamp: '2024-05-25T14:30:00Z' }
    ]
  },
  { 
    id: 'b2', 
    osakaId: 'OSA-2005',
    shopName: 'Central Supermart', 
    contactName: 'Saman Perera',
    location: 'Main Road, Negombo',
    phone: '+94719876543', 
    whatsappNumber: '+94719876543',
    creditLimit: 100000, 
    currentCredit: 45000, 
    dueDate: '2024-06-10',
    remarks: 'Bulk orders only.',
    payments: [
      { id: 'p3', buyerId: 'b2', amount: 10000, branch: Branch.B5, method: PaymentMethod.CASH, timestamp: '2024-05-20T09:15:00Z' }
    ]
  },
];

export const INITIAL_SUPPLIERS: Seller[] = [
  { 
    id: 's1', 
    shopName: 'Global Foods Co.', 
    contactName: 'Jennifer Wu',
    location: 'Industrial Zone, Horana',
    phone: '+94701234567', 
    whatsappNumber: '+94701234567',
    category: 'Grains', 
    balance: 85000,
    remarks: 'Primary grain supplier.',
    ledger: [
      { id: 'sl1', sellerId: 's1', type: 'PURCHASE_BILL', amount: 120000, timestamp: '2024-05-01T10:00:00Z', branch: Branch.MAIN, reference: 'INV-8822' },
      { id: 'sl2', sellerId: 's1', type: 'PAYMENT', amount: 35000, timestamp: '2024-05-15T14:00:00Z', branch: Branch.MAIN, method: PaymentMethod.CHEQUE, reference: 'CHQ-9910' }
    ]
  },
  { 
    id: 's2', 
    shopName: 'Osaka Wholesale Hub', 
    contactName: 'Manager Osaka',
    location: 'Colombo 01',
    phone: '+94711223344', 
    whatsappNumber: '+94711223344',
    category: 'Grocery', 
    balance: 0,
    remarks: 'Internal supply node.',
    ledger: []
  },
];

export const CATEGORIES = ['Grains', 'Grocery', 'Spices', 'Beverages', 'Cleaning', 'Other'];

export const ROLES_CONFIG = {
  [UserRole.SUPER_ADMIN]: { label: 'Super Admin', access: 'FULL' },
  [UserRole.BRANCH_ADMIN]: { label: 'Branch Admin', access: 'BRANCH_WIDE' },
  [UserRole.STAFF]: { label: 'Staff', access: 'POS_ONLY' }
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { 
    id: 'l1', 
    userId: 'Admin-01', 
    userRole: UserRole.SUPER_ADMIN, 
    branch: Branch.ALL, 
    action: 'Credit Limit Update', 
    target: 'Buyer: Ali Traders', 
    oldValue: '45000', 
    newValue: '50000', 
    timestamp: '2024-06-01T10:30:00Z', 
    severity: 'MEDIUM' 
  },
  { 
    id: 'l2', 
    userId: 'Mgr-B1', 
    userRole: UserRole.BRANCH_ADMIN, 
    branch: Branch.B1, 
    action: 'Expense Entry', 
    target: 'Utility: Electricity', 
    oldValue: 'None', 
    newValue: 'Rs. 12,500', 
    timestamp: '2024-06-01T14:15:00Z', 
    severity: 'LOW' 
  },
];
