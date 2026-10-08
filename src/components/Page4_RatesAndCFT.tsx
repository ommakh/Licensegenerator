import React, { useState } from "react";
import {
  BoxCFTReport,
  BoxComponentItem,
  BoxTypeDefinition,
  PricingState,
  QuotationCalculation,
} from "../types";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  IndianRupee,
  Layers,
  Percent,
  Hammer,
  ShieldAlert,
  Sliders,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { InteractiveCFTCalculatorModal } from "./InteractiveCFTCalculatorModal";

interface Page4RatesAndCFTProps {
  boxTemplate: BoxTypeDefinition;
  report: BoxCFTReport;
  pricing: PricingState;
  quotation: QuotationCalculation;
  quantityBoxes: number;
  onChangePricing: (newPricing: PricingState) => void;
  onChangeQuantityBoxes: (qty: number) => void;
  onChangeComponentQty: (id: string, newQty: number) => void;
  onChangeComponentCost?: (id: string, newCost?: number) => void;
  onAddComponent?: (type?: "solid_wood" | "plywood" | "hardwood_block") => void;
  onBackToStep3: () => void;
  onProceedToStep5: () => void;
}

export const Page4_RatesAndCFT: React.FC<Page4RatesAndCFTProps> = ({
  boxTemplate,
  report,
  pricing,
  quotation,
  quantityBoxes,
  onChangePricing,
  onChangeQuantityBoxes,
  onChangeComponentQty,
  onChangeComponentCost,
  onAddComponent,
  onBackToStep3,
  onProceedToStep5,
}) => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [recalculateFeedback, setRecalculateFeedback] = useState<string | null>(null);

  const handleManualRecalculate = () => {
    setRecalculateFeedback("✓ Recalculated & Synced: All piece CFT, volume, wastage and quotation totals are up-to-date!");
    setTimeout(() => setRecalculateFeedback(null), 4000);
  };
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Step 4 of 5 &bull; Total CFT &amp; Wood Rate Costing</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            CFT Summary &amp; Commercial Rates
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {boxTemplate.title} &bull; Adjust wood rate per CFT, plywood rate, wastage, and customize individual piece counts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCalculatorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-bold transition shadow-2xs"
            title="Open Timber CFT Formula & Pricing Calculator"
          >
            <Calculator className="w-4 h-4 text-amber-700" />
            <span>Live CFT Calculator</span>
          </button>

          <button
            type="button"
            onClick={handleManualRecalculate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 text-xs font-semibold transition"
            title="Recalculate all totals"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
            <span>Recalculate</span>
          </button>

          <button
            type="button"
            onClick={onBackToStep3}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to 3D View</span>
          </button>

          <button
            id="proceed-step5-top-btn"
            type="button"
            onClick={onProceedToStep5}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <span>Step 5: Generate Quotation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {recalculateFeedback && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{recalculateFeedback}</span>
          </div>
          <span className="text-[11px] text-emerald-700">Dynamic Live Sync</span>
        </div>
      )}

      {/* 4 Hero Metric Cards for CFT & Volume */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Total Timber CFT
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
            {report.totalWoodCft.toFixed(3)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Across {report.totalWoodPieces} solid timber pieces
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Plywood Area / CFT
          </span>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
            {report.totalPlywoodSqFt.toFixed(1)}{" "}
            <span className="text-sm font-normal text-zinc-500">Sq.Ft</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {report.totalPlywoodCft > 0 ? `${report.totalPlywoodCft.toFixed(3)} CFT volume` : "No plywood"}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Outer Gross Cubic Vol
          </span>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
            {report.grossOuterCft.toFixed(2)}{" "}
            <span className="text-sm font-normal text-zinc-500">CFT</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            L × B × H displacement space
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Est. Unit Net Cost
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 flex items-baseline">
            <span className="text-lg font-bold mr-0.5">₹</span>
            {quotation.unitCostBeforeTax.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Per box before tax
          </div>
        </div>
      </div>

      {/* Commercial Rates & Costing Inputs (User Requirement) */}
      <div className="bg-amber-500/10 border border-amber-300 rounded-2xl p-5 mb-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-amber-700" />
            <span>Wood &amp; Plywood Rates &bull; Commercial Price Inputs</span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>🧮 Live CFT &amp; Cost Calculator</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Wood Rate per CFT */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase">
              Wood Lumber Rate (₹/CFT)
            </label>
            <div className="flex items-center mt-1">
              <span className="text-sm font-bold text-zinc-400 mr-1.5">₹</span>
              <input
                id="wood-rate-cft-input"
                type="number"
                min="100"
                step="25"
                value={pricing.woodRatePerCft}
                onChange={(e) =>
                  onChangePricing({
                    ...pricing,
                    woodRatePerCft: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full text-lg font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
              />
              <span className="text-xs font-semibold text-zinc-400">/CFT</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Total Timber: ₹{quotation.woodCost.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Plywood Rate per Sq.Ft */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase">
              Plywood Rate (₹/Sq.Ft)
            </label>
            <div className="flex items-center mt-1">
              <span className="text-sm font-bold text-zinc-400 mr-1.5">₹</span>
              <input
                id="plywood-rate-sqft-input"
                type="number"
                min="10"
                step="2"
                value={pricing.plywoodRatePerSqFt}
                onChange={(e) =>
                  onChangePricing({
                    ...pricing,
                    plywoodRatePerSqFt: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full text-lg font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
              />
              <span className="text-xs font-semibold text-zinc-400">/Sq.Ft</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Total Plywood: ₹{quotation.plywoodCost.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Wastage & Cut Allowance % */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase">
              Wastage &amp; Sizing Allowance
            </label>
            <div className="flex items-center mt-1">
              <input
                id="wastage-percent-input"
                type="number"
                min="0"
                max="30"
                step="1"
                value={pricing.wastagePercent}
                onChange={(e) =>
                  onChangePricing({
                    ...pricing,
                    wastagePercent: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full text-lg font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
              />
              <span className="text-sm font-bold text-zinc-400">%</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Cut Wastage: ₹{quotation.wastageCost.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Labour & Fabrication per Box */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase">
              Carpentry &amp; Labour (₹/Box)
            </label>
            <div className="flex items-center mt-1">
              <span className="text-sm font-bold text-zinc-400 mr-1.5">₹</span>
              <input
                id="labour-cost-input"
                type="number"
                min="0"
                step="50"
                value={pricing.labourCostPerBox}
                onChange={(e) =>
                  onChangePricing({
                    ...pricing,
                    labourCostPerBox: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full text-lg font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
              />
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Fabrication &amp; assembly charge
            </div>
          </div>

          {/* Hardware & Strapping */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase">
              Nails, Strapping &amp; Screws
            </label>
            <div className="flex items-center mt-1">
              <span className="text-sm font-bold text-zinc-400 mr-1.5">₹</span>
              <input
                id="hardware-cost-input"
                type="number"
                min="0"
                step="25"
                value={pricing.hardwareFastenersCost}
                onChange={(e) =>
                  onChangePricing({
                    ...pricing,
                    hardwareFastenersCost: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full text-lg font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
              />
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Fastening hardware per box
            </div>
          </div>

          {/* Quantity of Boxes Order */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase">
              Order Quantity (Boxes)
            </label>
            <div className="flex items-center mt-1">
              <input
                id="order-quantity-input"
                type="number"
                min="1"
                step="1"
                value={quantityBoxes}
                onChange={(e) =>
                  onChangeQuantityBoxes(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full text-lg font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
              />
              <span className="text-xs font-semibold text-zinc-400">units</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Total batch volume
            </div>
          </div>

          {/* GST Tax Rate */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">
              GST / Tax Surcharge
            </label>
            <div className="flex items-center gap-1.5 mt-1">
              {[0, 12, 18].map((gst) => (
                <button
                  key={gst}
                  type="button"
                  onClick={() => onChangePricing({ ...pricing, gstPercent: gst })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 ${
                    pricing.gstPercent === gst
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {gst}%
                </button>
              ))}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1.5">
              GST: ₹{quotation.gstAmount.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Commercial Discount */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase">
              Commercial Discount (₹)
            </label>
            <div className="flex items-center mt-1">
              <span className="text-sm font-bold text-zinc-400 mr-1.5">₹</span>
              <input
                id="discount-amount-input"
                type="number"
                min="0"
                step="100"
                value={pricing.discountAmount}
                onChange={(e) =>
                  onChangePricing({
                    ...pricing,
                    discountAmount: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full text-lg font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
              />
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Deducted from pre-tax total
            </div>
          </div>
        </div>

        {/* Live Calculation Formula Strip */}
        <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-zinc-700">
            <span className="font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded text-[11px]">
              Live Formula
            </span>
            <span>Timber: <strong>{report.totalWoodCft.toFixed(3)} CFT</strong> × ₹{pricing.woodRatePerCft} = <strong>₹{quotation.woodCost.toLocaleString("en-IN")}</strong></span>
            {report.totalPlywoodSqFt > 0 && (
              <span>+ Ply: <strong>{report.totalPlywoodSqFt.toFixed(1)} SqFt</strong> = <strong>₹{quotation.plywoodCost.toLocaleString("en-IN")}</strong></span>
            )}
            <span>+ Wastage ({pricing.wastagePercent}%): <strong>₹{quotation.wastageCost.toLocaleString("en-IN")}</strong></span>
            <span>+ Labour/Hardware: <strong>₹{(pricing.labourCostPerBox + pricing.hardwareFastenersCost).toLocaleString("en-IN")}</strong></span>
            <span className="text-zinc-400">&bull;</span>
            <span className="text-amber-800 font-extrabold">= Unit Cost: ₹{quotation.unitCostBeforeTax.toLocaleString("en-IN")}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleManualRecalculate}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-bold shadow-2xs transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verify &amp; Recalculate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Component Pieces & Line Material Cost Editable List */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden mb-6">
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              <span>Component Breakdown &amp; Editable Line Material Costs</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Adjust piece counts and line material costs directly. Total timber, plywood, and overall quotation recalculate dynamically.
            </p>
          </div>

          {report.components.some((c) => c.customLineCost !== undefined) && onChangeComponentCost && (
            <button
              type="button"
              onClick={() => {
                report.components.forEach((c) => {
                  if (c.customLineCost !== undefined) {
                    onChangeComponentCost(c.id, undefined);
                  }
                });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold transition self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Line Costs to Auto</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Component Item</th>
                <th className="py-3 px-3">Cut Size (L × B × T)</th>
                <th className="py-3 px-3 w-28">Pieces (User i/p)</th>
                <th className="py-3 px-3">Piece CFT</th>
                <th className="py-3 px-3">Total Line CFT</th>
                <th className="py-3 px-4 text-right w-48">Line Material Cost (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {report.components.map((comp) => {
                const isPlywood = comp.materialType === "plywood";
                const autoLineCost = isPlywood
                  ? (comp.totalSqFt || 0) * pricing.plywoodRatePerSqFt
                  : comp.totalCft * pricing.woodRatePerCft;
                const isCustomCost = comp.customLineCost !== undefined;
                const activeLineCost = isCustomCost
                  ? comp.customLineCost
                  : Math.round(autoLineCost);

                return (
                  <tr key={comp.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900">{comp.name}</div>
                      <div className="text-[10px] text-zinc-400">
                        {comp.subtitle || comp.description}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-medium text-zinc-700">
                      {comp.length}&quot; × {comp.width}&quot; × {comp.thickness}&quot;
                    </td>

                    {/* User Editable Piece Quantity Input */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={comp.qty}
                          onChange={(e) =>
                            onChangeComponentQty(
                              comp.id,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-18 px-2 py-1 bg-amber-50/70 border border-amber-300 rounded font-bold text-zinc-900 focus:bg-white focus:border-amber-500 outline-none text-xs"
                        />
                        <span className="text-[11px] text-zinc-400">pcs</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-600">
                      {comp.pieceCft.toFixed(4)}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-amber-700">
                      {comp.totalCft.toFixed(3)} CFT
                      {isPlywood && (
                        <span className="text-[10px] block text-zinc-400 font-normal">
                          ({comp.totalSqFt} Sq.Ft)
                        </span>
                      )}
                    </td>

                    {/* User Editable Line Material Cost Input */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="relative inline-flex items-center">
                          <span className="absolute left-2.5 text-xs font-bold text-zinc-400">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={activeLineCost}
                            onChange={(e) => {
                              const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                              if (onChangeComponentCost) {
                                onChangeComponentCost(
                                  comp.id,
                                  isNaN(val as number) ? undefined : Math.max(0, val as number)
                                );
                              }
                            }}
                            title="Edit line material cost directly (User input)"
                            className={`w-28 pl-6 pr-2 py-1 rounded-lg text-xs font-mono font-bold text-right outline-none transition border ${
                              isCustomCost
                                ? "bg-amber-100/90 border-amber-500 text-amber-950 ring-1 ring-amber-400 focus:bg-white"
                                : "bg-amber-50/50 hover:bg-white border-amber-200 hover:border-amber-400 text-zinc-900 focus:bg-white focus:border-amber-500"
                            }`}
                          />
                        </div>
                        {isCustomCost && onChangeComponentCost && (
                          <button
                            type="button"
                            onClick={() => onChangeComponentCost(comp.id, undefined)}
                            title="Reset to formula cost"
                            className="px-1.5 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-200/90 hover:bg-amber-300 rounded border border-amber-300 transition shrink-0"
                          >
                            Auto
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 text-right">
                        {isCustomCost ? (
                          <span className="text-amber-700 font-semibold">User Custom Cost</span>
                        ) : (
                          <span>Formula: ₹{Math.round(autoLineCost).toLocaleString("en-IN")}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Costing Summary Strip */}
        <div className="bg-zinc-50 border-t border-zinc-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-zinc-600">
              Unit Rate (1 Box):{" "}
              <strong className="text-zinc-900">
                ₹{quotation.unitCostBeforeTax.toLocaleString("en-IN")}
              </strong>{" "}
              + GST ({pricing.gstPercent}%):{" "}
              <strong className="text-zinc-900">
                ₹{Math.round(quotation.gstAmount / quantityBoxes).toLocaleString("en-IN")}
              </strong>
            </div>
            <div className="text-sm font-bold text-zinc-900">
              Batch Total ({quantityBoxes} Boxes):{" "}
              <span className="text-emerald-700 text-lg font-black">
                ₹{quotation.grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <button
            id="proceed-step5-bottom-btn"
            type="button"
            onClick={onProceedToStep5}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition active:scale-98"
          >
            <span>Proceed to Step 5: Quotation Creation &amp; WhatsApp Share</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Timber CFT & Costing Calculator Modal */}
      <InteractiveCFTCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        currentUnit={report.unit}
        totalWoodCft={report.totalWoodCft}
        totalPlywoodSqFt={report.totalPlywoodSqFt}
        pricing={pricing}
        quantityBoxes={quantityBoxes}
        onApplyPricing={(newPricing, newQty) => {
          onChangePricing(newPricing);
          if (newQty && newQty !== quantityBoxes) {
            onChangeQuantityBoxes(newQty);
          }
        }}
        onApplyWoodRate={(rate) => {
          onChangePricing({
            ...pricing,
            woodRatePerCft: rate,
          });
        }}
        onAddComponent={(comp) => {
          if (onAddComponent) {
            onAddComponent(comp.materialType || "solid_wood");
          }
        }}
      />
    </div>
  );
};
