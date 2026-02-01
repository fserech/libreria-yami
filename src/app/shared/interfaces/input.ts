 export interface InputCounter {
  counter: boolean,
  maxLength: number,
  minLength: number
}

export interface InputOptionsSelect {
  label: string;
  value: string | number;
  resolver?: any;
}

