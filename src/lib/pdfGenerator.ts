import jsPDF from "jspdf";

export interface GeneratedPdfResult {
  blob: Blob;
  file: File;
  filename: string;
  url?: string;
}

export interface EditableQuotationPDFData {
  company: {
    name: string;
    tagline?: string;
    address: string;
    phone: string;
    email?: string;
    gstin?: string;
    gstNumber?: string;
  };
  quotationNumber: string;
  quotationDate: string;
  validityDays?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  clientName: string;
  clientGstin?: string;
  clientAddress?: string;
  itemTitle: string;
  dimensionsText: string;
  timberCftText: string;
  specificationsText?: string;
  quantityBoxes: number;
  unitRate: number;
  totalBeforeTax: number;
  rawMaterialCost: number;
  wastageCost: number;
  labourHardwareCost: number;
  discountAmount: number;
  gstPercent: number;
  gstAmount: number;
  grandTotal: number;
  amountInWords: string;
  terms: string[];
  notes?: string;
  preparedBy?: string;
  signatoryTitle?: string;
}

/**
 * Generate a crystal-clear, 100% vector corporate industrial quotation PDF.
 * Uses native vector jsPDF commands so it NEVER fails on Tailwind oklch, CSS, or iframe security.
 */
export function generateVectorQuotationPDF(
  data: EditableQuotationPDFData
): GeneratedPdfResult {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186 mm
  const rightEdge = pageWidth - margin; // 198 mm

  const currentGstin = data.company.gstin || data.company.gstNumber || "27AABCR1234F1Z8";

  // 1. Top Amber Accent Bar
  doc.setFillColor(217, 119, 6); // Amber-600
  doc.rect(margin, 10, contentWidth, 3, "F");

  // 2. Company Brand Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text(
    (data.company.tagline || "INDUSTRIAL PACKAGING & WOODEN WORKS • RAHUL DESIGN").toUpperCase(),
    margin,
    18
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(24, 24, 27); // Zinc-900
  doc.text((data.company.name || "RAHUL DESIGN PACKAGING WORKS").toUpperCase(), margin, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99); // Zinc-600
  const addressLines = doc.splitTextToSize(data.company.address || "MIDC Industrial Area, Pune, Maharashtra", 110);
  doc.text(addressLines, margin, 30);

  const afterAddressY = 30 + (addressLines.length * 3.8);
  doc.text(
    `Phone: ${data.company.phone || "+91-9822456789"}   |   Email: ${data.company.email || "contact@rahuldesign.com"}`,
    margin,
    afterAddressY
  );

  // Supplier GSTIN Verification Badge
  const gstinBadgeY = afterAddressY + 3;
  doc.setFillColor(254, 243, 199); // Amber-100
  doc.setDrawColor(245, 158, 11); // Amber-500
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, gstinBadgeY, 82, 5.8, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14); // Amber-800
  doc.text(`GSTIN: ${currentGstin}  (GST Registered Supplier)`, margin + 2.5, gstinBadgeY + 4);

  // 3. Top Right Quotation Meta Card
  const metaCardX = 132;
  const metaCardWidth = rightEdge - metaCardX;

  // Dark "COMMERCIAL QUOTATION" badge
  doc.setFillColor(24, 24, 27);
  doc.roundedRect(metaCardX, 15, metaCardWidth, 7, 1.2, 1.2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("COMMERCIAL QUOTATION", metaCardX + 8, 19.8);

  // Metadata rows
  let metaY = 27;
  const addMetaRow = (label: string, val: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(label, metaCardX, metaY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(24, 24, 27);
    doc.text(val, metaCardX + 26, metaY);
    metaY += 4.6;
  };

  addMetaRow("Quotation No:", data.quotationNumber || "RD-QT-2026-001");
  addMetaRow("Date:", data.quotationDate);
  addMetaRow("Validity:", data.validityDays || "30 Days from date of issue");
  addMetaRow("Payment:", data.paymentTerms || "50% Adv, Bal vs Delivery");
  if (data.deliveryTerms) {
    addMetaRow("Delivery:", data.deliveryTerms);
  }

  // 4. Horizontal Separator
  const sepY = Math.max(gstinBadgeY + 10, metaY + 2);
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.4);
  doc.line(margin, sepY, rightEdge, sepY);

  // 5. Buyer / Client Box & Packaging Specs Box
  const cardY = sepY + 3.5;
  const cardHeight = 24;
  const halfWidth = (contentWidth - 4) / 2;

  // Left Card: Buyer Details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cardY, halfWidth, cardHeight, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("QUOTATION PREPARED FOR (CLIENT / BUYER):", margin + 3, cardY + 4.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(data.clientName || "Valued Customer", margin + 3, cardY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  if (data.clientGstin) {
    doc.text(`Client GSTIN: ${data.clientGstin}`, margin + 3, cardY + 15);
  } else {
    doc.text("Industrial Packaging Requirement", margin + 3, cardY + 15);
  }
  if (data.clientAddress) {
    doc.text(data.clientAddress, margin + 3, cardY + 19.5);
  }

  // Right Card: Packaging Design & Sizing
  const rightCardX = margin + halfWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightCardX, cardY, halfWidth, cardHeight, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("PACKAGING DESIGN & TECHNICAL SIZING:", rightCardX + 3, cardY + 4.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(data.itemTitle || "Industrial Wooden Packaging Box", rightCardX + 3, cardY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Outer Sizing: ${data.dimensionsText}`, rightCardX + 3, cardY + 15);
  doc.text(`Timber Volume: ${data.timberCftText}  |  Qty: ${data.quantityBoxes} Units`, rightCardX + 3, cardY + 19.5);

  // 6. Itemized Table
  const tableTopY = cardY + cardHeight + 5;
  const tableHeaderHeight = 7;

  // Header Background
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, tableTopY, contentWidth, tableHeaderHeight, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  doc.text("Item #", margin + 2.5, tableTopY + 4.8);
  doc.text("Description & Technical Specifications", margin + 18, tableTopY + 4.8);
  doc.text("Batch Qty", margin + 108, tableTopY + 4.8, { align: "center" });
  doc.text("Timber CFT", margin + 128, tableTopY + 4.8, { align: "right" });
  doc.text("Unit Rate (INR)", margin + 156, tableTopY + 4.8, { align: "right" });
  doc.text("Total Amount (INR)", rightEdge - 3, tableTopY + 4.8, { align: "right" });

  // Table Data Row
  const rowY = tableTopY + tableHeaderHeight;
  const rowHeight = 20;

  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, rowY, contentWidth, rowHeight, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("01", margin + 3.5, rowY + 6);

  // Item Title & Description
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.itemTitle, margin + 18, rowY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dimensions: ${data.dimensionsText}  (Precision Cut-to-Size)`, margin + 18, rowY + 10.5);
  doc.text(
    data.specificationsText || "Complete industrial wooden box assembly with precision timber cut sizes, nailing & strapping.",
    margin + 18,
    rowY + 15
  );

  // Qty
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.quantityBoxes}`, margin + 108, rowY + 8, { align: "center" });

  // CFT
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(data.timberCftText.replace(" CFT", ""), margin + 128, rowY + 8, { align: "right" });

  // Unit Rate
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${data.unitRate.toLocaleString("en-IN")}`, margin + 156, rowY + 8, { align: "right" });

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${data.totalBeforeTax.toLocaleString("en-IN")}`, rightEdge - 3, rowY + 8, { align: "right" });

  // 7. Commercial Breakdown & Terms Section (Side by Side)
  const lowerY = rowY + rowHeight + 5;
  const termsWidth = 92;
  const breakX = margin + termsWidth + 4;
  const breakWidth = rightEdge - breakX;
  const lowerHeight = 72;

  // Left: Terms & Commercial Conditions
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(228, 228, 231);
  doc.roundedRect(margin, lowerY, termsWidth, lowerHeight, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(24, 24, 27);
  doc.text("TERMS & COMMERCIAL CONDITIONS:", margin + 3.5, lowerY + 5.5);

  let termItemY = lowerY + 10.5;
  const termBullets = data.terms && data.terms.length > 0
    ? data.terms
    : [
        "Wood seasoned & inspected according to industrial packaging standards.",
        "Includes sizing and cutting allowance with structural edge bracing.",
        "GST charged with full Input Tax Credit (ITC) applicability.",
        "Quotation validity: 30 days from date of issue.",
        "Delivery: Within 5-7 working days upon receipt of formal Purchase Order.",
      ];

  termBullets.slice(0, 5).forEach((term, idx) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105);
    const wrapped = doc.splitTextToSize(`•  ${term}`, termsWidth - 7);
    doc.text(wrapped, margin + 3.5, termItemY);
    termItemY += wrapped.length * 3.5 + 1.2;
  });

  if (data.notes) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Note: ${data.notes}`, margin + 3.5, lowerY + lowerHeight - 3);
  }

  // Right: Commercial Cost Breakdown Table
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(228, 228, 231);
  doc.roundedRect(breakX, lowerY, breakWidth, lowerHeight, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(24, 24, 27);
  doc.text("COMMERCIAL SUMMARY", breakX + 4, lowerY + 5.5);

  let costY = lowerY + 11.5;
  const addCostRow = (label: string, amt: number, isDiscount: boolean = false) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(isDiscount ? 16 : 71, isDiscount ? 185 : 85, isDiscount ? 129 : 105);
    doc.text(label, breakX + 4, costY);

    doc.setFont("helvetica", "bold");
    const prefix = isDiscount ? "-Rs. " : "Rs. ";
    doc.text(`${prefix}${Math.abs(amt).toLocaleString("en-IN")}`, rightEdge - 4, costY, { align: "right" });
    costY += 4.5;
  };

  const rawMatBatch = data.rawMaterialCost * data.quantityBoxes;
  const wastageBatch = data.wastageCost * data.quantityBoxes;
  const labourHwBatch = data.labourHardwareCost * data.quantityBoxes;

  addCostRow("Raw Material (Wood & Ply):", rawMatBatch);
  addCostRow("Wastage & Sizing:", wastageBatch);
  addCostRow("Carpentry, Fasteners & HW:", labourHwBatch);
  if (data.discountAmount > 0) {
    addCostRow("Commercial Discount:", data.discountAmount, true);
  }

  // Subtotal line
  doc.setDrawColor(226, 232, 240);
  doc.line(breakX + 3, costY - 1.5, rightEdge - 3, costY - 1.5);
  costY += 1.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Subtotal (Before Tax):", breakX + 4, costY);
  doc.text(`Rs. ${data.totalBeforeTax.toLocaleString("en-IN")}`, rightEdge - 4, costY, { align: "right" });
  costY += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`GST (${data.gstPercent}%):`, breakX + 4, costY);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${data.gstAmount.toLocaleString("en-IN")}`, rightEdge - 4, costY, { align: "right" });
  costY += 5;

  // Highlighted Grand Total Box
  const grandTotalBoxY = costY;
  doc.setFillColor(254, 243, 199); // Amber-100
  doc.setDrawColor(245, 158, 11); // Amber-500
  doc.rect(breakX + 2, grandTotalBoxY, breakWidth - 4, 8.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14); // Amber-900
  doc.text("GRAND TOTAL:", breakX + 4.5, grandTotalBoxY + 5.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text(`Rs. ${data.grandTotal.toLocaleString("en-IN")}`, rightEdge - 4.5, grandTotalBoxY + 6, {
    align: "right",
  });

  // Amount in Words
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const wordsWrapped = doc.splitTextToSize(`Amount in words: ${data.amountInWords}`, breakWidth - 6);
  doc.text(wordsWrapped, breakX + 4, grandTotalBoxY + 12);

  // 8. Signatures Block
  const sigY = lowerY + lowerHeight + 7;

  // Prepared By
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("PREPARED BY:", margin + 3, sigY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(data.preparedBy || data.company.name, margin + 3, sigY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Packaging Estimator & Engineer", margin + 3, sigY + 9);
  if (currentGstin) {
    doc.text(`GSTIN: ${currentGstin}`, margin + 3, sigY + 13);
  }

  // Authorized Signatory
  const sigRightX = rightEdge - 65;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("AUTHORIZED SIGNATORY:", sigRightX, sigY);

  // Signature line
  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.3);
  doc.line(sigRightX, sigY + 14, rightEdge - 3, sigY + 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(data.signatoryTitle || `For ${data.company.name}`, sigRightX, sigY + 18);

  // 9. Document Footer
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 12, rightEdge, pageHeight - 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Rahul Design Industrial Packaging Works • GSTIN: ${currentGstin} • Computer Generated Official Quotation`,
    margin,
    pageHeight - 8
  );

  doc.text(`Page 1 of 1`, rightEdge, pageHeight - 8, { align: "right" });

  // Output
  const cleanNum = (data.quotationNumber || "001").replace(/[^a-zA-Z0-9-_]/g, "_");
  const filename = `Quotation_${cleanNum}.pdf`;

  const blob = doc.output("blob");
  const file = new File([blob], filename, { type: "application/pdf" });

  return { blob, file, filename };
}

/**
 * Universal PDF generation entry point.
 * Guarantees successful PDF creation by using vector PDF generator with zero external rendering dependencies.
 */
export async function generateQuotationPDF(
  _elementId: string,
  quotationNumber: string,
  data?: EditableQuotationPDFData
): Promise<GeneratedPdfResult> {
  if (data) {
    return generateVectorQuotationPDF(data);
  }

  // Fallback minimal data if called without complete payload
  const fallbackData: EditableQuotationPDFData = {
    company: {
      name: "Rahul Design Industrial Packaging Works",
      tagline: "Industrial Packaging & Wooden Works",
      address: "MIDC Industrial Area, Bhosari, Pune, Maharashtra - 411026",
      phone: "+91 98224 56789",
      email: "contact@rahuldesignpackaging.com",
      gstin: "27AABCR1234F1Z8",
    },
    quotationNumber: quotationNumber || "RD-QT-2026-001",
    quotationDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    validityDays: "30 Days from date of issue",
    paymentTerms: "50% Advance with PO, Balance against Delivery",
    clientName: "Valued Customer",
    itemTitle: "Heavy Duty Wooden Packaging Box",
    dimensionsText: '48" L × 40" B × 36" H',
    timberCftText: "3.450 CFT",
    quantityBoxes: 50,
    unitRate: 4200,
    totalBeforeTax: 210000,
    rawMaterialCost: 2800,
    wastageCost: 280,
    labourHardwareCost: 1120,
    discountAmount: 0,
    gstPercent: 18,
    gstAmount: 37800,
    grandTotal: 247800,
    amountInWords: "Two Lakh Forty Seven Thousand Eight Hundred Rupees Only",
    terms: [
      "Lumber Rate calculated according to packaging standards.",
      "Includes 10% sizing and cutting allowance.",
      "Wood seasoned & inspected according to industrial requirements.",
      "GST charged @ 18% with Input Tax Credit applicability.",
      "Validity: 30 days from date of issue.",
    ],
  };

  return generateVectorQuotationPDF(fallbackData);
}

/**
 * Trigger immediate browser download of the PDF
 */
export function downloadPdfBlob(blob: Blob, filename: string): boolean {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 4000);
    return true;
  } catch (err) {
    console.error("Download error:", err);
    return false;
  }
}

/**
 * Open the generated PDF in a new browser tab/window
 */
export function openPdfInNewTab(blob: Blob): void {
  try {
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, "_blank");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      // If popup was blocked, fallback to normal link click
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.error("Open PDF in new tab error:", err);
  }
}
