import React from "react";
import { PageStep } from "../types";
import {
  Package,
  Sliders,
  Box,
  Calculator,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

interface BottomStepNavigationProps {
  currentStep: PageStep;
  onSelectStep: (step: PageStep) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

interface StepItem {
  step: PageStep;
  title: string;
  subtitle: string;
  nextButtonLabel: string;
  icon: React.ReactNode;
}

export const BottomStepNavigation: React.FC<BottomStepNavigationProps> = ({
  currentStep,
  onSelectStep,
  onPrevStep,
  onNextStep,
}) => {
  const steps: StepItem[] = [
    {
      step: 1,
      title: "1. Box Type",
      subtitle: "5 Packaging Types",
      nextButtonLabel: "Next: Component L×B×H",
      icon: <Package className="w-3.5 h-3.5" />,
    },
    {
      step: 2,
      title: "2. Component L×B×H",
      subtitle: "Piece Inputs & Add",
      nextButtonLabel: "Next: 3D View & Explode",
      icon: <Sliders className="w-3.5 h-3.5" />,
    },
    {
      step: 3,
      title: "3. 3D View & Explode",
      subtitle: "Hover CFT & Assembly",
      nextButtonLabel: "Next: Total CFT & Rates",
      icon: <Box className="w-3.5 h-3.5" />,
    },
    {
      step: 4,
      title: "4. Total CFT & Rates",
      subtitle: "Rate ₹/CFT & Wastage",
      nextButtonLabel: "Next: Quotation & PDF",
      icon: <Calculator className="w-3.5 h-3.5" />,
    },
    {
      step: 5,
      title: "5. Quotation & Share",
      subtitle: "Bill & WhatsApp Share",
      nextButtonLabel: "Start New Box",
      icon: <FileText className="w-3.5 h-3.5" />,
    },
  ];

  const currentStepData = steps.find((s) => s.step === currentStep) || steps[0];
  const prevStepData = steps.find((s) => s.step === currentStep - 1);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 5;

  return (
    <footer
      aria-label="Workflow step navigation"
      className="sticky bottom-0 z-40 w-full bg-white/95 backdrop-blur-md border-t-2 border-amber-500/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-2.5 px-3 sm:px-6 print:hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Mobile top mini-indicator (visible on very small screens) */}
        <div className="flex md:hidden items-center justify-between w-full text-xs font-semibold text-zinc-600 pb-1 border-b border-zinc-100">
          <span className="text-amber-700 font-bold">
            Step {currentStep} of 5: {currentStepData.title}
          </span>
          <span className="text-[11px] text-zinc-400">
            {currentStepData.subtitle}
          </span>
        </div>

        {/* Left: Previous Step Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start order-2 md:order-1">
          <button
            id="bottom-prev-step-btn"
            type="button"
            disabled={isFirstStep}
            onClick={onPrevStep}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              isFirstStep
                ? "opacity-30 cursor-not-allowed bg-zinc-100 text-zinc-400 border-zinc-200"
                : "bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 shadow-xs hover:border-zinc-400 active:scale-95"
            }`}
          >
            <ChevronLeft className="w-4 h-4 text-zinc-600" />
            <span>
              {isFirstStep
                ? "Previous"
                : prevStepData
                ? `Back: ${prevStepData.title.split(". ")[1]}`
                : "Previous Step"}
            </span>
          </button>

          {/* Mobile Right: Next Step Button */}
          <div className="md:hidden">
            <button
              id="bottom-next-step-btn-mobile"
              type="button"
              onClick={onNextStep}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-md transition"
            >
              <span>{isLastStep ? "New Calculation" : "Next Step"}</span>
              {isLastStep ? (
                <RotateCcw className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Center: The 5-Step Progress Bar as shown in image (Moved from Upper to Lower) */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-3xl px-2 order-2">
          <div className="flex items-center justify-between w-full gap-1 lg:gap-2">
            {steps.map((item, idx) => {
              const isActive = currentStep === item.step;
              const isDone = currentStep > item.step;

              return (
                <React.Fragment key={item.step}>
                  <button
                    id={`bottom-step-pill-${item.step}`}
                    type="button"
                    onClick={() => onSelectStep(item.step)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left transition whitespace-nowrap group shrink-0 ${
                      isActive
                        ? "bg-amber-500 text-white shadow-sm font-semibold scale-102"
                        : isDone
                        ? "bg-amber-50 text-amber-900 hover:bg-amber-100/90 border border-amber-200/60"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition shrink-0 ${
                        isActive
                          ? "bg-white text-amber-600 shadow-xs"
                          : isDone
                          ? "bg-amber-500 text-white"
                          : "bg-zinc-200 text-zinc-600 group-hover:bg-zinc-300"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                    </div>

                    <div className="text-left">
                      <div
                        className={`text-xs leading-tight font-medium ${
                          isActive ? "text-white font-bold" : "text-zinc-800"
                        }`}
                      >
                        {item.title}
                      </div>
                      <div
                        className={`text-[10px] leading-none ${
                          isActive ? "text-amber-100" : "text-zinc-400"
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </button>

                  {/* Connecting Line Between Steps (Orange if completed, Zinc if upcoming) */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-[2px] flex-1 min-w-[12px] lg:min-w-[18px] transition-colors rounded-full ${
                        currentStep > item.step ? "bg-amber-500" : "bg-zinc-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right: Desktop Next Step Button */}
        <div className="hidden md:flex items-center gap-2 order-3 shrink-0">
          <button
            id="bottom-next-step-btn"
            type="button"
            onClick={onNextStep}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <span>{currentStepData.nextButtonLabel}</span>
            {isLastStep ? (
              <RotateCcw className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};
