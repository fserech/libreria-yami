
import { PurchaseStatus } from "../interfaces/purchases-status";

export const STATUS_PURCHASES: PurchaseStatus[] = [
  { key: 'PENDING', label: 'Pendiente' },
  { key: 'RECEIVED', label: 'Recibida' },      // ✅ Cambiado de IN_PROCESS
  { key: 'COMPLETED', label: 'Completada' },   // ✅ Cambiado de FINALIZED
  { key: 'CANCELLED', label: 'Cancelada' }     // ✅ Cambiado de CANCEL
];
