import { OptionsChatBubble } from "../interfaces/options-chat-bubble";

export const ACTIONS_GRID_MAIN_ADMIN: OptionsChatBubble[] = [
  { icon: 'matModeEditOutline', colorIcon: 'text-gray-500 dark:text-white', label: 'Editar', action: 'edit'},
  { icon: 'matDeleteOutline', colorIcon: 'text-red-500', label: 'Eliminar', action: 'delete'}
];

export const ACTIONS_GRID_MAIN_ORDERS_PENDING: OptionsChatBubble[] = [
  // { icon: 'bootstrapBoxSeam', colorIcon: 'text-blue-500', label: 'Preparar', action: 'PREPARE'},
  { icon: 'matRemoveRedEyeOutline', colorIcon: 'text-blue-500', label: 'Ver', action: 'VIEW_ORDER'},
  { icon: 'bootstrapCheckCircleFill', colorIcon: 'text-emerald-500', label: 'Finalizar', action: 'FINALIZED'},
  { icon: 'bootstrapXCircle', colorIcon: 'text-red-500', label: 'Anular', action: 'CANCEL'}
];

export const ACTIONS_GRID_MAIN_ORDERS_IN_PROCESS: OptionsChatBubble[] = [
  { icon: 'bootstrapCheckCircleFill', colorIcon: 'text-emerald-500', label: 'Finalizar', action: 'FINALIZED'},
  { icon: 'matRemoveRedEyeOutline', colorIcon: 'text-blue-500', label: 'Ver', action: 'VIEW_ORDER'},
  { icon: 'bootstrapXCircle', colorIcon: 'text-red-500', label: 'Anular', action: 'CANCEL'}
];

export const ACTIONS_GRID_MAIN_ORDERS_FINALIZED: OptionsChatBubble[] = [
  { icon: 'matRemoveRedEyeOutline', colorIcon: 'text-blue-500', label: 'Ver', action: 'VIEW_ORDER'},
  { icon: 'matReceiptLongOutline', colorIcon: 'text-gray-500', label: 'Recibo', action: 'PRINT_RECEIPT'} // ✅ DESCOMENTADO
];


export const ACTIONS_GRID_MAIN_PURCHASES_PENDING: OptionsChatBubble[] = [
  { icon: 'matRemoveRedEyeOutline', colorIcon: 'text-blue-500', label: 'Ver', action: 'VIEW_PURCHASE'},
  { icon: 'bootstrapBoxSeam', colorIcon: 'text-purple-500', label: 'Recibir', action: 'RECEIVED'},
  { icon: 'bootstrapXCircle', colorIcon: 'text-red-500', label: 'Anular', action: 'CANCEL'}
];

export const ACTIONS_GRID_MAIN_PURCHASES_RECEIVED: OptionsChatBubble[] = [
  { icon: 'matRemoveRedEyeOutline', colorIcon: 'text-blue-500', label: 'Ver', action: 'VIEW_PURCHASE'},
  { icon: 'bootstrapCheckCircleFill', colorIcon: 'text-emerald-500', label: 'Completar', action: 'COMPLETED'},
  { icon: 'bootstrapXCircle', colorIcon: 'text-red-500', label: 'Anular', action: 'CANCEL'}
];

export const ACTIONS_GRID_MAIN_PURCHASES_COMPLETED: OptionsChatBubble[] = [
  { icon: 'matRemoveRedEyeOutline', colorIcon: 'text-blue-500', label: 'Ver', action: 'VIEW_PURCHASE'},
  { icon: 'matReceiptLongOutline', colorIcon: 'text-gray-500', label: 'Factura', action: 'PRINT_INVOICE'}
];

