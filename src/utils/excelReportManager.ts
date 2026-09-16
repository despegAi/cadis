import * as XLSX from 'xlsx';
import { Property, CreditSimulation, AccountingEntry, AccountingSummary, VendorApplication } from '../types';

/**
 * Generates and downloads a comprehensive, multi-sheet official Sales & Commercial Report in Excel (.xlsx)
 */
export function exportSalesReportToExcel(
  simulations: CreditSimulation[],
  properties: Property[],
  accountingEntries: AccountingEntry[]
): void {
  const wb = XLSX.utils.book_new();

  // 1. SHEET 1: Resumen de Ventas y Leads
  const salesRows = simulations.map((s, index) => ({
    'Nº': index + 1,
    'Lote Referencia': s.propiedadLote || 'Río Bonito General',
    'Cliente': s.clienteNombre,
    'Teléfono': s.telefono,
    'Email': s.email || 'No registrado',
    'Precio Terreno (USD)': s.montoTerreno,
    'Cuota Inicial 30% (USD)': s.cuotaInicialMonto,
    'Modalidad Inicial': s.modalidadInicial === 'diferido_3m' ? 'Diferido en 3 meses' : 'Contado',
    'Cuota Mensual (USD)': Number(s.cuotaMensual.toFixed(2)),
    'Plazo Años': s.plazoAnios,
    'Plazo Meses': s.plazoMeses,
    'Saldo Financiado (USD)': s.saldoRestante,
    'Estado Comercial': s.estado.toUpperCase(),
    'Fecha Solicitud': s.fecha,
    'Notas / Seguimiento': s.notas || ''
  }));

  const wsSales = XLSX.utils.json_to_sheet(salesRows);
  // Set column widths for Sheet 1
  wsSales['!cols'] = [
    { wch: 5 },  // Nº
    { wch: 18 }, // Lote
    { wch: 26 }, // Cliente
    { wch: 16 }, // Teléfono
    { wch: 25 }, // Email
    { wch: 20 }, // Precio
    { wch: 22 }, // Cuota Inicial
    { wch: 20 }, // Modalidad
    { wch: 18 }, // Cuota Mensual
    { wch: 12 }, // Plazo
    { wch: 12 }, // Meses
    { wch: 20 }, // Saldo
    { wch: 18 }, // Estado
    { wch: 18 }, // Fecha
    { wch: 30 }  // Notas
  ];
  XLSX.utils.book_append_sheet(wb, wsSales, 'Reporte Ventas & Leads');

  // 2. SHEET 2: Inventario de Propiedades y Mini Quintas
  const propertyRows = properties.map((p, index) => ({
    'Nº': index + 1,
    'Código Lote': p.loteNumero,
    'Denominación': p.titulo,
    'Proyecto': p.proyecto,
    'Ubicación': p.ubicacion,
    'Superficie (m²)': p.metraje,
    'Dimensiones': p.dimensiones,
    'Precio Total (USD)': p.precio,
    'Cuota Inicial 30% (USD)': p.precio * 0.3,
    'Estado Inmueble': p.estado.toUpperCase(),
    'Servicios Básicos': p.servicios.join(', ')
  }));

  const wsProps = XLSX.utils.json_to_sheet(propertyRows);
  wsProps['!cols'] = [
    { wch: 5 },
    { wch: 15 },
    { wch: 32 },
    { wch: 22 },
    { wch: 32 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 22 },
    { wch: 16 },
    { wch: 45 }
  ];
  XLSX.utils.book_append_sheet(wb, wsProps, 'Inventario Mini Quintas');

  // 3. SHEET 3: Libro de Movimientos Contables
  const accountingRows = accountingEntries.map((a, index) => ({
    'Nº': index + 1,
    'Fecha': a.fecha,
    'Concepto Asiento': a.concepto,
    'Tipo Asiento': a.tipo,
    'Lote Asociado': a.loteReferencia || 'General',
    'Cliente / Beneficiario': a.clienteReferencia || 'CADIS',
    'Monto USD': a.montoUSD,
    'Método Pago': a.metodoPago.toUpperCase(),
    'Nº Comprobante': a.comprobante || 'N/A',
    'Registrado Por': a.registradoPor,
    'Origen Registro': a.origen
  }));

  const wsAcc = XLSX.utils.json_to_sheet(accountingRows);
  wsAcc['!cols'] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 42 },
    { wch: 24 },
    { wch: 18 },
    { wch: 26 },
    { wch: 15 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsAcc, 'Libro Contable CADIS');

  // Download the generated Excel file
  const dateSuffix = new Date().toISOString().substring(0, 10);
  XLSX.writeFile(wb, `Reporte_Oficial_Ventas_CADIS_RioBonito_${dateSuffix}.xlsx`);
}

/**
 * Generates and downloads the specialized Accounting Balance Sheet in Excel (.xlsx)
 */
export function exportAccountingLedgerToExcel(
  entries: AccountingEntry[],
  summary: AccountingSummary
): void {
  const wb = XLSX.utils.book_new();

  // Summary header block
  const summaryData = [
    { 'MÉTRICA FINANCIERA': 'TOTAL INGRESOS RECAUDADOS', 'VALOR (USD)': summary.totalIngresosUSD },
    { 'MÉTRICA FINANCIERA': 'TOTAL EGRESOS Y COMISIONES', 'VALOR (USD)': summary.totalEgresosUSD },
    { 'MÉTRICA FINANCIERA': 'BALANCE NETO DISPONIBLE', 'VALOR (USD)': summary.balanceNetoUSD },
    { 'MÉTRICA FINANCIERA': 'CARTERA POR COBRAR (SALDO FINANCIADO)', 'VALOR (USD)': summary.carteraPorCobrarUSD },
    { 'MÉTRICA FINANCIERA': 'CUOTAS MENSUALES COBRADAS', 'VALOR (USD)': summary.cuotasCobradasMesUSD },
    { 'MÉTRICA FINANCIERA': 'TOTAL LOTES VENDIDOS / EN PAGO', 'VALOR (USD)': summary.lotesVendidosTotal },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 40 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Financiero');

  // Detailed Ledger
  const ledgerRows = entries.map((e, idx) => ({
    'ID': e.id,
    'Nº Asiento': idx + 1,
    'Fecha': e.fecha,
    'Concepto': e.concepto,
    'Tipo Movimiento': e.tipo.toUpperCase(),
    'Monto USD': e.montoUSD,
    'Lote Referencia': e.loteReferencia || 'General',
    'Cliente / Titular': e.clienteReferencia || 'CADIS',
    'Método de Pago': e.metodoPago.toUpperCase(),
    'Comprobante': e.comprobante || 'N/A',
    'Auditoría': `Registrado por ${e.registradoPor} (${e.origen})`
  }));

  const wsLedger = XLSX.utils.json_to_sheet(ledgerRows);
  wsLedger['!cols'] = [
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 45 },
    { wch: 24 },
    { wch: 16 },
    { wch: 18 },
    { wch: 25 },
    { wch: 16 },
    { wch: 20 },
    { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, wsLedger, 'Detalle Movimientos');

  const dateSuffix = new Date().toISOString().substring(0, 10);
  XLSX.writeFile(wb, `Balance_Contable_CADIS_${dateSuffix}.xlsx`);
}

export interface ExcelImportResult {
  success: boolean;
  message: string;
  importedEntries: AccountingEntry[];
  updatedLotStatuses: { loteNumero: string; estado: 'disponible' | 'reservado' | 'vendido' }[];
  totalImportedMontoUSD: number;
  rowsProcessed: number;
}

/**
 * Parses an uploaded Excel (.xlsx, .xls, .csv) file with sales/accounting data,
 * updates the accounting ledger and updates lot states automatically.
 */
export async function parseAndProcessSalesReportExcel(
  file: File,
  currentUser: string
): Promise<ExcelImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          return resolve({
            success: false,
            message: 'El archivo Excel no contiene hojas de cálculo válidas.',
            importedEntries: [],
            updatedLotStatuses: [],
            totalImportedMontoUSD: 0,
            rowsProcessed: 0
          });
        }

        // Try to find the best sheet: preferably one containing 'ventas', 'reporte', 'contable' or the first one
        let targetSheetName = workbook.SheetNames[0];
        const match = workbook.SheetNames.find((name) =>
          /ventas|contable|movimientos|leads|ingresos/i.test(name)
        );
        if (match) {
          targetSheetName = match;
        }

        const sheet = workbook.Sheets[targetSheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          return resolve({
            success: false,
            message: 'La hoja de cálculo está vacía o no tiene formato de tabla.',
            importedEntries: [],
            updatedLotStatuses: [],
            totalImportedMontoUSD: 0,
            rowsProcessed: 0
          });
        }

        const newAccountingEntries: AccountingEntry[] = [];
        const lotStatusUpdates: { loteNumero: string; estado: 'disponible' | 'reservado' | 'vendido' }[] = [];
        let totalUSD = 0;
        const todayStr = new Date().toISOString().substring(0, 10);

        rawJson.forEach((row, idx) => {
          // Flexible key lookup to handle varying column naming conventions
          const findVal = (patterns: RegExp[]): any => {
            for (const key of Object.keys(row)) {
              if (patterns.some((p) => p.test(key))) {
                return row[key];
              }
            }
            return null;
          };

          const loteRaw = findVal([/lote/i, /terreno/i, /inmueble/i, /c[oó]digo/i]) || `Lote RB-${(idx + 1).toString().padStart(2, '0')}`;
          const clienteRaw = findVal([/cliente/i, /nombre/i, /titular/i, /comprador/i]) || 'Cliente Importado';
          const montoRaw = findVal([/monto/i, /precio/i, /inicial/i, /total/i, /pago/i, /cuota/i, /usd/i]);
          const conceptoRaw = findVal([/concepto/i, /detalle/i, /descripci[oó]n/i, /modalidad/i]) || `Ingreso por venta ${loteRaw}`;
          const estadoRaw = findVal([/estado/i, /status/i])?.toString().toLowerCase() || '';
          const comprobanteRaw = findVal([/comprobante/i, /recibo/i, /factura/i, /n[uú]mero/i]) || `IMP-XLS-${Date.now().toString().slice(-4)}${idx}`;

          // Parse numeric amount
          let numericMonto = 0;
          if (typeof montoRaw === 'number') {
            numericMonto = montoRaw;
          } else if (typeof montoRaw === 'string') {
            const cleaned = montoRaw.replace(/[^0-9.-]+/g, '');
            numericMonto = parseFloat(cleaned) || 0;
          }

          // If no numeric amount found, default to standard cuota inicial of $2,400 USD
          if (numericMonto === 0) {
            numericMonto = 2400;
          }

          // Determine accounting type
          let entryTipo: AccountingEntry['tipo'] = 'ingreso_cuota_inicial';
          if (/reserva/i.test(conceptoRaw) || /reserva/i.test(estadoRaw)) {
            entryTipo = 'ingreso_reserva';
          } else if (/mensual|cuota/i.test(conceptoRaw)) {
            entryTipo = 'ingreso_cuota_mensual';
          } else if (numericMonto < 0 || /egreso|gasto/i.test(conceptoRaw)) {
            entryTipo = 'egreso_operativo';
          }

          // Generate entry
          const entry: AccountingEntry = {
            id: `acc-imp-${Date.now()}-${idx}`,
            fecha: todayStr,
            tipo: entryTipo,
            concepto: `${conceptoRaw} (${clienteRaw} - ${loteRaw})`,
            loteReferencia: String(loteRaw),
            clienteReferencia: String(clienteRaw),
            montoUSD: numericMonto,
            metodoPago: 'transferencia',
            comprobante: String(comprobanteRaw),
            registradoPor: currentUser,
            origen: 'importacion_excel'
          };

          newAccountingEntries.push(entry);
          totalUSD += numericMonto;

          // Check if row suggests lot status change
          const normalizedLote = String(loteRaw).trim();
          if (/vendido|cerrad|liquidado/i.test(estadoRaw) || /compraventa/i.test(conceptoRaw)) {
            lotStatusUpdates.push({ loteNumero: normalizedLote, estado: 'vendido' });
          } else if (/reserv/i.test(estadoRaw)) {
            lotStatusUpdates.push({ loteNumero: normalizedLote, estado: 'reservado' });
          }
        });

        resolve({
          success: true,
          message: `Se procesaron ${rawJson.length} filas exitosamente. Se generaron ${newAccountingEntries.length} asientos contables y se actualizaron los balances.`,
          importedEntries: newAccountingEntries,
          updatedLotStatuses: lotStatusUpdates,
          totalImportedMontoUSD: totalUSD,
          rowsProcessed: rawJson.length
        });
      } catch (err: any) {
        console.error('Error al procesar archivo Excel:', err);
        resolve({
          success: false,
          message: `Error al leer el archivo Excel: ${err?.message || 'Formato no soportado'}`,
          importedEntries: [],
          updatedLotStatuses: [],
          totalImportedMontoUSD: 0,
          rowsProcessed: 0
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        message: 'No se pudo leer el archivo cargado.',
        importedEntries: [],
        updatedLotStatuses: [],
        totalImportedMontoUSD: 0,
        rowsProcessed: 0
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generates and downloads a clean starter Excel template for entering sales reports
 */
export function downloadSampleSalesReportTemplate(): void {
  const wb = XLSX.utils.book_new();

  const sampleRows = [
    {
      'Lote': 'Lote RB-02',
      'Cliente': 'Mauricio Vaca Diez',
      'Telefono': '+591 78012345',
      'Precio Lote USD': 8000,
      'Monto Cobrado USD': 2400,
      'Concepto': 'Cuota Inicial 30% Lote RB-02',
      'Estado': 'Vendido',
      'Metodo Pago': 'Transferencia BNB',
      'Comprobante': 'TRF-BNB-887123',
      'Fecha': new Date().toISOString().substring(0, 10)
    },
    {
      'Lote': 'Lote RB-05',
      'Cliente': 'Carla Banegas Peña',
      'Telefono': '+591 76098765',
      'Precio Lote USD': 9500,
      'Monto Cobrado USD': 950,
      'Concepto': 'Reserva Formal 10% Lote RB-05',
      'Estado': 'Reservado',
      'Metodo Pago': 'Pago QR',
      'Comprobante': 'QR-BMSC-33211',
      'Fecha': new Date().toISOString().substring(0, 10)
    },
    {
      'Lote': 'Lote RB-04',
      'Cliente': 'Ing. Roberto Aguilera',
      'Telefono': '+591 71234567',
      'Precio Lote USD': 12000,
      'Monto Cobrado USD': 140,
      'Concepto': 'Amortización Cuota Mensual 2',
      'Estado': 'Vendido',
      'Metodo Pago': 'Transferencia BNB',
      'Comprobante': 'TRF-BNB-889901',
      'Fecha': new Date().toISOString().substring(0, 10)
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleRows);
  ws['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 35 },
    { wch: 15 },
    { wch: 20 },
    { wch: 18 },
    { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla_Ventas_CADIS');
  XLSX.writeFile(wb, 'Plantilla_Reporte_Ventas_CADIS.xlsx');
}

/**
 * Triggers a browser download of a CSV file with UTF-8 BOM so Excel opens accented characters seamlessly.
 */
function downloadCsvBlob(csvContent: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports credit simulations (leads) data directly to Excel (.xlsx) or CSV format.
 */
export function exportSimulationsReport(
  simulations: CreditSimulation[],
  format: 'xlsx' | 'csv' = 'xlsx'
): void {
  const dateSuffix = new Date().toISOString().substring(0, 10);
  const rows = simulations.map((s, index) => ({
    'Nº': index + 1,
    'ID Registro': s.id,
    'Fecha Solicitud': s.fecha,
    'Lote Referencia': s.propiedadLote || 'Río Bonito General',
    'Cliente': s.clienteNombre,
    'Teléfono': s.telefono,
    'Email': s.email || 'No registrado',
    'Precio Terreno (USD)': s.montoTerreno,
    'Cuota Inicial 30% (USD)': s.cuotaInicialMonto,
    'Modalidad Cuota Inicial': s.modalidadInicial === 'diferido_3m' ? 'Diferido en 3 meses' : 'Contado',
    'Saldo Financiado (USD)': s.saldoRestante,
    'Plazo Años': s.plazoAnios,
    'Plazo Meses': s.plazoMeses,
    'Cuota Mensual (USD)': Number(s.cuotaMensual.toFixed(2)),
    'Estado Comercial': s.estado.toUpperCase(),
    'Notas y Observaciones': s.notas || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  if (format === 'csv') {
    const csvData = XLSX.utils.sheet_to_csv(ws);
    downloadCsvBlob(csvData, `CADIS_Leads_Simulaciones_${dateSuffix}.csv`);
  } else {
    ws['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 14 },
      { wch: 20 },
      { wch: 26 },
      { wch: 16 },
      { wch: 24 },
      { wch: 20 },
      { wch: 22 },
      { wch: 22 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 35 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads & Simulaciones');
    XLSX.writeFile(wb, `CADIS_Leads_Simulaciones_${dateSuffix}.xlsx`);
  }
}

/**
 * Exports vendor/advisor application data directly to Excel (.xlsx) or CSV format.
 */
export function exportVendorsReport(
  vendors: VendorApplication[],
  format: 'xlsx' | 'csv' = 'xlsx'
): void {
  const dateSuffix = new Date().toISOString().substring(0, 10);
  const rows = vendors.map((v, index) => {
    let nivelLabel = 'Sin Experiencia';
    if (v.nivelExperiencia === 'intermedio') nivelLabel = 'Intermedio (1-3 años)';
    if (v.nivelExperiencia === 'experimentado') nivelLabel = 'Experimentado (3+ años)';

    let estadoLabel = 'PENDIENTE';
    if (v.estado === 'aprobado') estadoLabel = 'APROBADO';
    if (v.estado === 'rechazado') estadoLabel = 'RECHAZADO';

    return {
      'Nº': index + 1,
      'ID Candidato': v.id,
      'Fecha Postulación': v.fecha,
      'Nombre Completo': v.nombre,
      'C.I. / DNI': v.ci,
      'Teléfono Contacto': v.telefono,
      'Email': v.email,
      'Nivel de Experiencia': nivelLabel,
      'Detalle Experiencia': v.experiencia,
      'Estado Postulación': estadoLabel,
      'Mensaje / Propuesta': v.mensaje || 'Sin mensaje adicional'
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  if (format === 'csv') {
    const csvData = XLSX.utils.sheet_to_csv(ws);
    downloadCsvBlob(csvData, `CADIS_Postulaciones_Vendedores_${dateSuffix}.csv`);
  } else {
    ws['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 16 },
      { wch: 28 },
      { wch: 15 },
      { wch: 16 },
      { wch: 26 },
      { wch: 24 },
      { wch: 35 },
      { wch: 18 },
      { wch: 40 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Postulaciones Asesores');
    XLSX.writeFile(wb, `CADIS_Postulaciones_Vendedores_${dateSuffix}.xlsx`);
  }
}
