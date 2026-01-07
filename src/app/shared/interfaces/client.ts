export const allowedDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
export type OfferDay = typeof allowedDays[number];

export interface Client {
  id?: number;
  name: string;
  address?: string;
  branchId?: number;
  telephone?: string;

  idUser: number;
}

export interface ClientModel{
  list: Client[];
  errormessage: string;
}
