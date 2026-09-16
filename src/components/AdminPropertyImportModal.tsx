import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  X, 
  RefreshCw, 
  Layers, 
  FileCheck, 
  Sparkles, 
  Info, 
  HelpCircle,
  ArrowRight,
  Eye,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Property, UserRole } from '../types';
import { 
  parseAndValidatePropertiesExcel, 
  downloadPropertyImportTemplate, 
  generateDemoPropertiesImportBatch,
  validatePropertyRow,
  PropertyExcelImportReport, 
  PropertyValidationRow 
} from '../utils/excelPropertyImporter';

interface AdminPropertyImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingProperties: Property[];
  onConfirmImport: (validProperties: Property[], mode: 'append' | 'replace') => void;
  onLogActivity?: (
    accion: 'importacion_excel' | 'creacion_lote' | 'cambio_estado_lote',
    titulo: string,
    descripcion: string,
    entidadAfectada?: string,
    tipo?: 'info' | 'warning' | 'danger'
  ) => void;
  currentUsername: string;
  userRole?: UserRole;
}

export const AdminPropertyImportModal: React.FC<AdminPropertyImportModalProps> = ({
  isOpen,
  onClose,
  existingProperties,
  onConfirmImport,
  onLogActivity,
  currentUsername,
  userRole = 'admin'
}) => {
  const [report, setReport] = useState<PropertyExcelImportReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFileSize, setSelectedFileSize] = useState<string>('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [filterView, setFilterView] = useState<'all' | 'valid' | 'errors' | 'warnings'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const canReplace = userRole === 'admin' || userRole === 'developer';

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setSelectedFileName(file.name);
    setSelectedFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setSuccessNotice(null);

    try {
      const result = await parseAndValidatePropertiesExcel(file, existingProperties, file.name);
      setReport(result);
    } catch (err: any) {
      alert(`Error al procesar archivo: ${err?.message || 'Formato no soportado'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleLoadDemoData = () => {
    setIsProcessing(true);
    setSelectedFileName('Lotes_Demo_Proyecto_RioBonito.xlsx');
    setSelectedFileSize('18.4 KB');
    setSuccessNotice(null);

    // Run validation over the demo set
    setTimeout(() => {
      const demoRows = generateDemoPropertiesImportBatch();
      const seenLotesInFile = new Map<string, number>();
      const validationRows: PropertyValidationRow[] = demoRows.map((row, idx) => {
        return validatePropertyRow(row, idx + 2, existingProperties, seenLotesInFile);
      });

      const validRowsCount = validationRows.filter(r => r.status === 'valid').length;
      const warningRowsCount = validationRows.filter(r => r.status === 'warning').length;
      const errorRowsCount = validationRows.filter(r => r.status === 'error').length;
      const validProperties = validationRows
        .filter(r => r.property !== null)
        .map(r => r.property as Property);

      setReport({
        success: validProperties.length > 0,
        totalRows: validationRows.length,
        validRowsCount,
        warningRowsCount,
        errorRowsCount,
        rows: validationRows,
        validProperties,
        sheetName: 'Lotes Demo',
        fileName: 'Lotes_Demo_Proyecto_RioBonito.xlsx'
      });
      setIsProcessing(false);
    }, 200);
  };

  const handleExecuteImport = () => {
    if (!report || report.validProperties.length === 0) return;

    const count = report.validProperties.length;
    const modeLabel = importMode === 'replace' ? 'reemplazarán' : 'incorporarán / actualizarán';

    const confirmMsg = importMode === 'replace'
      ? `ADVERTENCIA: Se reemplazará el catálogo completo de propiedades por ${count} lotes válidos. ¿Desea continuar?`
      : `¿Confirma la importación de ${count} propiedades válidas al catálogo?`;

    if (!window.confirm(confirmMsg)) return;

    onConfirmImport(report.validProperties, importMode);

    if (onLogActivity) {
      onLogActivity(
        'importacion_excel',
        `Importación Excel Masiva (${importMode === 'replace' ? 'Reemplazo' : 'Anexo'})`,
        `Se importaron ${count} propiedades validadas desde "${report.fileName || 'Excel'}". Registrado por ${currentUsername}.`,
        'Catálogo de Propiedades',
        importMode === 'replace' ? 'danger' : 'info'
      );
    }

    setSuccessNotice(`¡Catálogo actualizado con éxito! Se procesaron ${count} propiedades.`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Filtered rows for the preview table
  const displayedRows = report?.rows.filter(r => {
    // Filter status
    if (filterView === 'valid' && r.status === 'error') return false;
    if (filterView === 'warnings' && r.status !== 'warning') return false;
    if (filterView === 'errors' && r.status !== 'error') return false;

    // Filter search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const lote = (r.property?.loteNumero || r.rawRow['Nº Lote'] || '').toLowerCase();
      const titulo = (r.property?.titulo || r.rawRow['Título / Denominación'] || '').toLowerCase();
      const issues = [...r.errors, ...r.warnings].join(' ').toLowerCase();
      return lote.includes(term) || titulo.includes(term) || issues.includes(term);
    }

    return true;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Importación Masiva de Propiedades (Excel)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Validador de Integridad
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Carga lotes masivos en Proyecto Río Bonito desde archivos .xlsx o .csv con diagnóstico previo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadPropertyImportTemplate}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Descargar archivo Excel de ejemplo con encabezados y guía"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Descargar Plantilla Excel</span>
              <span className="sm:hidden">Plantilla</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          
          {/* UPLOAD & DEMO ZONE */}
          {!report ? (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]' 
                    : 'border-slate-300 hover:border-emerald-500 bg-white hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  {isProcessing ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                </div>

                <h4 className="text-sm font-black text-slate-800">
                  {isProcessing ? 'Analizando estructura del archivo Excel...' : 'Arrastra tu archivo Excel aquí o haz clic para explorar'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Soporta formatos <strong>.xlsx, .xls y .csv</strong>. El sistema verificará automáticamente precios, códigos de lote, superficies y estados.
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-600">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 font-bold">Nº Lote</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 font-bold">Precio USD</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 font-bold">Superficie m²</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 font-bold">Estado</span>
                </div>
              </div>

              {/* Quick Testing Actions Banner */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-emerald-600 text-white shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-emerald-950">
                      ¿No tienes un archivo Excel a la mano?
                    </h5>
                    <p className="text-[11px] text-emerald-800">
                      Prueba el motor de validación en tiempo real con nuestro lote de datos demo preparado para Río Bonito.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLoadDemoData}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
                >
                  <span>Cargar Datos Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* REPORT & VALIDATION DASHBOARD */
            <div className="space-y-4">
              
              {/* File Info Bar */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{report.fileName || selectedFileName}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                        Hoja: "{report.sheetName}"
                      </span>
                      {selectedFileSize && (
                        <span className="text-[10px] text-slate-400 font-semibold">{selectedFileSize}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Diagnóstico completado con {report.totalRows} filas analizadas.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReport(null);
                      setSelectedFileName('');
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cambiar archivo
                  </button>
                  <button
                    type="button"
                    onClick={downloadPropertyImportTemplate}
                    className="px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Plantilla</span>
                  </button>
                </div>
              </div>

              {/* KPI CARDS DE VALIDACIÓN */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500">Filas Leídas</span>
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-xl font-black text-slate-900 mt-1">{report.totalRows}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Registros en el archivo</p>
                </div>

                {/* Válidas */}
                <div 
                  onClick={() => setFilterView('valid')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    filterView === 'valid'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-700">Listas para Importar</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-xl font-black text-emerald-700 mt-1">{report.validProperties.length}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Sin errores bloqueantes</p>
                </div>

                {/* Advertencias */}
                <div 
                  onClick={() => setFilterView('warnings')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    filterView === 'warnings'
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-700">Con Advertencias</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-xl font-black text-amber-700 mt-1">{report.warningRowsCount}</p>
                  <p className="text-[10px] text-amber-600 font-semibold">Valores por defecto / updates</p>
                </div>

                {/* Errores */}
                <div 
                  onClick={() => setFilterView('errors')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    filterView === 'errors'
                      ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-rose-700">Filas Rechazadas</span>
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <p className="text-xl font-black text-rose-700 mt-1">{report.errorRowsCount}</p>
                  <p className="text-[10px] text-rose-600 font-semibold">Requieren corrección</p>
                </div>
              </div>

              {/* FILTER & SEARCH BAR */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setFilterView('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterView === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todas ({report.rows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterView('valid')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterView === 'valid'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    Válidas ({report.validProperties.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterView('warnings')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterView === 'warnings'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    Advertencias ({report.warningRowsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterView('errors')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterView === 'errors'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    Errores ({report.errorRowsCount})
                  </button>
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Filtrar por lote, título o error..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* PREVIEW VALIDATION TABLE */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="max-h-72 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase sticky top-0 z-10 border-b">
                      <tr>
                        <th className="p-2.5 w-12 text-center">Fila</th>
                        <th className="p-2.5 w-24">Estado</th>
                        <th className="p-2.5">Lote</th>
                        <th className="p-2.5">Título / Denominación</th>
                        <th className="p-2.5 text-right">Precio USD</th>
                        <th className="p-2.5">Superficie</th>
                        <th className="p-2.5">Disponibilidad</th>
                        <th className="p-2.5">Diagnóstico de Validación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                            No se encontraron filas con el filtro seleccionado.
                          </td>
                        </tr>
                      ) : (
                        displayedRows.map((row) => {
                          const isErr = row.status === 'error';
                          const isWarn = row.status === 'warning';
                          const prop = row.property;

                          return (
                            <tr 
                              key={row.rowNumber}
                              className={`hover:bg-slate-50/80 transition-colors ${
                                isErr ? 'bg-rose-50/40' : isWarn ? 'bg-amber-50/20' : ''
                              }`}
                            >
                              <td className="p-2.5 text-center font-bold text-slate-500">
                                {row.rowNumber}
                              </td>
                              <td className="p-2.5">
                                {isErr ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                    <XCircle className="w-3 h-3 text-rose-600" />
                                    Error
                                  </span>
                                ) : isWarn ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    Aviso
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Válido
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 font-extrabold text-slate-900">
                                {prop?.loteNumero || row.rawRow['Nº Lote'] || <span className="text-rose-500 italic">Sin lote</span>}
                              </td>
                              <td className="p-2.5 font-medium text-slate-800">
                                {prop?.titulo || row.rawRow['Título / Denominación'] || '-'}
                              </td>
                              <td className="p-2.5 text-right font-black text-slate-900">
                                {prop?.precio ? (
                                  `$${prop.precio.toLocaleString()} USD`
                                ) : (
                                  <span className="text-rose-600 font-bold">
                                    {row.rawRow['Precio USD'] !== undefined ? `$${row.rawRow['Precio USD']}` : 'No definido'}
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-slate-600 font-semibold">
                                {prop?.metraje ? `${prop.metraje} m²` : '-'}
                              </td>
                              <td className="p-2.5">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  prop?.estado === 'disponible'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : prop?.estado === 'reservado'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {prop?.estado || 'disponible'}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <div className="space-y-0.5 max-w-sm">
                                  {row.errors.map((err, i) => (
                                    <p key={`err-${i}`} className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                                      <span>{err}</span>
                                    </p>
                                  ))}
                                  {row.warnings.map((warn, i) => (
                                    <p key={`warn-${i}`} className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                                      <span>{warn}</span>
                                    </p>
                                  ))}
                                  {row.errors.length === 0 && row.warnings.length === 0 && (
                                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                      Estructura y datos validados
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CONFIGURACIÓN DEL MODO DE IMPORTACIÓN */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h5 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Modo de Aplicación en el Catálogo</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label 
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      importMode === 'append'
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Anexar y Actualizar Lotes (Recomendado)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Agrega los nuevos lotes y actualiza aquellos que ya existan con el mismo número de lote. Conserva el resto del catálogo intacto.
                      </p>
                    </div>
                  </label>

                  <label 
                    className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                      !canReplace
                        ? 'bg-slate-100/80 border-slate-200 opacity-60 cursor-not-allowed'
                        : importMode === 'replace'
                        ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20 cursor-pointer'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      disabled={!canReplace}
                      checked={importMode === 'replace'}
                      onChange={() => canReplace && setImportMode('replace')}
                      className="mt-1 text-rose-600 focus:ring-rose-500 disabled:opacity-50"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-rose-900 block">
                          Reemplazo Completo del Catálogo
                        </span>
                        {!canReplace && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                            Solo Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-rose-600 mt-0.5">
                        {canReplace 
                          ? 'Sobrescribe todo el inventario existente reemplazándolo exclusivamente por los lotes válidos de este archivo.'
                          : 'Acción de borrado masivo bloqueada. Tu perfil (Editor) solo tiene autorización para el modo seguro Anexar y Actualizar.'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* SUCCESS NOTICE */}
              {successNotice && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{successNotice}</span>
                </div>
              )}

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-white px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {report ? (
              <span>
                Se importarán <strong>{report.validProperties.length}</strong> propiedades válidas al catálogo (de {report.totalRows} analizadas).
              </span>
            ) : (
              <span>Descarga la plantilla oficial para asegurar la coincidencia exacta de columnas.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            {report && (
              <button
                type="button"
                disabled={report.validProperties.length === 0}
                onClick={handleExecuteImport}
                className={`px-5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                  report.validProperties.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Confirmar e Importar {report.validProperties.length} Lotes
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
