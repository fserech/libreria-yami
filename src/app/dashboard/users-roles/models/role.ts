import { Module } from "src/app/shared/models/module";

export interface Role {
  uid?: string;
  key: string;
  name: string;
  label: string;
  permissions: Module[]
}
