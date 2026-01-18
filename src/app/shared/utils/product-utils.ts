import { Product, ProductVariant, ProductSupplierPrice } from '../interfaces/product';

/**
 * Obtiene el precio de costo de un producto o variante
 * PARA MOSTRAR EN LA UI - muestra el mejor precio disponible
 */
export function getProductCostPrice(product: Product | ProductVariant | null | undefined): number {
  if (!product) return 0;

  // NUEVO: Si tiene supplierPrices, usar el más barato
  if (product.supplierPrices && product.supplierPrices.length > 0) {
    const validPrices = product.supplierPrices.filter(sp => sp.costPrice > 0);

    if (validPrices.length === 0) return 0;

    const cheapest = validPrices.reduce((best, current) =>
      current.costPrice < best.costPrice ? current : best
    );

    return cheapest.costPrice;
  }

  // LEGACY: Usar costPrice directo
  return (product as any).costPrice || 0;
}

/**
 * 🆕 NUEVO: Calcula el costo promedio ponderado en tiempo real
 * basándose en los precios de los proveedores y su participación estimada
 *
 * IMPORTANTE: Este es un cálculo ESTIMADO porque no tenemos el historial
 * real de compras. En un sistema ideal, esto vendría del backend calculado
 * desde las compras reales.
 */
export function getProductAverageCostPrice(product: Product | ProductVariant | null | undefined): number {
  if (!product) return 0;

  // Si tiene averageCostPrice calculado (ideal), usarlo
  if ((product as any).averageCostPrice && (product as any).averageCostPrice > 0) {
    return (product as any).averageCostPrice;
  }

  // Si tiene múltiples proveedores con precios
  if (product.supplierPrices && product.supplierPrices.length > 0) {
    const validPrices = product.supplierPrices.filter(sp => sp.costPrice > 0);

    if (validPrices.length === 0) {
      return getProductCostPrice(product);
    }

    // Si solo hay un proveedor, usar su precio
    if (validPrices.length === 1) {
      return validPrices[0].costPrice;
    }

    // 🎯 ESTRATEGIA: Calcular promedio ponderado usando los precios actuales
    // Esto es una APROXIMACIÓN hasta que el backend calcule el real

    // Opción 1: Promedio simple (todos los proveedores tienen igual peso)
    const simpleAverage = validPrices.reduce((sum, sp) => sum + sp.costPrice, 0) / validPrices.length;

    // Opción 2: Dar más peso al proveedor preferido
    const preferredSupplier = validPrices.find(sp => sp.isPreferred);
    if (preferredSupplier) {
      // 70% proveedor preferido, 30% promedio del resto
      const othersAvg = validPrices
        .filter(sp => !sp.isPreferred)
        .reduce((sum, sp, _, arr) => sum + sp.costPrice / arr.length, 0);

      return (preferredSupplier.costPrice * 0.7) + (othersAvg * 0.3);
    }

    // Si no hay preferido, usar promedio simple
    return simpleAverage;
  }

  // Fallback: usar el costo actual
  return getProductCostPrice(product);
}

/**
 * Calcula la ganancia y margen de una venta
 */
export function calculateSaleProfit(
  product: Product | ProductVariant,
  quantity: number,
  salePrice: number
): { profit: number; margin: number; costPrice: number } {
  const costPrice = getProductAverageCostPrice(product);
  const profit = (salePrice - costPrice) * quantity;
  const margin = costPrice > 0 ? ((salePrice - costPrice) / costPrice) * 100 : 0;

  return { profit, margin, costPrice };
}

/**
 * Actualiza el costo promedio ponderado después de una compra
 */
export function updateAverageCostPrice(
  currentStock: number,
  currentAvgCost: number,
  newQuantity: number,
  newCostPrice: number
): number {
  if (currentStock === 0) {
    return newCostPrice;
  }

  const totalCost = (currentStock * currentAvgCost) + (newQuantity * newCostPrice);
  const totalQuantity = currentStock + newQuantity;

  return totalCost / totalQuantity;
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
 * Obtiene el proveedor con el mejor precio (más barato)
 */
export function getBestPriceSupplier(product: Product | ProductVariant): ProductSupplierPrice | null {
  if (!product || !product.supplierPrices || product.supplierPrices.length === 0) {
    return null;
  }

  const validPrices = product.supplierPrices.filter(sp => sp.costPrice > 0);

  if (validPrices.length === 0) return null;

  return validPrices.reduce((best, current) =>
    current.costPrice < best.costPrice ? current : best
  );
}

/**
 * Obtiene información de precio por proveedor
 */
export function getSupplierPriceInfo(
  product: Product | ProductVariant,
  supplierId: number
): ProductSupplierPrice | null {
  if (!product || !product.supplierPrices) return null;

  return product.supplierPrices.find(sp => sp.supplierId === supplierId) || null;
}

/**
 * Obtiene el margen de ganancia de un producto
 */
export function getProductMargin(product: Product | ProductVariant): number {
  const costPrice = getProductAverageCostPrice(product);
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

  return legacy.supplierId.map((supplierId: number) => ({
    supplierId,
    costPrice: legacy.costPrice
  }));
}

/**
 * Formatea un precio a string con moneda
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return 'Q0.00';
  return `Q${price.toFixed(2)}`;
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0.00%';
  return `${value.toFixed(2)}%`;
}

/**
 * 🆕 NUEVO: Obtiene información detallada de costos para debugging
 */
export function getCostBreakdown(product: Product | ProductVariant): {
  hasSingleSupplier: boolean;
  hasMultipleSuppliers: boolean;
  cheapestPrice: number;
  averagePrice: number;
  supplierCount: number;
  suppliers: ProductSupplierPrice[];
} {
  const suppliers = product.supplierPrices || [];
  const validPrices = suppliers.filter(sp => sp.costPrice > 0);

  return {
    hasSingleSupplier: validPrices.length === 1,
    hasMultipleSuppliers: validPrices.length > 1,
    cheapestPrice: validPrices.length > 0
      ? Math.min(...validPrices.map(sp => sp.costPrice))
      : 0,
    averagePrice: validPrices.length > 0
      ? validPrices.reduce((sum, sp) => sum + sp.costPrice, 0) / validPrices.length
      : 0,
    supplierCount: validPrices.length,
    suppliers: validPrices
  };
}
