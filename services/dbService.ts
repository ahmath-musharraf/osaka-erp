import { Transaction, Expense, Buyer, Seller, Cheque, Item, AuditLog, WhatsAppLog } from '../types';

/**
 * OSAKA ERP - NEON CLOUD DATA SERVICE
 * High-performance REST bridge for global ledger synchronization.
 */

const API_BASE_URL = 'https://ep-quiet-salad-ahw34wtc.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1';
const AUTH_TOKEN = 'npg_Dn6KBwLjz7Ar'; // Authorized Neon Identity Key

// Mapping frontend state keys to database table names
const TABLE_MAP: Record<string, string> = {
  transactions: 'transactions',
  expenses: 'expenses',
  buyers: 'buyers',
  suppliers: 'sellers',
  cheques: 'cheques',
  items: 'items',
  auditLogs: 'audit_logs',
  whatsappLogs: 'whatsapp_logs'
};

export interface CloudData {
  transactions: Transaction[];
  expenses: Expense[];
  buyers: Buyer[];
  suppliers: Seller[];
  cheques: Cheque[];
  items: Item[];
  auditLogs: AuditLog[];
  whatsappLogs: WhatsAppLog[];
}

export const dbService = {
  /**
   * Performs a global handshake with the Neon Cloud Ledger.
   * Reconstructs system state from distributed tables.
   */
  async loadAllData(): Promise<Partial<CloudData>> {
    console.debug(`Osaka Bridge: Handshaking with Neon Node...`);
    
    try {
      const endpoints = Object.entries(TABLE_MAP);
      
      const results = await Promise.all(
        endpoints.map(async ([stateKey, tableName]) => {
          const response = await fetch(`${API_BASE_URL}/${tableName}`, {
            headers: {
              'Authorization': `Bearer ${AUTH_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            console.warn(`Osaka Bridge: Table ${tableName} unavailable. Status: ${response.status}`);
            return [stateKey, []];
          }
          
          const data = await response.json();
          return [stateKey, data];
        })
      );

      const consolidatedData = Object.fromEntries(results);
      console.log("Osaka Bridge: Global Ledger reconstructed successfully.");
      
      // Also update local cache as a fall-back mirror
      localStorage.setItem('osaka_erp_cloud_data', JSON.stringify(consolidatedData));
      
      return consolidatedData;
    } catch (error) {
      console.error("Osaka Bridge: Handshake failed. Reverting to local mirror.", error);
      const local = localStorage.getItem('osaka_erp_cloud_data');
      return local ? JSON.parse(local) : {};
    }
  },

  /**
   * Synchronizes terminal state to the Neon Master Node.
   * Performs bulk UPSERT operations to maintain data integrity across branches.
   */
  async syncData(data: CloudData): Promise<boolean> {
    try {
      const endpoints = Object.entries(TABLE_MAP);
      
      const syncPromises = endpoints.map(async ([stateKey, tableName]) => {
        const payload = (data as any)[stateKey];
        if (!payload || !Array.isArray(payload) || payload.length === 0) return true;

        const response = await fetch(`${API_BASE_URL}/${tableName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates' // UPSERT behavior: Insert or Update on conflict
          },
          body: JSON.stringify(payload)
        });

        return response.ok;
      });

      const results = await Promise.all(syncPromises);
      const allSuccess = results.every(Boolean);

      if (allSuccess) {
        localStorage.setItem('osaka_erp_cloud_data', JSON.stringify(data));
        console.debug("Osaka Bridge: Node synchronization verified.");
      }

      return allSuccess;
    } catch (error) {
      console.error("Osaka Bridge: Synchronization error.", error);
      return false;
    }
  }
};
