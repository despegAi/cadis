import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  FileSpreadsheet, 
  Image, 
  FileCheck, 
  Search, 
  Calendar, 
  User, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Lock
} from 'lucide-react';
import { AdminDocument, UserRole, Property, AccountingEntry } from '../types';
import { parseAndProcessSalesReportExcel } from '../utils/excelReportManager';

interface AdminDocumentsTabProps {
  documents: AdminDocument[];
  userRole: UserRole;
  currentUsername: string;
  properties: Property[];
  onAddDocument: (doc: AdminDocument) => void;
  onDeleteDocument: (id: string) => void;
  onImportEntriesFromExcel?: (entries: AccountingEntry[], lotUpdates: { loteNumero: string; estado: 'disponible' | 'reservado' | 'vendido' }[]) => void;
}

export const AdminDocumentsTab: React.FC<AdminDocumentsTabProps> = ({
  documents,
  userRole,
  currentUsername,
  properties,
  onAddDocument,
  onDeleteDocument,
  onImportEntriesFromExcel
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [docNombre, setDocNombre] = useState('');
  const [docTipo, setDocTipo] = useState<AdminDocument['tipo']>('reporte_excel');
  const [docLote, setDocLote] = useState('Todos los lotes');
  const [docCliente, setDocCliente] = useState('');
  const [docNotas, setDocNotas] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFileSize, setSelectedFileSize] = useState<string>('0 KB');
  const [uploadedFileObj, setUploadedFileObj] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = userRole === 'admin' || userRole === 'developer' || userRole === 'editor';
  const canDelete = userRole === 'admin' || userRole === 'developer';

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileObj(file);
    setSelectedFileName(file.name);
    const sizeKb = (file.size / 1024).toFixed(1);
    setSelectedFileSize(`${sizeKb} KB`);

    if (!docNombre) {
      setDocNombre(file.name.replace(/\.[^/.]+$/, ''));
    }

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
      setDocTipo('reporte_excel');
    } else if (file.name.endsWith('.pdf')) {
      setDocTipo('contrato');
    }
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNombre.trim()) return;

    const newDoc: AdminDocument = {
      id: `doc-${Date.now()}`,
      nombre: docNombre.trim(),
      tipo: docTipo,
      tamano: selectedFileSize !== '0 KB' ? selectedFileSize : '125.0 KB',
      fechaSubida: new Date().toISOString().replace('T', ' ').substring(0, 16),
      subidoPor: currentUsername,
      loteAsociado: docLote,
      clienteAsociado: docCliente.trim() || 'General',
      notas: docNotas.trim()
    };

    onAddDocument(newDoc);

    // If it's an Excel report and the user provided a file object, automatically process it for accounting too!
    if (docTipo === 'reporte_excel' && uploadedFileObj && onImportEntriesFromExcel) {
      try {
        const result = await parseAndProcessSalesReportExcel(uploadedFileObj, currentUsername);
        if (result.success) {
          onImportEntriesFromExcel(result.importedEntries, result.updatedLotStatuses);
          setFeedback(`¡Documento guardado! Se actualizó la contabilidad automáticamente con $${result.totalImportedMontoUSD.toLocaleString()} USD.`);
        }
      } catch (err) {
        console.error('Error auto-syncing excel to accounting:', err);
      }
    } else {
      setFeedback(`Documento "${newDoc.nombre}" cargado exitosamente al repositorio.`);
    }

    setShowUploadModal(false);
    setDocNombre('');
    setDocCliente('');
    setDocNotas('');
    setSelectedFileName('');
    setUploadedFileObj(null);
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleSimulateDownload = (doc: AdminDocument) => {
    // If doc has real file URL or is one of the 4 official Excel files, download real file directly
    if (doc.archivoUrl || doc.nombre.endsWith('.xlsx')) {
      const fileUrl = doc.archivoUrl || `/data/excel/${doc.nombre}`;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = doc.nombre;
      link.target = '_blank';
      link.click();
      return;
    }

    // Creates a simple metadata document download
    const content = `CADIS BIENES RAÍCES - REPOSITORIO DIGITAL
Documento: ${doc.nombre}
Tipo: ${doc.tipo}
Fecha de subida: ${doc.fechaSubida}
Subido por: ${doc.subidoPor}
Lote Asociado: ${doc.loteAsociado || 'General'}
Cliente: ${doc.clienteAsociado || 'General'}
Notas: ${doc.notas || 'Sin notas adicionales'}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.nombre.endsWith('.txt') || doc.nombre.includes('.') ? doc.nombre : `${doc.nombre}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocs = documents.filter((d) => {
    const matchesSearch = 
      d.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.loteAsociado && d.loteAsociado.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.clienteAsociado && d.clienteAsociado.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.notas && d.notas.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'todos' || d.tipo === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (tipo: AdminDocument['tipo']) => {
    switch (tipo) {
      case 'reporte_excel':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'contrato':
        return <FileCheck className="w-4 h-4 text-blue-600" />;
      case 'recibo':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'plano':
        return <FileCode className="w-4 h-4 text-purple-600" />;
      case 'ci_cliente':
        return <User className="w-4 h-4 text-sky-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header and Upload Trigger */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              Repositorio de Documentos Digitales CADIS
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
              {documents.length} archivos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Almacena contratos de compraventa, minutas con reconocimiento notarial, comprobantes de reserva y reportes Excel de ventas.
          </p>
        </div>

        <div>
          {canUpload ? (
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
              id="btn-open-upload-doc-modal"
            >
              <Upload className="w-4 h-4" />
              <span>Cargar Nuevo Documento</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Modo Lectura (Carga Restringida)</span>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar documento por nombre, lote o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium text-slate-800 bg-white focus:outline-none"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="todos">Todos los Tipos ({documents.length})</option>
          <option value="reporte_excel">Reportes Excel (.xlsx)</option>
          <option value="contrato">Contratos y Minutas</option>
          <option value="recibo">Recibos y Comprobantes</option>
          <option value="plano">Planos y Topografía</option>
          <option value="ci_cliente">Documentos de Identidad</option>
          <option value="otro">Otros</option>
        </select>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-3">Nombre del Archivo</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Lote / Cliente</th>
              <th className="p-3">Tamaño</th>
              <th className="p-3">Fecha & Subido Por</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No se encontraron documentos en esta categoría.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                        {getTypeIcon(doc.tipo)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{doc.nombre}</p>
                        {doc.notas && (
                          <span className="text-[10px] text-slate-400 line-clamp-1">{doc.notas}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {doc.tipo.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-slate-800">{doc.loteAsociado || 'General'}</p>
                    <span className="text-[10px] text-slate-500">{doc.clienteAsociado || 'Sin cliente'}</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-600 whitespace-nowrap">
                    {doc.tamano}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <p className="text-slate-800 font-semibold">{doc.fechaSubida}</p>
                    <span className="text-[10px] text-slate-400">Por {doc.subidoPor}</span>
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSimulateDownload(doc)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[11px]"
                      title="Descargar documento"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar</span>
                    </button>

                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer inline-flex items-center"
                        title="Eliminar documento (Solo Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span
                        className="p-1.5 text-slate-300 inline-flex items-center cursor-not-allowed"
                        title={userRole === 'editor' ? "Eliminación restringida: Solo rol Admin puede eliminar documentos" : "Modo Solo Lectura: Eliminación bloqueada"}
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-black text-slate-900">Cargar Documento al Sistema</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-3 text-xs">
              {/* File Dropzone / Picker */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer bg-emerald-50/40 hover:bg-emerald-50/80 transition-colors"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFilePicked}
                  className="hidden"
                  accept=".pdf, .xlsx, .xls, .csv, .jpg, .jpeg, .png, .doc, .docx"
                />
                <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <p className="font-bold text-slate-800">
                  {selectedFileName ? selectedFileName : 'Haz clic o arrastra un archivo aquí'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Formatos soportados: PDF, Excel (.xlsx, .csv), Imágenes y Documentos Word
                </p>
                {selectedFileSize !== '0 KB' && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Tamaño: {selectedFileSize}
                  </span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Descriptivo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Contrato Compraventa Lote RB-02"
                  value={docNombre}
                  onChange={(e) => setDocNombre(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={docTipo}
                    onChange={(e) => setDocTipo(e.target.value as AdminDocument['tipo'])}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="reporte_excel">Reporte Excel de Ventas</option>
                    <option value="contrato">Contrato de Compraventa</option>
                    <option value="recibo">Recibo / Comprobante</option>
                    <option value="plano">Plano Topográfico / Catastro</option>
                    <option value="ci_cliente">Cédula de Identidad (C.I.)</option>
                    <option value="otro">Otro Documento</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lote Asociado</label>
                  <select
                    value={docLote}
                    onChange={(e) => setDocLote(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="Todos los lotes">Todos los lotes / General</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.loteNumero}>
                        {p.loteNumero}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cliente / Titular Asociado</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Carlos Morales"
                  value={docCliente}
                  onChange={(e) => setDocCliente(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notas Adicionales</label>
                <textarea
                  rows={2}
                  placeholder="Observaciones sobre firmas, pagos o validación..."
                  value={docNotas}
                  onChange={(e) => setDocNotas(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm"
                >
                  Guardar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
