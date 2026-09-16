import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  X, 
  Users, 
  Calculator, 
  Building2, 
  Mail, 
  Database, 
  TrendingUp, 
  PhoneCall, 
  Plus, 
  Trash2, 
  Copy, 
  CheckCheck,
  Search, 
  DollarSign, 
  BarChart3, 
  PieChart as PieIcon, 
  Check, 
  XCircle,
  FileSpreadsheet,
  FileText,
  LogOut,
  Lock,
  Download,
  AlertTriangle,
  UserCheck,
  History,
  Bell,
  Upload,
  Calendar
} from 'lucide-react';
import {
  Property,
  CreditSimulation,
  VendorApplication,
  NewsletterSubscriber,
  AdminUser,
  UserRole,
  AccountingEntry,
  AdminDocument,
  AccountingSummary,
  ActivityLogItem,
  ClientPaymentPlan,
  LotReservationRequest,
  ChatInteractionLog
} from '../types';
import { SUPABASE_SQL_SCRIPT } from '../data/supabaseSql';
import { INITIAL_ACCOUNTING_ENTRIES, INITIAL_DOCUMENTS, INITIAL_ACTIVITY_LOGS, INITIAL_PAYMENT_PLANS } from '../data/initialData';
import { AdminCharts } from './AdminCharts';
import { AdminAccountingTab } from './AdminAccountingTab';
import { AdminPaymentScheduleTab } from './AdminPaymentScheduleTab';
import { AdminDocumentsTab } from './AdminDocumentsTab';
import { AdminActivityLogTab } from './AdminActivityLogTab';
import { AdminReservationsTab } from './AdminReservationsTab';
import { AdminLoginView } from './AdminLoginView';
import { AdminEmailNotificationsTab } from './AdminEmailNotificationsTab';
import { AdminTopSummarySection } from './AdminTopSummarySection';
import { AdminPropertyImportModal } from './AdminPropertyImportModal';
import { exportSalesReportToExcel, exportSimulationsReport, exportVendorsReport } from '../utils/excelReportManager';
import { 
  triggerSimulationEmailNotification, 
  triggerVendorEmailNotification, 
  formatSimulationEmailContent,
  triggerMailtoClient 
} from '../utils/emailNotificationManager';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  simulations: CreditSimulation[];
  vendors: VendorApplication[];
  subscribers: NewsletterSubscriber[];
  reservations: LotReservationRequest[];
  chatInteractions: ChatInteractionLog[];
  onUpdateSimulationStatus: (id: string, newStatus: CreditSimulation['estado']) => void;
  onUpdateVendorStatus: (id: string, newStatus: VendorApplication['estado']) => void;
  onUpdateReservationStatus: (id: string, newStatus: LotReservationRequest['estado']) => void;
  onAddProperty: (property: Property) => void;
  onBulkImportProperties?: (properties: Property[], mode: 'append' | 'replace') => void;
  onTogglePropertyStatus: (id: string, newStatus: Property['estado']) => void;
  onDeleteProperty: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  properties,
  simulations,
  vendors,
  subscribers,
  reservations,
  chatInteractions,
  onUpdateSimulationStatus,
  onUpdateVendorStatus,
  onUpdateReservationStatus,
  onAddProperty,
  onBulkImportProperties,
  onTogglePropertyStatus,
  onDeleteProperty
}) => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('cadis_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'simulations' | 'properties' | 'accounting' | 'payment-schedule' | 'documents' | 'activity' | 'vendors' | 'subscribers' | 'notifications' | 'reservations' | 'sql'
  >('analytics');

  const [searchQuery, setSearchQuery] = useState('');
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  // Accounting State (Dedicated to Admin Panel)
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>(INITIAL_ACCOUNTING_ENTRIES);

  // Client Payment Plans State
  const [paymentPlans, setPaymentPlans] = useState<ClientPaymentPlan[]>(INITIAL_PAYMENT_PLANS);

  // Documents State
  const [documents, setDocuments] = useState<AdminDocument[]>(INITIAL_DOCUMENTS);

  // Activity Log State (Audit trail for editor accountability & administration)
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('cadis_activity_logs');
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  });

  // Action logger helper for accountability
  const logAction = (
    accion: ActivityLogItem['accion'],
    titulo: string,
    detalles: string,
    entidadAfectada?: string,
    tipo: ActivityLogItem['tipo'] = 'info'
  ) => {
    if (!currentUser) return;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      usuario: currentUser.username,
      userRole: currentUser.role,
      accion,
      titulo,
      detalles,
      entidadAfectada,
      tipo
    };

    setActivityLogs((prev) => {
      const updated = [newLog, ...prev];
      try {
        localStorage.setItem('cadis_activity_logs', JSON.stringify(updated.slice(0, 200)));
      } catch (e) {
        console.error('Error persisting activity logs:', e);
      }
      return updated;
    });
  };

  const handleClearActivityLogs = () => {
    if (!isFullControl) return;
    setActivityLogs([]);
    try {
      localStorage.removeItem('cadis_activity_logs');
    } catch (e) {
      console.error(e);
    }
  };

  // New Property Modal Form State
  const [showAddPropModal, setShowAddPropModal] = useState(false);
  const [showImportPropertiesModal, setShowImportPropertiesModal] = useState(false);
  const [newPropLote, setNewPropLote] = useState('');
  const [newPropTitulo, setNewPropTitulo] = useState('');
  const [newPropPrecio, setNewPropPrecio] = useState<number>(8000);
  const [newPropMetraje, setNewPropMetraje] = useState<number>(500);
  const [newPropDimensiones, setNewPropDimensiones] = useState('20m x 25m');
  const [newPropUbicacion, setNewPropUbicacion] = useState('Limoncito, Santa Cruz - Sector Colinas');
  const [newPropImagen, setNewPropImagen] = useState('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80');

  // RBAC Permission Helpers
  const isDeveloper = currentUser?.role === 'developer';
  const isAdmin = currentUser?.role === 'admin';
  const isFullControl = isDeveloper || isAdmin;
  const isEditor = currentUser?.role === 'editor';
  const isReader = currentUser?.role === 'reader';

  // Key metrics calculation
  const totalSimulations = simulations.length;
  const pendingVendors = vendors.filter((v) => v.estado === 'pendiente').length;
  const availableProperties = properties.filter((p) => p.estado === 'disponible').length;
  const totalPortfolioValue = properties.reduce((acc, curr) => acc + curr.precio, 0);

  // Dynamic Accounting Summary Memo
  const accountingSummary: AccountingSummary = useMemo(() => {
    let totalIngresos = 0;
    let totalEgresos = 0;
    let cuotasCobradasMes = 0;

    accountingEntries.forEach((entry) => {
      if (entry.montoUSD > 0) {
        totalIngresos += entry.montoUSD;
        if (entry.tipo === 'ingreso_cuota_mensual') {
          cuotasCobradasMes += entry.montoUSD;
        }
      } else {
        totalEgresos += entry.montoUSD;
      }
    });

    const soldProps = properties.filter((p) => p.estado === 'vendido');
    // Saldo financiado de los lotes vendidos (precio total - 30% cuota inicial)
    const carteraCobrar = soldProps.reduce((acc, curr) => acc + (curr.precio * 0.7), 0);

    return {
      totalIngresosUSD: totalIngresos,
      totalEgresosUSD: totalEgresos,
      balanceNetoUSD: totalIngresos + totalEgresos,
      carteraPorCobrarUSD: carteraCobrar,
      cuotasCobradasMesUSD: cuotasCobradasMes,
      lotesVendidosTotal: soldProps.length
    };
  }, [accountingEntries, properties]);

  const filteredVendors = useMemo(() => {
    const q = vendorSearchQuery.toLowerCase().trim();
    if (!q) return vendors;
    return vendors.filter((v) => 
      v.nombre.toLowerCase().includes(q) ||
      v.ci.toLowerCase().includes(q) ||
      v.telefono.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.experiencia.toLowerCase().includes(q) ||
      v.estado.toLowerCase().includes(q)
    );
  }, [vendors, vendorSearchQuery]);

  if (!isOpen) return null;

  // Render Login View if not logged in
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
        <AdminLoginView 
          onLoginSuccess={(user) => setCurrentUser(user)} 
          onClose={onClose} 
        />
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('cadis_admin_user');
    setCurrentUser(null);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFullControl && !isEditor) return;
    if (!newPropLote.trim() || !newPropTitulo.trim()) return;

    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      loteNumero: newPropLote.trim(),
      titulo: newPropTitulo.trim(),
      proyecto: 'Proyecto Río Bonito',
      ubicacion: newPropUbicacion.trim(),
      precio: newPropPrecio,
      cuotaInicialPorcentaje: 30,
      metraje: newPropMetraje,
      dimensiones: newPropDimensiones.trim(),
      servicios: ['Agua potable', 'Energía eléctrica', 'Vías ripiadas', 'Acceso al río'],
      imagen: newPropImagen.trim(),
      disponible: true,
      estado: 'disponible',
      destacado: false
    };

    onAddProperty(newProperty);
    logAction(
      'creacion_lote',
      `Alta de nueva mini quinta: ${newProperty.loteNumero}`,
      `Lote registrado en catálogo: "${newProperty.titulo}", precio: $${newProperty.precio.toLocaleString()} USD, dimensiones: ${newProperty.dimensiones} (${newProperty.metraje} m²).`,
      newProperty.loteNumero,
      'success'
    );

    setShowAddPropModal(false);
    setNewPropLote('');
    setNewPropTitulo('');
    setNewPropPrecio(8000);
  };

  // Property status & deletion handlers with audit logging
  const handleTogglePropertyStatus = (id: string, newStatus: Property['estado']) => {
    const prop = properties.find((p) => p.id === id);
    if (!prop) return;
    const oldStatus = prop.estado;
    onTogglePropertyStatus(id, newStatus);

    logAction(
      'cambio_estado_lote',
      `Cambio de estado en ${prop.loteNumero}`,
      `Estado del lote actualizado de "${oldStatus.toUpperCase()}" a "${newStatus.toUpperCase()}" para "${prop.titulo}".`,
      prop.loteNumero,
      newStatus === 'vendido' ? 'success' : newStatus === 'reservado' ? 'warning' : 'info'
    );
  };

  const handleDeletePropertyWithLog = (id: string) => {
    if (!isFullControl) return;
    const prop = properties.find((p) => p.id === id);
    if (!prop) return;
    onDeleteProperty(id);

    logAction(
      'eliminacion_lote',
      `Eliminación de mini quinta: ${prop.loteNumero}`,
      `Se eliminó del catálogo el lote ${prop.loteNumero} (${prop.titulo}) con precio de lista de $${prop.precio.toLocaleString()} USD.`,
      prop.loteNumero,
      'danger'
    );
  };

  // Simulation status update with audit logging
  const handleUpdateSimulationStatus = (id: string, newStatus: CreditSimulation['estado']) => {
    const sim = simulations.find((s) => s.id === id);
    if (!sim) return;
    const oldStatus = sim.estado;
    onUpdateSimulationStatus(id, newStatus);

    logAction(
      'cambio_estado_lead',
      `Actualización de lead: ${sim.clienteNombre}`,
      `Estado comercial cambiado de "${oldStatus}" a "${newStatus}" para ${sim.propiedadLote || 'Río Bonito'} (Terreno $${sim.montoTerreno.toLocaleString()} USD).`,
      sim.clienteNombre,
      newStatus === 'cerrado' ? 'success' : 'info'
    );
  };

  // Lot reservation status update with audit logging
  const handleUpdateReservationStatus = (id: string, newStatus: LotReservationRequest['estado']) => {
    const res = reservations.find((r) => r.id === id);
    if (!res) return;
    onUpdateReservationStatus(id, newStatus);

    logAction(
      'reserva_lote',
      `Actualización de reserva: ${res.loteNumero}`,
      `Estado de la solicitud (${res.accion}) cambiado a "${newStatus}" para ${res.loteNumero}.`,
      res.loteNumero,
      newStatus === 'confirmada' ? 'success' : newStatus === 'cancelada' ? 'danger' : 'info'
    );
  };

  // Vendor status update with audit logging
  const handleUpdateVendorStatus = (id: string, newStatus: VendorApplication['estado']) => {
    const vend = vendors.find((v) => v.id === id);
    if (!vend) return;
    onUpdateVendorStatus(id, newStatus);

    logAction(
      'decision_vendedor',
      `Postulación de asesor: ${vend.nombre}`,
      `Se resolvió "${newStatus.toUpperCase()}" para el candidato asesor ${vend.nombre} (CI: ${vend.ci}).`,
      vend.nombre,
      newStatus === 'aprobado' ? 'success' : 'danger'
    );
  };

  // Accounting update handlers
  const handleAddAccountingEntry = (entry: AccountingEntry) => {
    setAccountingEntries((prev) => [entry, ...prev]);
    logAction(
      'asiento_contable',
      `Registro contable: ${entry.concepto}`,
      `Asiento registrado por $${Math.abs(entry.montoUSD).toLocaleString()} USD (${entry.tipo}) para ${entry.loteReferencia || 'General'}.`,
      entry.loteReferencia,
      entry.montoUSD >= 0 ? 'success' : 'warning'
    );
  };

  const handleImportAccountingEntries = (
    newEntries: AccountingEntry[], 
    lotUpdates: { loteNumero: string; estado: 'disponible' | 'reservado' | 'vendido' }[]
  ) => {
    setAccountingEntries((prev) => [...newEntries, ...prev]);
    logAction(
      'importacion_excel',
      `Importación masiva Excel (${newEntries.length} asientos)`,
      `Se importaron ${newEntries.length} registros contables y se procesaron ${lotUpdates?.length || 0} sincronizaciones de lote desde archivo Excel.`,
      'Módulo Contable',
      'info'
    );

    // Update lot statuses if specified in the imported sales Excel
    if (lotUpdates && lotUpdates.length > 0) {
      lotUpdates.forEach((u) => {
        const found = properties.find((p) => p.loteNumero.toLowerCase() === u.loteNumero.toLowerCase());
        if (found) {
          handleTogglePropertyStatus(found.id, u.estado);
        }
      });
    }
  };

  // Documents handlers
  const handleAddDocument = (doc: AdminDocument) => {
    setDocuments((prev) => [doc, ...prev]);
    logAction(
      'carga_documento',
      `Carga de documento: ${doc.nombre}`,
      `Archivo subido al repositorio: tipo "${doc.tipo}", lote "${doc.loteAsociado || 'General'}", cliente "${doc.clienteAsociado || 'General'}" (${doc.tamano}).`,
      doc.nombre,
      'info'
    );
  };

  const handleDeleteDocument = (id: string) => {
    if (!isFullControl) return;
    const doc = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    logAction(
      'eliminacion_documento',
      `Eliminación de documento: ${doc?.nombre || id}`,
      `Se eliminó el documento "${doc?.nombre || id}" del repositorio digital.`,
      doc?.nombre || id,
      'warning'
    );
  };

  // Export handlers for simulations and vendors (Excel and CSV)
  const handleExportSimulations = (format: 'xlsx' | 'csv') => {
    exportSimulationsReport(simulations, format);
    logAction(
      'exportacion_datos',
      `Exportación de Leads (${format.toUpperCase()})`,
      `Se descargaron ${simulations.length} solicitudes de crédito y leads en formato ${format.toUpperCase()}.`,
      'Módulo Leads',
      'info'
    );
  };

  const handleExportVendors = (format: 'xlsx' | 'csv') => {
    exportVendorsReport(vendors, format);
    logAction(
      'exportacion_datos',
      `Exportación de Asesores (${format.toUpperCase()})`,
      `Se descargaron ${vendors.length} postulaciones de asesores inmobiliarios en formato ${format.toUpperCase()}.`,
      'Módulo Vendedores',
      'info'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Panel Administrativo CADIS</h3>
                
                {/* User Role Badge */}
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded flex items-center gap-1 ${
                  isDeveloper 
                    ? 'bg-purple-500 text-slate-950' 
                    : isAdmin 
                    ? 'bg-emerald-500 text-slate-950' 
                    : isEditor 
                    ? 'bg-blue-500 text-slate-950' 
                    : 'bg-slate-300 text-slate-900'
                }`}>
                  <UserCheck className="w-3 h-3" />
                  <span>
                    {isDeveloper 
                      ? 'DESARROLLADOR (Control Total)' 
                      : isAdmin 
                      ? 'ADMIN (Control Total)' 
                      : isEditor 
                      ? 'EDITOR (Comercial)' 
                      : 'LECTURA (Solo Consulta)'}
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Usuario activo: <strong className="text-slate-200">{currentUser.nombreCompleto}</strong> • Acceso: {currentUser.ultimoAcceso || 'En sesión'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Logout */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Quick Export Sales Excel Button in Top Bar */}
            <button
              type="button"
              onClick={() => exportSalesReportToExcel(simulations, properties, accountingEntries)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/30"
              title="Descargar Reporte de Ventas en Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden md:inline">Reporte Excel</span>
            </button>

            {/* Logout / Switch Role */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
              title="Cambiar de usuario o cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Cerrar panel de administración"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Summary Cards & D3.js Monthly Simulation Volume Section */}
        <AdminTopSummarySection
          properties={properties}
          simulations={simulations}
          vendors={vendors}
          accountingSummary={accountingSummary}
          onNavigateTab={setActiveTab}
        />

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          
          {/* CONTROL DE INGRESOS Y EGRESOS (CAJA) */}
          <button
            onClick={() => setActiveTab('accounting')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'accounting'
                ? 'border-[#009698] text-teal-900 bg-teal-50/60'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#009698]" />
            <span>Control de Ingresos y Egresos</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#009698] text-white font-black">
              Caja
            </span>
          </button>

          {/* PLAN DE PAGOS Y CENTRALIZACIÓN DE CUOTAS */}
          <button
            onClick={() => setActiveTab('payment-schedule')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'payment-schedule'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/80'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Plan de Pagos & Cuotas</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-600 text-white font-black">
              {paymentPlans.length} Clientes
            </span>
          </button>

          {/* DOCUMENTOS Y REPORTES */}
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Documentos & Excel ({documents.length})</span>
          </button>

          {/* REGISTRO DE ACTIVIDAD (ACTIVITY LOG - AUDITORÍA DE EDITORES) */}
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'border-purple-600 text-purple-900 bg-purple-50/70'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-purple-600" />
            <span>Activity Log ({activityLogs.length})</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-700 text-white font-black">
              {activityLogs.filter((l) => l.userRole === 'editor').length} Editores
            </span>
          </button>

          {/* ANALYTICS */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Gráficas Recharts</span>
          </button>

          {/* LEADS Y SIMULACIONES */}
          <button
            onClick={() => setActiveTab('simulations')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'simulations'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Leads ({simulations.length})</span>
          </button>

          {/* GESTIÓN PROPIEDADES */}
          <button
            onClick={() => setActiveTab('properties')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'properties'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Lotes ({properties.length})</span>
          </button>

          {/* VENDEDORES */}
          <button
            onClick={() => setActiveTab('vendors')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'vendors'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Vendedores ({vendors.length})</span>
          </button>

          {/* RESERVAS DE LOTES E INTERACCIONES DE CHAT (MINI-CRM) */}
          <button
            onClick={() => setActiveTab('reservations')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reservations'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/70'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>Reservas y Chat</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-600 text-white font-black">
              {reservations.length}
            </span>
          </button>

          {/* NOTIFICACIONES POR CORREO (EMAIL TRIGGERS) */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'border-sky-600 text-sky-800 bg-sky-50/70'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4 text-sky-600" />
            <span>Notificaciones Email</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-600 text-white font-black">
              Trigger
            </span>
          </button>

          {/* BOLETÍN */}
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'subscribers'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Boletín ({subscribers.length})</span>
          </button>

          {/* SQL SCRIPT (Visible only to Developer & Admin) */}
          {isFullControl && (
            <button
              onClick={() => setActiveTab('sql')}
              className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'sql'
                  ? 'border-sky-600 text-sky-800'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4 text-sky-600" />
              <span>SQL Supabase</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          
          {/* TAB: MÓDULO CONTABLE & FINANZAS (CONTROL DE CAJA) */}
          {activeTab === 'accounting' && (
            <AdminAccountingTab
              entries={accountingEntries}
              summary={accountingSummary}
              userRole={currentUser.role}
              currentUsername={currentUser.username}
              properties={properties}
              simulations={simulations}
              onAddEntry={handleAddAccountingEntry}
              onImportEntries={handleImportAccountingEntries}
            />
          )}

          {/* TAB: PLAN DE PAGOS Y CENTRALIZACIÓN DE CUOTAS */}
          {activeTab === 'payment-schedule' && (
            <AdminPaymentScheduleTab
              plans={paymentPlans}
              userRole={currentUser.role}
              currentUsername={currentUser.username}
              onUpdatePlan={(updatedPlan) => {
                setPaymentPlans((prev) => prev.map((p) => p.id === updatedPlan.id ? updatedPlan : p));
                logAction('asiento_contable', `Pago registrado en ${updatedPlan.loteNumero}`, `Cobro de cuota para ${updatedPlan.clienteNombre}`, updatedPlan.loteNumero, 'success');
              }}
              onAddPlan={(newPlan) => {
                setPaymentPlans((prev) => [newPlan, ...prev]);
                logAction('creacion_lote', `Nuevo Plan de Pago: ${newPlan.loteNumero}`, `Adjudicación creada para ${newPlan.clienteNombre}`, newPlan.loteNumero, 'info');
              }}
              onAddAccountingEntry={handleAddAccountingEntry}
            />
          )}

          {/* TAB: DOCUMENTOS Y CONTRATOS */}
          {activeTab === 'documents' && (
            <AdminDocumentsTab
              documents={documents}
              userRole={currentUser.role}
              currentUsername={currentUser.username}
              properties={properties}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              onImportEntriesFromExcel={handleImportAccountingEntries}
            />
          )}

          {/* TAB: REGISTRO DE ACTIVIDAD (ACTIVITY LOG - AUDITORÍA) */}
          {activeTab === 'activity' && (
            <AdminActivityLogTab
              logs={activityLogs}
              userRole={currentUser.role}
              currentUsername={currentUser.username}
              onClearLogs={handleClearActivityLogs}
            />
          )}

          {/* TAB: ANALÍTICA RECHARTS */}
          {activeTab === 'analytics' && (
            <AdminCharts simulations={simulations} properties={properties} />
          )}

          {/* TAB: LEADS Y SIMULACIONES */}
          {activeTab === 'simulations' && (
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente o teléfono..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 focus:outline-none"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                      aria-label="Limpiar búsqueda"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Export Simulations to Excel (.xlsx) */}
                  <button
                    type="button"
                    onClick={() => handleExportSimulations('xlsx')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Exportar simulaciones y leads a formato Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Exportar Excel (.xlsx)</span>
                  </button>

                  {/* Export Simulations to CSV (.csv) */}
                  <button
                    type="button"
                    onClick={() => handleExportSimulations('csv')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Exportar simulaciones y leads a archivo CSV (.csv)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar CSV</span>
                  </button>

                  {/* General Comprehensive Sales Report */}
                  <button
                    type="button"
                    onClick={() => exportSalesReportToExcel(simulations, properties, accountingEntries)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                    title="Reporte Integral de Ventas con Lotes y Contabilidad"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Reporte Integral</span>
                  </button>

                  <div className="text-xs text-slate-500 font-semibold hidden md:block">
                    {simulations.length} solicitudes
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Contacto</th>
                      <th className="p-3">Terreno / Lote</th>
                      <th className="p-3">Cuota Inicial (30%)</th>
                      <th className="p-3">Cuota Saldo</th>
                      <th className="p-3">Plazo</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acción WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {simulations
                      .filter((s) => 
                        s.clienteNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.telefono.includes(searchQuery)
                      )
                      .map((sim) => {
                        const whatsappMsg = `Hola ${sim.clienteNombre}, te saludo de CADIS Servicios Inmobiliarios sobre tu simulación para el Proyecto Río Bonito por $${sim.montoTerreno.toLocaleString()} USD y cuota de $${sim.cuotaMensual} USD/mes. ¿Cuándo te gustaría coordinar tu visita?`;
                        const whatsappLink = `https://wa.me/${sim.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMsg)}`;

                        return (
                          <tr key={sim.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{sim.clienteNombre}</p>
                              <span className="text-[10px] text-slate-400">{sim.fecha}</span>
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-slate-800">{sim.telefono}</p>
                              {sim.email && <span className="text-[10px] text-slate-500">{sim.email}</span>}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-900">${sim.montoTerreno.toLocaleString()} USD</span>
                              <p className="text-[10px] text-emerald-700 font-semibold">{sim.propiedadLote || 'Río Bonito'}</p>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-emerald-700">${sim.cuotaInicialMonto.toLocaleString()} USD</span>
                              <p className="text-[10px] text-slate-500">
                                {sim.modalidadInicial === 'diferido_3m' ? '3 meses de $' + sim.cuotaInicialMensual.toFixed(0) : 'Contado'}
                              </p>
                            </td>
                            <td className="p-3 font-extrabold text-slate-900">
                              ${sim.cuotaMensual.toFixed(2)} USD/m
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px]">
                                {sim.plazoAnios} años
                              </span>
                            </td>
                            <td className="p-3">
                              {isReader ? (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {sim.estado}
                                </span>
                              ) : (
                                <select
                                  value={sim.estado}
                                  onChange={(e) => handleUpdateSimulationStatus(sim.id, e.target.value as CreditSimulation['estado'])}
                                  className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${
                                    sim.estado === 'nuevo'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : sim.estado === 'contactado'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : sim.estado === 'en_negociacion'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}
                                >
                                  <option value="nuevo">Nuevo</option>
                                  <option value="contactado">Contactado</option>
                                  <option value="en_negociacion">En Negociación</option>
                                  <option value="cerrado">Cerrado / Venta</option>
                                </select>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerSimulationEmailNotification(sim);
                                    logAction(
                                      'notificacion_correo',
                                      `Reenvío de Reporte: ${sim.clienteNombre}`,
                                      `Se disparó nuevamente el reporte resumen de crédito por correo para ${sim.propiedadLote || 'Lote'}.`,
                                      sim.clienteNombre,
                                      'info'
                                    );
                                    alert(`¡Reporte de simulación de ${sim.clienteNombre} enviado por correo al administrador!`);
                                  }}
                                  className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors cursor-pointer"
                                  title="Enviar / Reenviar reporte de este lead al correo del desarrollador/admin"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={whatsappLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  <span>Contactar</span>
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: GESTIÓN DE PROPIEDADES */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Inventario de Mini Quintas en Proyecto Río Bonito
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {properties.filter(p => p.estado === 'disponible').length} Disponibles • {properties.filter(p => p.estado === 'reservado').length} Reservados • {properties.filter(p => p.estado === 'vendido').length} Vendidos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportSalesReportToExcel(simulations, properties, accountingEntries)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Descargar Inventario (Excel)</span>
                  </button>

                  {(isFullControl || isEditor) && (
                    <button
                      onClick={() => setShowImportPropertiesModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                      title="Importación masiva de lotes con validador de datos"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Importar Catálogo (Excel)</span>
                    </button>
                  )}

                  {(isFullControl || isEditor) && (
                    <button
                      onClick={() => setShowAddPropModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nueva Mini Quinta</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Add Property Submodal */}
              {showAddPropModal && (
                <div className="bg-white p-5 rounded-xl border-2 border-emerald-500 shadow-lg space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="text-sm font-black text-slate-900">Agregar Nueva Mini Quinta</h4>
                    <button onClick={() => setShowAddPropModal(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateProperty} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nº de Lote *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Lote RB-09"
                        value={newPropLote}
                        onChange={(e) => setNewPropLote(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Título de la Mini Quinta *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Mini Quinta Las Palmas"
                        value={newPropTitulo}
                        onChange={(e) => setNewPropTitulo(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Precio (USD) *</label>
                      <input
                        type="number"
                        required
                        value={newPropPrecio}
                        onChange={(e) => setNewPropPrecio(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Superficie (m²)</label>
                      <input
                        type="number"
                        value={newPropMetraje}
                        onChange={(e) => setNewPropMetraje(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Dimensiones</label>
                      <input
                        type="text"
                        value={newPropDimensiones}
                        onChange={(e) => setNewPropDimensiones(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ubicación</label>
                      <input
                        type="text"
                        value={newPropUbicacion}
                        onChange={(e) => setNewPropUbicacion(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t">
                      <button
                        type="button"
                        onClick={() => setShowAddPropModal(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        Guardar Propiedad
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Properties Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-500 border-b">
                    <tr>
                      <th className="p-3">Lote</th>
                      <th className="p-3">Título</th>
                      <th className="p-3">Metraje</th>
                      <th className="p-3">Precio USD</th>
                      <th className="p-3">Cuota Inicial (30%)</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {properties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-extrabold text-slate-900">{prop.loteNumero}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{prop.titulo}</p>
                          <span className="text-[10px] text-slate-400">{prop.ubicacion}</span>
                        </td>
                        <td className="p-3 font-semibold">{prop.metraje} m² ({prop.dimensiones})</td>
                        <td className="p-3 font-black text-slate-900">${prop.precio.toLocaleString()} USD</td>
                        <td className="p-3 font-bold text-emerald-700">${(prop.precio * 0.3).toLocaleString()} USD</td>
                        <td className="p-3">
                          {isReader ? (
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              prop.estado === 'disponible'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prop.estado === 'reservado'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {prop.estado}
                            </span>
                          ) : (
                            <select
                              value={prop.estado}
                              onChange={(e) => handleTogglePropertyStatus(prop.id, e.target.value as Property['estado'])}
                              className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${
                                prop.estado === 'disponible'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : prop.estado === 'reservado'
                                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                                  : 'bg-slate-100 text-slate-600 border-slate-300'
                              }`}
                            >
                              <option value="disponible">Disponible</option>
                              <option value="reservado">Reservado</option>
                              <option value="vendido">Vendido</option>
                            </select>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {isFullControl ? (
                            <button
                              onClick={() => handleDeletePropertyWithLog(prop.id)}
                              className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors cursor-pointer"
                              title="Eliminar lote"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold">Protegido</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: POSTULACIONES DE VENDEDORES */}
          {activeTab === 'vendors' && (
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar por asesor, CI, teléfono o estado..."
                    value={vendorSearchQuery}
                    onChange={(e) => setVendorSearchQuery(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 focus:outline-none"
                  />
                  {vendorSearchQuery && (
                    <button 
                      type="button"
                      onClick={() => setVendorSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                      aria-label="Limpiar búsqueda"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Export Vendors to Excel (.xlsx) */}
                  <button
                    type="button"
                    onClick={() => handleExportVendors('xlsx')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Exportar postulaciones de asesores a formato Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Exportar Excel (.xlsx)</span>
                  </button>

                  {/* Export Vendors to CSV (.csv) */}
                  <button
                    type="button"
                    onClick={() => handleExportVendors('csv')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Exportar postulaciones de asesores a archivo CSV (.csv)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar CSV</span>
                  </button>

                  <div className="text-xs text-slate-500 font-semibold hidden md:block">
                    {filteredVendors.length} de {vendors.length} candidatos
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-500 border-b">
                    <tr>
                      <th className="p-3">Candidato</th>
                      <th className="p-3">C.I. / DNI</th>
                      <th className="p-3">Contacto</th>
                      <th className="p-3">Experiencia</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Decisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVendors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold">No se encontraron candidatos con el criterio de búsqueda.</p>
                          <p className="text-[11px] text-slate-400 mt-1">Intenta con otro nombre, número de carnet o teléfono.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredVendors.map((vend) => (
                      <tr key={vend.id} className="hover:bg-slate-50/70">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{vend.nombre}</p>
                          <span className="text-[10px] text-slate-400">{vend.fecha}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{vend.ci}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{vend.telefono}</p>
                          <span className="text-[10px] text-slate-500">{vend.email}</span>
                        </td>
                        <td className="p-3 max-w-xs">
                          <p className="text-xs text-slate-600 line-clamp-2">{vend.experiencia}</p>
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {vend.nivelExperiencia}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              vend.estado === 'aprobado'
                                ? 'bg-emerald-100 text-emerald-800'
                                : vend.estado === 'rechazado'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {vend.estado}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          {/* Quick Send Candidate Report to Email */}
                          <button
                            type="button"
                            onClick={() => {
                              triggerVendorEmailNotification(vend);
                              logAction(
                                'notificacion_correo',
                                `Ficha de Asesor Reenviada: ${vend.nombre}`,
                                `Ficha de postulación enviada por correo al administrador. C.I.: ${vend.ci}.`,
                                vend.nombre,
                                'info'
                              );
                              alert(`¡Ficha de postulación de ${vend.nombre} enviada por correo al administrador!`);
                            }}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="Enviar ficha de postulación por correo"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {isReader ? (
                            <span className="text-[10px] text-slate-400">Solo lectura</span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleUpdateVendorStatus(vend.id, 'aprobado')}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                title="Aprobar agente"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Aprobar</span>
                              </button>
                              <button
                                onClick={() => handleUpdateVendorStatus(vend.id, 'rechazado')}
                                className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                title="Rechazar solicitud"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rechazar</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SUSCRIPTORES BOLETÍN */}
          {activeTab === 'subscribers' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900">Correos Registrados en Boletín de Ofertas</h4>
                  <p className="text-xs text-slate-500">Lista para envío de newsletters y campañas de email marketing de Río Bonito.</p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {subscribers.length} suscriptores
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-800">{sub.email}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{sub.fecha}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SUPABASE SQL SCRIPT (Restricted to Developer & Admin) */}
          {activeTab === 'sql' && isFullControl && (
            <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-sky-400" />
                    <h4 className="text-sm font-extrabold text-white">
                      Script SQL Oficial para Supabase Database
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tablas requeridas: <code className="text-emerald-400">propiedades</code>, <code className="text-emerald-400">simulaciones_credito</code>, <code className="text-emerald-400">vendedores</code> y <code className="text-emerald-400">boletin</code>.
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-slate-950" />
                      <span>¡Copiado al Portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Script SQL Completo</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 max-h-96 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300">
                <pre>{SUPABASE_SQL_SCRIPT}</pre>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300">
                <p>
                  <strong>Instrucciones de uso en Supabase:</strong> Inicia sesión en tu dashboard de Supabase &gt; entra en tu proyecto &gt; ve a <strong>SQL Editor</strong> &gt; pega este script y pulsa <strong>Run</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB: RESERVAS DE LOTES E INTERACCIONES DE CHAT (MINI-CRM) */}
          {activeTab === 'reservations' && (
            <AdminReservationsTab
              reservations={reservations}
              chatInteractions={chatInteractions}
              simulations={simulations}
              vendors={vendors}
              userRole={currentUser.role}
              onUpdateReservationStatus={handleUpdateReservationStatus}
            />
          )}

          {/* TAB: NOTIFICACIONES POR CORREO */}
          {activeTab === 'notifications' && (
            <AdminEmailNotificationsTab
              simulations={simulations}
              vendors={vendors}
              properties={properties}
              userRole={currentUser.role}
              currentUsername={currentUser.username}
              onLogActivity={logAction}
            />
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CADIS Servicios Inmobiliarios</span>
            <span>•</span>
            <span>Sesión: <strong className="text-emerald-700">{currentUser.role.toUpperCase()}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => exportSalesReportToExcel(simulations, properties, accountingEntries)}
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Reporte Ventas Excel</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 cursor-pointer"
            >
              Cerrar Panel
            </button>
          </div>
        </div>

        {/* Modal de Importación Masiva de Propiedades desde Excel */}
        <AdminPropertyImportModal
          isOpen={showImportPropertiesModal}
          onClose={() => setShowImportPropertiesModal(false)}
          existingProperties={properties}
          currentUsername={currentUser.username}
          onLogActivity={logAction}
          onConfirmImport={(importedProps, mode) => {
            if (onBulkImportProperties) {
              onBulkImportProperties(importedProps, mode);
            } else {
              importedProps.forEach(p => onAddProperty(p));
            }
          }}
        />

      </div>
    </div>
  );
};
