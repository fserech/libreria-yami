import { OrdersStatus } from "../interfaces/orders-status";

export const STATUS_ORDERS: OrdersStatus[] = [
  { key: 'PENDING', label: 'Pendiente' },
  { key: 'IN_PROCESS', label: 'Cargado' },
  { key: 'FINALIZED', label: 'Finalizado' },
  { key: 'CANCEL', label: 'Anulado' }
]
