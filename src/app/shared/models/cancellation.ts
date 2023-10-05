import { DocumentReference } from "@angular/fire/compat/firestore";

export interface Cancellation {
  uid?: string;
  type: 'SALE'|'SHOPPING';
  documentRef: DocumentReference;
  comment: string;
  status: 'PENDING' | 'FINALIZED' | 'NOT_APPLY';
  commentNotApply?: string;
}


/**
 * Consulta anulaciones pendientes
 *
 * SALE
 * - MOVITO DE ANULACION (comment)
 * - DESCARTAR DE STOCK POR DEFECTUOSO = TRUE | FALSE (toggle) EN CASO DE SER VENTA
 * - VER DETALLES EN FRONTEND
 * *
 * * AUTHORIZATION | NO_APPLY
 *
 * AUTHORIZATION
 *
 * CASO DE SER VENTA
 *
 * - DESCARTAR DE STOCK POR DEFECTUOSO = TRUE (toggle)
 * * SE CAMBIA A ESTADO FINALIZED
 * * NO SE HACEN CAMBIOS DE DEVOLUCION A STOCK
 * * SE CAMBIA A ESTADO CANCELED LA VENTA
 *
 * - DESCARTAR DE STOCK POR DEFECTUOSO = FALSE (toggle)
 * * SE CAMBIA A ESTADO FINALIZED
 * * SE DEVUELVE EL STOCK DE VENTA
 * * SE CAMBIA A ESTADO CANCELED LA VENTA
 *
 *
 * CASO DE SER COMPRA
 * AUTHORIZATION
 * * SE CAMBIA A ESTADO FINALIZED
 * * SE RESTA EL STOCK DE LA COMPRA DE LOS PRODUCTOS EN CASO DE QUE LA COMPRA ESTE EN ESTADO FINALIZED CASO CONTRARIO NO SE MODIFICA STOCK
 * * SE CAMBIA A ESTADO CANCELED LA COMPRA
 *
 * NO_APPLY
 * Se cambia de estado la anulacion a NOT_APPLY
 * agregar comentario del por que no aplica
 *
 */
