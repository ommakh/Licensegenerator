import React from "react";
import { BoxTypeId } from "../types";
import { BOX_TEMPLATES } from "../data/boxTemplates";
import { ArrowRight, Check, ShieldCheck, Layers, Ruler } from "lucide-react";
import { Box3DIcon } from "./Box3DIcon";

interface Page1BoxSelectorProps {
  selectedBoxId?: BoxTypeId;
  selectedBoxTypeId?: BoxTypeId;
  onSelectBox: (boxId: BoxTypeId) => void;
  onProceedToStep2?: () => void;
}

export const Page1_BoxSelector: React.FC<Page1BoxSelectorProps> = ({
  selectedBoxId,
  selectedBoxTypeId,
  onSelectBox,
  onProceedToStep2,
}) => {
  const currentBoxId = selectedBoxTypeId || selectedBoxId || "type1_block_pallet";
  const activeTemplate = BOX_TEMPLATES.find((t) => t.id === currentBoxId) || BOX_TEMPLATES[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {BOX_TEMPLATES.map((box, index) => {
          const isSelected = box.id === currentBoxId;

          return (
            <div
              key={box.id}
              id={`box-card-${box.id}`}
              onClick={() => onSelectBox(box.id)}
              className={`group relative rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden bg-white shadow-xs hover:shadow-md ${
                isSelected
                  ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              {/* Card Content */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                {/* Header Row: Small & Accurate 3D Icon + Header Info */}
                <div>
                  <div className="flex items-start gap-3.5 mb-3.5">
                    {/* Small & Accurate 3D Model Icon (Clean 58px) */}
                    <div
                      className={`w-16 h-16 rounded-xl border flex items-center justify-center shrink-0 p-1 transition-all duration-200 shadow-2xs ${
                        isSelected
                          ? "bg-amber-100/60 border-amber-300 ring-1 ring-amber-400/30 scale-102"
                          : "bg-amber-50/40 border-amber-200/70 group-hover:bg-amber-50 group-hover:border-amber-300"
                      }`}
                    >
                      <Box3DIcon boxId={box.id} size={54} />
                    </div>

                    {/* Meta info & Selection check */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[11px] font-bold text-amber-800 tracking-wider uppercase">
                          Option 0{index + 1}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                            isSelected
                              ? "bg-amber-500 text-white"
                              : "border border-zinc-300 bg-zinc-50"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 leading-snug">
                        {box.title}
                      </h3>
                      <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-800 bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                        <span className="truncate">{box.specStandard || box.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-3">
                    {box.shortDesc}
                  </p>

                  {/* Factory Standard Dimensions Pill */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-stone-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 mb-3.5">
                    <Ruler className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="text-[11px] text-zinc-500 font-medium">Std Size:</span>
                    <span className="font-bold text-zinc-800 font-mono text-[11px]">
                      {box.defaultDims.length}&quot; × {box.defaultDims.width}&quot; × {box.defaultDims.height}&quot;
                    </span>
                  </div>

                  {/* Key Features / Assembly points */}
                  <div className="space-y-1 mb-4">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-600" />
                      Assembly Components
                    </div>
                    <ul className="text-xs text-zinc-600 space-y-1">
                      {box.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBox(box.id);
                    if (onProceedToStep2) onProceedToStep2();
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    isSelected
                      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                  }`}
                >
                  <span>{isSelected ? "Configure This Box (Next)" : "Select This Type"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Box Overview Bottom Bar */}
      <div className="mt-8 bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-14 h-14 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-center shrink-0 p-1 shadow-2xs">
            <Box3DIcon boxId={activeTemplate.id} size={48} />
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-700 uppercase flex items-center gap-1">
              <span>Current Selection</span>
              <span className="text-zinc-400">&bull;</span>
              <span className="text-zinc-500 font-medium">Ready to Configure</span>
            </div>
            <div className="text-base font-bold text-zinc-900">
              {activeTemplate.title}
            </div>
            <div className="text-xs text-zinc-500">
              {activeTemplate.defaultComponents.length} components ready for L × B × H entry &bull; Std: {activeTemplate.defaultDims.length}&quot; × {activeTemplate.defaultDims.width}&quot; × {activeTemplate.defaultDims.height}&quot;
            </div>
          </div>
        </div>

        <button
          id="proceed-step2-bottom-btn"
          type="button"
          onClick={onProceedToStep2}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-xs transition active:scale-98 shrink-0"
        >
          <span>Step 2: Enter Component L×B×H Values</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
