export interface OrdersStatus {
  key: 'PENDING' | 'IN_PROCESS' |'FINALIZED'|'CANCEL';
  label: string;
}
