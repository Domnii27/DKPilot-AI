import jsPDF from "jspdf";

export const downloadInvoicePDF = (invoice) => {
  if (!invoice) {
    alert("Invoice details not found");
    return;
  }

  const pdf = new jsPDF();

  const invoiceNumber = invoice.id || "-";
  const clientName = invoice.clientName || "-";
  const clientEmail = invoice.clientEmail || "-";
  const description = invoice.itemDescription || "-";
  const amount = Number(invoice.amount || 0).toFixed(2);
  const gstPercentage = Number(invoice.gstPercentage || 0);
  const gstAmount = Number(invoice.gstAmount || 0).toFixed(2);
  const totalAmount = Number(invoice.totalAmount || 0).toFixed(2);

  const createdDate = invoice.createdDate
    ? new Date(invoice.createdDate).toLocaleString()
    : "-";

  pdf.setFontSize(22);
  pdf.text("DKPilot AI", 20, 20);

  pdf.setFontSize(14);
  pdf.text("Professional Invoice", 20, 30);

  pdf.setLineWidth(0.5);
  pdf.line(20, 36, 190, 36);

  pdf.setFontSize(12);

  pdf.text(`Invoice Number: ${invoiceNumber}`, 20, 48);
  pdf.text(`Created Date: ${createdDate}`, 20, 58);

  pdf.line(20, 65, 190, 65);

  pdf.setFontSize(14);
  pdf.text("Client Details", 20, 76);

  pdf.setFontSize(12);
  pdf.text(`Client Name: ${clientName}`, 20, 88);
  pdf.text(`Client Email: ${clientEmail}`, 20, 98);

  pdf.line(20, 106, 190, 106);

  pdf.setFontSize(14);
  pdf.text("Invoice Description", 20, 118);

  pdf.setFontSize(12);

  const descriptionLines = pdf.splitTextToSize(
    description,
    165
  );

  pdf.text(descriptionLines, 20, 130);

  const descriptionHeight = descriptionLines.length * 7;
  const calculationStartY = 140 + descriptionHeight;

  pdf.line(
    20,
    calculationStartY,
    190,
    calculationStartY
  );

  pdf.text(
    `Amount: Rs. ${amount}`,
    20,
    calculationStartY + 15
  );

  pdf.text(
    `GST (${gstPercentage}%): Rs. ${gstAmount}`,
    20,
    calculationStartY + 27
  );

  pdf.setFontSize(14);

  pdf.text(
    `Total Amount: Rs. ${totalAmount}`,
    20,
    calculationStartY + 43
  );

  pdf.line(
    20,
    calculationStartY + 50,
    190,
    calculationStartY + 50
  );

  pdf.setFontSize(10);

  pdf.text(
    "Thank you for choosing DKPilot AI.",
    20,
    calculationStartY + 63
  );

  pdf.save(`DKPilot-Invoice-${invoiceNumber}.pdf`);
};