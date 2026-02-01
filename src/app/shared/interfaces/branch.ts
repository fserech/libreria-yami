export interface Branch {
  id?: number | null;
  name: string;
  address: string;
  telephone: string;
  idUser: number;
  active?: boolean;
  dateCreated?: string;
  dateUpdated?: string;
}

