import { jsPDF } from 'jspdf';
import { Property } from '../types';
import { CADIS_WHATSAPP_DISPLAY } from '../config/contact';

/**
 * Loads an image from URL and converts it to a base64 DataURL using canvas.
 * Falls back to null if CORS or network error occurs.
 */
async function getBase64ImageFromUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 600;
          canvas.height = img.naturalHeight || 400;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      // Set a 3-second timeout so PDF generation never blocks
      setTimeout(() => resolve(null), 3000);
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

export async function generatePropertyPdfBrochure(property: Property): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Palette Colors
  const darkNavy = [15, 23, 42];      // #0f172a
  const primaryGreen = [5, 150, 105];  // #059669
  const deepGreen = [6, 78, 59];       // #064e3b
  const lightBg = [248, 250, 252];     // #f8fafc
  const amberColor = [217, 119, 6];    // #d97706
  const slateGray = [100, 116, 139];   // #64748b
  const slateLight = [241, 245, 249];  // #f1f5f9
  const borderGray = [226, 232, 240];  // #e2e8f0

  // 1. TOP HEADER BAR
  doc.setFillColor(deepGreen[0], deepGreen[1], deepGreen[2]);
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Accent Line
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.rect(0, 26, pageWidth, 2, 'F');

  // Company Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CADIS SERVICIOS INMOBILIARIOS', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(209, 250, 229);
  doc.text('PROYECTO CAMPESTRE RÍO BONITO • LIMONCITO, SANTA CRUZ - BOLIVIA', margin, 17);

  // Document Badge (Right Header)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('FOLLETO TÉCNICO OFICIAL', pageWidth - margin, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(209, 250, 229);
  const todayStr = new Date().toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Emisión: ${todayStr}`, pageWidth - margin, 17, { align: 'right' });

  // 2. HERO / TITLE SECTION
  let y = 35;

  // Lote Badge & Title
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.roundedRect(margin, y, 32, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(property.loteNumero.toUpperCase(), margin + 16, y + 5, { align: 'center' });

  // Status Badge
  const isAvailable = property.estado === 'disponible';
  const isReserved = property.estado === 'reservado';
  const statusBg = isAvailable ? [16, 185, 129] : isReserved ? [245, 158, 11] : [100, 116, 139];
  const statusLabel = isAvailable ? 'DISPONIBLE' : isReserved ? 'RESERVADO' : 'VENDIDO';

  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.roundedRect(margin + 35, y, 30, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(statusLabel, margin + 50, y + 5, { align: 'center' });

  // Code reference
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text(`CÓDIGO: RB-${property.id.toUpperCase()}`, pageWidth - margin, y + 5, { align: 'right' });

  y += 13;

  // Property Title
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(property.titulo, margin, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text(`Ubicación: ${property.ubicacion} (A 45 minutos de Santa Cruz de la Sierra)`, margin, y);

  y += 6;

  // 3. PROPERTY IMAGE OR TECHNICAL BLUEPRINT BOX
  const imageBoxHeight = 52;
  const base64Img = property.imagen ? await getBase64ImageFromUrl(property.imagen) : null;

  if (base64Img) {
    try {
      doc.addImage(base64Img, 'JPEG', margin, y, contentWidth, imageBoxHeight, undefined, 'FAST');
      // Frame border
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, contentWidth, imageBoxHeight);
    } catch {
      renderVectorLotGraphic(doc, margin, y, contentWidth, imageBoxHeight, property);
    }
  } else {
    renderVectorLotGraphic(doc, margin, y, contentWidth, imageBoxHeight, property);
  }

  y += imageBoxHeight + 6;

  // 4. SPECS & FINANCIAL HIGHLIGHTS (Two Columns)
  const colWidth = (contentWidth - 6) / 2;

  // Column 1: Ficha Técnica (Superficie & Dimensiones)
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, colWidth, 46, 2, 2, 'FD');

  // Title Box 1
  doc.setFillColor(slateLight[0], slateLight[1], slateLight[2]);
  doc.roundedRect(margin, y, colWidth, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('1. ESPECIFICACIONES TÉCNICAS DEL LOTE', margin + 4, y + 5.5);

  let subY = y + 14;
  const renderSpecRow = (label: string, val: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text(label, margin + 4, subY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(val, margin + colWidth - 4, subY, { align: 'right' });
    subY += 7;
  };

  renderSpecRow('Superficie Total:', `${property.metraje.toLocaleString()} m²`);
  renderSpecRow('Dimensiones (Linderos):', property.dimensiones);
  renderSpecRow('Topografía:', 'Plana / Lista para edificar');
  renderSpecRow('Tipo de Inmueble:', 'Mini Quinta Campestre');

  // Column 2: Plan de Precios y Cuota Inicial
  const col2X = margin + colWidth + 6;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(col2X, y, colWidth, 46, 2, 2, 'FD');

  // Title Box 2
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.roundedRect(col2X, y, colWidth, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(deepGreen[0], deepGreen[1], deepGreen[2]);
  doc.text('2. CONDICIONES DE VENTA Y RESERVA', col2X + 4, y + 5.5);

  subY = y + 14;
  const cuotaInicialTotal = property.precio * 0.3;
  const cuotaInicialDiferida3m = cuotaInicialTotal / 3;
  const saldoFinanciar = property.precio * 0.7;

  const renderPriceRow = (label: string, val: string, isHighlight = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text(label, col2X + 4, subY);

    doc.setFont('helvetica', 'bold');
    if (isHighlight) {
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.setFontSize(9);
    } else {
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    }
    doc.text(val, col2X + colWidth - 4, subY, { align: 'right' });
    subY += 7;
  };

  renderPriceRow('Precio Total de Venta:', `$${property.precio.toLocaleString()} USD`, true);
  renderPriceRow('Cuota Inicial (30%):', `$${cuotaInicialTotal.toLocaleString()} USD`);
  renderPriceRow('Inicial Diferida (3 meses):', `3 cuotas de $${cuotaInicialDiferida3m.toFixed(2)} USD`);
  renderPriceRow('Saldo a Financiar (70%):', `$${saldoFinanciar.toLocaleString()} USD`);

  y += 51;

  // 5. FINANCING SIMULATION TABLE (Crédito Directo CADIS)
  doc.setFillColor(deepGreen[0], deepGreen[1], deepGreen[2]);
  doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('3. SIMULACIÓN DE CRÉDITO DIRECTO CADIS (SIN BANCOS NI GARANTES)', margin + 4, y + 5.5);

  y += 11;

  // Table Headers
  const cellWidth = contentWidth / 4;
  doc.setFillColor(slateLight[0], slateLight[1], slateLight[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.2);
  doc.rect(margin, y, contentWidth, 7, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('PLAZO', margin + 4, y + 4.8);
  doc.text('N° CUOTAS', margin + cellWidth + 4, y + 4.8);
  doc.text('CUOTA MENSUAL (USD)', margin + cellWidth * 2 + 4, y + 4.8);
  doc.text('EQUIVALENTE DIARIO', margin + cellWidth * 3 + 4, y + 4.8);

  y += 7;

  // 3 Years Plan
  const cuota3 = saldoFinanciar / 36;
  const cuota5 = saldoFinanciar / 60;
  const cuota10 = saldoFinanciar / 120;

  const renderTableRow = (plazo: string, cuotas: string, mensual: number, isRec = false) => {
    if (isRec) {
      doc.setFillColor(236, 253, 245); // Emerald 50 highlight
      doc.rect(margin, y, contentWidth, 8, 'F');
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, 8, 'F');
    }
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, contentWidth, 8, 'S');

    doc.setFont('helvetica', isRec ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(plazo + (isRec ? '  [PLAN RECOMENDADO]' : ''), margin + 4, y + 5.5);
    doc.text(cuotas, margin + cellWidth + 4, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isRec ? primaryGreen[0] : darkNavy[0], isRec ? primaryGreen[1] : darkNavy[1], isRec ? primaryGreen[2] : darkNavy[2]);
    doc.text(`$${mensual.toFixed(2)} USD`, margin + cellWidth * 2 + 4, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text(`Aprox. $${(mensual / 30).toFixed(2)} USD/día`, margin + cellWidth * 3 + 4, y + 5.5);

    y += 8;
  };

  renderTableRow('3 Años', '36 cuotas', cuota3, false);
  renderTableRow('5 Años', '60 cuotas', cuota5, true);
  renderTableRow('10 Años', '120 cuotas', cuota10, false);

  y += 4;

  // Credit Advantages note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('* Requisitos mínimos: Únicamente fotocopia de Cédula de Identidad (C.I.). Sin verificación de buró crediticio ni papeleo bancario.', margin, y);

  y += 8;

  // 6. SERVICIOS Y VENTAJAS DE RÍO BONITO
  doc.setFillColor(slateLight[0], slateLight[1], slateLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('4. SERVICIOS BÁSICOS Y BENEFICIOS INCLUIDOS', margin + 4, y + 6);

  // Services list in 2 columns
  const services = property.servicios && property.servicios.length > 0 
    ? property.servicios 
    : ['Agua Potable Instalada', 'Energía Eléctrica', 'Acceso Ripia Todo el Año', 'Salida Directa a Playas de Río'];

  let sY = y + 12;
  const half = Math.ceil(services.length / 2);
  const colLeft = services.slice(0, half);
  const colRight = services.slice(half);

  colLeft.forEach((srv) => {
    doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.circle(margin + 5, sY - 1, 1.2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(srv, margin + 8, sY);
    sY += 5;
  });

  sY = y + 12;
  colRight.forEach((srv) => {
    doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.circle(margin + colWidth + 5, sY - 1, 1.2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(srv, margin + colWidth + 8, sY);
    sY += 5;
  });

  y += 29;

  // 7. CONTACT & RESERVATION CALL-TO-ACTION BOX
  doc.setFillColor(240, 253, 250); // Mint / Emerald tint
  doc.setDrawColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(deepGreen[0], deepGreen[1], deepGreen[2]);
  doc.text('¿CÓMO RESERVAR ESTE LOTE O AGENDAR UNA VISITA GUIADA?', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Coordinamos transporte gratuito todos los sábados y domingos para conocer los terrenos en Limoncito.', margin + 4, y + 12);
  doc.text(`WhatsApp Oficial CADIS: ${CADIS_WHATSAPP_DISPLAY}   |   Atención de Lunes a Domingo de 08:00 a 19:00`, margin + 4, y + 17);

  // 8. LEGAL FOOTER
  const footerY = pageHeight - 12;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('CADIS Servicios Inmobiliarios • Proyecto Río Bonito • Documento emitido para fines informativos y de cotización comercial.', margin, footerY + 1);
  doc.text(`Página 1 de 1 • Ref: ${property.loteNumero}`, pageWidth - margin, footerY + 1, { align: 'right' });

  // Save the PDF
  const sanitizedFileName = `Folleto_${property.loteNumero.replace(/[^a-zA-Z0-9_-]/g, '_')}_CADIS.pdf`;
  doc.save(sanitizedFileName);
}

/**
 * Renders an elegant technical lot blueprint graphic when no image is available or image cannot be loaded
 */
function renderVectorLotGraphic(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  property: Property
) {
  // Background blueprint grid
  doc.setFillColor(15, 23, 42); // Dark blueprint
  doc.rect(x, y, w, h, 'F');

  // Subtle grid lines
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.2);
  for (let gx = x + 10; gx < x + w; gx += 15) {
    doc.line(gx, y, gx, y + h);
  }
  for (let gy = y + 10; gy < y + h; gy += 15) {
    doc.line(x, gy, x + w, gy);
  }

  // Central Lot Boundary Polygon
  const lotX = x + 25;
  const lotY = y + 10;
  const lotW = w - 50;
  const lotH = h - 20;

  doc.setFillColor(6, 78, 59);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.6);
  doc.rect(lotX, lotY, lotW, lotH, 'FD');

  // Text inside lot blueprint
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(property.loteNumero, x + w / 2, y + h / 2 - 2, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 231, 183); // Emerald 300
  doc.text(`SUPERFICIE: ${property.metraje} m²  •  ${property.dimensiones}`, x + w / 2, y + h / 2 + 5, { align: 'center' });

  // Compass / Orientation indicator
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('PLANO ESQUEMÁTICO • PROYECTO RÍO BONITO', x + 5, y + 6);
  doc.text('ACCESO A CALLE PRINCIPAL', x + w / 2, y + h - 3, { align: 'center' });
}
