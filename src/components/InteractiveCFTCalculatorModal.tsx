import React, { useState, useEffect } from "react";
import {
  X,
  Calculator,
  Layers,
  Percent,
  Coins,
  Check,
  Copy,
  Plus,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { BoxDimensions, BoxUnit, PricingState, BoxComponentItem } from "../types";
import {
  calculatePieceCFT,
  calculatePieceSqFt,
  numberToIndianWords,
  toInches,
} from "../lib/cftCalculator";

interface InteractiveCFTCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Current project data for seeding & sync
  currentUnit?: BoxUnit;
  totalWoodCft?: number;
  totalPlywoodSqFt?: number;
  pricing?: PricingState;
  quantityBoxes?: number;
  onApplyPricing?: (newPricing: PricingState, newQuantity?: number) => void;
  onApplyWoodRate?: (rate: number) => void;
  onApplyUnitRate?: (rate: number) => void;
  onAddComponent?: (comp: Partial<BoxComponentItem>) => void;
}

export const InteractiveCFTCalculatorModal: React.FC<InteractiveCFTCalculatorModalProps> = ({
  isOpen,
  onClose,
  currentUnit = "in",
  totalWoodCft = 0,
  totalPlywoodSqFt = 0,
  pricing,
  quantityBoxes = 1,
  onApplyPricing,
  onApplyWoodRate,
  onApplyUnitRate,
  onAddComponent,
}) => {
  const [activeTab, setActiveTab] = useState<"cft_piece" | "box_quotation" | "math_pad">("cft_piece");

  // Tab 1: Timber Piece CFT State
  const [pieceLength, setPieceLength] = useState<number>(48);
  const [pieceWidth, setPieceWidth] = useState<number>(3.5);
  const [pieceThickness, setPieceThickness] = useState<number>(0.75);
  const [pieceUnit, setPieceUnit] = useState<BoxUnit>(currentUnit);
  const [pieceQty, setPieceQty] = useState<number>(10);
  const [pieceWoodRate, setPieceWoodRate] = useState<number>(pricing?.woodRatePerCft || 650);
  const [pieceWastage, setPieceWastage] = useState<number>(pricing?.wastagePercent || 7);
  const [pieceName, setPieceName] = useState<string>("Wooden Slat / Batten");

  // Tab 2: Box Quotation Costing State
  const [qWoodCft, setQWoodCft] = useState<number>(totalWoodCft || 2.45);
  const [qWoodRate, setQWoodRate] = useState<number>(pricing?.woodRatePerCft || 650);
  const [qPlySqFt, setQPlySqFt] = useState<number>(totalPlywoodSqFt || 0);
  const [qPlyRate, setQPlyRate] = useState<number>(pricing?.plywoodRatePerSqFt || 48);
  const [qWastagePct, setQWastagePct] = useState<number>(pricing?.wastagePercent || 7);
  const [qLabour, setQLabour] = useState<number>(pricing?.labourCostPerBox || 350);
  const [qHardware, setQHardware] = useState<number>(pricing?.hardwareFastenersCost || 150);
  const [qQuantity, setQQuantity] = useState<number>(quantityBoxes || 10);
  const [qDiscount, setQDiscount] = useState<number>(pricing?.discountAmount || 0);
  const [qGstPct, setQGstPct] = useState<number>(pricing?.gstPercent ?? 18);

  // Tab 3: Quick Math Pad State
  const [mathExpression, setMathExpression] = useState<string>("");
  const [mathResult, setMathResult] = useState<string>("0");
  const [mathHistory, setMathHistory] = useState<Array<{ expr: string; res: string }>>([]);

  // Copied alert state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);

  // Sync with props when opened
  useEffect(() => {
    if (isOpen) {
      if (pricing) {
        setPieceWoodRate(pricing.woodRatePerCft);
        setPieceWastage(pricing.wastagePercent);
        setQWoodRate(pricing.woodRatePerCft);
        setQPlyRate(pricing.plywoodRatePerSqFt);
        setQWastagePct(pricing.wastagePercent);
        setQLabour(pricing.labourCostPerBox);
        setQHardware(pricing.hardwareFastenersCost);
        setQDiscount(pricing.discountAmount || 0);
        setQGstPct(pricing.gstPercent ?? 18);
      }
      if (totalWoodCft) setQWoodCft(totalWoodCft);
      if (totalPlywoodSqFt !== undefined) setQPlySqFt(totalPlywoodSqFt);
      if (quantityBoxes) setQQuantity(quantityBoxes);
      if (currentUnit) setPieceUnit(currentUnit);
    }
  }, [isOpen, pricing, totalWoodCft, totalPlywoodSqFt, quantityBoxes, currentUnit]);

  // Keyboard shortcut for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Tab 1 Calculations: Single Piece & Line CFT
  const singlePieceCft = calculatePieceCFT(pieceLength, pieceWidth, pieceThickness, pieceUnit);
  const totalLineCft = Math.round(singlePieceCft * pieceQty * 1000) / 1000;
  const singlePieceSqFt = calculatePieceSqFt(pieceLength, pieceWidth, pieceUnit);
  const totalLineSqFt = Math.round(singlePieceSqFt * pieceQty * 100) / 100;
  const baseLineCost = Math.round(totalLineCft * pieceWoodRate);
  const lineWastageCost = Math.round(baseLineCost * (pieceWastage / 100));
  const totalLineCostWithWastage = baseLineCost + lineWastageCost;
  const costPerPiece = pieceQty > 0 ? Math.round((totalLineCostWithWastage / pieceQty) * 10) / 10 : 0;

  // Tab 2 Calculations: Full Box Costing
  const calcWoodCost = Math.round(qWoodCft * qWoodRate);
  const calcPlyCost = Math.round(qPlySqFt * qPlyRate);
  const calcRawTotal = calcWoodCost + calcPlyCost;
  const calcWastageAmount = Math.round(calcRawTotal * (qWastagePct / 100));
  const calcUnitCostBeforeTax = calcRawTotal + calcWastageAmount + qLabour + qHardware;
  const calcSubtotal = Math.max(0, Math.round(calcUnitCostBeforeTax * qQuantity - qDiscount));
  const calcGstAmount = Math.round(calcSubtotal * (qGstPct / 100));
  const calcGrandTotal = calcSubtotal + calcGstAmount;
  const calcAmountInWords = numberToIndianWords(calcGrandTotal);

  // Copy helper
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Math Pad calculation runner
  const handleMathBtn = (val: string) => {
    if (val === "C") {
      setMathExpression("");
      setMathResult("0");
      return;
    }
    if (val === "DEL") {
      setMathExpression((prev) => prev.slice(0, -1));
      return;
    }
    if (val === "=") {
      try {
        // Sanitize math string: only digits, decimal point, parens, and basic operators
        const clean = mathExpression.replace(/×/g, "*").replace(/÷/g, "/");
        if (!/^[0-9+\-*/.() ]+$/.test(clean)) {
          setMathResult("Error");
          return;
        }
        // eslint-disable-next-line no-eval
        const evaluated = Function(`'use strict'; return (${clean})`)();
        const resStr = Number.isFinite(evaluated)
          ? (Math.round(evaluated * 1000) / 1000).toString()
          : "Error";
        setMathResult(resStr);
        if (resStr !== "Error") {
          setMathHistory((prev) => [{ expr: mathExpression, res: resStr }, ...prev.slice(0, 4)]);
        }
      } catch {
        setMathResult("Error");
      }
      return;
    }
    setMathExpression((prev) => prev + val);
  };

  // Apply to project handlers
  const handleApplyWoodRate = () => {
    if (onApplyWoodRate) {
      onApplyWoodRate(pieceWoodRate);
    }
    if (onApplyPricing && pricing) {
      onApplyPricing({
        ...pricing,
        woodRatePerCft: pieceWoodRate,
        wastagePercent: pieceWastage,
      });
    }
    setApplySuccessMsg(`✅ Wood Rate ₹${pieceWoodRate}/CFT applied to project!`);
    setTimeout(() => setApplySuccessMsg(null), 3000);
  };

  const handleApplyFullCosting = () => {
    if (onApplyPricing && pricing) {
      const updatedPricing: PricingState = {
        ...pricing,
        woodRatePerCft: qWoodRate,
        plywoodRatePerSqFt: qPlyRate,
        wastagePercent: qWastagePct,
        labourCostPerBox: qLabour,
        hardwareFastenersCost: qHardware,
        discountAmount: qDiscount,
        gstPercent: qGstPct,
      };
      onApplyPricing(updatedPricing, qQuantity);
    }
    if (onApplyUnitRate) {
      onApplyUnitRate(calcUnitCostBeforeTax);
    }
    setApplySuccessMsg(`✅ Commercial pricing & quantities synced with project!`);
    setTimeout(() => {
      setApplySuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleAddPieceAsComponent = () => {
    if (onAddComponent) {
      onAddComponent({
        name: pieceName,
        length: pieceLength,
        width: pieceWidth,
        thickness: pieceThickness,
        qty: pieceQty,
        materialType: "solid_wood",
        category: "BATTENS_CLEATS",
        woodType: "Pine / Jungle Wood",
      });
      setApplySuccessMsg(`✅ Added "${pieceName}" (${totalLineCft} CFT) to crate components!`);
      setTimeout(() => setApplySuccessMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Header */}
        <div className="bg-zinc-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Timber CFT &amp; Costing Calculator
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-zinc-950">
                  Live Calculator
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Indian Packaging Formula &bull; (Length × Width × Thickness) ÷ 1728
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition"
            title="Close calculator (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("cft_piece")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition border-t border-x ${
              activeTab === "cft_piece"
                ? "bg-white text-amber-700 border-zinc-200 border-b-transparent shadow-xs -mb-[1px]"
                : "text-zinc-600 hover:text-zinc-900 border-transparent hover:bg-zinc-100"
            }`}
          >
            🪵 1. Timber Slat &amp; CFT Formula
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("box_quotation")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition border-t border-x ${
              activeTab === "box_quotation"
                ? "bg-white text-amber-700 border-zinc-200 border-b-transparent shadow-xs -mb-[1px]"
                : "text-zinc-600 hover:text-zinc-900 border-transparent hover:bg-zinc-100"
            }`}
          >
            💰 2. Box Costing &amp; Quotation
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("math_pad")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition border-t border-x ${
              activeTab === "math_pad"
                ? "bg-white text-amber-700 border-zinc-200 border-b-transparent shadow-xs -mb-[1px]"
                : "text-zinc-600 hover:text-zinc-900 border-transparent hover:bg-zinc-100"
            }`}
          >
            🔢 3. Quick Math Pad
          </button>
        </div>

        {/* Toast / Notice Banner */}
        {applySuccessMsg && (
          <div className="bg-emerald-50 text-emerald-800 border-b border-emerald-200 px-5 py-2 text-xs font-bold flex items-center justify-between">
            <span>{applySuccessMsg}</span>
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: Timber Slat & Piece CFT Calculator */}
          {activeTab === "cft_piece" && (
            <div className="space-y-5">
              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-zinc-500 font-bold text-[11px] uppercase">Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPieceName("Heavy Skid / Runner");
                    setPieceLength(48);
                    setPieceWidth(3.5);
                    setPieceThickness(3.5);
                    setPieceUnit("in");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-700 hover:text-amber-900 font-medium text-[11px] transition"
                >
                  Skid Runner (48×3.5×3.5&quot;)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPieceName("Wooden Deck Batten / Slat");
                    setPieceLength(48);
                    setPieceWidth(3.5);
                    setPieceThickness(0.75);
                    setPieceUnit("in");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-700 hover:text-amber-900 font-medium text-[11px] transition"
                >
                  Deck Slat (48×3.5×0.75&quot;)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPieceName("Pallet Spacer Block");
                    setPieceLength(4);
                    setPieceWidth(4);
                    setPieceThickness(3.5);
                    setPieceUnit("in");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-700 hover:text-amber-900 font-medium text-[11px] transition"
                >
                  Spacer Block (4×4×3.5&quot;)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPieceName("Export Heavy Plank");
                    setPieceLength(60);
                    setPieceWidth(5);
                    setPieceThickness(1);
                    setPieceUnit("in");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-700 hover:text-amber-900 font-medium text-[11px] transition"
                >
                  Side Plank (60×5×1&quot;)
                </button>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Length */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Length (L)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      value={pieceLength}
                      onChange={(e) => setPieceLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-full font-mono font-bold text-sm bg-white border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                    />
                    <span className="text-xs font-bold text-zinc-500">{pieceUnit}</span>
                  </div>
                </div>

                {/* Width */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Width / Breadth (W)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.1"
                      step="0.25"
                      value={pieceWidth}
                      onChange={(e) => setPieceWidth(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-full font-mono font-bold text-sm bg-white border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                    />
                    <span className="text-xs font-bold text-zinc-500">{pieceUnit}</span>
                  </div>
                </div>

                {/* Thickness */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Thickness / Height (T)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.1"
                      step="0.25"
                      value={pieceThickness}
                      onChange={(e) => setPieceThickness(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-full font-mono font-bold text-sm bg-white border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                    />
                    <span className="text-xs font-bold text-zinc-500">{pieceUnit}</span>
                  </div>
                </div>

                {/* Units Selector */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Dimension Unit
                  </label>
                  <select
                    value={pieceUnit}
                    onChange={(e) => setPieceUnit(e.target.value as BoxUnit)}
                    className="w-full font-bold text-xs bg-white border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-amber-500"
                  >
                    <option value="in">Inches (in)</option>
                    <option value="mm">Millimeters (mm)</option>
                    <option value="cm">Centimeters (cm)</option>
                  </select>
                </div>
              </div>

              {/* Quantity, Wood Rate & Wastage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Piece Quantity (Pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pieceQty}
                    onChange={(e) => setPieceQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full font-mono font-bold text-sm bg-white border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Wood Rate (₹ per CFT)
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="50"
                      step="25"
                      value={pieceWoodRate}
                      onChange={(e) => setPieceWoodRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full font-mono font-bold text-sm bg-white border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Wastage / Sizing (%)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={pieceWastage}
                      onChange={(e) => setPieceWastage(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full font-mono font-bold text-sm bg-white border border-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                    />
                    <span className="text-zinc-500 font-bold text-xs">%</span>
                  </div>
                </div>
              </div>

              {/* Formula & Calculation Result Cards */}
              <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-4">
                <div className="text-[11px] font-mono text-amber-900 mb-3 bg-white/70 border border-amber-200 rounded-lg px-3 py-1.5 flex items-center justify-between">
                  <span>
                    <strong>Formula:</strong> ({toInches(pieceLength, pieceUnit).toFixed(2)}&quot; × {toInches(pieceWidth, pieceUnit).toFixed(2)}&quot; × {toInches(pieceThickness, pieceUnit).toFixed(2)}&quot;) ÷ 1728 = <strong>{singlePieceCft.toFixed(4)} CFT / pc</strong>
                  </span>
                  <span className="text-amber-700 font-bold">1 CFT = 1728 cu.in</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-amber-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">1 Piece CFT</span>
                    <span className="text-lg font-black font-mono text-amber-800 block mt-0.5">
                      {singlePieceCft.toFixed(4)}
                    </span>
                    <span className="text-[10px] text-zinc-400">Cu.Ft per item</span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-amber-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Total Line CFT</span>
                    <span className="text-lg font-black font-mono text-zinc-950 block mt-0.5">
                      {totalLineCft.toFixed(3)} <span className="text-xs font-bold text-amber-700">CFT</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">for {pieceQty} pieces</span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-amber-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Timber Material Cost</span>
                    <span className="text-lg font-black font-mono text-zinc-950 block mt-0.5">
                      ₹{baseLineCost.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-zinc-400">@ ₹{pieceWoodRate}/CFT</span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-amber-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Cost + Wastage</span>
                    <span className="text-lg font-black font-mono text-emerald-700 block mt-0.5">
                      ₹{totalLineCostWithWastage.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-zinc-400">₹{costPerPiece}/piece</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Tab 1 */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => handleCopyText(`${totalLineCft.toFixed(3)} CFT`, "cft_val")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === "cft_val" ? "Copied!" : `Copy ${totalLineCft.toFixed(3)} CFT`}</span>
                </button>

                <div className="flex items-center gap-2">
                  {onAddComponent && (
                    <button
                      type="button"
                      onClick={handleAddPieceAsComponent}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add as Crate Component</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleApplyWoodRate}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply ₹{pieceWoodRate}/CFT to Project</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Box Costing & Quotation Full Breakdown */}
          {activeTab === "box_quotation" && (
            <div className="space-y-4">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900">
                    Live Commercial Costing Formula
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Adjust any rate, wastage, labour or quantity &bull; See instantaneous recalculated unit &amp; grand totals
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300">
                  Unit Cost: ₹{calcUnitCostBeforeTax.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Rates & Volume Inputs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                    Wood CFT
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={qWoodCft}
                    onChange={(e) => setQWoodCft(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full font-mono font-bold text-sm bg-zinc-50 border border-zinc-200 rounded px-2 py-1 mt-1"
                  />
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                    Wood Rate (₹/CFT)
                  </label>
                  <input
                    type="number"
                    step="25"
                    value={qWoodRate}
                    onChange={(e) => setQWoodRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full font-mono font-bold text-sm bg-zinc-50 border border-zinc-200 rounded px-2 py-1 mt-1"
                  />
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                    Plywood (Sq.Ft)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={qPlySqFt}
                    onChange={(e) => setQPlySqFt(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full font-mono font-bold text-sm bg-zinc-50 border border-zinc-200 rounded px-2 py-1 mt-1"
                  />
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                    Ply Rate (₹/Sq.Ft)
                  </label>
                  <input
                    type="number"
                    step="2"
                    value={qPlyRate}
                    onChange={(e) => setQPlyRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full font-mono font-bold text-sm bg-zinc-50 border border-zinc-200 rounded px-2 py-1 mt-1"
                  />
                </div>
              </div>

              {/* Manufacturing & Assembly Costs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                    Wastage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={qWastagePct}
                    onChange={(e) => setQWastagePct(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full font-mono font-bold text-sm bg-zinc-50 border border-zinc-200 rounded px-2 py-1 mt-1"
                  />
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                    Labour per Box (₹)
                  </label>
                  <input
                    type="number"
                    step="25"
                    value={qLabour}
                    onChange={(e) => setQLabour(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full font-mono font-bold text-sm bg-zinc-50 border border-zinc-200 rounded px-2 py-1 mt-1"
                  />
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                    Hardware per Box (₹)
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={qHardware}
                    onChange={(e) => setQHardware(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full font-mono font-bold text-sm bg-zinc-50 border border-zinc-200 rounded px-2 py-1 mt-1"
                  />
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                    Order Qty (Boxes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={qQuantity}
                    onChange={(e) => setQQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full font-mono font-bold text-sm bg-zinc-50 border border-zinc-200 rounded px-2 py-1 mt-1 text-amber-700"
                  />
                </div>
              </div>

              {/* Tax & Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                    Discount Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={qDiscount}
                    onChange={(e) => setQDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full font-mono font-bold text-sm bg-zinc-50 border border-zinc-200 rounded px-2 py-1 mt-1 text-emerald-700"
                  />
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                    GST Tax Rate (%)
                  </label>
                  <select
                    value={qGstPct}
                    onChange={(e) => setQGstPct(parseFloat(e.target.value) || 0)}
                    className="w-full font-bold text-sm bg-zinc-50 border border-zinc-200 rounded px-2 py-1.5 mt-1"
                  >
                    <option value={0}>0% (Tax Exempt / SEZ)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST (Standard Packaging)</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>
              </div>

              {/* Comprehensive Costing Summary Panel */}
              <div className="bg-zinc-900 text-white rounded-2xl p-4 shadow-md space-y-2.5">
                <div className="flex justify-between items-center text-xs text-zinc-300">
                  <span>Raw Material Subtotal:</span>
                  <span className="font-mono font-semibold">
                    ₹{calcRawTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-300">
                  <span>Wastage Allowance ({qWastagePct}%):</span>
                  <span className="font-mono font-semibold">
                    ₹{calcWastageAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-300">
                  <span>Carpentry &amp; Hardware (per box):</span>
                  <span className="font-mono font-semibold">
                    ₹{(qLabour + qHardware).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-t border-zinc-700 pt-2 flex justify-between items-center text-sm font-bold text-amber-400">
                  <span>Unit Box Rate (Excl. Tax):</span>
                  <span className="font-mono text-base">
                    ₹{calcUnitCostBeforeTax.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-300">
                  <span>Subtotal for {qQuantity} boxes (Less Discount):</span>
                  <span className="font-mono font-semibold">
                    ₹{calcSubtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-300">
                  <span>GST Amount ({qGstPct}%):</span>
                  <span className="font-mono font-semibold">
                    ₹{calcGstAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-t-2 border-amber-500 pt-2.5 flex justify-between items-baseline text-white">
                  <div>
                    <span className="text-sm font-black uppercase text-amber-400">
                      Grand Total:
                    </span>
                    <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">
                      {calcAmountInWords}
                    </span>
                  </div>
                  <span className="text-2xl font-black font-mono text-amber-400">
                    ₹{calcGrandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Tab 2 */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setQWoodCft(totalWoodCft || 2.45);
                    setQPlySqFt(totalPlywoodSqFt || 0);
                    if (pricing) {
                      setQWoodRate(pricing.woodRatePerCft);
                      setQPlyRate(pricing.plywoodRatePerSqFt);
                      setQWastagePct(pricing.wastagePercent);
                      setQLabour(pricing.labourCostPerBox);
                      setQHardware(pricing.hardwareFastenersCost);
                      setQDiscount(pricing.discountAmount || 0);
                      setQGstPct(pricing.gstPercent ?? 18);
                    }
                    if (quantityBoxes) setQQuantity(quantityBoxes);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Crate</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyFullCosting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply All Values to Quotation &amp; Project</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Quick Desk Math Pad */}
          {activeTab === "math_pad" && (
            <div className="space-y-4">
              {/* Display */}
              <div className="bg-zinc-950 text-white rounded-2xl p-4 shadow-inner">
                <div className="text-right text-xs font-mono text-zinc-400 min-h-4">
                  {mathExpression || "0"}
                </div>
                <div className="text-right text-2xl font-black font-mono text-amber-400 mt-1">
                  {mathResult}
                </div>
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-4 gap-2 text-sm font-bold">
                {/* Row 1 */}
                <button
                  type="button"
                  onClick={() => handleMathBtn("C")}
                  className="py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 transition"
                >
                  C
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn("DEL")}
                  className="py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
                >
                  DEL
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn("/ 1728")}
                  className="py-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black transition"
                  title="Divide by 1728 (CFT formula)"
                >
                  ÷ 1728
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn(" / ")}
                  className="py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 transition text-base"
                >
                  ÷
                </button>

                {/* Row 2 */}
                <button
                  type="button"
                  onClick={() => handleMathBtn("7")}
                  className="py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-900 transition text-base"
                >
                  7
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn("8")}
                  className="py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-900 transition text-base"
                >
                  8
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn("9")}
                  className="py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-900 transition text-base"
                >
                  9
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn(" * ")}
                  className="py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 transition text-base"
                >
                  ×
                </button>

                {/* Row 3 */}
                <button
                  type="button"
                  onClick={() => handleMathBtn("4")}
                  className="py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-900 transition text-base"
                >
                  4
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn("5")}
                  className="py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-900 transition text-base"
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn("6")}
                  className="py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-900 transition text-base"
                >
                  6
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn(" - ")}
                  className="py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 transition text-base"
                >
                  −
                </button>

                {/* Row 4 */}
                <button
                  type="button"
                  onClick={() => handleMathBtn("1")}
                  className="py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-900 transition text-base"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn("2")}
                  className="py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-900 transition text-base"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn("3")}
                  className="py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-900 transition text-base"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn(" + ")}
                  className="py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 transition text-base"
                >
                  +
                </button>

                {/* Row 5 */}
                <button
                  type="button"
                  onClick={() => handleMathBtn("0")}
                  className="py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-900 transition text-base"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn(".")}
                  className="py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-900 transition text-base"
                >
                  .
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyText(mathResult, "math_res")}
                  className="py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === "math_res" ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMathBtn("=")}
                  className="py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-lg shadow-xs transition"
                >
                  =
                </button>
              </div>

              {/* Recent History */}
              {mathHistory.length > 0 && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Recent Calculations:
                  </span>
                  <div className="space-y-1 text-xs font-mono">
                    {mathHistory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-zinc-600">
                        <span>{item.expr}</span>
                        <span className="font-bold text-zinc-900">= {item.res}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-zinc-50 border-t border-zinc-200 px-5 py-3 flex items-center justify-between text-xs">
          <div className="text-zinc-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>Formulas conform to Indian Packaging Standards &amp; Sawmill CFT rules.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold transition"
          >
            Done &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
