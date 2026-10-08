/**
 * Types for 5-Page Box Viewer, Component CFT Calculator & Quotation System
 * Industrial wooden packaging & WhatsApp quotation workflow
 */

export type BoxUnit = "in" | "mm" | "cm";

export type BoxTypeId =
  | "type1_block_pallet"      // Heavy-Duty 4-Way Block Pallet (9 blocks, 3 runners, deck, optional ply top)
  | "type2_plywood_cleated"   // Plywood Export Box with Cleats/Battens (Plywood faces, wood battens, skid base)
  | "type3_skeleton_crate"    // Open-Slatted Wooden Crate (Skeleton Crate with spaced slats & posts)
  | "type4_machine_skid"      // Long Heavy Machine Base Pallet (Long runners, cross stringers, load blocks)
  | "type5_solid_pine_box";   // Solid Pine Wood Heavy Box (100% solid planks, internal/external battens)

export type ComponentCategory =
  | "RUNNERS_SKIDS"
  | "SPACER_BLOCKS"
  | "DECK_SLATS"
  | "PLYWOOD_PANELS"
  | "SIDE_WALLS"
  | "END_WALLS"
  | "CORNER_POSTS"
  | "BATTENS_CLEATS"
  | "LID_COVER"
  | "CUSTOM";

export type MaterialType = "solid_wood" | "plywood" | "hardwood_block";

export interface BoxDimensions {
  length: number; // L
  width: number;  // B (Breadth / Width)
  height: number; // H (Height / Depth)
  unit: BoxUnit;
}

export interface BoxComponentItem {
  id: string;
  name: string;
  subtitle?: string;
  category: ComponentCategory;
  materialType: MaterialType;
  description: string;
  qty: number;
  // Dimensions in current box unit
  length: number;
  width: number;
  thickness: number;
  // Calculated CFT & Area
  pieceCft: number;
  totalCft: number;
  sqFtPerPiece?: number;
  totalSqFt?: number;
  woodType: string;
  isRemovable?: boolean;
  customLineCost?: number; // User-editable custom line material cost (₹)
}

export interface BoxTypeDefinition {
  id: BoxTypeId;
  title: string;
  subtitle?: string;
  specStandard?: string;
  badge: string;
  shortDesc: string;
  fullDesc: string;
  defaultDims: BoxDimensions;
  recommendedUse: string;
  features: string[];
  defaultComponents: Omit<BoxComponentItem, "pieceCft" | "totalCft" | "sqFtPerPiece" | "totalSqFt">[];
  hasPlywoodOption: boolean;
  hasSlatOption: boolean;
}

export interface PricingState {
  woodRatePerCft: number;       // Rate in ₹ per cu.ft (e.g. 650)
  plywoodRatePerSqFt: number;   // Rate in ₹ per sq.ft (e.g. 48)
  wastagePercent: number;       // e.g. 7%
  labourCostPerBox: number;     // e.g. 350
  hardwareFastenersCost: number;// e.g. 150 (nails, screws, strapping)
  gstPercent: number;           // 0, 12, 18%
  customPieceAdjustments: number; // additional extra pieces count
  discountAmount: number;
}

export interface CompanyDetails {
  name: string;
  companyName?: string;
  tagline?: string;
  proprietorName?: string;
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  gstNumber?: string;
}

export interface CustomerDetails {
  clientName: string;
  companyOrProject: string;
  deliveryLocation: string;
  quoteNumber: string;
  quoteDate: string;
  validDays: number;
  quantityBoxes: number;
}

export interface BoxCFTReport {
  boxType: BoxTypeId;
  dimensions: BoxDimensions;
  components: BoxComponentItem[];
  totalWoodPieces: number;
  totalWoodCft: number;
  totalPlywoodSqFt: number;
  totalPlywoodCft: number;
  grossOuterCft: number;
  estimatedWeightKg: number;
  unit: BoxUnit;
}

export interface QuotationCalculation {
  woodCost: number;
  plywoodCost: number;
  rawMaterialSubtotal: number;
  wastageCost: number;
  labourCost: number;
  hardwareCost: number;
  unitCostBeforeTax: number;
  totalBeforeTax: number;
  gstAmount: number;
  grandTotal: number;
  amountInWords?: string;
}

export type PageStep = 1 | 2 | 3 | 4 | 5;

export type CameraPresetView = "LEFT" | "FRONT" | "RIGHT" | "BACK" | "TOP" | "ISO";
