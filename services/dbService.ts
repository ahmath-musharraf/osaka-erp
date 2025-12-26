
import { Transaction, Expense, Buyer, Seller, Cheque, Item, AuditLog, WhatsAppLog } from '../types';

/**
 * OSAKA ERP - DATABASE SERVICE LAYER
 * This service manages the synchronization between the frontend and the 
 * Neon PostgreSQL database via API endpoints.
 */

const STORAGE_KEY = 'osaka_erp_cloud_data';

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
   * Fetches all data from the database.
   * Replace the inner logic with: await fetch('/api/get-all-data')
   */
  async loadAllData(): Promise<Partial<CloudData>> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error("Cloud Node Corrupted", e);
        return {};
      }
    }
    return {};
  },

  /**
   * Persists data to the database.
   * Replace with: await fetch('/api/sync', { method: 'POST', body: JSON.stringify(data) })
   */
  async syncData(data: CloudData): Promise<boolean> {
    // Simulate database write time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Cloud Sync Failed", e);
      return false;
    }
  }
};
