import * as XLSX from 'xlsx';
import { Property } from '../types';

export interface PropertyValidationRow {
  rowNumber: number;
  rawRow: Record<string, any>;
  property: Property | null;
  status: 'valid' | 'warning' | 'error';
  errors: string[];
  warnings: string[];
  isDuplicateInFile: boolean;
  isExistingInCatalog: boolean;
}

export interface PropertyExcelImportReport {
  success: boolean;
  totalRows: number;
  validRowsCount: number;
  warningRowsCount: number;
  errorRowsCount: number;
  rows: PropertyValidationRow[];
  validProperties: Property[];
  sheetName: string;
  fileName?: string;
  errorMessage?: string;
}

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80'
];

/**
 * Normalizes property status from various textual inputs
 */
function normalizeEstado(val: any): { estado: 'disponible' | 'reservado' | 'vendido'; warning?: string } {
  if (!val) return { estado: 'disponible' };
  const str = String(val).trim().toLowerCase();
  
  if (/^disp|^libr|^act|^ok/i.test(str)) {
    return { estado: 'disponible' };
  }
  if (/^res|^apart|^se[ñn]ad/i.test(str)) {
    return { estado: 'reservado' };
  }
  if (/^vend|^cerra|^adqui|^liquid/i.test(str)) {
    return { estado: 'vendido' };
  }

  return { 
    estado: 'disponible', 
    warning: `Estado '${val}' no reconocido. Se asignó 'disponible' por defecto.` 
  };
}

/**
 * Searches a row object using multiple regex patterns for flexible header matching
 */
function findRowValue(row: Record<string, any>, patterns: RegExp[]): any {
  for (const key of Object.keys(row)) {
    const trimmedKey = key.trim();
    if (patterns.some(p => p.test(trimmedKey))) {
      const val = row[key];
      if (val !== undefined && val !== null && val !== '') {
        return val;
      }
    }
  }
  return null;
}

/**
 * Parses numeric value cleanly from strings like "$8,500 USD", "8.000", 8000
 */
function parseNumericValue(val: any): number {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (!val) return 0;
  const str = String(val).trim();
  // Remove currency symbols, commas and spaces
  const cleaned = str.replace(/[$USDuusd\s]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Validates a single parsed Excel row into a Property domain entity
 */
export function validatePropertyRow(
  rawRow: Record<string, any>,
  rowNumber: number,
  existingProperties: Property[],
  seenLotesInFile: Map<string, number>
): PropertyValidationRow {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Número de Lote
  const loteRaw = findRowValue(rawRow, [
    /^lote/i,
    /c[oó]digo/i,
    /identificador/i,
    /n[uú]mero.*lote/i,
    /num_lote/i,
    /rb/i
  ]);

  let loteNumero = loteRaw ? String(loteRaw).trim() : '';
  if (!loteNumero) {
    errors.push("El 'Nº de Lote' es obligatorio y no puede estar vacío.");
  } else {
    // Standardize prefix if plain number was provided e.g. "09" -> "Lote RB-09"
    if (/^\d+$/.test(loteNumero)) {
      const padded = loteNumero.padStart(2, '0');
      loteNumero = `Lote RB-${padded}`;
      warnings.push(`Formato de lote normalizado a '${loteNumero}'.`);
    } else if (!/^lote/i.test(loteNumero)) {
      loteNumero = `Lote ${loteNumero}`;
    }
  }

  // Check duplicate inside this file
  let isDuplicateInFile = false;
  const lotKey = loteNumero.toLowerCase();
  if (lotKey) {
    if (seenLotesInFile.has(lotKey)) {
      isDuplicateInFile = true;
      const prevRow = seenLotesInFile.get(lotKey);
      errors.push(`Lote duplicado: '${loteNumero}' ya apareció en la fila ${prevRow} de este archivo.`);
    } else {
      seenLotesInFile.set(lotKey, rowNumber);
    }
  }

  // Check existence in existing catalog
  const isExistingInCatalog = existingProperties.some(
    p => p.loteNumero.toLowerCase().trim() === lotKey
  );
  if (isExistingInCatalog) {
    warnings.push(`El lote '${loteNumero}' ya existe en el catálogo. Esta importación actualizará sus datos.`);
  }

  // 2. Precio
  const precioRaw = findRowValue(rawRow, [
    /^precio/i,
    /precio.*usd/i,
    /monto/i,
    /valor/i,
    /costo/i
  ]);

  let precio = parseNumericValue(precioRaw);
  if (precioRaw === null || precioRaw === undefined) {
    errors.push("El 'Precio USD' es obligatorio.");
  } else if (precio <= 0) {
    errors.push(`Precio inválido (${precioRaw}). Debe ser un número mayor a 0 USD.`);
  } else if (precio < 1000) {
    warnings.push(`Precio inusualmente bajo ($${precio} USD). Verifique si el monto es correcto.`);
  } else if (precio > 1000000) {
    warnings.push(`Precio inusualmente elevado ($${precio.toLocaleString()} USD). Verifique el monto.`);
  }

  // 3. Título / Denominación
  const tituloRaw = findRowValue(rawRow, [
    /^t[ií]tulo/i,
    /denominaci[oó]n/i,
    /^nombre/i,
    /descripci[oó]n/i
  ]);

  let titulo = tituloRaw ? String(tituloRaw).trim() : '';
  if (!titulo) {
    titulo = loteNumero ? `Mini Quinta ${loteNumero.replace(/^Lote\s*/i, '')}` : 'Mini Quinta Río Bonito';
    warnings.push(`Título no especificado: asignado automáticamente '${titulo}'.`);
  }

  // 4. Superficie / Metraje
  const metrajeRaw = findRowValue(rawRow, [
    /metraje/i,
    /superficie/i,
    /[aá]rea/i,
    /m2/i,
    /m²/i
  ]);

  let metraje = parseNumericValue(metrajeRaw);
  if (metraje <= 0) {
    metraje = 500;
    warnings.push("Superficie no especificada o menor a cero: asignado 500 m² por defecto.");
  }

  // 5. Dimensiones
  const dimensionesRaw = findRowValue(rawRow, [
    /dimensi[oó]n/i,
    /medidas/i,
    /frente/i
  ]);

  let dimensiones = dimensionesRaw ? String(dimensionesRaw).trim() : '';
  if (!dimensiones) {
    dimensiones = '20m x 25m';
    warnings.push("Dimensiones no especificadas: asignado '20m x 25m' por defecto.");
  }

  // 6. Ubicación y Proyecto
  const ubicacionRaw = findRowValue(rawRow, [/ubicaci[oó]n/i, /sector/i, /zona/i, /lugar/i]);
  const ubicacion = ubicacionRaw ? String(ubicacionRaw).trim() : 'Limoncito, Santa Cruz - Zona Alta';

  const proyectoRaw = findRowValue(rawRow, [/proyecto/i, /condominio/i, /urbanizaci[oó]n/i]);
  const proyecto = proyectoRaw ? String(proyectoRaw).trim() : 'Proyecto Río Bonito';

  // 7. Estado
  const estadoRaw = findRowValue(rawRow, [/estado/i, /status/i, /disponib/i]);
  const estadoResult = normalizeEstado(estadoRaw);
  const estado = estadoResult.estado;
  if (estadoResult.warning) {
    warnings.push(estadoResult.warning);
  }

  // 8. Servicios
  const serviciosRaw = findRowValue(rawRow, [/servicio/i]);
  let servicios: string[] = ['Agua de Pozo Profundo', 'Energía Eléctrica', 'Vías Ripiadas', 'Acceso al Río'];
  if (serviciosRaw) {
    if (Array.isArray(serviciosRaw)) {
      servicios = serviciosRaw.map(s => String(s).trim()).filter(Boolean);
    } else {
      const split = String(serviciosRaw).split(/[,;|•\n]/).map(s => s.trim()).filter(Boolean);
      if (split.length > 0) {
        servicios = split;
      }
    }
  }

  // 9. Imagen
  const imagenRaw = findRowValue(rawRow, [/imagen/i, /foto/i, /url/i, /link/i]);
  let imagen = imagenRaw ? String(imagenRaw).trim() : '';
  if (!imagen || !/^https?:\/\//i.test(imagen)) {
    const defaultIdx = (rowNumber - 1) % DEFAULT_IMAGES.length;
    imagen = DEFAULT_IMAGES[defaultIdx];
  }

  // 10. Destacado
  const destacadoRaw = findRowValue(rawRow, [/destacad/i, /favorito/i, /vip/i]);
  const destacado = destacadoRaw 
    ? /^(si|sí|true|1|yes)/i.test(String(destacadoRaw).trim()) 
    : false;

  // 11. Cuota Inicial Porcentaje
  const cuotaInicialPorcentajeRaw = findRowValue(rawRow, [/cuota.*inicial/i, /inicial.*porcentaje/i, /porcentaje/i]);
  let cuotaInicialPorcentaje = parseNumericValue(cuotaInicialPorcentajeRaw);
  if (cuotaInicialPorcentaje <= 0 || cuotaInicialPorcentaje > 100) {
    cuotaInicialPorcentaje = 30; // standard 30%
  }

  // Determine overall status
  let status: 'valid' | 'warning' | 'error' = 'valid';
  if (errors.length > 0) {
    status = 'error';
  } else if (warnings.length > 0) {
    status = 'warning';
  }

  // Construct property object if valid or warning
  let property: Property | null = null;
  if (status !== 'error') {
    // If existing in catalog, reuse existing ID to update cleanly
    const existing = existingProperties.find(
      p => p.loteNumero.toLowerCase().trim() === lotKey
    );

    property = {
      id: existing ? existing.id : `prop-imp-${Date.now()}-${rowNumber}`,
      loteNumero,
      titulo,
      proyecto,
      ubicacion,
      precio,
      cuotaInicialPorcentaje,
      metraje,
      dimensiones,
      servicios,
      imagen,
      disponible: estado === 'disponible',
      estado,
      destacado,
      caracteristicas: [
        `Superficie de ${metraje} m²`,
        `Frente y fondo: ${dimensiones}`,
        `Documentación y plano al día`,
        `Crédito directo sin bancos (30% inicial)`
      ]
    };
  }

  return {
    rowNumber,
    rawRow,
    property,
    status,
    errors,
    warnings,
    isDuplicateInFile,
    isExistingInCatalog
  };
}

/**
 * Parses and validates an Excel file or buffer
 */
export async function parseAndValidatePropertiesExcel(
  fileOrBuffer: File | ArrayBuffer,
  existingProperties: Property[],
  fileName?: string
): Promise<PropertyExcelImportReport> {
  return new Promise((resolve) => {
    try {
      const handleBuffer = (buffer: ArrayBuffer) => {
        try {
          const data = new Uint8Array(buffer);
          const workbook = XLSX.read(data, { type: 'array' });

          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            return resolve({
              success: false,
              totalRows: 0,
              validRowsCount: 0,
              warningRowsCount: 0,
              errorRowsCount: 0,
              rows: [],
              validProperties: [],
              sheetName: '',
              fileName,
              errorMessage: 'El archivo Excel no contiene ninguna hoja de cálculo.'
            });
          }

          // Choose the best sheet: preferably containing 'propiedad', 'lote', 'inventario', 'quinta' or the first one
          let targetSheetName = workbook.SheetNames[0];
          const matchedSheet = workbook.SheetNames.find(name =>
            /propiedad|lote|inventario|quinta|catalogo|inmueble/i.test(name)
          );
          if (matchedSheet) {
            targetSheetName = matchedSheet;
          }

          const worksheet = workbook.Sheets[targetSheetName];
          const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

          if (!rawRows || rawRows.length === 0) {
            return resolve({
              success: false,
              totalRows: 0,
              validRowsCount: 0,
              warningRowsCount: 0,
              errorRowsCount: 0,
              rows: [],
              validProperties: [],
              sheetName: targetSheetName,
              fileName,
              errorMessage: `La hoja "${targetSheetName}" está vacía o no contiene filas con datos.`
            });
          }

          const validationRows: PropertyValidationRow[] = [];
          const seenLotesInFile = new Map<string, number>();

          rawRows.forEach((row, index) => {
            // Ignore completely empty rows
            const values = Object.values(row).filter(v => v !== '' && v !== null && v !== undefined);
            if (values.length === 0) return;

            const validatedRow = validatePropertyRow(
              row,
              index + 2, // 1-based, +1 for header
              existingProperties,
              seenLotesInFile
            );
            validationRows.push(validatedRow);
          });

          const validRowsCount = validationRows.filter(r => r.status === 'valid').length;
          const warningRowsCount = validationRows.filter(r => r.status === 'warning').length;
          const errorRowsCount = validationRows.filter(r => r.status === 'error').length;

          const validProperties: Property[] = validationRows
            .filter(r => r.property !== null)
            .map(r => r.property as Property);

          return resolve({
            success: validProperties.length > 0,
            totalRows: validationRows.length,
            validRowsCount,
            warningRowsCount,
            errorRowsCount,
            rows: validationRows,
            validProperties,
            sheetName: targetSheetName,
            fileName,
            errorMessage: validProperties.length === 0 
              ? 'No se encontraron filas válidas para importar en el archivo. Revise los errores señalados.' 
              : undefined
          });
        } catch (err: any) {
          return resolve({
            success: false,
            totalRows: 0,
            validRowsCount: 0,
            warningRowsCount: 0,
            errorRowsCount: 0,
            rows: [],
            validProperties: [],
            sheetName: '',
            fileName,
            errorMessage: `Error al procesar el archivo Excel: ${err?.message || 'Formato no soportado.'}`
          });
        }
      };

      if (fileOrBuffer instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result instanceof ArrayBuffer) {
            handleBuffer(e.target.result);
          } else {
            resolve({
              success: false,
              totalRows: 0,
              validRowsCount: 0,
              warningRowsCount: 0,
              errorRowsCount: 0,
              rows: [],
              validProperties: [],
              sheetName: '',
              fileName,
              errorMessage: 'No se pudo leer el archivo cargado.'
            });
          }
        };
        reader.onerror = () => {
          resolve({
            success: false,
            totalRows: 0,
            validRowsCount: 0,
            warningRowsCount: 0,
            errorRowsCount: 0,
            rows: [],
            validProperties: [],
            sheetName: '',
            fileName,
            errorMessage: 'Error en la lectura del archivo desde el dispositivo.'
          });
        };
        reader.readAsArrayBuffer(fileOrBuffer);
      } else {
        handleBuffer(fileOrBuffer);
      }
    } catch (outerErr: any) {
      resolve({
        success: false,
        totalRows: 0,
        validRowsCount: 0,
        warningRowsCount: 0,
        errorRowsCount: 0,
        rows: [],
        validProperties: [],
        sheetName: '',
        fileName,
        errorMessage: outerErr?.message || 'Error inesperado al validar Excel.'
      });
    }
  });
}

/**
 * Generates and triggers download of the Official CADIS Excel Import Template
 */
export function downloadPropertyImportTemplate(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Template with real example rows and clear column structure
  const templateRows = [
    {
      'Nº Lote': 'Lote RB-09',
      'Título / Denominación': 'Mini Quinta Los Guayacanes',
      'Precio USD': 8500,
      'Superficie m²': 500,
      'Dimensiones': '20m x 25m',
      'Estado': 'disponible',
      'Ubicación': 'Limoncito, Santa Cruz - Sector Colinas',
      'Proyecto': 'Proyecto Río Bonito',
      'Servicios Básicos': 'Agua de Pozo Profundo, Energía Eléctrica, Calles Ripiadas, Acceso al Río',
      'Destacado': 'SI',
      'Cuota Inicial %': 30
    },
    {
      'Nº Lote': 'Lote RB-10',
      'Título / Denominación': 'Mini Quinta El Mirador del Valle',
      'Precio USD': 9200,
      'Superficie m²': 550,
      'Dimensiones': '22m x 25m',
      'Estado': 'disponible',
      'Ubicación': 'Limoncito, Santa Cruz - Zona Alta',
      'Proyecto': 'Proyecto Río Bonito',
      'Servicios Básicos': 'Agua potable, Energía Eléctrica, Vías Ripiadas',
      'Destacado': 'NO',
      'Cuota Inicial %': 30
    },
    {
      'Nº Lote': 'Lote RB-11',
      'Título / Denominación': 'Mini Quinta Las Palmeras Real',
      'Precio USD': 8000,
      'Superficie m²': 500,
      'Dimensiones': '20m x 25m',
      'Estado': 'reservado',
      'Ubicación': 'Limoncito, Santa Cruz - Entrada Principal',
      'Proyecto': 'Proyecto Río Bonito',
      'Servicios Básicos': 'Agua, Luz, Camino Ripiado',
      'Destacado': 'NO',
      'Cuota Inicial %': 30
    },
    {
      'Nº Lote': 'Lote RB-12',
      'Título / Denominación': 'Mini Quinta Los Tajibos Dorados',
      'Precio USD': 11000,
      'Superficie m²': 700,
      'Dimensiones': '28m x 25m',
      'Estado': 'disponible',
      'Ubicación': 'Limoncito, Santa Cruz - Ribera del Río',
      'Proyecto': 'Proyecto Río Bonito',
      'Servicios Básicos': 'Agua de Pozo, Electricidad, Entorno Arbolado, Acceso al Río',
      'Destacado': 'SI',
      'Cuota Inicial %': 30
    }
  ];

  const wsTemplate = XLSX.utils.json_to_sheet(templateRows);

  wsTemplate['!cols'] = [
    { wch: 15 }, // Lote
    { wch: 32 }, // Título
    { wch: 14 }, // Precio
    { wch: 15 }, // Superficie
    { wch: 16 }, // Dimensiones
    { wch: 14 }, // Estado
    { wch: 35 }, // Ubicación
    { wch: 24 }, // Proyecto
    { wch: 45 }, // Servicios
    { wch: 12 }, // Destacado
    { wch: 16 }  // Cuota Inicial
  ];

  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Plantilla Propiedades CADIS');

  // Sheet 2: Quick Guide & Rules
  const instructions = [
    { 'CAMPO': 'Nº Lote', 'OBLIGATORIO': 'SÍ', 'FORMATO': 'Texto (Ej: Lote RB-09 o RB-09)', 'DESCRIPCIÓN': 'Identificador único del lote. Si ya existe en el catálogo, actualizará sus datos.' },
    { 'CAMPO': 'Título / Denominación', 'OBLIGATORIO': 'OPCIONAL', 'FORMATO': 'Texto', 'DESCRIPCIÓN': 'Nombre comercial. Si se omite, se asigna automáticamente "Mini Quinta [Lote]".' },
    { 'CAMPO': 'Precio USD', 'OBLIGATORIO': 'SÍ', 'FORMATO': 'Numérico mayor a 0', 'DESCRIPCIÓN': 'Precio total de contado / lista en Dólares Estadounidenses (USD).' },
    { 'CAMPO': 'Superficie m²', 'OBLIGATORIO': 'OPCIONAL', 'FORMATO': 'Numérico', 'DESCRIPCIÓN': 'Área del terreno en metros cuadrados. Por defecto 500 m².' },
    { 'CAMPO': 'Dimensiones', 'OBLIGATORIO': 'OPCIONAL', 'FORMATO': 'Texto (Ej: 20m x 25m)', 'DESCRIPCIÓN': 'Medidas de frente y fondo.' },
    { 'CAMPO': 'Estado', 'OBLIGATORIO': 'OPCIONAL', 'FORMATO': 'disponible | reservado | vendido', 'DESCRIPCIÓN': 'Disponibilidad del lote. Por defecto "disponible".' },
    { 'CAMPO': 'Ubicación', 'OBLIGATORIO': 'OPCIONAL', 'FORMATO': 'Texto', 'DESCRIPCIÓN': 'Zona o referencia geográfica dentro de Limoncito / Cotoca.' },
    { 'CAMPO': 'Proyecto', 'OBLIGATORIO': 'OPCIONAL', 'FORMATO': 'Texto', 'DESCRIPCIÓN': 'Por defecto "Proyecto Río Bonito".' },
    { 'CAMPO': 'Servicios Básicos', 'OBLIGATORIO': 'OPCIONAL', 'FORMATO': 'Texto separado por comas', 'DESCRIPCIÓN': 'Ej: Agua, Electricidad, Vías Ripiadas.' },
    { 'CAMPO': 'Destacado', 'OBLIGATORIO': 'OPCIONAL', 'FORMATO': 'SI / NO', 'DESCRIPCIÓN': 'Resalta el lote con insignia VIP en la galería principal.' }
  ];

  const wsInstructions = XLSX.utils.json_to_sheet(instructions);
  wsInstructions['!cols'] = [
    { wch: 22 },
    { wch: 14 },
    { wch: 30 },
    { wch: 55 }
  ];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Guía de Columnas');

  XLSX.writeFile(wb, 'Plantilla_Importacion_Propiedades_CADIS.xlsx');
}

/**
 * Generates an in-memory demo batch to test Excel import & validation immediately
 */
export function generateDemoPropertiesImportBatch(): Record<string, any>[] {
  return [
    {
      'Nº Lote': 'Lote RB-09',
      'Título / Denominación': 'Mini Quinta Los Guayacanes',
      'Precio USD': 8500,
      'Superficie m²': 500,
      'Dimensiones': '20m x 25m',
      'Estado': 'disponible',
      'Ubicación': 'Limoncito, Santa Cruz - Sector Colinas',
      'Servicios Básicos': 'Agua de Pozo Profundo, Energía Eléctrica, Calles Ripiadas, Acceso al Río',
      'Destacado': 'SI'
    },
    {
      'Nº Lote': 'Lote RB-10',
      'Título / Denominación': 'Mini Quinta El Mirador del Valle',
      'Precio USD': 9200,
      'Superficie m²': 550,
      'Dimensiones': '22m x 25m',
      'Estado': 'disponible',
      'Ubicación': 'Limoncito, Santa Cruz - Zona Alta',
      'Servicios Básicos': 'Agua potable, Energía Eléctrica, Vías Ripiadas',
      'Destacado': 'SI'
    },
    {
      'Nº Lote': 'Lote RB-01', // Existing lot demonstration: triggers warning of update
      'Título / Denominación': 'Mini Quinta El Manantial (Actualizada)',
      'Precio USD': 8200,
      'Superficie m²': 500,
      'Dimensiones': '20m x 25m',
      'Estado': 'disponible',
      'Ubicación': 'Limoncito, Santa Cruz - Zona Alta',
      'Servicios Básicos': 'Agua de Pozo Profundo, Energía Eléctrica, Vías Ripiadas, Acceso al Río'
    },
    {
      'Nº Lote': 'Lote RB-11',
      'Título / Denominación': 'Mini Quinta Los Cántaros del Río',
      'Precio USD': 8900,
      'Superficie m²': 500,
      'Dimensiones': '20m x 25m',
      'Estado': 'reservado',
      'Ubicación': 'Limoncito, Santa Cruz - Entrada Ribereña'
    },
    {
      'Nº Lote': 'Lote RB-12',
      'Título / Denominación': 'Mini Quinta Quinta Real Ribereña',
      'Precio USD': 11500,
      'Superficie m²': 680,
      'Dimensiones': '25m x 27.2m',
      'Estado': 'disponible',
      'Ubicación': 'Limoncito, Santa Cruz - Primera Línea Río'
    },
    {
      'Nº Lote': 'Lote RB-13',
      'Título / Denominación': 'Lote con Precio Faltante (Demostración de Error)',
      'Precio USD': 0, // Intentionally invalid to demonstrate row error flagging
      'Superficie m²': 500,
      'Dimensiones': '20m x 25m',
      'Estado': 'disponible'
    }
  ];
}
