import { Module } from "src/app/shared/models/module";

export interface Role {
  id?: string;
  key: string;
  name: string;
  label: string;
  permissions: Module[]
}
