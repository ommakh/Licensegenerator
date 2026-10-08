import {
  BoxComponentItem,
  BoxDimensions,
  BoxCFTReport,
  BoxTypeId,
  BoxUnit,
  PricingState,
  QuotationCalculation,
} from "../types";

/**
 * Convert any unit dimension to Inches for standard CFT formula
 */
export function toInches(val: number, unit: BoxUnit): number {
  if (unit === "mm") return val / 25.4;
  if (unit === "cm") return val / 2.54;
  return val;
}

/**
 * Convert inches to target unit
 */
export function fromInches(valInches: number, unit: BoxUnit): number {
  if (unit === "mm") return valInches * 25.4;
  if (unit === "cm") return valInches * 2.54;
  return valInches;
}

/**
 * Calculate CFT for a single piece given its L, W, T in a specific unit
 * Indian Timber Formula: (L * W * T) / 1728 (when in inches)
 */
export function calculatePieceCFT(
  length: number,
  width: number,
  thickness: number,
  unit: BoxUnit
): number {
  const lIn = toInches(length, unit);
  const wIn = toInches(width, unit);
  const tIn = toInches(thickness, unit);
  const cft = (lIn * wIn * tIn) / 1728;
  return Math.round(cft * 10000) / 10000;
}

/**
 * Calculate Square Feet (for Plywood panel costing)
 */
export function calculatePieceSqFt(
  length: number,
  width: number,
  unit: BoxUnit
): number {
  const lIn = toInches(length, unit);
  const wIn = toInches(width, unit);
  const sqft = (lIn * wIn) / 144;
  return Math.round(sqft * 100) / 100;
}

/**
 * Enrich raw component items with computed CFT & SqFt values
 */
export function enrichComponents(
  items: Omit<BoxComponentItem, "pieceCft" | "totalCft" | "sqFtPerPiece" | "totalSqFt">[],
  unit: BoxUnit
): BoxComponentItem[] {
  return items.map((item) => {
    const pieceCft = calculatePieceCFT(item.length, item.width, item.thickness, unit);
    const totalCft = Math.round(pieceCft * item.qty * 1000) / 1000;
    const pieceSqFt = calculatePieceSqFt(item.length, item.width, unit);
    const totalSqFt = Math.round(pieceSqFt * item.qty * 100) / 100;

    return {
      ...item,
      pieceCft,
      totalCft,
      sqFtPerPiece: pieceSqFt,
      totalSqFt,
    };
  });
}

/**
 * Generate full CFT & Material Summary Report
 */
export function generateCFTReport(
  boxType: BoxTypeId,
  dims: BoxDimensions,
  components: BoxComponentItem[]
): BoxCFTReport {
  const lIn = toInches(dims.length, dims.unit);
  const wIn = toInches(dims.width, dims.unit);
  const hIn = toInches(dims.height, dims.unit);
  const grossOuterCft = Math.round(((lIn * wIn * hIn) / 1728) * 100) / 100;

  let totalWoodPieces = 0;
  let totalWoodCft = 0;
  let totalPlywoodSqFt = 0;
  let totalPlywoodCft = 0;

  const enrichedComps: BoxComponentItem[] = components.map((comp) => {
    const pieceCft = calculatePieceCFT(comp.length, comp.width, comp.thickness, dims.unit);
    const totalCft = Math.round(pieceCft * comp.qty * 1000) / 1000;
    const pieceSqFt = calculatePieceSqFt(comp.length, comp.width, dims.unit);
    const totalSqFt = Math.round(pieceSqFt * comp.qty * 100) / 100;
    return {
      ...comp,
      pieceCft,
      totalCft,
      sqFtPerPiece: pieceSqFt,
      totalSqFt,
    };
  });

  enrichedComps.forEach((comp) => {
    if (comp.materialType === "plywood") {
      totalPlywoodSqFt += comp.totalSqFt || 0;
      totalPlywoodCft += comp.totalCft;
    } else {
      totalWoodPieces += comp.qty;
      totalWoodCft += comp.totalCft;
    }
  });

  // Estimated dry pine/hardwood density ~480-550 kg/m3 (approx 15 kg per CFT)
  const estimatedWeightKg = Math.round((totalWoodCft * 14.5 + totalPlywoodCft * 18.0) * 10) / 10;

  return {
    boxType,
    dimensions: dims,
    components: enrichedComps,
    totalWoodPieces,
    totalWoodCft: Math.round(totalWoodCft * 1000) / 1000,
    totalPlywoodSqFt: Math.round(totalPlywoodSqFt * 100) / 100,
    totalPlywoodCft: Math.round(totalPlywoodCft * 1000) / 1000,
    grossOuterCft,
    estimatedWeightKg,
    unit: dims.unit,
  };
}

/**
 * Compute Complete Quotation Costing
 */
export function computeQuotation(
  report: BoxCFTReport,
  pricing: PricingState,
  quantityBoxes: number = 1
): QuotationCalculation {
  let woodCost = 0;
  let plywoodCost = 0;

  report.components.forEach((comp) => {
    const isPlywood = comp.materialType === "plywood";
    if (isPlywood) {
      const autoCost = (comp.totalSqFt || 0) * pricing.plywoodRatePerSqFt;
      plywoodCost += comp.customLineCost !== undefined ? comp.customLineCost : autoCost;
    } else {
      const autoCost = comp.totalCft * pricing.woodRatePerCft;
      woodCost += comp.customLineCost !== undefined ? comp.customLineCost : autoCost;
    }
  });

  woodCost = Math.round(woodCost);
  plywoodCost = Math.round(plywoodCost);
  const rawMaterialSubtotal = woodCost + plywoodCost;
  const wastageCost = Math.round(rawMaterialSubtotal * (pricing.wastagePercent / 100));

  const unitCostBeforeTax =
    rawMaterialSubtotal +
    wastageCost +
    pricing.labourCostPerBox +
    pricing.hardwareFastenersCost;

  const totalBeforeTax = Math.max(0, unitCostBeforeTax * quantityBoxes - pricing.discountAmount);
  const gstAmount = Math.round(totalBeforeTax * (pricing.gstPercent / 100));
  const grandTotal = totalBeforeTax + gstAmount;

  return {
    woodCost,
    plywoodCost,
    rawMaterialSubtotal,
    wastageCost,
    labourCost: pricing.labourCostPerBox * quantityBoxes,
    hardwareCost: pricing.hardwareFastenersCost * quantityBoxes,
    unitCostBeforeTax,
    totalBeforeTax,
    gstAmount,
    grandTotal,
  };
}

/**
 * Convert numbers to Indian Rupees in words (e.g. ₹ 14,500 => "Fourteen Thousand Five Hundred Rupees Only")
 */
export function numberToIndianWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : " ");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        "Hundred " +
        (n % 100 !== 0 ? "and " + inWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        inWords(Math.floor(n / 1000)) +
        "Thousand " +
        (n % 1000 !== 0 ? inWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        inWords(Math.floor(n / 100000)) +
        "Lakh " +
        (n % 100000 !== 0 ? inWords(n % 100000) : "")
      );
    return (
      inWords(Math.floor(n / 10000000)) +
      "Crore " +
      (n % 10000000 !== 0 ? inWords(n % 10000000) : "")
    );
  }

  const rounded = Math.round(num);
  return `${inWords(rounded).trim()} Rupees Only`;
}
