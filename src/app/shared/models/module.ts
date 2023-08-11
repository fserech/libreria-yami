import { Submodule } from "./submodule";

export interface Module {
  access: boolean,
  badge: boolean,
  badgeSecondary: boolean,
  icon: string,
  label: string,
  menuFooter: string,
  name: string,
  path: string,
  submodules: Submodule[]
}
