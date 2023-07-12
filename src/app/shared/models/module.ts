import { Submodule } from "./submodule";

export interface Module {
  name: string;
  label: string;
  path: string;
  icon: string;
  menuFooter: boolean;
  access: boolean;
  badgeSecondary:boolean;
  subModules: Submodule[]
}
