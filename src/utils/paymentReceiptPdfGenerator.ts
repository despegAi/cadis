import { jsPDF } from 'jspdf';
import { ClientPaymentPlan, PaymentScheduleQuota } from '../types';

/**
 * Genera un recibo/comprobante oficial de pago de cuota en formato PDF.
 */
export async function generatePaymentReceiptPdf(
  plan: ClientPaymentPlan,
  quota: PaymentScheduleQuota
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // Compact formal voucher size
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Primary Palette: CADIS Teal (#009698)
  const tealColor = [0, 150, 152];
  const darkNavy = [45, 55, 72];
  const lightGray = [245, 247, 250];

  // 1. TOP HEADER BAR
  doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CADIS BIENES RAÍCES', margin, 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Servicios Inmobiliarios • Proyecto Río Bonito (Limoncito)', margin, 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RECIBO OFICIAL DE PAGO', pageWidth - margin, 9, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const dateStr = quota.fechaPagoReal || new Date().toISOString().split('T')[0];
  doc.text(`N°: REC-${quota.numeroCuota.toString().padStart(3, '0')}-${plan.loteNumero.replace(/\s+/g, '')}`, pageWidth - margin, 15, { align: 'right' });

  let y = 28;

  // 2. CLIENT & LOT DETAILS BOX
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'F');
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('DATOS DE LA ADJUDICACIÓN', margin + 4, y + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  
  // Left column
  doc.text(`Cliente: ${plan.clienteNombre}`, margin + 4, y + 13);
  doc.text(`C.I. / DNI: ${plan.ci || 'N/D'}`, margin + 4, y + 19);
  doc.text(`Teléfono: ${plan.telefono}`, margin + 4, y + 25);
  doc.text(`Lote / Inmueble: ${plan.loteNumero}`, margin + 4, y + 30);

  // Right column
  const rightX = margin + contentWidth / 2 + 4;
  doc.text(`Proyecto: Proyecto Río Bonito`, rightX, y + 13);
  doc.text(`Ubicación: Limoncito, El Torno`, rightX, y + 19);
  doc.text(`Plazo Total: ${plan.plazoAnios} Años (${plan.plazoAnios * 12} meses)`, rightX, y + 25);
  doc.text(`Tasa Interés: ${plan.tasaInteresAnual}% Anual`, rightX, y + 30);

  y += 40;

  // 3. PAYMENT BREAKDOWN TABLE
  doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);

  doc.text('Concepto / N° Cuota', margin + 4, y + 4.5);
  doc.text('F. Vencimiento', margin + 50, y + 4.5);
  doc.text('Abono Capital', margin + 80, y + 4.5);
  doc.text('Interés (10%)', margin + 105, y + 4.5);
  doc.text('Total Pagado', pageWidth - margin - 4, y + 4.5, { align: 'right' });

  y += 7;

  // Row Content
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 10, 'F');
  doc.setDrawColor(230, 235, 240);
  doc.line(margin, y + 10, pageWidth - margin, y + 10);

  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  doc.text(`Cuota Mensual N° ${quota.numeroCuota} de ${plan.plazoAnios * 12}`, margin + 4, y + 6);
  doc.text(quota.fechaVencimiento, margin + 50, y + 6);
  doc.text(`$${quota.capitalUSD.toFixed(2)}`, margin + 80, y + 6);
  doc.text(`$${quota.interesUSD.toFixed(2)}`, margin + 105, y + 6);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
  doc.text(`$${quota.montoCuotaUSD.toFixed(2)} USD`, pageWidth - margin - 4, y + 6, { align: 'right' });

  y += 15;

  // 4. TRANSACTION SUMMARY BOX
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);

  doc.text(`Método de Pago: ${(quota.metodoPago || 'transferencia').toUpperCase()}`, margin + 4, y + 6);
  doc.text(`Comprobante Ref.: ${quota.comprobante || 'REG-INTERNO'}`, margin + 4, y + 12);
  doc.text(`Fecha Cancelación: ${dateStr}`, margin + 4, y + 17);

  doc.text(`Saldo Restante de Capital: $${quota.saldoRestanteUSD.toFixed(2)} USD`, pageWidth - margin - 4, y + 6, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setTextColor(0, 120, 100);
  doc.text(`ESTADO: PAGADO`, pageWidth - margin - 4, y + 15, { align: 'right' });

  y += 28;

  // 5. SIGNATURE & STAMP FOOTER
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 130, 140);
  doc.text('Este documento constituye un recibo oficial emitido por el sistema de administración de CADIS BIENES RAÍCES.', margin, y);

  y += 14;

  const col1X = margin + 20;
  const col2X = pageWidth - margin - 50;

  doc.setDrawColor(180, 190, 200);
  doc.line(col1X, y, col1X + 40, y);
  doc.line(col2X, y, col2X + 40, y);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('CADIS BIENES RAÍCES', col1X + 20, y + 4, { align: 'center' });
  doc.text('Firma Cliente / Adjudicatario', col2X + 20, y + 4, { align: 'center' });

  // Save PDF
  doc.save(`Recibo_Cuota_${quota.numeroCuota}_${plan.loteNumero.replace(/\s+/g, '_')}.pdf`);
}
