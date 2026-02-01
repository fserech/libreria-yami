// src/app/shared/interfaces/transfer.interface.ts

export interface BranchTransfer {
  id?: number;
  transferNumber: string;
  originBranch: {
    id: number;
    name: string;
  };
  originBranchId: number;
  destinationBranch: {
    id: number;
    name: string;
  };
  destinationBranchId: number;
  requestedBy: number;
  approvedBy?: number;
  sentBy?: number;
  receivedBy?: number;
  status: TransferStatus;
  transferDate: string;
  approvedDate?: string;
  sentDate?: string;
  receivedDate?: string;
  updatedDate?: string;
  reason?: string;
  notes?: string;
  transportInfo?: string;
  items: TransferItem[];
  totalItems?: number;
  totalUnits?: number;
}

export interface TransferItem {
  id?: number;
  transferId?: number;
  product: {
    id: number;
    productName: string;
  };
  productId: number;
  variant?: {
    id: number;
    variantName: string;
  };
  variantId?: number;
  quantityRequested: number;
  quantitySent?: number;
  quantityReceived?: number;
  notes?: string;
  conditionNotes?: string;
}

export enum TransferStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface TransferFormData {
  originBranchId: number;
  destinationBranchId: number;
  requestedBy: number;
  reason?: string;
  notes?: string;
  items: TransferItemFormData[];
}

export interface TransferItemFormData {
  productId: number;
  variantId?: number;
  quantityRequested: number;
  notes?: string;
}

export interface TransferFilters {
  originBranchId?: number;
  destinationBranchId?: number;
  status?: TransferStatus;
  dateFrom?: string;
  dateTo?: string;
}
