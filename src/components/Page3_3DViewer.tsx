import React, { useState } from "react";
import {
  BoxCFTReport,
  BoxComponentItem,
  BoxDimensions,
  BoxTypeDefinition,
  CameraPresetView,
} from "../types";
import { Box3DViewer } from "./Box3DViewer";
import { ComponentEditorModal } from "./ComponentEditorModal";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Layers,
  Plus,
  Eye,
  Sliders,
  Sparkles,
  Compass,
  Edit3,
  Trash2,
  PackagePlus,
  MousePointerClick,
  Info,
} from "lucide-react";

interface Page33DViewerProps {
  boxTemplate: BoxTypeDefinition;
  dimensions: BoxDimensions;
  report: BoxCFTReport;
  components: BoxComponentItem[];
  hasPlywoodTop: boolean;
  deckOption?: "full_slat" | "only_blocks";
  onSelectDeckOption?: (option: "full_slat" | "only_blocks") => void;
  onChangeDimensions: (newDims: BoxDimensions) => void;
  onTogglePlywoodTop: () => void;
  onAddWoodenSlat: () => void;
  onAddComponent?: (type?: "solid_wood" | "plywood" | "hardwood_block") => void;
  onRemoveComponent?: (id: string) => void;
  onUpdateComponent?: (id: string, field: keyof BoxComponentItem, value: any) => void;
  onBackToStep2: () => void;
  onProceedToStep4: () => void;
}

export const Page3_3DViewer: React.FC<Page33DViewerProps> = ({
  boxTemplate,
  dimensions,
  report,
  components,
  hasPlywoodTop,
  deckOption = "full_slat",
  onSelectDeckOption,
  onChangeDimensions,
  onTogglePlywoodTop,
  onAddWoodenSlat,
  onAddComponent,
  onRemoveComponent,
  onUpdateComponent,
  onBackToStep2,
  onProceedToStep4,
}) => {
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [isLidOpen, setIsLidOpen] = useState<boolean>(false);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetView | null>(null);
  const [inspectedComp, setInspectedComp] = useState<BoxComponentItem | null>(null);

  // Component Editor Modal state
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);

  // Toggle Explode between 0 and 1
  const toggleExplode = () => {
    setExplodeFactor((prev) => (prev > 0.05 ? 0 : 0.85));
  };

  // Handle double click from 3D canvas
  const handleDoubleClick3D = (comp: BoxComponentItem | null) => {
    if (comp) {
      setSelectedCompId(comp.id);
    } else {
      setSelectedCompId(components[0]?.id || null);
    }
    setIsEditorModalOpen(true);
  };

  // Handle open editor for specific component from list
  const handleOpenEditComponent = (comp: BoxComponentItem) => {
    setSelectedCompId(comp.id);
    setIsEditorModalOpen(true);
  };

  // Fallback add component handler
  const handleAddDefault = (type: "solid_wood" | "plywood" | "hardwood_block" = "solid_wood") => {
    if (onAddComponent) {
      onAddComponent(type);
    } else {
      onAddWoodenSlat();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Box className="w-4 h-4" />
            <span>Step 3 of 5 &bull; 3D Assembly &amp; Exploded Inspection</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            {boxTemplate.title}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Double-click any box piece to edit L × B × H / T or add/remove components. Use Exploded View to separate pieces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToStep2}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit L×B×H Table</span>
          </button>

          <button
            id="proceed-step4-top-btn"
            type="button"
            onClick={onProceedToStep4}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <span>Step 4: Total CFT &amp; Rates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Double-Click Interactive Hint Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300 rounded-2xl p-3.5 mb-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MousePointerClick className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-amber-950 flex items-center gap-2">
              <span>Interactive 3D Double-Click Active</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-mono font-bold uppercase">
                L × B × H / T Editor
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-0.5">
              Double-click directly on any part in the 3D viewer below to open the editable dimensions popup and modify or remove components.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="open-editor-quick-btn"
            type="button"
            onClick={() => {
              setSelectedCompId(components[0]?.id || null);
              setIsEditorModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit L × B × H / T</span>
          </button>

          <button
            id="quick-add-component-page3"
            type="button"
            onClick={() => handleAddDefault("solid_wood")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Component</span>
          </button>
        </div>
      </div>

      {/* Live Editable Overall L×B×H Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <Sliders className="w-3.5 h-3.5 text-amber-700" />
              Overall Outer L × B × H:
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Length */}
              <div className="flex items-center bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200">
                <span className="text-[11px] font-bold text-zinc-400 mr-1.5">L:</span>
                <input
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
                  className="w-14 text-xs font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
                />
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  {dimensions.unit}
                </span>
              </div>

              {/* Width / Breadth */}
              <div className="flex items-center bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200">
                <span className="text-[11px] font-bold text-zinc-400 mr-1.5">B:</span>
                <input
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
                  className="w-14 text-xs font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
                />
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  {dimensions.unit}
                </span>
              </div>

              {/* Height */}
              <div className="flex items-center bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200">
                <span className="text-[11px] font-bold text-zinc-400 mr-1.5">H:</span>
                <input
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
                  className="w-14 text-xs font-extrabold text-zinc-900 bg-transparent outline-none focus:text-amber-600"
                />
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  {dimensions.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Customization Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            {onSelectDeckOption && (
              <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => onSelectDeckOption("full_slat")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    deckOption === "full_slat"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                  title="Full Slat covering top deck"
                >
                  🪵 Full Slat
                </button>
                <button
                  type="button"
                  onClick={() => onSelectDeckOption("only_blocks")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    deckOption === "only_blocks"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                  title="Only Blocks and base runners/stringers"
                >
                  🧱 Only Blocks
                </button>
              </div>
            )}

            {boxTemplate.hasPlywoodOption && (
              <button
                type="button"
                onClick={onTogglePlywoodTop}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                  hasPlywoodTop
                    ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                    : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300"
                }`}
              >
                {hasPlywoodTop ? "✓ Plywood Top Active" : "+ Add Plywood Sheet"}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsLidOpen(!isLidOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                isLidOpen
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300"
              }`}
            >
              {isLidOpen ? "Close Top Lid" : "Open Top Lid"}
            </button>
          </div>
        </div>
      </div>

      {/* 3D Viewport Section with Controls Overlay */}
      <div className="relative w-full h-[520px] bg-slate-900/5 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
        {/* The 3D Canvas */}
        <Box3DViewer
          report={report}
          dims={dimensions}
          boxType={boxTemplate.id}
          lidOpenAngle={isLidOpen ? 1 : 0}
          explodeFactor={explodeFactor}
          showDimensions={showDimensions}
          hasPlywoodTop={hasPlywoodTop}
          deckMode={deckOption}
          cameraPreset={cameraPreset}
          onHoverComponent={(comp) => setInspectedComp(comp)}
          onDoubleClickComponent={handleDoubleClick3D}
        />

        {/* Floating Hint in Viewport */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <div className="bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700/80 text-white flex items-center gap-2 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold">
              Double-click any part to edit L×B×H/T
            </span>
          </div>
        </div>

        {/* Top Controls Overlay: Exploded View Button & Slider */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2.5">
          {/* Big Exploded View Button */}
          <button
            id="exploded-view-btn"
            type="button"
            onClick={toggleExplode}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 ${
              explodeFactor > 0.05
                ? "bg-amber-500 text-zinc-950 ring-2 ring-amber-400"
                : "bg-zinc-900/85 hover:bg-zinc-900 text-white backdrop-blur-md"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {explodeFactor > 0.05 ? "💥 Exploded Assembly (Active)" : "💥 Exploded View (Open Assembly)"}
            </span>
          </button>

          {/* Explode Factor Slider */}
          <div className="bg-zinc-900/85 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-zinc-700 shadow-md flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Explode:
            </span>
            <input
              id="explode-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodeFactor}
              onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
              className="w-24 accent-amber-500 cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
            />
            <span className="text-[11px] font-mono text-zinc-300 w-8 text-right">
              {Math.round(explodeFactor * 100)}%
            </span>
          </div>

          {/* Dimensions Overlay Toggle */}
          <button
            type="button"
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md border transition ${
              showDimensions
                ? "bg-sky-600/90 text-white border-sky-400"
                : "bg-zinc-900/70 text-zinc-300 border-zinc-700"
            }`}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" />
            <span>3D Dimensions</span>
          </button>
        </div>

        {/* Bottom Floating Bar: Camera Presets */}
        <div className="absolute bottom-4 right-4 z-20 bg-zinc-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700 shadow-md flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-400 mr-1" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase mr-1">
            Angle:
          </span>
          {(["FRONT", "LEFT", "RIGHT", "BACK", "TOP", "ISO"] as CameraPresetView[]).map(
            (preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCameraPreset(preset)}
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition uppercase ${
                  cameraPreset === preset
                    ? "bg-amber-500 text-zinc-900"
                    : "text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {preset}
              </button>
            )
          )}
        </div>
      </div>

      {/* Component Cut-List & Quick Edit / Remove Table */}
      <div className="mt-4 bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-zinc-200">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Components &amp; Battens Cut-List ({components.length} parts)</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Click &quot;Edit (L×B×H/T)&quot; on any item or double-click it in the 3D model above to customize dimensions. Click &quot;Remove&quot; to delete.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAddDefault("solid_wood")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Slat / Batten</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddDefault("plywood")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-semibold transition"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>+ Add Ply Sheet</span>
            </button>
          </div>
        </div>

        {/* Component Cut-List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {components.map((comp) => {
            const isPly = comp.materialType === "plywood";
            return (
              <div
                key={comp.id}
                onDoubleClick={() => handleOpenEditComponent(comp)}
                className="bg-zinc-50 hover:bg-amber-50/40 border border-zinc-200 hover:border-amber-300 rounded-2xl p-3 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-zinc-900 block truncate">
                        {comp.name}
                      </span>
                      {comp.subtitle && (
                        <span className="text-[10px] text-zinc-400 block truncate">
                          {comp.subtitle}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isPly
                          ? "bg-orange-100 text-orange-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isPly ? "PLY" : "WOOD"} ×{comp.qty}
                    </span>
                  </div>

                  {/* L × B × H / T readout */}
                  <div className="mt-2 bg-white rounded-xl p-2 border border-zinc-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase">
                        Cut Dimensions (L × B × T)
                      </div>
                      <div className="text-xs font-extrabold text-amber-900 font-mono">
                        {comp.length}&quot; × {comp.width}&quot; × {comp.thickness}&quot;
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-400 font-bold uppercase">Line CFT</div>
                      <div className="text-xs font-extrabold text-zinc-800 font-mono">
                        {comp.totalCft.toFixed(3)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit & Remove Action Buttons */}
                <div className="mt-2.5 pt-2 border-t border-zinc-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditComponent(comp)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-[11px] font-bold transition"
                  >
                    <Edit3 className="w-3 h-3 text-amber-700" />
                    <span>Edit (L×B×H/T)</span>
                  </button>

                  {onRemoveComponent && (
                    <button
                      type="button"
                      onClick={() => onRemoveComponent(comp.id)}
                      title="Remove this component from crate"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-100 text-zinc-400 hover:text-red-700 text-[11px] font-semibold transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Status & CFT Summary Footer */}
      <div className="mt-4 bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Active Hover Inspector
          </div>
          {inspectedComp ? (
            <div className="mt-1">
              <span className="font-bold text-base text-zinc-900">
                {inspectedComp.name}
              </span>{" "}
              <span className="text-xs text-zinc-500">
                ({inspectedComp.subtitle || inspectedComp.woodType})
              </span>
              <div className="text-xs text-zinc-700 mt-0.5">
                Cut:{" "}
                <strong className="text-amber-800">
                  {inspectedComp.length}&quot; × {inspectedComp.width}&quot; × {inspectedComp.thickness}&quot;
                </strong>{" "}
                &bull; Qty: <strong>{inspectedComp.qty} pcs</strong> &bull; Total Line CFT:{" "}
                <strong className="text-amber-700 font-bold">
                  {inspectedComp.totalCft.toFixed(3)} CFT
                </strong>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 mt-1">
              Move cursor over any plank or batten in 3D to inspect. Double-click on any piece to edit its values.
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-zinc-400 font-bold uppercase">
              Total Timber CFT
            </div>
            <div className="text-xl font-black text-amber-700">
              {report.totalWoodCft.toFixed(3)} CFT
            </div>
          </div>

          <button
            id="proceed-step4-bottom-btn"
            type="button"
            onClick={onProceedToStep4}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition active:scale-98"
          >
            <span>Step 4: Total CFT &amp; Pricing Rates</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Double-Click Component Dimensions (L × B × H / T) Editor Modal */}
      <ComponentEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        components={components}
        selectedComponentId={selectedCompId}
        onSelectComponentId={(id) => setSelectedCompId(id)}
        onUpdateComponent={(id, field, value) => {
          if (onUpdateComponent) {
            onUpdateComponent(id, field, value);
          }
        }}
        onAddComponent={(type) => {
          handleAddDefault(type);
        }}
        onRemoveComponent={(id) => {
          if (onRemoveComponent) {
            onRemoveComponent(id);
          }
        }}
        dimensions={dimensions}
        onChangeDimensions={onChangeDimensions}
      />
    </div>
  );
};
