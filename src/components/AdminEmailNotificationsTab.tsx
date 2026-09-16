import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  History, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Bell, 
  UserCheck, 
  Sparkles,
  Calculator,
  Users,
  Eye,
  Trash2,
  FileText
} from 'lucide-react';
import { 
  EmailNotificationConfig, 
  EmailNotificationLog, 
  CreditSimulation, 
  VendorApplication, 
  Property,
  UserRole 
} from '../types';
import { 
  getEmailNotificationConfig, 
  saveEmailNotificationConfig, 
  getEmailNotificationLogs,
  sendTestEmailReport,
  sendConsolidatedExecutiveEmailReport,
  triggerMailtoClient,
  formatSimulationEmailContent,
  formatVendorEmailContent
} from '../utils/emailNotificationManager';

interface AdminEmailNotificationsTabProps {
  simulations: CreditSimulation[];
  vendors: VendorApplication[];
  properties: Property[];
  userRole: UserRole;
  currentUsername: string;
  onLogActivity: (
    accion: 'notificacion_correo' | 'otro',
    titulo: string,
    detalles: string,
    entidad?: string,
    tipo?: 'info' | 'success' | 'warning' | 'danger'
  ) => void;
}

export const AdminEmailNotificationsTab: React.FC<AdminEmailNotificationsTabProps> = ({
  simulations,
  vendors,
  properties,
  userRole,
  currentUsername,
  onLogActivity
}) => {
  const [config, setConfig] = useState<EmailNotificationConfig>(() => getEmailNotificationConfig());
  const [logs, setLogs] = useState<EmailNotificationLog[]>(() => getEmailNotificationLogs());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);
  const [selectedLogForPreview, setSelectedLogForPreview] = useState<EmailNotificationLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchLogQuery, setSearchLogQuery] = useState('');

  const isFullControl = userRole === 'developer' || userRole === 'admin';

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveEmailNotificationConfig(config);
    setSavedSuccess(true);
    onLogActivity(
      'notificacion_correo',
      'Configuración de Correos Actualizada',
      `Destinatario principal: ${config.recipientEmail}, Notificar simulaciones: ${config.notifyOnSimulation ? 'Sí' : 'No'}, Notificar vendedores: ${config.notifyOnVendorApplication ? 'Sí' : 'No'}.`,
      config.recipientEmail,
      'info'
    );
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendTest = async () => {
    setTestSending(true);
    setTestSuccessMessage(null);
    try {
      const result = await sendTestEmailReport(config.recipientEmail);
      setLogs(getEmailNotificationLogs());
      setTestSuccessMessage(`¡Reporte de prueba enviado exitosamente a ${config.recipientEmail}!`);
      onLogActivity(
        'notificacion_correo',
        'Prueba de Disparador de Correo Enviada',
        `Se verificó el envío hacia ${config.recipientEmail}.`,
        config.recipientEmail,
        'success'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setTestSending(false);
      setTimeout(() => setTestSuccessMessage(null), 5000);
    }
  };

  const handleSendConsolidatedReport = async () => {
    setTestSending(true);
    try {
      const result = await sendConsolidatedExecutiveEmailReport(simulations, vendors, properties, config.recipientEmail);
      setLogs(getEmailNotificationLogs());
      setTestSuccessMessage(`¡Reporte ejecutivo consolidado enviado a ${config.recipientEmail}!`);
      onLogActivity(
        'notificacion_correo',
        'Reporte Ejecutivo Consolidado Enviado',
        `Contiene ${simulations.length} simulaciones y ${vendors.length} postulaciones. Destino: ${config.recipientEmail}.`,
        config.recipientEmail,
        'success'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setTestSending(false);
      setTimeout(() => setTestSuccessMessage(null), 5000);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClearLogs = () => {
    if (!isFullControl) return;
    localStorage.removeItem('cadis_email_notification_logs');
    setLogs([]);
  };

  const filteredLogs = logs.filter((l) => {
    const q = searchLogQuery.toLowerCase();
    return (
      !q ||
      l.recipient.toLowerCase().includes(q) ||
      l.subject.toLowerCase().includes(q) ||
      l.summaryText.toLowerCase().includes(q) ||
      (l.referenceName && l.referenceName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner: Status & Quick Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shrink-0 mt-0.5">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Disparador de Notificaciones por Correo (Email Triggers)
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Disparador Activo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Envía automáticamente un reporte ejecutivo al correo del desarrollador o administrador (<strong>{config.recipientEmail}</strong>) cada vez que un cliente complete una simulación de crédito directo o un aspirante postule como asesor.
            </p>
          </div>
        </div>

        {/* Quick Test / Trigger Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSendTest}
            disabled={testSending}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            id="btn-test-email-trigger"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>{testSending ? 'Enviando...' : 'Enviar Prueba a Email'}</span>
          </button>

          <button
            type="button"
            onClick={handleSendConsolidatedReport}
            disabled={testSending}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            id="btn-consolidated-report"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Reporte Consolidado</span>
          </button>
        </div>
      </div>

      {/* Test Success Feedback Toast */}
      {testSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{testSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Config Form (Left) & Live Report Previews (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Settings Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-700" />
                <h4 className="text-sm font-black text-slate-900">
                  Parámetros de Enlace y Destinatarios
                </h4>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                Persistente en LocalStorage
              </span>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Primary Developer / Admin Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico Principal (Developer / Admin) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={config.recipientEmail}
                    onChange={(e) => setConfig({ ...config, recipientEmail: e.target.value })}
                    placeholder="vladimir.uzed@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-sky-500 focus:outline-none text-slate-800"
                    id="input-primary-admin-email"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Recibirá las notificaciones instantáneas de cada simulación o postulación.
                </p>
              </div>

              {/* Secondary Admin Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo de Copia o Gerencia (Opcional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={config.adminEmail}
                    onChange={(e) => setConfig({ ...config, adminEmail: e.target.value })}
                    placeholder="gerencia@cadisinmobiliaria.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-sky-500 focus:outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Triggers Checklist */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Eventos Disparadores Automáticos:
                </label>

                {/* Trigger 1: Credit Simulation */}
                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.notifyOnSimulation}
                    onChange={(e) => setConfig({ ...config, notifyOnSimulation: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-extrabold text-slate-800">
                        Nuevas Simulaciones de Crédito Directo (Leads)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dispara un correo con nombre del cliente, teléfono, lote seleccionado, monto inicial 30% y cuota mensual.
                    </p>
                  </div>
                </label>

                {/* Trigger 2: Vendor Application */}
                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={config.notifyOnVendorApplication}
                    onChange={(e) => setConfig({ ...config, notifyOnVendorApplication: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-sky-600" />
                      <span className="text-xs font-extrabold text-slate-800">
                        Nuevas Postulaciones de Asesores Inmobiliarios
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dispara un reporte con carnet de identidad, datos de contacto, nivel de experiencia y trayectoria comercial.
                    </p>
                  </div>
                </label>
              </div>

              {/* Delivery Mode */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Mecanismo de Despacho de Correo:
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, activeMethod: 'automated_dispatch' })}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      config.activeMethod === 'automated_dispatch'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 text-xs'
                    }`}
                  >
                    <p className="text-xs font-black flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Despacho Inmediato
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Simulación en tiempo real y registro auditado.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, activeMethod: 'mailto_trigger' })}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      config.activeMethod === 'mailto_trigger'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 text-xs'
                    }`}
                  >
                    <p className="text-xs font-black flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 text-sky-600" />
                      Mailto: Directo
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Abre cliente de correo (Gmail/Outlook) con datos.
                    </p>
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Guardar Configuración de Alertas</span>
                </button>

                {savedSuccess && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ¡Guardado!
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Notification Summary Template Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <h4 className="text-sm font-black text-slate-900">
                  Previsualización del Reporte Ejecutivo
                </h4>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Formato Oficial CADIS
              </span>
            </div>

            {/* Mock Email Template Box */}
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs bg-slate-50">
              <div className="bg-slate-900 text-white p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>De: <strong>CADIS Sistema Automatizado &lt;notificaciones@cadisinmobiliaria.com&gt;</strong></span>
                  <span className="text-[10px] text-emerald-400">EN TIEMPO REAL</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Para: <strong className="text-white">{config.recipientEmail}</strong>
                </p>
                <p className="text-xs font-black text-sky-300 pt-0.5">
                  Asunto: [CADIS] 🚀 Nueva Simulación de Crédito: Marcelo Saucedo (Lote RB-01)
                </p>
              </div>

              <div className="p-4 space-y-3 bg-white text-slate-800">
                <div className="p-2.5 rounded-lg bg-emerald-50 border-l-4 border-emerald-600 text-[11px] text-emerald-950 font-medium">
                  <strong>Nuevo interesado registrado en plataforma:</strong> Los datos y condiciones calculadas se detallan a continuación para contacto rápido.
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <p><strong>• Cliente:</strong> Marcelo Saucedo</p>
                  <p><strong>• Teléfono:</strong> +591 71234567 (<span className="text-emerald-700 font-bold">WhatsApp Directo habilitado</span>)</p>
                  <p><strong>• Terreno:</strong> Lote RB-01 ($8,000 USD en Río Bonito)</p>
                  <p><strong>• Cuota Inicial 30%:</strong> $2,400 USD (Opción diferida: 3 cuotas de $800 USD/mes)</p>
                  <p><strong>• Saldo Financiado:</strong> $5,600 USD a 5 años (60 meses fijas)</p>
                  <p><strong>• Cuota Mensual Fija:</strong> $93.33 USD/mes</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Generado automáticamente por CADIS Web</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleSim = simulations[0];
                      if (sampleSim) {
                        const content = formatSimulationEmailContent(sampleSim, config.recipientEmail);
                        handleCopyText(content.textBody, 'sample-email');
                      }
                    }}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'sample-email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'sample-email' ? 'Copiado' : 'Copiar Plantilla'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Simulation dispatch action button */}
            <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
              <span>¿Deseas reenviar el último lead recibido a tu correo?</span>
              <button
                type="button"
                onClick={() => {
                  if (simulations[0]) {
                    const content = formatSimulationEmailContent(simulations[0], config.recipientEmail);
                    triggerMailtoClient(config.recipientEmail, content.subject, content.textBody);
                  }
                }}
                className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir en Cliente de Correo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Notification History Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-700" />
              <h4 className="text-sm font-black text-slate-900">
                Historial de Disparos de Correo ({logs.length})
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro auditado de todos los reportes emitidos al desarrollador y administrador.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar en historial de correos..."
              value={searchLogQuery}
              onChange={(e) => setSearchLogQuery(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-sky-500 text-slate-800 w-52 sm:w-64"
            />
            {isFullControl && logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearLogs}
                className="px-2.5 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors border border-transparent hover:border-red-200"
                title="Limpiar registro de notificaciones"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs space-y-2">
            <Mail className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold">No hay disparos de correo registrados con este criterio.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filteredLogs.map((item) => (
              <div 
                key={item.id} 
                className="p-3.5 sm:p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    item.type === 'credit_simulation' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : item.type === 'vendor_application'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.type === 'credit_simulation' ? (
                      <Calculator className="w-4 h-4" />
                    ) : item.type === 'vendor_application' ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900 text-xs">
                        {item.subject}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {item.summaryText}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Destinatario: <strong className="text-slate-600">{item.recipient}</strong> • Ref: {item.referenceName || 'Sistema'}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between items-center shrink-0 gap-1.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-[11px] text-slate-500">
                  <span>{item.timestamp}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedLogForPreview(item)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
                      title="Ver reporte completo"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Ver</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyText(item.summaryText, item.id)}
                      className="p-1 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                      title="Copiar resumen"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing log details */}
      {selectedLogForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400" />
                <h4 className="text-sm font-black">Detalle del Reporte de Notificación</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogForPreview(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-700">
                <p><strong>Destinatario:</strong> {selectedLogForPreview.recipient}</p>
                <p><strong>Asunto:</strong> {selectedLogForPreview.subject}</p>
                <p><strong>Fecha y Hora:</strong> {selectedLogForPreview.timestamp}</p>
                <p><strong>Estado de Entrega:</strong> <span className="uppercase text-emerald-700 font-bold">{selectedLogForPreview.status}</span></p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">Contenido del Reporte:</h5>
                <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {selectedLogForPreview.summaryText}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => triggerMailtoClient(selectedLogForPreview.recipient, selectedLogForPreview.subject, selectedLogForPreview.summaryText)}
                  className="px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir en Cliente de Correo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLogForPreview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
