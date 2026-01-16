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
