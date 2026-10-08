import React, { useState } from "react";
import {
  BoxComponentItem,
  BoxDimensions,
  BoxTypeDefinition,
  BoxUnit,
} from "../types";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  RotateCcw,
  Sliders,
  Layers,
  Info,
  CheckCircle2,
} from "lucide-react";

interface Page2ComponentInputsProps {
  boxTemplate: BoxTypeDefinition;
  dimensions: BoxDimensions;
  components: BoxComponentItem[];
  deckOption?: "full_slat" | "only_blocks";
  onSelectDeckOption?: (option: "full_slat" | "only_blocks") => void;
  onChangeDimensions: (newDims: BoxDimensions) => void;
  onChangeComponent: (id: string, field: keyof BoxComponentItem, value: any) => void;
  onAddComponent: (type: "solid_wood" | "plywood" | "hardwood_block") => void;
  onRemoveComponent: (id: string) => void;
  onResetComponents: () => void;
  onBackToStep1: () => void;
  onProceedToStep3: () => void;
}

export const Page2_ComponentInputs: React.FC<Page2ComponentInputsProps> = ({
  boxTemplate,
  dimensions,
  components,
  deckOption = "full_slat",
  onSelectDeckOption,
  onChangeDimensions,
  onChangeComponent,
  onAddComponent,
  onRemoveComponent,
  onResetComponents,
  onBackToStep1,
  onProceedToStep3,
}) => {
  const [showUnitChangeModal, setShowUnitChangeModal] = useState(false);

  // Total CFT of all current components
  const totalCftSum = components.reduce((acc, c) => acc + (c.totalCft || 0), 0);
  const totalPcsSum = components.reduce((acc, c) => acc + (c.qty || 0), 0);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Header Bar with Step Title & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Step 2 of 5 &bull; Component L × B × H Specifications</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            {boxTemplate.title}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {boxTemplate.subtitle || boxTemplate.shortDesc} &bull; Set cut lengths, widths, thicknesses and piece counts for each timber or plywood part.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToStep1}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Box Type</span>
          </button>

          <button
            id="proceed-step3-top-btn"
            type="button"
            onClick={onProceedToStep3}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <span>Step 3: 3D View &amp; Explode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Outer Dimensions Card */}
      <div className="bg-amber-500/10 border border-amber-300/80 rounded-2xl p-5 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-700" />
              Overall Outer Box Dimensions (L × B × H)
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Defines the global crate/pallet envelope. Updating these keeps component scales proportional.
            </p>
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-300/70 shadow-2xs">
            <span className="text-[11px] font-semibold text-zinc-500 px-2">Unit:</span>
            {(["in", "mm", "cm"] as BoxUnit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => onChangeDimensions({ ...dimensions, unit: u })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition uppercase ${
                  dimensions.unit === u
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-xl border border-amber-200">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase">
              Overall Length (L)
            </label>
            <div className="flex items-center mt-1">
              <input
                id="box-overall-length"
                type="number"
                min="1"
                step="0.5"
                value={dimensions.length}
                onChange={(e) =>
                  onChangeDimensions({
                    ...dimensions,
                    length: Math.max(1, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full text-lg font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
              />
              <span className="text-xs font-bold text-zinc-400 uppercase">
                {dimensions.unit}
              </span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase">
              Overall Width / Breadth (B)
            </label>
            <div className="flex items-center mt-1">
              <input
                id="box-overall-width"
                type="number"
                min="1"
                step="0.5"
                value={dimensions.width}
                onChange={(e) =>
                  onChangeDimensions({
                    ...dimensions,
                    width: Math.max(1, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full text-lg font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
              />
              <span className="text-xs font-bold text-zinc-400 uppercase">
                {dimensions.unit}
              </span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase">
              Overall Height (H)
            </label>
            <div className="flex items-center mt-1">
              <input
                id="box-overall-height"
                type="number"
                min="1"
                step="0.5"
                value={dimensions.height}
                onChange={(e) =>
                  onChangeDimensions({
                    ...dimensions,
                    height: Math.max(1, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full text-lg font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
              />
              <span className="text-xs font-bold text-zinc-400 uppercase">
                {dimensions.unit}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pallet / Deck Configuration: Full Slat vs Only Blocks selection */}
      {onSelectDeckOption && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl mb-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              {deckOption === "full_slat" ? "🪵" : "🧱"}
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                <span>Deck Structure Selection:</span>
                <span className="text-amber-800 font-extrabold">
                  {deckOption === "full_slat" ? "Full Slat Deck (Top Planks Included)" : "Only Blocks & Skids Base"}
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5">
                {deckOption === "full_slat"
                  ? "Standard full top wooden planks covering the deck. Switch to 'Only Blocks & Skids' if cargo only requires the block pallet base without top slats."
                  : "Only the solid wooden spacer blocks and base runners/stringers (No top deck slats). Timber CFT and pricing are calculated accordingly."}
              </p>
            </div>
          </div>

          <div className="flex items-center bg-white p-1 rounded-xl border border-amber-300 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => onSelectDeckOption("full_slat")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                deckOption === "full_slat"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-amber-50"
              }`}
            >
              <span>🪵 Full Slat Deck</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectDeckOption("only_blocks")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                deckOption === "only_blocks"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-amber-50"
              }`}
            >
              <span>🧱 Only Blocks & Skids</span>
            </button>
          </div>
        </div>
      )}

      {/* Component Inputs Table Header & Action buttons */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden mb-6">
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              Individual Cut Components ({components.length} Items)
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enter Length (L), Breadth (B), and Thickness (T) for each piece. CFT updates automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onAddComponent("solid_wood")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Wood Slat</span>
            </button>

            <button
              type="button"
              onClick={() => onAddComponent("plywood")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Ply Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => onAddComponent("hardwood_block")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Block</span>
            </button>

            <button
              type="button"
              onClick={onResetComponents}
              title="Reset components to factory preset"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-medium transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Components Table (Desktop & Tablet) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Component Name &amp; Description</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 w-20">Qty</th>
                <th className="py-3 px-3 w-28">Length (L)</th>
                <th className="py-3 px-3 w-28">Width (B)</th>
                <th className="py-3 px-3 w-28">Thick (T)</th>
                <th className="py-3 px-3 w-24">Pc. CFT</th>
                <th className="py-3 px-3 w-24 text-right">Total CFT</th>
                <th className="py-3 px-3 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {components.map((comp, idx) => {
                const isPlywood = comp.materialType === "plywood";

                return (
                  <tr
                    key={comp.id}
                    className="hover:bg-amber-50/40 transition group"
                  >
                    {/* Name */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={comp.name}
                        onChange={(e) =>
                          onChangeComponent(comp.id, "name", e.target.value)
                        }
                        className="font-semibold text-zinc-900 bg-transparent border-b border-transparent focus:border-amber-400 outline-none w-full text-xs"
                      />
                      <div className="text-[10px] text-zinc-400 truncate">
                        {comp.subtitle || comp.description}
                      </div>
                    </td>

                    {/* Material Type Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isPlywood
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : comp.materialType === "hardwood_block"
                            ? "bg-stone-200 text-stone-800"
                            : "bg-amber-50 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {isPlywood ? "Plywood" : comp.materialType === "hardwood_block" ? "Block" : "Lumber"}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={comp.qty}
                        onChange={(e) =>
                          onChangeComponent(
                            comp.id,
                            "qty",
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-16 px-2 py-1 bg-zinc-100 group-hover:bg-white rounded border border-zinc-200 focus:border-amber-500 font-bold text-zinc-900 outline-none text-xs"
                      />
                    </td>

                    {/* Length */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="0.1"
                          step="0.25"
                          value={comp.length}
                          onChange={(e) =>
                            onChangeComponent(
                              comp.id,
                              "length",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 px-2 py-1 bg-zinc-100 group-hover:bg-white rounded border border-zinc-200 focus:border-amber-500 font-semibold text-zinc-900 outline-none text-xs"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] text-zinc-400 font-bold uppercase pointer-events-none">
                          {dimensions.unit}
                        </span>
                      </div>
                    </td>

                    {/* Width / Breadth */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="0.1"
                          step="0.25"
                          value={comp.width}
                          onChange={(e) =>
                            onChangeComponent(
                              comp.id,
                              "width",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 px-2 py-1 bg-zinc-100 group-hover:bg-white rounded border border-zinc-200 focus:border-amber-500 font-semibold text-zinc-900 outline-none text-xs"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] text-zinc-400 font-bold uppercase pointer-events-none">
                          {dimensions.unit}
                        </span>
                      </div>
                    </td>

                    {/* Thickness */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="0.05"
                          step="0.1"
                          value={comp.thickness}
                          onChange={(e) =>
                            onChangeComponent(
                              comp.id,
                              "thickness",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 px-2 py-1 bg-zinc-100 group-hover:bg-white rounded border border-zinc-200 focus:border-amber-500 font-semibold text-zinc-900 outline-none text-xs"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] text-zinc-400 font-bold uppercase pointer-events-none">
                          {dimensions.unit}
                        </span>
                      </div>
                    </td>

                    {/* Piece CFT */}
                    <td className="py-3 px-3 font-mono text-zinc-600 font-medium">
                      {comp.pieceCft.toFixed(4)}
                    </td>

                    {/* Total CFT */}
                    <td className="py-3 px-3 font-mono text-right font-bold text-amber-700">
                      {comp.totalCft.toFixed(3)}
                    </td>

                    {/* Delete action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveComponent(comp.id)}
                        title="Remove component"
                        className="p-1 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Live Calculation Footer Strip */}
        <div className="bg-zinc-50 border-t border-zinc-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs text-zinc-700">
            <div>
              <span className="text-zinc-500">Total Pieces: </span>
              <span className="font-bold text-zinc-900 text-sm">{totalPcsSum} pcs</span>
            </div>
            <div>
              <span className="text-zinc-500">Gross Outer Box CFT: </span>
              <span className="font-bold text-zinc-900 text-sm">
                {(
                  (dimensions.length * dimensions.width * dimensions.height) /
                  1728
                ).toFixed(2)}{" "}
                CFT
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Net Lumber &amp; Panel CFT: </span>
              <span className="font-bold text-amber-700 text-base">
                {totalCftSum.toFixed(3)} CFT
              </span>
            </div>
          </div>

          <button
            id="proceed-step3-bottom-btn"
            type="button"
            onClick={onProceedToStep3}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition active:scale-98"
          >
            <span>Proceed to 3D Viewer &amp; Exploded View (Step 3)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
