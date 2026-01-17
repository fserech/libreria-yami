import { Product, ProductVariant, ProductSupplierPrice } from '../interfaces/product';

/**
 * Obtiene el precio de costo de un producto o variante
 * Prioriza supplierPrices si existe, sino usa costPrice legacy
 */
export function getProductCostPrice(product: Product | ProductVariant | null | undefined): number {
  if (!product) return 0;

  // NUEVO: Si tiene supplierPrices, usar el preferido o el más barato
  if (product.supplierPrices && product.supplierPrices.length > 0) {
    const preferred = product.supplierPrices.find(sp => sp.isPreferred && sp.costPrice > 0);
    if (preferred) return preferred.costPrice;

    const cheapest = product.supplierPrices
      .filter(sp => sp.costPrice > 0)
      .reduce((best, current) =>
        (!best || current.costPrice < best.costPrice) ? current : best
      , null as ProductSupplierPrice | null);

    return cheapest?.costPrice || 0;
  }

  // LEGACY: Usar costPrice directo
  return (product as any).costPrice || 0;
}

/**
 * Obtiene todos los IDs de proveedores de un producto
 */
export function getProductSupplierIds(product: Product | ProductVariant | null | undefined): number[] {
  if (!product) return [];

  // NUEVO: Si tiene supplierPrices
  if (product.supplierPrices && product.supplierPrices.length > 0) {
    return product.supplierPrices.map(sp => sp.supplierId);
  }

  // LEGACY: Usar supplierId directo
  return (product as any).supplierId || [];
}

/**
 * Obtiene el proveedor preferido
 */
export function getPreferredSupplier(product: Product | ProductVariant): ProductSupplierPrice | null {
  if (!product || !product.supplierPrices) return null;
  return product.supplierPrices.find(sp => sp.isPreferred) || null;
}

/**
 * Obtiene el margen de ganancia de un producto
 */
export function getProductMargin(product: Product | ProductVariant): number {
  const costPrice = getProductCostPrice(product);
  const salePrice = product.salePrice || 0;

  if (costPrice === 0 || salePrice === 0) return 0;

  return ((salePrice - costPrice) / costPrice) * 100;
}

/**
 * Verifica si un producto usa el nuevo sistema de precios
 */
export function usesSupplierPrices(product: Product | ProductVariant): boolean {
  return !!(product.supplierPrices && product.supplierPrices.length > 0);
}

/**
 * Convierte de formato legacy a supplierPrices
 */
export function convertLegacyToSupplierPrices(product: Product | ProductVariant): ProductSupplierPrice[] {
  const legacy = product as any;

  if (!legacy.costPrice || !legacy.supplierId || legacy.supplierId.length === 0) {
    return [];
  }

  return legacy.supplierId.map((supplierId: number, index: number) => ({
    supplierId,
    costPrice: legacy.costPrice,
    isPreferred: index === 0 // El primero es preferido
  }));
}
