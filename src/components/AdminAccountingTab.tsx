import React, { useState, useRef } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  CreditCard, 
  Lock, 
  FileText,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { AccountingEntry, AccountingSummary, UserRole, Property, CreditSimulation } from '../types';
import { 
  exportAccountingLedgerToExcel, 
  exportSalesReportToExcel, 
  parseAndProcessSalesReportExcel,
  downloadSampleSalesReportTemplate 
} from '../utils/excelReportManager';

interface AdminAccountingTabProps {
  entries: AccountingEntry[];
  summary: AccountingSummary;
  userRole: UserRole;
  currentUsername: string;
  properties: Property[];
  simulations: CreditSimulation[];
  onAddEntry: (entry: AccountingEntry) => void;
  onImportEntries: (newEntries: AccountingEntry[], lotUpdates: { loteNumero: string; estado: 'disponible' | 'reservado' | 'vendido' }[]) => void;
}

export const AdminAccountingTab: React.FC<AdminAccountingTabProps> = ({
  entries,
  summary,
  userRole,
  currentUsername,
  properties,
  simulations,
  onAddEntry,
  onImportEntries
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual entry form fields
  const [manualConcepto, setManualConcepto] = useState('');
  const [manualTipo, setManualTipo] = useState<AccountingEntry['tipo']>('ingreso_cuota_inicial');
  const [manualMonto, setManualMonto] = useState<number>(2400);
  const [manualLote, setManualLote] = useState('Lote RB-01');
  const [manualCliente, setManualCliente] = useState('');
  const [manualMetodo, setManualMetodo] = useState<AccountingEntry['metodoPago']>('transferencia');
  const [manualComprobante, setManualComprobante] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = userRole === 'admin' || userRole === 'developer';
  const canUploadReports = userRole === 'admin' || userRole === 'developer' || userRole === 'editor';

  // Filtered ledger entries
  const filteredEntries = entries.filter((e) => {
    const matchesSearch = 
      e.concepto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.loteReferencia && e.loteReferencia.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.clienteReferencia && e.clienteReferencia.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.comprobante && e.comprobante.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'todos' || e.tipo === filterType;
    return matchesSearch && matchesType;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadFeedback(null);

    try {
      const result = await parseAndProcessSalesReportExcel(file, currentUsername);
      if (result.success) {
        onImportEntries(result.importedEntries, result.updatedLotStatuses);
        setUploadFeedback({
          type: 'success',
          message: `${result.message} Total recaudado procesado: $${result.totalImportedMontoUSD.toLocaleString()} USD.`
        });
      } else {
        setUploadFeedback({
          type: 'error',
          message: result.message
        });
      }
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: `Error al procesar: ${err?.message || 'Archivo inválido'}`
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualConcepto.trim() || manualMonto === 0) return;

    const newEntry: AccountingEntry = {
      id: `acc-man-${Date.now()}`,
      fecha: new Date().toISOString().substring(0, 10),
      tipo: manualTipo,
      concepto: manualConcepto.trim(),
      loteReferencia: manualLote.trim(),
      clienteReferencia: manualCliente.trim() || 'Cliente CADIS',
      montoUSD: manualTipo === 'egreso_operativo' || manualTipo === 'comision_vendedor' 
        ? -Math.abs(manualMonto) 
        : Math.abs(manualMonto),
      metodoPago: manualMetodo,
      comprobante: manualComprobante.trim() || `REC-${Date.now().toString().slice(-4)}`,
      registradoPor: currentUsername,
      origen: 'manual'
    };

    onAddEntry(newEntry);
    setShowManualModal(false);
    setManualConcepto('');
    setManualCliente('');
    setManualComprobante('');
    setUploadFeedback({
      type: 'success',
      message: `Asiento contable registrado exitosamente por $${Math.abs(manualMonto).toLocaleString()} USD.`
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      
      {/* 1. Header Banner & Actions */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-100 text-[#009698]">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              Control de Ingresos y Egresos (Registro de Caja)
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#009698] text-white">
              Caja Diaria
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro y flujo de caja diario de ingresos por cuotas iniciales, cuotas mensuales, reservas y egresos operativos.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Sales Report to Excel */}
          <button
            type="button"
            onClick={() => exportSalesReportToExcel(simulations, properties, entries)}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Descargar Reporte Completo de Ventas en formato Excel (.xlsx)"
            id="btn-export-sales-excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Exportar Reporte de Ventas (Excel)</span>
          </button>

          {/* Export Balance Sheet to Excel */}
          <button
            type="button"
            onClick={() => exportAccountingLedgerToExcel(entries, summary)}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Exportar Balance Contable a Excel"
            id="btn-export-balance-excel"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>Exportar Balance (Excel)</span>
          </button>

          {/* Manual Entry Button (Restricted to Admin / Dev) */}
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              id="btn-add-accounting-entry"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Asiento</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Ingresos Recaudados</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            ${summary.totalIngresosUSD.toLocaleString()} <span className="text-xs text-slate-400">USD</span>
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cuotas iniciales y cuotas recibidas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Egresos & Comisiones</span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            ${Math.abs(summary.totalEgresosUSD).toLocaleString()} <span className="text-xs text-slate-400">USD</span>
          </p>
          <div className="flex items-center gap-1 text-[11px] text-rose-500 font-semibold mt-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Obras, comisiones y apertura</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Balance Neto en Caja</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ${summary.balanceNetoUSD.toLocaleString()} <span className="text-xs text-slate-400">USD</span>
          </p>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            Flujo neto disponible
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Cartera Financiada por Cobrar</span>
          <p className="text-2xl font-black text-sky-700 mt-1">
            ${summary.carteraPorCobrarUSD.toLocaleString()} <span className="text-xs text-slate-400">USD</span>
          </p>
          <div className="text-[11px] text-sky-600 font-semibold mt-1">
            {summary.lotesVendidosTotal} lotes en financiamiento directo
          </div>
        </div>
      </div>

      {/* 3. Excel Sales Report Upload & Sync Section */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/80 p-5 rounded-2xl border border-emerald-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <h4 className="text-sm font-black text-emerald-950">
                Cargar Reporte de Ventas Excel y Actualizar Contabilidad
              </h4>
            </div>
            <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
              Sube el archivo Excel con los reportes de venta o cobranzas del equipo comercial. El sistema leerá automáticamente los clientes, lotes y montos cobrados, sumando los ingresos al libro contable y actualizando el estado de los lotes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Download Sample Template */}
            <button
              type="button"
              onClick={downloadSampleSalesReportTemplate}
              className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar plantilla de Excel con formato de ejemplo"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Descargar Plantilla Excel</span>
            </button>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
              id="input-excel-sales-report"
            />

            {/* Upload Trigger Button */}
            {canUploadReports ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                id="btn-upload-sales-report"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Procesando Excel...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-white" />
                    <span>Subir Reporte Excel</span>
                  </>
                )}
              </button>
            ) : (
              <div className="px-3 py-2 rounded-xl bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Solo Administrador</span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback message */}
        {uploadFeedback && (
          <div className={`mt-3.5 p-3 rounded-xl flex items-center gap-2.5 text-xs font-bold ${
            uploadFeedback.type === 'success' 
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
              : 'bg-rose-100 text-rose-900 border border-rose-300'
          }`}>
            {uploadFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <span>{uploadFeedback.message}</span>
          </div>
        )}
      </div>

      {/* 4. Ledger Table & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Header Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por concepto, lote, cliente o comprobante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los Movimientos ({entries.length})</option>
              <option value="ingreso_cuota_inicial">Cuotas Iniciales</option>
              <option value="ingreso_cuota_mensual">Cuotas Mensuales</option>
              <option value="ingreso_reserva">Reservas</option>
              <option value="egreso_operativo">Egresos Operativos</option>
              <option value="comision_vendedor">Comisiones Vendedores</option>
            </select>
          </div>
        </div>

        {/* Entries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Concepto & Lote</th>
                <th className="p-3">Cliente / Titular</th>
                <th className="p-3">Tipo Movimiento</th>
                <th className="p-3">Método / Comprobante</th>
                <th className="p-3 text-right">Monto (USD)</th>
                <th className="p-3 text-center">Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No se encontraron registros contables con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((item) => {
                  const isPositive = item.montoUSD > 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.fecha}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{item.concepto}</p>
                        {item.loteReferencia && (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {item.loteReferencia}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {item.clienteReferencia || 'CADIS'}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          item.tipo === 'ingreso_cuota_inicial'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.tipo === 'ingreso_cuota_mensual'
                            ? 'bg-teal-100 text-teal-800'
                            : item.tipo === 'ingreso_reserva'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.tipo.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800 uppercase text-[11px]">{item.metodoPago}</p>
                        <span className="text-[10px] font-mono text-slate-400">{item.comprobante}</span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`text-xs font-black ${
                          isPositive ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {isPositive ? '+' : ''}${item.montoUSD.toLocaleString()} USD
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.origen === 'importacion_excel'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.origen === 'importacion_excel' ? 'Excel Import' : 'Manual'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-black text-slate-900">Registrar Nuevo Asiento Contable</h4>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateManualEntry} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Concepto del Movimiento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cobro de cuota inicial Lote RB-03"
                  value={manualConcepto}
                  onChange={(e) => setManualConcepto(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Movimiento</label>
                  <select
                    value={manualTipo}
                    onChange={(e) => setManualTipo(e.target.value as AccountingEntry['tipo'])}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="ingreso_cuota_inicial">Ingreso Cuota Inicial</option>
                    <option value="ingreso_cuota_mensual">Ingreso Cuota Mensual</option>
                    <option value="ingreso_reserva">Ingreso Reserva</option>
                    <option value="egreso_operativo">Egreso Operativo / Obras</option>
                    <option value="comision_vendedor">Comisión a Vendedor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monto en USD *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={manualMonto}
                    onChange={(e) => setManualMonto(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lote Referencia</label>
                  <select
                    value={manualLote}
                    onChange={(e) => setManualLote(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.loteNumero}>
                        {p.loteNumero} ({p.titulo})
                      </option>
                    ))}
                    <option value="Proyecto General">Proyecto General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cliente / Titular</label>
                  <input
                    type="text"
                    placeholder="Nombre del cliente"
                    value={manualCliente}
                    onChange={(e) => setManualCliente(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Método de Pago</label>
                  <select
                    value={manualMetodo}
                    onChange={(e) => setManualMetodo(e.target.value as AccountingEntry['metodoPago'])}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="efectivo">Efectivo en Caja</option>
                    <option value="qr">Pago QR</option>
                    <option value="deposito">Depósito Bancario</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nº Comprobante / Recibo</label>
                  <input
                    type="text"
                    placeholder="Ej: TRF-BNB-129844"
                    value={manualComprobante}
                    onChange={(e) => setManualComprobante(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm"
                >
                  Guardar Asiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
