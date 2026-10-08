import React, { useState, useEffect } from "react";
import {
  X,
  Trash2,
  Plus,
  Layers,
  Sparkles,
  Sliders,
  Check,
  Package,
  Boxes,
} from "lucide-react";
import {
  BoxComponentItem,
  BoxDimensions,
  BoxUnit,
} from "../types";
import { calculatePieceCFT, calculatePieceSqFt } from "../lib/cftCalculator";

interface ComponentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: BoxComponentItem[];
  selectedComponentId: string | null;
  onSelectComponentId: (id: string) => void;
  onUpdateComponent: (id: string, field: keyof BoxComponentItem, value: any) => void;
  onAddComponent: (type?: "solid_wood" | "plywood" | "hardwood_block") => void;
  onRemoveComponent: (id: string) => void;
  dimensions: BoxDimensions;
  onChangeDimensions?: (newDims: BoxDimensions) => void;
}

export const ComponentEditorModal: React.FC<ComponentEditorModalProps> = ({
  isOpen,
  onClose,
  components,
  selectedComponentId,
  onSelectComponentId,
  onUpdateComponent,
  onAddComponent,
  onRemoveComponent,
  dimensions,
  onChangeDimensions,
}) => {
  const [activeTab, setActiveTab] = useState<"component" | "overall">("component");
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Selected component
  const currentComp =
    components.find((c) => c.id === selectedComponentId) ||
    components[0] ||
    null;

  const isPlywood = currentComp?.materialType === "plywood";

  // Step adjust helper
  const adjustValue = (field: "length" | "width" | "thickness" | "qty", delta: number) => {
    if (!currentComp) return;
    const currentVal = Number(currentComp[field]) || 0;
    const step = field === "qty" ? 1 : 0.25;
    const minVal = field === "qty" ? 1 : 0.1;
    const newVal = Math.max(minVal, Math.round((currentVal + delta) * 100) / 100);
    onUpdateComponent(currentComp.id, field, newVal);
  };

  const handleSetThicknessPreset = (val: number) => {
    if (!currentComp) return;
    onUpdateComponent(currentComp.id, "thickness", val);
  };

  // Live calculations for current piece
  const pieceCft = currentComp
    ? calculatePieceCFT(currentComp.length, currentComp.width, currentComp.thickness, dimensions.unit)
    : 0;
  const totalCft = currentComp ? pieceCft * currentComp.qty : 0;
  const sqft = currentComp
    ? calculatePieceSqFt(currentComp.length, currentComp.width, dimensions.unit)
    : 0;

  return (
    <div
      id="component-editor-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="component-editor-modal-card"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-amber-950 px-5 py-4 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Edit Dimensions (L × B × H / T)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-500/30">
                  Double-Click Active
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Edit individual cut pieces, add or remove components, or tune overall box dimensions.
              </p>
            </div>
          </div>

          <button
            id="modal-close-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection & Top Bar */}
        <div className="bg-zinc-50 px-5 py-2.5 border-b border-zinc-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-200/80 rounded-xl">
            <button
              id="tab-edit-component"
              type="button"
              onClick={() => setActiveTab("component")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "component"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Package className="w-3.5 h-3.5 text-amber-600" />
              <span>Piece L × B × T ({components.length})</span>
            </button>

            <button
              id="tab-edit-overall"
              type="button"
              onClick={() => setActiveTab("overall")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "overall"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-amber-600" />
              <span>Overall Box ({dimensions.length}×{dimensions.width}×{dimensions.height})</span>
            </button>
          </div>

          {/* Quick Add Component dropdown / action */}
          <div className="relative">
            <button
              id="quick-add-comp-btn"
              type="button"
              onClick={() => setAddDropdownOpen(!addDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Component</span>
            </button>

            {addDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-zinc-200 p-1.5 z-30 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    onAddComponent("solid_wood");
                    setAddDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-amber-50 text-zinc-800 transition flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Solid Wood Cleat / Slat</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddComponent("plywood");
                    setAddDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-amber-50 text-zinc-800 transition flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>Plywood Sheet Panel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddComponent("hardwood_block");
                    setAddDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-amber-50 text-zinc-800 transition flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-stone-500" />
                  <span>Skid Block / Spacer</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === "component" && (
            <>
              {/* Component Selector Scroll Strip */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Select Component to Edit or Remove:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {components.map((comp) => {
                    const isSel = currentComp?.id === comp.id;
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => onSelectComponentId(comp.id)}
                        className={`px-3 py-2 rounded-2xl text-left border shrink-0 transition flex flex-col min-w-[150px] max-w-[210px] ${
                          isSel
                            ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 text-zinc-900"
                            : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="text-xs font-bold truncate">
                            {comp.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-200/80 text-zinc-700">
                            ×{comp.qty}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-700 font-semibold mt-0.5">
                          {comp.length}&quot; × {comp.width}&quot; × {comp.thickness}&quot;
                        </span>
                        {comp.subtitle && (
                          <span className="text-[9px] text-zinc-400 truncate mt-0.5">
                            {comp.subtitle}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentComp ? (
                <div className="space-y-4">
                  {/* Active Component Info & Material Selector */}
                  <div className="bg-amber-500/10 border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          id="edit-component-name"
                          type="text"
                          value={currentComp.name}
                          onChange={(e) =>
                            onUpdateComponent(currentComp.id, "name", e.target.value)
                          }
                          className="text-sm font-bold text-zinc-900 bg-transparent border-b border-transparent focus:border-amber-500 outline-none w-full"
                          title="Click to rename component"
                        />
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                        <span>{currentComp.subtitle || currentComp.description}</span>
                        <span>&bull;</span>
                        <span className="font-semibold text-amber-800">
                          {currentComp.woodType || "Timber / Plywood"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Material Type Pills */}
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-300/70 shadow-2xs">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateComponent(currentComp.id, "materialType", "solid_wood")
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            currentComp.materialType === "solid_wood"
                              ? "bg-amber-600 text-white"
                              : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          Solid Wood
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateComponent(currentComp.id, "materialType", "plywood")
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            currentComp.materialType === "plywood"
                              ? "bg-amber-600 text-white"
                              : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          Plywood
                        </button>
                      </div>

                      {/* Remove Button for this component */}
                      <button
                        id="remove-current-comp-btn"
                        type="button"
                        onClick={() => {
                          onRemoveComponent(currentComp.id);
                        }}
                        title="Remove this component from crate"
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition active:scale-95 shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Key Numerical Inputs: Length, Width/Breadth, Height/Thickness, Quantity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Length (L) */}
                    <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                          Length (L)
                        </label>
                        <span className="text-[10px] font-bold text-amber-700 uppercase">
                          {dimensions.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjustValue("length", -0.5)}
                          className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm flex items-center justify-center transition"
                        >
                          -
                        </button>
                        <input
                          id="edit-comp-length"
                          type="number"
                          step="0.25"
                          min="0.1"
                          value={currentComp.length}
                          onChange={(e) =>
                            onUpdateComponent(
                              currentComp.id,
                              "length",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="flex-1 text-center font-extrabold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl py-1 text-sm outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue("length", 0.5)}
                          className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm flex items-center justify-center transition"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 text-center">
                        Cut length along grain
                      </div>
                    </div>

                    {/* Width / Breadth (B) */}
                    <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                          Width / Breadth (B)
                        </label>
                        <span className="text-[10px] font-bold text-amber-700 uppercase">
                          {dimensions.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjustValue("width", -0.25)}
                          className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm flex items-center justify-center transition"
                        >
                          -
                        </button>
                        <input
                          id="edit-comp-width"
                          type="number"
                          step="0.25"
                          min="0.1"
                          value={currentComp.width}
                          onChange={(e) =>
                            onUpdateComponent(
                              currentComp.id,
                              "width",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="flex-1 text-center font-extrabold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl py-1 text-sm outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue("width", 0.25)}
                          className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm flex items-center justify-center transition"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 text-center">
                        Face width (Breadth)
                      </div>
                    </div>

                    {/* Thickness / Height (H / T) */}
                    <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                          Thickness / H (T)
                        </label>
                        <span className="text-[10px] font-bold text-amber-700 uppercase">
                          {dimensions.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjustValue("thickness", -0.1)}
                          className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm flex items-center justify-center transition"
                        >
                          -
                        </button>
                        <input
                          id="edit-comp-thickness"
                          type="number"
                          step="0.1"
                          min="0.05"
                          value={currentComp.thickness}
                          onChange={(e) =>
                            onUpdateComponent(
                              currentComp.id,
                              "thickness",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="flex-1 text-center font-extrabold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl py-1 text-sm outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue("thickness", 0.1)}
                          className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm flex items-center justify-center transition"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 text-center">
                        Timber thickness / Gauge
                      </div>
                    </div>

                    {/* Quantity (Qty) */}
                    <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                          Pieces (Qty)
                        </label>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">
                          PCS
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjustValue("qty", -1)}
                          className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm flex items-center justify-center transition"
                        >
                          -
                        </button>
                        <input
                          id="edit-comp-qty"
                          type="number"
                          step="1"
                          min="1"
                          value={currentComp.qty}
                          onChange={(e) =>
                            onUpdateComponent(
                              currentComp.id,
                              "qty",
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="flex-1 text-center font-extrabold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl py-1 text-sm outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => adjustValue("qty", 1)}
                          className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm flex items-center justify-center transition"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 text-center">
                        Total identical pieces
                      </div>
                    </div>
                  </div>

                  {/* Standard Timber Thickness Presets */}
                  <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
                    <div className="text-[11px] font-bold text-zinc-600 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Standard Indian Timber Thickness Presets:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '0.75" (3/4")', val: 0.75 },
                        { label: '1.0" (1")', val: 1.0 },
                        { label: '1.25" (1-1/4")', val: 1.25 },
                        { label: '1.5" (1-1/2")', val: 1.5 },
                        { label: '2.0" (2")', val: 2.0 },
                        { label: '2.5" (2-1/2")', val: 2.5 },
                        { label: "12mm Ply (0.47\")", val: 0.47 },
                        { label: "18mm Ply (0.71\")", val: 0.71 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleSetThicknessPreset(preset.val)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition border ${
                            Math.abs(currentComp.thickness - preset.val) < 0.03
                              ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                              : "bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Line Material Cost (User Override Option) */}
                  <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                        Line Material Cost (₹)
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {currentComp.customLineCost !== undefined
                          ? "Custom user cost override active"
                          : "Formula-calculated based on timber / plywood rates"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative inline-flex items-center">
                        <span className="absolute left-2.5 text-xs font-bold text-zinc-400">₹</span>
                        <input
                          id="edit-comp-custom-cost"
                          type="number"
                          min="0"
                          step="10"
                          placeholder="Auto rate"
                          value={currentComp.customLineCost !== undefined ? currentComp.customLineCost : ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                            onUpdateComponent(
                              currentComp.id,
                              "customLineCost",
                              isNaN(val as number) ? undefined : Math.max(0, val as number)
                            );
                          }}
                          className={`w-32 pl-6 pr-2 py-1.5 rounded-xl border text-sm font-bold font-mono text-right outline-none transition ${
                            currentComp.customLineCost !== undefined
                              ? "bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-400 focus:bg-white"
                              : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white focus:border-amber-500"
                          }`}
                        />
                      </div>
                      {currentComp.customLineCost !== undefined && (
                        <button
                          type="button"
                          onClick={() => onUpdateComponent(currentComp.id, "customLineCost", undefined)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition"
                        >
                          Reset Auto
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Real-time CFT & Cost readout for this piece */}
                  <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                        Live Piece Calculation Formula
                      </span>
                      <div className="text-xs text-zinc-700 mt-0.5 font-mono">
                        ({currentComp.length}&quot; × {currentComp.width}&quot; × {currentComp.thickness}&quot;) ÷ 1728 ={" "}
                        <strong className="text-zinc-900 font-bold">{pieceCft.toFixed(4)} CFT/pc</strong>
                      </div>
                      {isPlywood && (
                        <div className="text-[11px] text-zinc-600 mt-0.5">
                          Sheet Area: <strong>{sqft.toFixed(2)} Sq.Ft</strong> per piece
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">
                        Line Total ({currentComp.qty} pcs)
                      </div>
                      <div className="text-xl font-black text-amber-700 font-mono">
                        {totalCft.toFixed(3)} CFT
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-500">
                  No component selected. Click &quot;+ Add Component&quot; to create one.
                </div>
              )}
            </>
          )}

          {activeTab === "overall" && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-300/80 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-700" />
                  Overall Outer Crate / Box Envelope (L × B × H)
                </h3>
                <p className="text-xs text-zinc-600 mt-1">
                  Adjust the external bounding dimensions of the entire wooden packaging box.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Overall Length */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Overall Length (L)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="overall-box-length"
                      type="number"
                      step="0.5"
                      min="1"
                      value={dimensions.length}
                      onChange={(e) =>
                        onChangeDimensions?.({
                          ...dimensions,
                          length: Math.max(1, parseFloat(e.target.value) || 0),
                        })
                      }
                      className="w-full text-lg font-black text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl p-2 outline-none focus:border-amber-500"
                    />
                    <span className="text-xs font-bold text-zinc-400 uppercase">
                      {dimensions.unit}
                    </span>
                  </div>
                </div>

                {/* Overall Width */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Overall Width / Breadth (B)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="overall-box-width"
                      type="number"
                      step="0.5"
                      min="1"
                      value={dimensions.width}
                      onChange={(e) =>
                        onChangeDimensions?.({
                          ...dimensions,
                          width: Math.max(1, parseFloat(e.target.value) || 0),
                        })
                      }
                      className="w-full text-lg font-black text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl p-2 outline-none focus:border-amber-500"
                    />
                    <span className="text-xs font-bold text-zinc-400 uppercase">
                      {dimensions.unit}
                    </span>
                  </div>
                </div>

                {/* Overall Height */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Overall Height (H)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="overall-box-height"
                      type="number"
                      step="0.5"
                      min="1"
                      value={dimensions.height}
                      onChange={(e) =>
                        onChangeDimensions?.({
                          ...dimensions,
                          height: Math.max(1, parseFloat(e.target.value) || 0),
                        })
                      }
                      className="w-full text-lg font-black text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl p-2 outline-none focus:border-amber-500"
                    />
                    <span className="text-xs font-bold text-zinc-400 uppercase">
                      {dimensions.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-zinc-50 px-5 py-3.5 border-t border-zinc-200 flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-500">
            Total Box Parts: <strong className="text-zinc-800">{components.length} items</strong> &bull; Total Pieces:{" "}
            <strong className="text-zinc-800">
              {components.reduce((sum, c) => sum + c.qty, 0)} pcs
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="modal-apply-close-btn"
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-sm transition active:scale-98"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Done / Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
