// shared/interfaces/branch.ts
export interface Branch {
  id?: number;
  branchName: string;
  branchCode?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  phone: string;
  email?: string;
  managerName?: string;
  managerPhone?: string;
  active: boolean;
  isHeadquarters?: boolean; // Indica si es la sucursal principal
  openingTime?: string;
  closingTime?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BranchStats {
  totalSales: number;
  totalProducts: number;
  totalEmployees: number;
  averageTicket: number;
}
