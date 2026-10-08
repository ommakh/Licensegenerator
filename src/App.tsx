import React, { useState, useMemo, useEffect } from "react";
import {
  BoxDimensions,
  BoxTypeId,
  BoxComponentItem,
  PageStep,
  PricingState,
  CompanyDetails,
} from "./types";
import { BOX_TEMPLATES } from "./data/boxTemplates";
import { enrichComponents, generateCFTReport, computeQuotation } from "./lib/cftCalculator";
import { BottomStepNavigation } from "./components/BottomStepNavigation";
import { Page1_BoxSelector } from "./components/Page1_BoxSelector";
import { Page2_ComponentInputs } from "./components/Page2_ComponentInputs";
import { Page3_3DViewer } from "./components/Page3_3DViewer";
import { Page4_RatesAndCFT } from "./components/Page4_RatesAndCFT";
import { Page5_Quotation } from "./components/Page5_Quotation";
import { Box, Layers, PhoneCall } from "lucide-react";

const LICENSE_STORAGE_KEY = "secure_license_key";
const LICENSE_NAME_KEY = "secure_license_customer";
const LICENSE_DEVICE_KEY = "secure_license_device_id";
const LICENSE_API_BASE_URL = (
  import.meta.env.VITE_LICENSE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:4000/api" : "/api")
).replace(/\/+$/, "");

const getLicenseDeviceId = () => {
  let deviceId = window.localStorage.getItem(LICENSE_DEVICE_KEY);
  if (!deviceId) {
    deviceId = window.crypto.randomUUID();
    window.localStorage.setItem(LICENSE_DEVICE_KEY, deviceId);
  }
  return deviceId;
};

export default function App() {
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [activationError, setActivationError] = useState<string>("");
  const [isCheckingLicense, setIsCheckingLicense] = useState<boolean>(false);
  const [isLicenseActive, setIsLicenseActive] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(LICENSE_STORAGE_KEY));
  });

  useEffect(() => {
    const savedKey = typeof window !== "undefined" ? window.localStorage.getItem(LICENSE_STORAGE_KEY) : null;
    const savedCustomer = typeof window !== "undefined" ? window.localStorage.getItem(LICENSE_NAME_KEY) : null;

    if (savedKey) {
      setLicenseKeyInput(savedKey);
      if (savedCustomer) setCustomerName(savedCustomer);
      void verifyStoredLicense(savedKey);
    }
  }, []);

  const verifyStoredLicense = async (licenseKey: string) => {
    try {
      const response = await fetch(`${LICENSE_API_BASE_URL}/licenses/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey, deviceId: getLicenseDeviceId() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "License verification failed");
      }

      setIsLicenseActive(true);
      setActivationError("");
    } catch (error) {
      setActivationError(error instanceof Error ? error.message : "License invalid");
      setIsLicenseActive(false);
    }
  };

  const handleActivateLicense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedKey = licenseKeyInput.trim();
    const trimmedName = customerName.trim();

    if (!trimmedKey || !trimmedName) {
      setActivationError("Please enter your name and license key.");
      return;
    }

    setIsCheckingLicense(true);
    setActivationError("");

    try {
      const response = await fetch(`${LICENSE_API_BASE_URL}/licenses/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: trimmedKey, deviceId: getLicenseDeviceId() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "License verification failed");
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(LICENSE_STORAGE_KEY, trimmedKey);
        window.localStorage.setItem(LICENSE_NAME_KEY, trimmedName);
      }

      setIsLicenseActive(true);
      setActivationError("");
    } catch (error) {
      setActivationError(error instanceof Error ? error.message : "License validation failed");
      setIsLicenseActive(false);
    } finally {
      setIsCheckingLicense(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LICENSE_STORAGE_KEY);
      window.localStorage.removeItem(LICENSE_NAME_KEY);
    }
    setIsLicenseActive(false);
    setLicenseKeyInput("");
    setCustomerName("");
    setActivationError("");
  };

  // Step 1 to 5 Navigation
  const [currentStep, setCurrentStep] = useState<PageStep>(1);

  // Selected Box Template
  const [selectedBoxTypeId, setSelectedBoxTypeId] = useState<BoxTypeId>("type1_block_pallet");

  // Overall Dimensions
  const [dimensions, setDimensions] = useState<BoxDimensions>({
    length: 48,
    width: 40,
    height: 5.5,
    unit: "in",
  });

  // Custom components list (initialized from active template)
  const [components, setComponents] = useState<BoxComponentItem[]>(() => {
    const template = BOX_TEMPLATES.find((t) => t.id === "type1_block_pallet") || BOX_TEMPLATES[0];
    return enrichComponents(template.defaultComponents, "in");
  });

  // Optional Plywood Top Sheet active
  const [hasPlywoodTop, setHasPlywoodTop] = useState<boolean>(false);

  // Commercial Pricing & Rates (Step 4 & 5)
  const [pricing, setPricing] = useState<PricingState>({
    woodRatePerCft: 650, // Standard Indian pine/silverwood rate ~ ₹550-750/CFT
    plywoodRatePerSqFt: 48, // 12mm-18mm commercial pine plywood ~ ₹42-55/sqft
    wastagePercent: 8,
    labourCostPerBox: 350,
    hardwareFastenersCost: 150,
    gstPercent: 18,
    customPieceAdjustments: 0,
    discountAmount: 0,
  });

  // Company Information (Editable in Step 5)
  const [company, setCompany] = useState<CompanyDetails>({
    name: "Rahul Design Industrial Packaging Works",
    phone: "+91 98224 56789",
    address: "Plot 42, MIDC Industrial Area, Bhosari, Pune, Maharashtra - 411026",
    email: "contact@rahuldesignpackaging.com",
    gstin: "27AABCR1234F1Z8",
    gstNumber: "27AABCR1234F1Z8",
  });

  const [clientName, setClientName] = useState<string>("Tata AutoComp Systems Ltd.");
  const [quotationNumber, setQuotationNumber] = useState<string>("RD-QT-2025-0849");
  const [quotationDate] = useState<string>(() =>
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  );
  const [quantityBoxes, setQuantityBoxes] = useState<number>(50);

  // Active Template Object
  const currentTemplate = useMemo(() => {
    return BOX_TEMPLATES.find((t) => t.id === selectedBoxTypeId) || BOX_TEMPLATES[0];
  }, [selectedBoxTypeId]);

  // Real-time Material Report & CFT Calculation
  const report = useMemo(() => {
    return generateCFTReport(selectedBoxTypeId, dimensions, components);
  }, [selectedBoxTypeId, dimensions, components]);

  // Real-time Quotation Calculation
  const quotation = useMemo(() => {
    return computeQuotation(report, pricing, quantityBoxes);
  }, [report, pricing, quantityBoxes]);

  // Deck Option: Full Slat vs Only Blocks
  const [deckOption, setDeckOption] = useState<"full_slat" | "only_blocks">("full_slat");

  const handleSelectDeckOption = (option: "full_slat" | "only_blocks") => {
    setDeckOption(option);
    if (option === "only_blocks") {
      setComponents((prev) => {
        const withoutSlats = prev.filter(
          (c) =>
            c.category !== "DECK_SLATS" &&
            c.id !== "pal_top_slats" &&
            c.id !== "mach_deck_planks"
        );
        return enrichComponents(withoutSlats, dimensions.unit);
      });
    } else {
      const defaultDeckSlats = currentTemplate.defaultComponents.filter(
        (c) =>
          c.category === "DECK_SLATS" ||
          c.id === "pal_top_slats" ||
          c.id === "mach_deck_planks"
      );
      setComponents((prev) => {
        const hasDeck = prev.some(
          (c) =>
            c.category === "DECK_SLATS" ||
            c.id === "pal_top_slats" ||
            c.id === "mach_deck_planks"
        );
        if (hasDeck) return prev;
        const restored = [...prev, ...defaultDeckSlats];
        return enrichComponents(restored, dimensions.unit);
      });
    }
  };

  // Switch Box Type (Step 1 Selection)
  const handleSelectBox = (typeId: BoxTypeId) => {
    setSelectedBoxTypeId(typeId);
    const template = BOX_TEMPLATES.find((t) => t.id === typeId) || BOX_TEMPLATES[0];
    setDimensions(template.defaultDims);
    const newComps = enrichComponents(template.defaultComponents, template.defaultDims.unit);
    setComponents(newComps);
    setHasPlywoodTop(false);
    setDeckOption("full_slat");
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Update Components in Step 2 or Live Inputs
  const handleUpdateComponents = (newComponents: BoxComponentItem[]) => {
    setComponents(newComponents);
  };

  // Change Dimension in Step 3 Live Bar
  const handleChangeDimensions = (newDims: BoxDimensions) => {
    setDimensions(newDims);
    // scale component lengths proportionally if matching outer dimension
    setComponents((prev) =>
      prev.map((c) => {
        let updatedLength = c.length;
        let updatedWidth = c.width;

        if (
          c.category === "RUNNERS_SKIDS" ||
          c.category === "BATTENS_CLEATS" ||
          c.category === "CORNER_POSTS"
        ) {
          if (c.length === dimensions.length) updatedLength = newDims.length;
          if (c.length === dimensions.width) updatedLength = newDims.width;
        }
        return {
          ...c,
          length: updatedLength,
          width: updatedWidth,
        };
      })
    );
  };

  // Add Wooden Slat / Cleat / Ply Component
  const handleAddComponent = (type: "solid_wood" | "plywood" | "hardwood_block" = "solid_wood") => {
    const isPly = type === "plywood";
    const isBlock = type === "hardwood_block";
    const newComp: BoxComponentItem = {
      id: `custom_${Date.now()}`,
      name: isPly
        ? `Extra Plywood Sheet #${components.length + 1}`
        : isBlock
        ? `Extra Skid Spacer Block #${components.length + 1}`
        : `Extra Wooden Cleat/Slat #${components.length + 1}`,
      woodType: isPly ? "Commercial Plywood" : isBlock ? "Hardwood Jungle Wood" : "Pine / Jungle Wood",
      category: isPly ? "PLYWOOD_PANELS" : isBlock ? "SPACER_BLOCKS" : "BATTENS_CLEATS",
      materialType: type,
      qty: 1,
      length: isBlock ? 4 : dimensions.length,
      width: isPly ? dimensions.width : isBlock ? 4 : 3.5,
      thickness: isPly ? 0.47 : isBlock ? 3.5 : 0.75,
      pieceCft: 0,
      totalCft: 0,
      description: "User-added crate piece",
    };
    const enriched = enrichComponents([...components, newComp], dimensions.unit);
    setComponents(enriched);
  };

  // Legacy alias for Page 3
  const handleAddWoodenSlat = () => {
    handleAddComponent("solid_wood");
  };

  // Remove component by ID
  const handleRemoveComponent = (id: string) => {
    setComponents((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      return enrichComponents(filtered, dimensions.unit);
    });
  };

  // Update a specific field on a component (L, B, H/T, name, material, qty)
  const handleUpdateComponentField = (id: string, field: keyof BoxComponentItem, value: any) => {
    setComponents((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, [field]: value } : c));
      return enrichComponents(updated, dimensions.unit);
    });
  };

  // Toggle Plywood Top (Customizable button on Page 3)
  const handleTogglePlywoodTop = () => {
    setHasPlywoodTop(!hasPlywoodTop);
  };

  // Update piece quantity for a specific component (Page 4 user editable piece quantity)
  const handleUpdateComponentQty = (id: string, newQty: number) => {
    setComponents((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, qty: newQty } : c));
      return enrichComponents(updated, dimensions.unit);
    });
  };

  // Update line material cost for a specific component (Page 4 user editable line material cost)
  const handleUpdateComponentCost = (id: string, newCost?: number) => {
    setComponents((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, customLineCost: newCost } : c));
      return enrichComponents(updated, dimensions.unit);
    });
  };

  // Reset to Step 1
  const handleStartNew = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Full-fledged Next and Previous Step handlers
  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as PageStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleStartNew();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as PageStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!isLicenseActive) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-2xl font-black text-slate-950">
              <Box className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Software Login</h1>
            <p className="mt-2 text-sm text-slate-300">Activate your license to access the configurator.</p>
          </div>

          <form onSubmit={handleActivateLicense} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none ring-0 placeholder:text-slate-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">License Key</label>
              <input
                type="text"
                value={licenseKeyInput}
                onChange={(event) => setLicenseKeyInput(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none placeholder:text-slate-500"
                placeholder="Enter the complete license key"
              />
            </div>

            {activationError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {activationError}
              </div>
            )}

            <button
              type="submit"
              disabled={isCheckingLicense}
              className="w-full rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCheckingLicense ? "Verifying license..." : "Activate License"}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-300">
            <div className="font-semibold text-slate-100">Demo license</div>
            <div className="mt-1">Use a valid license key issued by the license administrator.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-zinc-900 font-sans flex flex-col">
      {/* Top Application Header - Clean & Minimal Wooden Crate Configurator */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shadow-xs">
              <Box className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">
                Wooden Crate Configurator
              </h1>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Step {currentStep} of 5
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Multi-Page Screen Outlet */}
      <main className="flex-1 pb-10">
        {currentStep === 1 && (
          <Page1_BoxSelector
            selectedBoxTypeId={selectedBoxTypeId}
            onSelectBox={handleSelectBox}
            onProceedToStep2={handleNextStep}
          />
        )}

        {currentStep === 2 && (
          <Page2_ComponentInputs
            boxTemplate={currentTemplate}
            dimensions={dimensions}
            components={components}
            deckOption={deckOption}
            onSelectDeckOption={handleSelectDeckOption}
            onChangeDimensions={setDimensions}
            onChangeComponent={handleUpdateComponentField}
            onAddComponent={handleAddComponent}
            onRemoveComponent={handleRemoveComponent}
            onResetComponents={() => {
              const newComps = enrichComponents(currentTemplate.defaultComponents, dimensions.unit);
              setComponents(newComps);
            }}
            onProceedToStep3={() => {
              setCurrentStep(3);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onBackToStep1={() => {
              setCurrentStep(1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {currentStep === 3 && (
          <Page3_3DViewer
            boxTemplate={currentTemplate}
            dimensions={dimensions}
            report={report}
            components={components}
            hasPlywoodTop={hasPlywoodTop}
            deckOption={deckOption}
            onSelectDeckOption={handleSelectDeckOption}
            onChangeDimensions={handleChangeDimensions}
            onTogglePlywoodTop={handleTogglePlywoodTop}
            onAddWoodenSlat={handleAddWoodenSlat}
            onAddComponent={handleAddComponent}
            onRemoveComponent={handleRemoveComponent}
            onUpdateComponent={handleUpdateComponentField}
            onBackToStep2={() => {
              setCurrentStep(2);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onProceedToStep4={() => {
              setCurrentStep(4);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {currentStep === 4 && (
          <Page4_RatesAndCFT
            boxTemplate={currentTemplate}
            report={report}
            pricing={pricing}
            quotation={quotation}
            quantityBoxes={quantityBoxes}
            onChangePricing={setPricing}
            onChangeQuantityBoxes={setQuantityBoxes}
            onChangeComponentQty={handleUpdateComponentQty}
            onChangeComponentCost={handleUpdateComponentCost}
            onAddComponent={handleAddComponent}
            onBackToStep3={() => {
              setCurrentStep(3);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onProceedToStep5={() => {
              setCurrentStep(5);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {currentStep === 5 && (
          <Page5_Quotation
            boxTemplate={currentTemplate}
            dimensions={dimensions}
            report={report}
            pricing={pricing}
            quotation={quotation}
            company={company}
            clientName={clientName}
            quotationNumber={quotationNumber}
            quotationDate={quotationDate}
            quantityBoxes={quantityBoxes}
            onUpdateCompany={setCompany}
            onUpdateClientName={setClientName}
            onUpdateQuotationNumber={setQuotationNumber}
            onUpdatePricing={setPricing}
            onUpdateQuantityBoxes={setQuantityBoxes}
            onBackToStep4={() => {
              setCurrentStep(4);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onStartNew={handleStartNew}
          />
        )}
      </main>

      {/* Full-Fledged Persistent Bottom Step Navigation (Moved from Upper to Lower as requested) */}
      <BottomStepNavigation
        currentStep={currentStep}
        onSelectStep={(step) => {
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onPrevStep={handlePrevStep}
        onNextStep={handleNextStep}
      />


    </div>
  );
}
