import React, { useState, useId, useEffect } from "react";
import {
  BoxCFTReport,
  BoxDimensions,
  BoxTypeDefinition,
  CompanyDetails,
  PricingState,
  QuotationCalculation,
} from "../types";
import {
  generateVectorQuotationPDF,
  downloadPdfBlob,
  openPdfInNewTab,
  EditableQuotationPDFData,
} from "../lib/pdfGenerator";
import { numberToIndianWords } from "../lib/cftCalculator";
import {
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Building2,
  FileText,
  MessageCircle,
  Download,
  Loader2,
  ShieldCheck,
  ExternalLink,
  Info,
  RefreshCw,
  Edit3,
  Plus,
  Trash2,
  RotateCcw,
  Calculator,
  SlidersHorizontal,
  FileDown,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { InteractiveCFTCalculatorModal } from "./InteractiveCFTCalculatorModal";

interface Page5QuotationProps {
  boxTemplate: BoxTypeDefinition;
  dimensions: BoxDimensions;
  report: BoxCFTReport;
  pricing: PricingState;
  quotation: QuotationCalculation;
  company: CompanyDetails;
  clientName: string;
  quotationNumber: string;
  quotationDate: string;
  quantityBoxes: number;
  onUpdateCompany: (company: CompanyDetails) => void;
  onUpdateClientName: (name: string) => void;
  onUpdateQuotationNumber: (num: string) => void;
  onUpdatePricing?: (newPricing: PricingState) => void;
  onUpdateQuantityBoxes?: (qty: number) => void;
  onBackToStep4: () => void;
  onStartNew: () => void;
}

export const Page5_Quotation: React.FC<Page5QuotationProps> = ({
  boxTemplate,
  dimensions,
  report,
  pricing,
  quotation,
  company,
  clientName,
  quotationNumber,
  quotationDate,
  quantityBoxes,
  onUpdateCompany,
  onUpdateClientName,
  onUpdateQuotationNumber,
  onUpdatePricing,
  onUpdateQuantityBoxes,
  onBackToStep4,
  onStartNew,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isConvertingPdf, setIsConvertingPdf] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [lastPdfBlob, setLastPdfBlob] = useState<Blob | null>(null);
  const [downloadedPdfName, setDownloadedPdfName] = useState<string>("");
  const [showWhatsAppHelpModal, setShowWhatsAppHelpModal] = useState<boolean>(false);
  const [clientGstin, setClientGstin] = useState<string>("");
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState<boolean>(false);
  const [recalcSuccessMessage, setRecalcSuccessMessage] = useState<string | null>(null);

  // ====== FULLY EDITABLE QUOTATION STATE ======
  // Quotation Metadata
  const [editDate, setEditDate] = useState<string>(quotationDate);
  const [editValidity, setEditValidity] = useState<string>("30 Days from date of issue");
  const [editPaymentTerms, setEditPaymentTerms] = useState<string>("50% Advance with PO, Balance against Delivery");
  const [editDeliveryTerms, setEditDeliveryTerms] = useState<string>("3 to 5 working days from formal PO confirmation");
  const [editClientAddress, setEditClientAddress] = useState<string>("");

  // Product / Packaging Sizing & Specs
  const [editItemTitle, setEditItemTitle] = useState<string>(boxTemplate.title);
  const [editDimensionsText, setEditDimensionsText] = useState<string>(
    `${dimensions.length}" L × ${dimensions.width}" B × ${dimensions.height}" H (${dimensions.unit})`
  );
  const [editTimberCftText, setEditTimberCftText] = useState<string>(`${report.totalWoodCft.toFixed(3)} CFT`);
  const [editSpecifications, setEditSpecifications] = useState<string>(
    `Includes precision timber cut sizes, nailing, heavy-duty strapping & industrial assembly.`
  );

  // Quantity & Commercial Rates
  const [editBatchQty, setEditBatchQty] = useState<number>(quantityBoxes);
  const [editUnitRate, setEditUnitRate] = useState<number>(quotation.unitCostBeforeTax);
  const [editSubtotal, setEditSubtotal] = useState<number>(quotation.totalBeforeTax);
  const [editRawMaterialCost, setEditRawMaterialCost] = useState<number>(
    quotation.woodCost + quotation.plywoodCost
  );
  const [editWastageCost, setEditWastageCost] = useState<number>(quotation.wastageCost);
  const [editLabourHardwareCost, setEditLabourHardwareCost] = useState<number>(
    quotation.labourCost + quotation.hardwareCost
  );
  const [editDiscountAmount, setEditDiscountAmount] = useState<number>(pricing.discountAmount || 0);
  const [editGstPercent, setEditGstPercent] = useState<number>(pricing.gstPercent || 18);
  const [editGstAmount, setEditGstAmount] = useState<number>(quotation.gstAmount);
  const [editGrandTotal, setEditGrandTotal] = useState<number>(quotation.grandTotal);
  const [editAmountInWords, setEditAmountInWords] = useState<string>(
    quotation.amountInWords || numberToIndianWords(quotation.grandTotal)
  );

  // Synchronize when underlying quotation, pricing, or quantity change from Step 4 or Modal
  useEffect(() => {
    setEditBatchQty(quantityBoxes);
    setEditUnitRate(quotation.unitCostBeforeTax);
    setEditSubtotal(quotation.totalBeforeTax);
    setEditRawMaterialCost(quotation.woodCost + quotation.plywoodCost);
    setEditWastageCost(quotation.wastageCost);
    setEditLabourHardwareCost(quotation.labourCost + quotation.hardwareCost);
    setEditDiscountAmount(pricing.discountAmount || 0);
    setEditGstPercent(pricing.gstPercent ?? 18);
    setEditGstAmount(quotation.gstAmount);
    setEditGrandTotal(quotation.grandTotal);
    setEditAmountInWords(quotation.amountInWords || numberToIndianWords(quotation.grandTotal));
    setEditTimberCftText(`${report.totalWoodCft.toFixed(3)} CFT`);
  }, [quotation, quantityBoxes, pricing, report.totalWoodCft]);

  // Editable Terms & Commercial Conditions list
  const [editTerms, setEditTerms] = useState<string[]>([
    `Lumber Rate calculated according to packaging standards.`,
    report.totalPlywoodSqFt > 0
      ? `Plywood sheet calculated @ ₹${pricing.plywoodRatePerSqFt}/Sq.Ft.`
      : `Selected seasoned timber for industrial export packaging.`,
    `Includes ${pricing.wastagePercent}% sizing and cutting allowance.`,
    `Wood seasoned & inspected according to packaging standards.`,
    `GST charged @ ${pricing.gstPercent}% with Input Tax Credit (ITC) applicability.`,
    `Quotation valid for 30 days from date of issue.`,
  ]);
  const [newTermInput, setNewTermInput] = useState<string>("");

  // Signatory & Notes
  const [editNotes, setEditNotes] = useState<string>("");
  const [editPreparedBy, setEditPreparedBy] = useState<string>(company.proprietorName || company.name);
  const [editSignatoryTitle, setEditSignatoryTitle] = useState<string>(`For ${company.name}`);

  // Visual toggle for editing assistance
  const [showEditHelp, setShowEditHelp] = useState<boolean>(true);

  const currentGstin = company.gstin || company.gstNumber || "";

  // Auto-recalculate Subtotal, GST and Grand Total from Unit Rate and Quantity
  const handleAutoRecalculateTotals = (
    unitRate?: number,
    qty: number = editBatchQty,
    gstPct: number = editGstPercent,
    discount: number = editDiscountAmount
  ) => {
    // If unitRate wasn't explicitly passed, re-verify from commercial breakdown
    const breakdownPerBox = editRawMaterialCost + editWastageCost + editLabourHardwareCost;
    const finalUnitRate = unitRate !== undefined ? unitRate : (breakdownPerBox > 0 ? breakdownPerBox : editUnitRate);
    const sub = Math.max(0, Math.round(finalUnitRate * qty - discount));
    const gst = Math.round(sub * (gstPct / 100));
    const grand = sub + gst;

    setEditUnitRate(finalUnitRate);
    setEditSubtotal(sub);
    setEditGstAmount(gst);
    setEditGrandTotal(grand);
    const words = numberToIndianWords(grand);
    setEditAmountInWords(words);

    setRecalcSuccessMessage(
      `✓ Recalculated Totals: Unit Rate ₹${finalUnitRate.toLocaleString("en-IN")} × ${qty} boxes - ₹${discount} disc = Subtotal ₹${sub.toLocaleString("en-IN")}, GST (${gstPct}%): ₹${gst.toLocaleString("en-IN")}, Grand Total: ₹${grand.toLocaleString("en-IN")}`
    );
    setTimeout(() => setRecalcSuccessMessage(null), 5000);
  };

  // Reset all edited fields back to the CFT formula calculation
  const handleResetToFormula = () => {
    setEditDate(quotationDate);
    setEditValidity("30 Days from date of issue");
    setEditPaymentTerms("50% Advance with PO, Balance against Delivery");
    setEditDeliveryTerms("3 to 5 working days from formal PO confirmation");
    setEditItemTitle(boxTemplate.title);
    setEditDimensionsText(
      `${dimensions.length}" L × ${dimensions.width}" B × ${dimensions.height}" H (${dimensions.unit})`
    );
    setEditTimberCftText(`${report.totalWoodCft.toFixed(3)} CFT`);
    setEditSpecifications(
      `Includes precision timber cut sizes, nailing, heavy-duty strapping & industrial assembly.`
    );
    setEditBatchQty(quantityBoxes);
    setEditUnitRate(quotation.unitCostBeforeTax);
    setEditSubtotal(quotation.totalBeforeTax);
    setEditRawMaterialCost(quotation.woodCost + quotation.plywoodCost);
    setEditWastageCost(quotation.wastageCost);
    setEditLabourHardwareCost(quotation.labourCost + quotation.hardwareCost);
    setEditDiscountAmount(pricing.discountAmount || 0);
    setEditGstPercent(pricing.gstPercent || 18);
    setEditGstAmount(quotation.gstAmount);
    setEditGrandTotal(quotation.grandTotal);
    setEditAmountInWords(quotation.amountInWords || numberToIndianWords(quotation.grandTotal));
    setEditTerms([
      `Lumber Rate calculated according to packaging standards.`,
      report.totalPlywoodSqFt > 0
        ? `Plywood sheet calculated @ ₹${pricing.plywoodRatePerSqFt}/Sq.Ft.`
        : `Selected seasoned timber for industrial export packaging.`,
      `Includes ${pricing.wastagePercent}% sizing and cutting allowance.`,
      `Wood seasoned & inspected according to packaging standards.`,
      `GST charged @ ${pricing.gstPercent}% with Input Tax Credit (ITC) applicability.`,
      `Quotation valid for 30 days from date of issue.`,
    ]);
    setRecalcSuccessMessage("✓ Reset complete: All commercial values reverted to exact CFT engineering formula.");
    setTimeout(() => setRecalcSuccessMessage(null), 4000);
  };

  // Construct current editable data package for vector PDF & WhatsApp
  const buildCurrentPdfData = (): EditableQuotationPDFData => {
    return {
      company: {
        name: company.name,
        tagline: company.tagline || "INDUSTRIAL PACKAGING & WOODEN WORKS • RAHUL DESIGN",
        address: company.address,
        phone: company.phone,
        email: company.email,
        gstin: currentGstin,
      },
      quotationNumber: quotationNumber || "RD-QT-2026-001",
      quotationDate: editDate,
      validityDays: editValidity,
      paymentTerms: editPaymentTerms,
      deliveryTerms: editDeliveryTerms,
      clientName: clientName || "Valued Customer",
      clientGstin: clientGstin,
      clientAddress: editClientAddress,
      itemTitle: editItemTitle,
      dimensionsText: editDimensionsText,
      timberCftText: editTimberCftText,
      specificationsText: editSpecifications,
      quantityBoxes: editBatchQty,
      unitRate: editUnitRate,
      totalBeforeTax: editSubtotal,
      rawMaterialCost: editRawMaterialCost,
      wastageCost: editWastageCost,
      labourHardwareCost: editLabourHardwareCost,
      discountAmount: editDiscountAmount,
      gstPercent: editGstPercent,
      gstAmount: editGstAmount,
      grandTotal: editGrandTotal,
      amountInWords: editAmountInWords,
      terms: editTerms,
      notes: editNotes,
      preparedBy: editPreparedBy,
      signatoryTitle: editSignatoryTitle,
    };
  };

  // Generate clean WhatsApp Quotation Text
  const getShareableText = (pdfAttachedNotice: boolean = false) => {
    return (
      `*COMMERCIAL QUOTATION - ${company.name.toUpperCase()}*\n` +
      `Ref: ${quotationNumber} | Date: ${editDate}\n` +
      (currentGstin ? `GSTIN: ${currentGstin}\n` : "") +
      `Client: ${clientName || "Valued Customer"}\n` +
      (clientGstin ? `Client GSTIN: ${clientGstin}\n` : "") +
      `--------------------------------------\n` +
      `📦 *Box Item:* ${editItemTitle}\n` +
      `📐 *Dimensions:* ${editDimensionsText}\n` +
      `🪵 *Timber CFT:* ${editTimberCftText}\n` +
      `📦 *Quantity:* ${editBatchQty} Units\n` +
      `--------------------------------------\n` +
      `💰 *Unit Rate (Excl. Tax):* ₹${editUnitRate.toLocaleString("en-IN")}\n` +
      `📊 *Subtotal (${editBatchQty} units):* ₹${editSubtotal.toLocaleString("en-IN")}\n` +
      `🏛️ *GST (${editGstPercent}%):* ₹${editGstAmount.toLocaleString("en-IN")}\n` +
      `⭐ *GRAND TOTAL:* ₹${editGrandTotal.toLocaleString("en-IN")}\n` +
      `In words: ${editAmountInWords}\n` +
      `--------------------------------------\n` +
      (pdfAttachedNotice ? `📎 *Official PDF Document generated & ready.*\n` : "") +
      `📞 Contact: ${company.phone || "+91-9822456789"}\n` +
      `📍 Works: ${company.address}\n` +
      `Rahul Design Packaging CFT & Costing System`
    );
  };

  // 1. Download PDF directly (Using guaranteed vector PDF generator)
  const handleDownloadPdf = async () => {
    try {
      setIsConvertingPdf(true);
      setPdfSuccessMessage("Generating professional vector PDF...");

      const pdfData = buildCurrentPdfData();
      const { blob, filename } = generateVectorQuotationPDF(pdfData);

      setLastPdfBlob(blob);
      setDownloadedPdfName(filename);
      downloadPdfBlob(blob, filename);

      setPdfSuccessMessage(`✅ PDF saved as "${filename}" in Downloads.`);
      setTimeout(() => setPdfSuccessMessage(null), 6000);
    } catch (err: any) {
      console.error("PDF generation error:", err);
      alert("Error generating PDF: " + (err?.message || "Please check details and retry."));
    } finally {
      setIsConvertingPdf(false);
    }
  };

  // 2. Open PDF in a New Tab
  const handleOpenPdfInNewTab = () => {
    try {
      const pdfData = buildCurrentPdfData();
      const { blob } = generateVectorQuotationPDF(pdfData);
      setLastPdfBlob(blob);
      openPdfInNewTab(blob);
    } catch (err: any) {
      console.error("Open PDF error:", err);
      alert("Unable to open PDF preview: " + (err?.message || "Retry."));
    }
  };

  // 3. Convert PDF and Send to WhatsApp
  const handleConvertAndSendWhatsApp = async () => {
    try {
      setIsConvertingPdf(true);
      setPdfSuccessMessage("Preparing quotation PDF & WhatsApp link...");

      const pdfData = buildCurrentPdfData();
      const { blob, filename } = generateVectorQuotationPDF(pdfData);
      setLastPdfBlob(blob);
      setDownloadedPdfName(filename);
      downloadPdfBlob(blob, filename);

      setShowWhatsAppHelpModal(true);

      const message = encodeURIComponent(getShareableText(true));
      const whatsappUrl = `https://wa.me/?text=${message}`;
      window.open(whatsappUrl, "_blank");

      setPdfSuccessMessage(`✅ PDF "${filename}" downloaded and WhatsApp launched!`);
      setTimeout(() => setPdfSuccessMessage(null), 6000);
    } catch (err: any) {
      console.error("WhatsApp flow error:", err);
      alert("Could not complete WhatsApp flow: " + (err?.message || "Please retry."));
    } finally {
      setIsConvertingPdf(false);
    }
  };

  // Copy shareable summary text to clipboard
  const handleCopyText = () => {
    navigator.clipboard.writeText(getShareableText(false));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Native Browser Print Dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Step Header & Action Controls */}
      <div className="print:hidden bg-white border border-zinc-200 rounded-2xl p-5 mb-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Step 5 of 5 &bull; Fully Editable Quotation &amp; PDF Export</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Quotation &amp; PDF Cost Sheet
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Every text, quantity, and cost is directly editable on this sheet. Changes reflect immediately on PDF and WhatsApp.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onBackToStep4}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Rates</span>
          </button>

          {/* User Request: Download PDF (Working reliably) */}
          <button
            id="download-pdf-btn"
            type="button"
            disabled={isConvertingPdf}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs transition shadow-md disabled:opacity-60"
            title="Generate and download official PDF document"
          >
            {isConvertingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download PDF</span>
          </button>

          {/* View PDF in New Tab */}
          <button
            id="open-pdf-tab-btn"
            type="button"
            onClick={handleOpenPdfInNewTab}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white font-semibold text-xs transition shadow-xs"
            title="Open generated PDF directly in a new browser tab"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View PDF</span>
          </button>

          {/* Send PDF to WhatsApp */}
          <button
            id="send-pdf-whatsapp-btn"
            type="button"
            disabled={isConvertingPdf}
            onClick={handleConvertAndSendWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md transition disabled:opacity-60"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          {/* Print */}
          <button
            id="print-quotation-btn"
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* PDF Success / Download Notice */}
      {pdfSuccessMessage && (
        <div className="print:hidden mb-4 bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pdfSuccessMessage}</span>
          </div>
          {lastPdfBlob && (
            <button
              type="button"
              onClick={handleOpenPdfInNewTab}
              className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold underline hover:text-emerald-950"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open PDF in Tab</span>
            </button>
          )}
        </div>
      )}

      {/* Quotation Editing Toolbar / Helper Banner */}
      <div className="print:hidden bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-300/80 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <Edit3 className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900">
              Live In-Place Document Editor Active
            </div>
            <div className="text-[11px] text-zinc-500">
              Click into any text field, rate, date, terms or signatory directly on the invoice below to edit.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsCalculatorModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-2xs"
            title="Open Interactive Timber CFT & Commercial Pricing Calculator"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>🧮 Live CFT Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => handleAutoRecalculateTotals()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold transition shadow-2xs"
            title="Recalculate Subtotal, GST and Grand Total from current Unit Rate and Qty"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-600" />
            <span>Recalculate Totals</span>
          </button>

          <button
            type="button"
            onClick={handleResetToFormula}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 text-xs font-semibold transition shadow-2xs"
            title="Reset all fields to original CFT formulas from Step 4"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
            <span>Reset to Formula Rates</span>
          </button>
        </div>
      </div>

      {recalcSuccessMessage && (
        <div className="print:hidden mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{recalcSuccessMessage}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold shrink-0">Live Verified</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL PRINTABLE & IN-PLACE EDITABLE QUOTATION SHEET                    */}
      {/* ========================================================================= */}
      <div
        id="quotation-print-sheet"
        className="bg-white border border-zinc-300 rounded-2xl shadow-sm p-6 sm:p-10 text-zinc-900 print:border-none print:shadow-none print:p-0 transition"
      >
        {/* Top Header Row */}
        <div className="border-b-2 border-zinc-900 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Left: Company Credentials (Fully In-Place Editable) */}
            <div className="flex-1 min-w-0">
              {/* Tagline */}
              <input
                type="text"
                value={company.tagline || "Industrial Packaging & Wooden Works • Rahul Design"}
                onChange={(e) => onUpdateCompany({ ...company, tagline: e.target.value })}
                className="w-full text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1"
                placeholder="Industrial Packaging Tagline"
                title="Click to edit Company Tagline"
              />

              {/* Company Name */}
              <input
                type="text"
                value={company.name}
                onChange={(e) => onUpdateCompany({ ...company, name: e.target.value })}
                className="w-full text-2xl sm:text-3xl font-black text-zinc-950 mt-0.5 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1"
                placeholder="Company Name"
                title="Click to edit Company Name"
              />

              {/* Company Address */}
              <input
                type="text"
                value={company.address}
                onChange={(e) => onUpdateCompany({ ...company, address: e.target.value })}
                className="w-full text-xs text-zinc-600 mt-1 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1"
                placeholder="Works & Office Address"
                title="Click to edit Address"
              />

              {/* Phone & Email */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-600 mt-0.5">
                <span className="font-semibold">Phone:</span>
                <input
                  type="text"
                  value={company.phone}
                  onChange={(e) => onUpdateCompany({ ...company, phone: e.target.value })}
                  className="w-36 font-bold text-zinc-900 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1"
                  placeholder="+91 98224 56789"
                />
                <span>&bull;</span>
                <span className="font-semibold">Email:</span>
                <input
                  type="email"
                  value={company.email || "contact@rahuldesignpackaging.com"}
                  onChange={(e) => onUpdateCompany({ ...company, email: e.target.value })}
                  className="w-56 text-zinc-800 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1"
                  placeholder="contact@company.com"
                />
              </div>

              {/* GST Number Badge (Editable) */}
              <div className="pt-2 flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 font-mono font-bold text-zinc-950 bg-amber-100 px-2 py-1 rounded border border-amber-300 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>GSTIN:</span>
                  <input
                    type="text"
                    maxLength={15}
                    value={currentGstin}
                    onChange={(e) => {
                      const g = e.target.value.toUpperCase();
                      onUpdateCompany({ ...company, gstin: g, gstNumber: g });
                    }}
                    placeholder="27AABCR1234F1Z8"
                    className="w-40 font-mono font-bold uppercase bg-transparent outline-none hover:bg-white/80 focus:bg-white px-1 rounded text-amber-950"
                    title="Edit Supplier GSTIN"
                  />
                </div>
                <span className="text-[10px] text-zinc-400 font-semibold">
                  (GST Registered Supplier)
                </span>
              </div>
            </div>

            {/* Right: Quotation Metadata (Number, Date, Validity, Terms) */}
            <div className="text-left sm:text-right shrink-0 w-full sm:w-auto">
              <div className="inline-block bg-zinc-950 text-white px-4 py-1 text-xs font-black uppercase tracking-wider rounded-md mb-2">
                Official Quotation
              </div>

              <div className="text-xs text-zinc-600 space-y-1.5">
                <div className="flex sm:justify-end items-center gap-1.5">
                  <span className="text-zinc-500">Quotation No:</span>
                  <input
                    type="text"
                    value={quotationNumber}
                    onChange={(e) => onUpdateQuotationNumber(e.target.value)}
                    className="w-36 font-mono font-bold text-zinc-950 sm:text-right bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                    placeholder="RD-QT-2026-001"
                    title="Edit Quotation Number"
                  />
                </div>

                <div className="flex sm:justify-end items-center gap-1.5">
                  <span className="text-zinc-500">Date:</span>
                  <input
                    type="text"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-36 font-semibold text-zinc-900 sm:text-right bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                    placeholder="DD Mon YYYY"
                    title="Edit Quotation Date"
                  />
                </div>

                <div className="flex sm:justify-end items-center gap-1.5">
                  <span className="text-zinc-500">Validity:</span>
                  <input
                    type="text"
                    value={editValidity}
                    onChange={(e) => setEditValidity(e.target.value)}
                    className="w-48 font-semibold text-zinc-900 sm:text-right bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                    placeholder="30 Days from date of issue"
                    title="Edit Validity Duration"
                  />
                </div>

                <div className="flex sm:justify-end items-center gap-1.5">
                  <span className="text-zinc-500">Payment:</span>
                  <input
                    type="text"
                    value={editPaymentTerms}
                    onChange={(e) => setEditPaymentTerms(e.target.value)}
                    className="w-52 font-semibold text-zinc-900 sm:text-right bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                    placeholder="50% Adv, Bal vs Delivery"
                    title="Edit Payment Terms"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To & Packaging Specs (Side by Side Cards) */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Buyer Details */}
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">
                Quotation Prepared For (Client / Buyer):
              </span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => onUpdateClientName(e.target.value)}
                placeholder="Client / Buyer Company Name"
                className="w-full text-sm font-bold text-zinc-950 mt-0.5 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1"
                title="Edit Client Name"
              />

              <div className="flex items-center gap-1.5 mt-1 text-zinc-600">
                <span className="font-mono text-[11px] font-semibold">Client GSTIN:</span>
                <input
                  type="text"
                  maxLength={15}
                  value={clientGstin}
                  onChange={(e) => setClientGstin(e.target.value.toUpperCase())}
                  placeholder="27AAACT0000A1Z5 (Optional)"
                  className="w-44 font-mono font-bold text-[11px] uppercase text-zinc-900 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                  title="Edit Client GSTIN"
                />
              </div>

              <input
                type="text"
                value={editClientAddress}
                onChange={(e) => setEditClientAddress(e.target.value)}
                placeholder="Delivery / Plant Location (e.g. Bhosari Plant, Pune)"
                className="w-full text-[11px] text-zinc-500 mt-1 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1"
                title="Edit Client Delivery Location"
              />
            </div>

            {/* Packaging Design & Sizing */}
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">
                Packaging Design &amp; Sizing:
              </span>
              <input
                type="text"
                value={editItemTitle}
                onChange={(e) => setEditItemTitle(e.target.value)}
                placeholder="Box Item Title"
                className="w-full font-bold text-zinc-900 mt-0.5 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1"
                title="Edit Box Item Title"
              />

              <div className="flex items-center gap-1 text-zinc-600 mt-1">
                <span>Outer Size:</span>
                <input
                  type="text"
                  value={editDimensionsText}
                  onChange={(e) => setEditDimensionsText(e.target.value)}
                  className="w-48 font-bold text-zinc-900 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                  title="Edit Outer Dimensions Text"
                />
              </div>

              <div className="flex items-center gap-1 text-zinc-600 mt-0.5">
                <span>Total Timber:</span>
                <input
                  type="text"
                  value={editTimberCftText}
                  onChange={(e) => setEditTimberCftText(e.target.value)}
                  className="w-28 font-bold text-amber-700 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                  title="Edit Timber Volume Text"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Table (Every single cell is editable) */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs border border-zinc-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-zinc-100 text-zinc-700 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                <th className="py-2.5 px-3 w-10">#</th>
                <th className="py-2.5 px-3">Description &amp; Specifications</th>
                <th className="py-2.5 px-3 text-center w-24">Batch Qty</th>
                <th className="py-2.5 px-3 text-right w-28">Timber CFT</th>
                <th className="py-2.5 px-3 text-right w-36">Unit Rate (₹)</th>
                <th className="py-2.5 px-4 text-right w-36">Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr>
                <td className="py-3 px-3 font-semibold text-zinc-600">01</td>

                {/* Description & Technical Specs */}
                <td className="py-3 px-3">
                  <div className="font-bold text-zinc-900">{editItemTitle}</div>
                  <div className="text-[11px] text-zinc-600 mt-0.5">
                    Dimensions: {editDimensionsText} &bull; {report.totalWoodPieces} wood pieces assembly
                  </div>
                  <input
                    type="text"
                    value={editSpecifications}
                    onChange={(e) => setEditSpecifications(e.target.value)}
                    placeholder="Assembly & specification notes"
                    className="w-full text-[11px] text-zinc-500 mt-1 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1"
                    title="Edit Item Technical Notes"
                  />
                </td>

                {/* Batch Quantity (User Editable) */}
                <td className="py-3 px-3 text-center">
                  <input
                    type="number"
                    min="1"
                    value={editBatchQty}
                    onChange={(e) => {
                      const q = Math.max(1, parseInt(e.target.value) || 1);
                      setEditBatchQty(q);
                      handleAutoRecalculateTotals(editUnitRate, q);
                    }}
                    className="w-16 font-bold text-center bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded py-0.5"
                    title="Edit Batch Quantity"
                  />
                </td>

                {/* Unit Timber CFT */}
                <td className="py-3 px-3 text-right font-mono font-medium">
                  {report.totalWoodCft.toFixed(3)}
                </td>

                {/* Unit Rate (User Editable) */}
                <td className="py-3 px-3 text-right">
                  <div className="relative inline-flex items-center">
                    <span className="text-zinc-400 text-xs font-bold mr-0.5">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={editUnitRate}
                      onChange={(e) => {
                        const r = Math.max(0, parseFloat(e.target.value) || 0);
                        setEditUnitRate(r);
                        handleAutoRecalculateTotals(r, editBatchQty);
                      }}
                      className="w-24 font-mono font-bold text-right bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded py-0.5 text-zinc-900"
                      title="Edit Unit Rate directly"
                    />
                  </div>
                </td>

                {/* Total Amount (User Editable or Auto-Calculated) */}
                <td className="py-3 px-4 text-right">
                  <div className="relative inline-flex items-center">
                    <span className="text-zinc-400 text-xs font-bold mr-0.5">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={editSubtotal}
                      onChange={(e) => {
                        const s = Math.max(0, parseFloat(e.target.value) || 0);
                        setEditSubtotal(s);
                        const gst = Math.round(s * (editGstPercent / 100));
                        const grand = s + gst;
                        setEditGstAmount(gst);
                        setEditGrandTotal(grand);
                        setEditAmountInWords(numberToIndianWords(grand));
                      }}
                      className="w-28 font-mono font-black text-right bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded py-0.5 text-zinc-950"
                      title="Edit Total Before Tax directly"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Commercial Cost Breakdown & Terms (Both Fully Editable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start border-t border-zinc-200 pt-4">
          {/* Left Column: Terms & Commercial Conditions (Editable list) */}
          <div className="text-xs text-zinc-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider">
                Terms &amp; Commercial Conditions:
              </span>
              <span className="text-[10px] text-zinc-400 italic print:hidden">
                (Click text to edit)
              </span>
            </div>

            <ul className="space-y-1.5 text-[11px] text-zinc-600">
              {editTerms.map((term, index) => (
                <li key={index} className="flex items-start gap-1.5 group">
                  <span className="text-amber-700 font-bold mt-0.5">&bull;</span>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => {
                      const updated = [...editTerms];
                      updated[index] = e.target.value;
                      setEditTerms(updated);
                    }}
                    className="flex-1 text-[11px] text-zinc-700 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditTerms(editTerms.filter((_, i) => i !== index));
                    }}
                    className="print:hidden opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-600 p-0.5 transition"
                    title="Remove term"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Add Custom Term Input */}
            <div className="print:hidden pt-2 flex items-center gap-1.5">
              <input
                type="text"
                value={newTermInput}
                onChange={(e) => setNewTermInput(e.target.value)}
                placeholder="+ Add new commercial condition / term..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTermInput.trim()) {
                    setEditTerms([...editTerms, newTermInput.trim()]);
                    setNewTermInput("");
                  }
                }}
                className="flex-1 text-xs border border-zinc-200 hover:border-amber-400 focus:border-amber-500 rounded-lg px-2.5 py-1 outline-none bg-zinc-50 focus:bg-white"
              />
              <button
                type="button"
                disabled={!newTermInput.trim()}
                onClick={() => {
                  if (newTermInput.trim()) {
                    setEditTerms([...editTerms, newTermInput.trim()]);
                    setNewTermInput("");
                  }
                }}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Delivery Timeline / Additional Notes */}
            <div className="pt-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Delivery Timeline:
              </label>
              <input
                type="text"
                value={editDeliveryTerms}
                onChange={(e) => setEditDeliveryTerms(e.target.value)}
                placeholder="e.g. 3 to 5 working days from PO"
                className="w-full text-xs font-medium text-zinc-800 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1 mt-0.5"
              />
            </div>
          </div>

          {/* Right Column: Commercial Summary Box (Every row editable) */}
          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 text-xs space-y-2">
            {/* Raw Material Cost */}
            <div className="flex justify-between items-center text-zinc-600">
              <span>Raw Material (Wood &amp; Plywood):</span>
              <div className="flex items-center">
                <span className="text-zinc-400 text-xs font-semibold mr-0.5">₹</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={editRawMaterialCost * editBatchQty}
                  onChange={(e) => {
                    const totalRaw = parseFloat(e.target.value) || 0;
                    const newRawPerBox = Math.round(totalRaw / Math.max(1, editBatchQty));
                    setEditRawMaterialCost(newRawPerBox);
                    const newUnit = newRawPerBox + editWastageCost + editLabourHardwareCost;
                    handleAutoRecalculateTotals(newUnit, editBatchQty, editGstPercent, editDiscountAmount);
                  }}
                  className="w-24 font-mono font-semibold text-right bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                />
              </div>
            </div>

            {/* Wastage Cost */}
            <div className="flex justify-between items-center text-zinc-600">
              <span>Wastage &amp; Sizing Allowance:</span>
              <div className="flex items-center">
                <span className="text-zinc-400 text-xs font-semibold mr-0.5">₹</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={editWastageCost * editBatchQty}
                  onChange={(e) => {
                    const totalWastage = parseFloat(e.target.value) || 0;
                    const newWastagePerBox = Math.round(totalWastage / Math.max(1, editBatchQty));
                    setEditWastageCost(newWastagePerBox);
                    const newUnit = editRawMaterialCost + newWastagePerBox + editLabourHardwareCost;
                    handleAutoRecalculateTotals(newUnit, editBatchQty, editGstPercent, editDiscountAmount);
                  }}
                  className="w-24 font-mono font-semibold text-right bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                />
              </div>
            </div>

            {/* Carpentry & Hardware */}
            <div className="flex justify-between items-center text-zinc-600">
              <span>Carpentry, Fasteners &amp; Hardware:</span>
              <div className="flex items-center">
                <span className="text-zinc-400 text-xs font-semibold mr-0.5">₹</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={editLabourHardwareCost * editBatchQty}
                  onChange={(e) => {
                    const totalLH = parseFloat(e.target.value) || 0;
                    const newLHPerBox = Math.round(totalLH / Math.max(1, editBatchQty));
                    setEditLabourHardwareCost(newLHPerBox);
                    const newUnit = editRawMaterialCost + editWastageCost + newLHPerBox;
                    handleAutoRecalculateTotals(newUnit, editBatchQty, editGstPercent, editDiscountAmount);
                  }}
                  className="w-24 font-mono font-semibold text-right bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                />
              </div>
            </div>

            {/* Commercial Discount */}
            <div className="flex justify-between items-center text-emerald-700 font-semibold">
              <span>Commercial Discount:</span>
              <div className="flex items-center">
                <span className="text-emerald-700 text-xs font-bold mr-0.5">-₹</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={editDiscountAmount}
                  onChange={(e) => {
                    const d = Math.max(0, parseFloat(e.target.value) || 0);
                    setEditDiscountAmount(d);
                    handleAutoRecalculateTotals(editUnitRate, editBatchQty, editGstPercent, d);
                  }}
                  className="w-24 font-mono font-bold text-right text-emerald-800 bg-transparent outline-none hover:bg-emerald-50 focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-400 rounded px-1"
                />
              </div>
            </div>

            {/* Subtotal (Before Tax) */}
            <div className="border-t border-zinc-300 pt-2 flex justify-between items-center font-bold text-zinc-900">
              <span>Subtotal (Before Tax):</span>
              <div className="flex items-center">
                <span className="text-zinc-400 text-xs font-bold mr-0.5">₹</span>
                <input
                  type="number"
                  min="0"
                  value={editSubtotal}
                  onChange={(e) => {
                    const s = Math.max(0, parseFloat(e.target.value) || 0);
                    setEditSubtotal(s);
                    const gst = Math.round(s * (editGstPercent / 100));
                    const grand = s + gst;
                    setEditGstAmount(gst);
                    setEditGrandTotal(grand);
                    setEditAmountInWords(numberToIndianWords(grand));
                  }}
                  className="w-28 font-mono font-black text-right text-zinc-950 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                />
              </div>
            </div>

            {/* GST Percentage and Amount */}
            <div className="flex justify-between items-center text-zinc-600">
              <div className="flex items-center gap-1">
                <span>GST:</span>
                <div className="inline-flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="28"
                    value={editGstPercent}
                    onChange={(e) => {
                      const p = Math.max(0, parseFloat(e.target.value) || 0);
                      setEditGstPercent(p);
                      const gst = Math.round(editSubtotal * (p / 100));
                      const grand = editSubtotal + gst;
                      setEditGstAmount(gst);
                      setEditGrandTotal(grand);
                      setEditAmountInWords(numberToIndianWords(grand));
                    }}
                    className="w-10 font-bold text-center bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded"
                  />
                  <span>%</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-zinc-400 text-xs font-semibold mr-0.5">₹</span>
                <input
                  type="number"
                  min="0"
                  value={editGstAmount}
                  onChange={(e) => {
                    const g = Math.max(0, parseFloat(e.target.value) || 0);
                    setEditGstAmount(g);
                    const grand = editSubtotal + g;
                    setEditGrandTotal(grand);
                    setEditAmountInWords(numberToIndianWords(grand));
                  }}
                  className="w-24 font-mono font-semibold text-right bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                />
              </div>
            </div>

            {/* Grand Total Amount (Highlighted Box) */}
            <div className="border-t-2 border-zinc-900 pt-2.5 flex justify-between items-baseline text-zinc-950">
              <span className="text-sm font-black uppercase">Grand Total:</span>
              <div className="flex items-baseline">
                <span className="text-base font-black text-amber-700 mr-0.5">₹</span>
                <input
                  type="number"
                  min="0"
                  value={editGrandTotal}
                  onChange={(e) => {
                    const gt = Math.max(0, parseFloat(e.target.value) || 0);
                    setEditGrandTotal(gt);
                    setEditAmountInWords(numberToIndianWords(gt));
                  }}
                  className="w-36 text-xl sm:text-2xl font-black text-amber-700 font-mono text-right bg-transparent outline-none hover:bg-amber-100/50 focus:bg-amber-100 focus:ring-1 focus:ring-amber-400 rounded px-1"
                />
              </div>
            </div>

            {/* Amount in Words (Editable) */}
            <div className="text-[11px] text-zinc-500 italic pt-1 border-t border-zinc-200">
              <span>Amount in words: </span>
              <input
                type="text"
                value={editAmountInWords}
                onChange={(e) => setEditAmountInWords(e.target.value)}
                className="w-full not-italic font-semibold text-zinc-900 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1 mt-0.5"
                placeholder="Amount in words"
                title="Edit Amount in Words"
              />
            </div>
          </div>
        </div>

        {/* Signature & Signatory (In-Place Editable) */}
        <div className="mt-12 pt-6 border-t border-zinc-200 grid grid-cols-2 gap-4 text-xs">
          {/* Prepared By */}
          <div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Prepared By:
            </div>
            <input
              type="text"
              value={editPreparedBy}
              onChange={(e) => setEditPreparedBy(e.target.value)}
              className="font-bold text-zinc-950 mt-1 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1"
              placeholder="Estimator / Prepared By Name"
            />
            <div className="text-zinc-500">Estimator &amp; Packaging Works</div>
            {currentGstin && (
              <div className="text-[11px] font-mono text-zinc-600 mt-0.5">
                GSTIN: {currentGstin}
              </div>
            )}
          </div>

          {/* Authorized Signatory */}
          <div className="text-right">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Authorized Signatory:
            </div>
            <div className="mt-8 border-t border-zinc-300 inline-block pt-1 min-w-[180px]">
              <input
                type="text"
                value={editSignatoryTitle}
                onChange={(e) => setEditSignatoryTitle(e.target.value)}
                className="w-full text-right font-semibold text-zinc-900 bg-transparent outline-none hover:bg-amber-50/50 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 rounded px-1"
                placeholder="For Company Name"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Start New Calculation Footer */}
      <div className="print:hidden mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onStartNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Calculate Another Box Design (Start from Step 1)</span>
        </button>
      </div>

      {/* WhatsApp Help Modal */}
      {showWhatsAppHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              PDF Generated &amp; WhatsApp Opened!
            </h3>
            <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
              Your quotation PDF has been downloaded as{" "}
              <strong className="text-zinc-900 font-mono">
                {downloadedPdfName || "Quotation.pdf"}
              </strong>
              . In WhatsApp:
            </p>

            <ol className="mt-3 space-y-2 text-xs text-zinc-700 list-decimal pl-4">
              <li>Open your recipient&apos;s chat in WhatsApp.</li>
              <li>
                Click the <strong>Paperclip / Plus (+)</strong> icon &rarr; select <strong>Document</strong>.
              </li>
              <li>
                Select the downloaded <span className="font-mono text-emerald-800 font-bold">{downloadedPdfName}</span> from your Downloads folder.
              </li>
              <li>Press Send! The pre-filled message contains all commercial details.</li>
            </ol>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowWhatsAppHelpModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Timber CFT & Costing Calculator Modal */}
      <InteractiveCFTCalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        currentUnit={dimensions.unit}
        totalWoodCft={report.totalWoodCft}
        totalPlywoodSqFt={report.totalPlywoodSqFt}
        pricing={pricing}
        quantityBoxes={editBatchQty}
        onApplyPricing={(newPricing, newQty) => {
          if (onUpdatePricing) {
            onUpdatePricing(newPricing);
          }
          if (newQty && onUpdateQuantityBoxes) {
            onUpdateQuantityBoxes(newQty);
          }
          // Direct local state updates for immediate quotation response
          const effectiveQty = newQty || editBatchQty;
          setEditBatchQty(effectiveQty);
          setEditDiscountAmount(newPricing.discountAmount || 0);
          setEditGstPercent(newPricing.gstPercent || 18);

          // Calculate raw material from new wood rate
          const estWoodCost = Math.round(report.totalWoodCft * newPricing.woodRatePerCft);
          const estPlyCost = Math.round(report.totalPlywoodSqFt * newPricing.plywoodRatePerSqFt);
          const newRaw = estWoodCost + estPlyCost;
          const newWastage = Math.round(newRaw * (newPricing.wastagePercent / 100));
          const newLH = (newPricing.labourCostPerBox || 0) + (newPricing.hardwareFastenersCost || 0);

          setEditRawMaterialCost(newRaw);
          setEditWastageCost(newWastage);
          setEditLabourHardwareCost(newLH);

          const newUnit = newRaw + newWastage + newLH;
          handleAutoRecalculateTotals(
            newUnit,
            effectiveQty,
            newPricing.gstPercent || 18,
            newPricing.discountAmount || 0
          );
        }}
        onApplyWoodRate={(rate) => {
          if (onUpdatePricing) {
            onUpdatePricing({ ...pricing, woodRatePerCft: rate });
          }
          const estWoodCost = Math.round(report.totalWoodCft * rate);
          const estPlyCost = Math.round(report.totalPlywoodSqFt * pricing.plywoodRatePerSqFt);
          const newRaw = estWoodCost + estPlyCost;
          const newWastage = Math.round(newRaw * (pricing.wastagePercent / 100));
          setEditRawMaterialCost(newRaw);
          setEditWastageCost(newWastage);
          const newUnit = newRaw + newWastage + editLabourHardwareCost;
          handleAutoRecalculateTotals(newUnit, editBatchQty, editGstPercent, editDiscountAmount);
        }}
      />
    </div>
  );
};
