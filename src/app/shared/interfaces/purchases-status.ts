export interface PurchaseStatus {
  key: 'PENDING' | 'RECEIVED' | 'COMPLETED' | 'CANCELLED'; // ✅ Corregido
  label: string;
}
