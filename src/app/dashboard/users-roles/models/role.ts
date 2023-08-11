import { Module } from "src/app/shared/models/module";

export interface Role {
  key: string;
  name: string;
  permissions: Module[]
}
