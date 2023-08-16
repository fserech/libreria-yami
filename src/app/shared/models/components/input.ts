export interface InputIcon {
  icon: string;
  show: boolean
}

export interface InputCounter {
  counter: boolean,
  maxLength: number,
  minLength: number
}

export interface InputOptionsSelect {
  resolver?: string;
  label: string;
  value: string;
}
