import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ShieldAlert, 
  UserCheck, 
  Trash2, 
  PlusCircle, 
  RefreshCw, 
  FileText, 
  FileSpreadsheet, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  Download, 
  Clock, 
  User, 
  Building2, 
  Users,
  ShieldCheck,
  AlertCircle,
  Mail
} from 'lucide-react';
import { ActivityLogItem, UserRole } from '../types';

interface AdminActivityLogTabProps {
  logs: ActivityLogItem[];
  userRole: UserRole;
  currentUsername: string;
  onClearLogs?: () => void;
}

export const AdminActivityLogTab: React.FC<AdminActivityLogTabProps> = ({
  logs,
  userRole,
  currentUsername,
  onClearLogs
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [filterAction, setFilterAction] = useState<string>('todos');
  const [filterSeverity, setFilterSeverity] = useState<string>('todos');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const canClearLogs = userRole === 'developer' || userRole === 'admin';

  // Metrics calculation
  const totalLogs = logs.length;
  const editorLogsCount = logs.filter((l) => l.userRole === 'editor').length;
  const criticalLogsCount = logs.filter((l) => l.tipo === 'danger' || l.accion.includes('eliminacion')).length;
  const statusChangeCount = logs.filter((l) => l.accion === 'cambio_estado_lote' || l.accion === 'cambio_estado_lead').length;

  // Filtered Logs
  const filteredLogs = logs.filter((log) => {
    const matchesRole = filterRole === 'todos' || log.userRole === filterRole;
    const matchesAction = filterAction === 'todos' || log.accion === filterAction;
    const matchesSeverity = filterSeverity === 'todos' || log.tipo === filterSeverity;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      log.titulo.toLowerCase().includes(query) ||
      log.detalles.toLowerCase().includes(query) ||
      log.usuario.toLowerCase().includes(query) ||
      (log.entidadAfectada && log.entidadAfectada.toLowerCase().includes(query)) ||
      log.timestamp.toLowerCase().includes(query);

    return matchesRole && matchesAction && matchesSeverity && matchesSearch;
  });

  const getActionIcon = (accion: ActivityLogItem['accion'], tipo: ActivityLogItem['tipo']) => {
    switch (accion) {
      case 'cambio_estado_lote':
        return <RefreshCw className="w-4 h-4 text-amber-600" />;
      case 'eliminacion_lote':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'creacion_lote':
        return <PlusCircle className="w-4 h-4 text-emerald-600" />;
      case 'cambio_estado_lead':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'decision_vendedor':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'carga_documento':
        return <FileText className="w-4 h-4 text-teal-600" />;
      case 'eliminacion_documento':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      case 'asiento_contable':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'importacion_excel':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-700" />;
      case 'notificacion_correo':
        return <Mail className="w-4 h-4 text-sky-600" />;
      default:
        return <History className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSeverityBadge = (tipo: ActivityLogItem['tipo']) => {
    switch (tipo) {
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            Crítico / Eliminación
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Cambio de Estado
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Creación / Aprobado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Registro
          </span>
        );
    }
  };

  const handleExportLogs = () => {
    const header = "ID,Fecha y Hora,Usuario,Rol,Accion,Titulo,Detalles,Entidad Afectada,Severidad\n";
    const rows = logs.map(l => 
      `"${l.id}","${l.timestamp}","${l.usuario}","${l.userRole}","${l.accion}","${l.titulo.replace(/"/g, '""')}","${l.detalles.replace(/"/g, '""')}","${(l.entidadAfectada || '').replace(/"/g, '""')}","${l.tipo}"`
    ).join("\n");

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CADIS_Activity_Log_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header & Accountability Statement */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              Registro de Actividad y Auditoría (Activity Log)
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-900 text-white">
              Supervisión en Tiempo Real
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Trazabilidad y rendición de cuentas (accountability) para administradores y desarrolladores. Registra cada cambio de estado, eliminación, alta de lote y carga de archivo efectuada por los editores y el personal.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handleExportLogs}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            title="Descargar registro de actividad en formato CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          {canClearLogs && onClearLogs && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
              title="Restablecer o limpiar el registro de actividad"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpiar Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Clearing Logs */}
      {showClearConfirm && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-rose-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              <strong>¿Confirmas limpiar el registro histórico?</strong> Esta acción reiniciará los registros almacenados localmente.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 text-xs font-bold bg-white text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (onClearLogs) onClearLogs();
                setShowClearConfirm(false);
              }}
              className="px-3 py-1 text-xs font-black bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-2xs"
            >
              Sí, Limpiar Registro
            </button>
          </div>
        </div>
      )}

      {/* Accountability KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Eventos</span>
            <History className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{totalLogs}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Acciones registradas</p>
        </div>

        {/* Highlighted Editor Accountability Card */}
        <div 
          onClick={() => setFilterRole(filterRole === 'editor' ? 'todos' : 'editor')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            filterRole === 'editor'
              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-700 uppercase">Actividad de Editores</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-900 mt-1">{editorLogsCount}</p>
          <p className="text-[10px] text-blue-600 font-semibold mt-0.5 flex items-center justify-between">
            <span>{filterRole === 'editor' ? 'Filtro activo (Quitar)' : 'Clic para filtrar solo editores'}</span>
          </p>
        </div>

        <div 
          onClick={() => setFilterSeverity(filterSeverity === 'danger' ? 'todos' : 'danger')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            filterSeverity === 'danger'
              ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 uppercase">Eliminaciones / Críticos</span>
            <Trash2 className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-black text-rose-900 mt-1">{criticalLogsCount}</p>
          <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
            {filterSeverity === 'danger' ? 'Filtro activo (Quitar)' : 'Lotes o docs eliminados'}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase">Cambios de Estado</span>
            <RefreshCw className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{statusChangeCount}</p>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Lotes y leads modificados</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por lote, cliente, usuario, descripción o fecha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium text-slate-800 bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="todos">Todos los Roles ({logs.length})</option>
            <option value="editor">Solo Editores ({editorLogsCount})</option>
            <option value="admin">Administrador</option>
            <option value="developer">Desarrollador</option>
            <option value="reader">Lectores</option>
          </select>

          {/* Action Type Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="todos">Todas las Acciones</option>
            <option value="cambio_estado_lote">Cambios de Estado de Lote</option>
            <option value="eliminacion_lote">Eliminaciones de Lote</option>
            <option value="creacion_lote">Creación de Lotes</option>
            <option value="cambio_estado_lead">Actualización de Leads</option>
            <option value="decision_vendedor">Aprobación / Rechazo Vendedores</option>
            <option value="carga_documento">Carga de Documentos / Excel</option>
            <option value="eliminacion_documento">Eliminación de Documentos</option>
            <option value="asiento_contable">Asientos Contables</option>
            <option value="notificacion_correo">Disparos de Correo</option>
          </select>

          {/* Reset Filters */}
          {(filterRole !== 'todos' || filterAction !== 'todos' || filterSeverity !== 'todos' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFilterRole('todos');
                setFilterAction('todos');
                setFilterSeverity('todos');
                setSearchQuery('');
              }}
              className="text-xs text-purple-700 hover:text-purple-900 font-bold px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 cursor-pointer"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Activity Log Feed / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-black text-slate-600 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Historial Cronológico de Movimientos</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 lowercase">
            Mostrando {filteredLogs.length} de {logs.length} registros
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800">No hay registros con los filtros seleccionados</p>
              <p className="text-xs text-slate-500 mt-1">Prueba seleccionando otro rol o restableciendo los términos de búsqueda.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFilterRole('todos');
                setFilterAction('todos');
                setFilterSeverity('todos');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-xl"
            >
              Ver todos los eventos
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((item) => (
              <div 
                key={item.id} 
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
              >
                {/* Left Column: Icon + Details */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getActionIcon(item.accion, item.tipo)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-slate-900 text-xs sm:text-[13px]">
                        {item.titulo}
                      </h4>
                      {getSeverityBadge(item.tipo)}
                      
                      {item.entidadAfectada && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {item.entidadAfectada}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.detalles}
                    </p>
                  </div>
                </div>

                {/* Right Column: User + Timestamp */}
                <div className="flex sm:flex-col sm:items-end justify-between items-center shrink-0 text-[11px] pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800">{item.usuario}</span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                      item.userRole === 'editor'
                        ? 'bg-blue-100 text-blue-800'
                        : item.userRole === 'admin'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.userRole === 'developer'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.userRole}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono sm:mt-1">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
