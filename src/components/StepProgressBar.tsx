import React from "react";
import { PageStep } from "../types";
import { Package, Sliders, Box, Calculator, FileText, CheckCircle2 } from "lucide-react";

interface StepProgressBarProps {
  currentStep: PageStep;
  onSelectStep: (step: PageStep) => void;
  completedSteps?: PageStep[];
}

interface StepItem {
  step: PageStep;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  onSelectStep,
}) => {
  const steps: StepItem[] = [
    {
      step: 1,
      title: "1. Box Type",
      subtitle: "5 Packaging Types",
      icon: <Package className="w-4 h-4" />,
    },
    {
      step: 2,
      title: "2. Component L×B×H",
      subtitle: "Piece Inputs & Add",
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      step: 3,
      title: "3. 3D View & Explode",
      subtitle: "Hover CFT & Assembly",
      icon: <Box className="w-4 h-4" />,
    },
    {
      step: 4,
      title: "4. Total CFT & Rates",
      subtitle: "Rate ₹/CFT & Wastage",
      icon: <Calculator className="w-4 h-4" />,
    },
    {
      step: 5,
      title: "5. Quotation & Share",
      subtitle: "Bill & WhatsApp Share",
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  return (
    <nav aria-label="Workflow progress" className="w-full bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-1 sm:gap-2">
          {steps.map((item, idx) => {
            const isActive = currentStep === item.step;
            const isDone = currentStep > item.step;

            return (
              <React.Fragment key={item.step}>
                <button
                  id={`step-btn-${item.step}`}
                  type="button"
                  onClick={() => onSelectStep(item.step)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition whitespace-nowrap group shrink-0 ${
                    isActive
                      ? "bg-amber-500 text-white shadow-xs font-semibold"
                      : isDone
                      ? "bg-amber-50/80 text-amber-900 hover:bg-amber-100"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      isActive
                        ? "bg-white text-amber-600 shadow-xs"
                        : isDone
                        ? "bg-amber-500 text-white"
                        : "bg-zinc-200 text-zinc-600 group-hover:bg-zinc-300"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs leading-tight font-medium">
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

                {idx < steps.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 min-w-[12px] sm:min-w-[20px] transition rounded ${
                      currentStep > item.step ? "bg-amber-500" : "bg-zinc-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
