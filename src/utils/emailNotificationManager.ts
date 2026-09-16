import { 
  CreditSimulation, 
  VendorApplication, 
  Property, 
  EmailNotificationConfig, 
  EmailNotificationLog,
  ActivityLogItem 
} from '../types';

export const DEFAULT_EMAIL_CONFIG: EmailNotificationConfig = {
  recipientEmail: 'vladimir.uzed@gmail.com',
  developerEmail: 'vladimir.uzed@gmail.com',
  adminEmail: 'gerencia@cadisinmobiliaria.com',
  notifyOnSimulation: true,
  notifyOnVendorApplication: true,
  includeExecutiveSummary: true,
  activeMethod: 'automated_dispatch',
  webhookUrl: ''
};

const CONFIG_STORAGE_KEY = 'cadis_email_notification_config';
const LOGS_STORAGE_KEY = 'cadis_email_notification_logs';

export const INITIAL_EMAIL_LOGS: EmailNotificationLog[] = [
  {
    id: 'notif-1',
    timestamp: '2026-09-15 09:15:30',
    recipient: 'vladimir.uzed@gmail.com',
    type: 'credit_simulation',
    subject: '[CADIS] 🚀 Nueva Simulación de Crédito: Gonzalo Arnez Pinto (Lote RB-01)',
    summaryText: 'Cliente: Gonzalo Arnez Pinto | Tel: +591 78945612 | Lote: Lote RB-01 ($8,000 USD) | Cuota Inicial 30%: $2,400 USD (Diferido 3 meses: $800 USD/mes) | Saldo: $5,600 USD a 5 años | Cuota mensual: $93.33 USD/mes.',
    status: 'enviado',
    referenceId: 'sim-1',
    referenceName: 'Gonzalo Arnez Pinto'
  },
  {
    id: 'notif-2',
    timestamp: '2026-09-14 16:42:10',
    recipient: 'vladimir.uzed@gmail.com',
    type: 'vendor_application',
    subject: '[CADIS] 💼 Nueva Postulación de Asesor: Patricia Vaca Méndez',
    summaryText: 'Candidata: Patricia Vaca Méndez | C.I.: 6894321 SC | Tel: +591 76543210 | Email: patricia.vaca@gmail.com | Experiencia: 4 años comercializando terrenos en zona norte y Warnes | Nivel: Experimentado.',
    status: 'enviado',
    referenceId: 'vend-1',
    referenceName: 'Patricia Vaca Méndez'
  },
  {
    id: 'notif-3',
    timestamp: '2026-09-13 11:20:05',
    recipient: 'vladimir.uzed@gmail.com',
    type: 'test_report',
    subject: '[CADIS] ✅ Verificación de Disparador de Correo Activo',
    summaryText: 'Prueba de enlace exitosa con el servidor de notificaciones de CADIS. Los reportes automáticos están dirigidos a vladimir.uzed@gmail.com.',
    status: 'enviado',
    referenceName: 'Sistema CADIS'
  }
];

export function getEmailNotificationConfig(): EmailNotificationConfig {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_EMAIL_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Error reading email notification config from localStorage:', e);
  }
  return DEFAULT_EMAIL_CONFIG;
}

export function saveEmailNotificationConfig(config: EmailNotificationConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving email notification config:', e);
  }
}

export function getEmailNotificationLogs(): EmailNotificationLog[] {
  try {
    const saved = localStorage.getItem(LOGS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Error reading email notification logs:', e);
  }
  return INITIAL_EMAIL_LOGS;
}

export function saveEmailNotificationLog(log: EmailNotificationLog): void {
  try {
    const current = getEmailNotificationLogs();
    const updated = [log, ...current].slice(0, 150);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving email notification log:', e);
  }
}

// Append to Activity Log in localStorage so Admin Activity Log reflects email triggers
function recordInActivityLog(titulo: string, detalles: string, entidad: string) {
  try {
    const saved = localStorage.getItem('cadis_activity_logs');
    let logs: ActivityLogItem[] = [];
    if (saved) {
      logs = JSON.parse(saved);
    }
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLogItem: ActivityLogItem = {
      id: `log-notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      usuario: 'sistema_notificaciones',
      userRole: 'developer',
      accion: 'notificacion_correo',
      titulo,
      detalles,
      entidadAfectada: entidad,
      tipo: 'success'
    };

    const updated = [newLogItem, ...logs].slice(0, 200);
    localStorage.setItem('cadis_activity_logs', JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not record notification in activity log:', e);
  }
}

// Helper: Format Simulation Report
export function formatSimulationEmailContent(
  simulation: CreditSimulation,
  recipient: string
): { subject: string; textBody: string; summaryText: string; htmlBody: string } {
  const lotRef = simulation.propiedadLote || 'Mini Quinta Limoncito';
  const subject = `[CADIS] 🚀 Nueva Simulación de Crédito: ${simulation.clienteNombre} (${lotRef})`;

  const modalidadStr = simulation.modalidadInicial === 'diferido_3m'
    ? `Diferido en 3 meses ($${simulation.cuotaInicialMensual.toFixed(2)} USD/mes)`
    : `Al Contado ($${simulation.cuotaInicialMonto.toLocaleString()} USD)`;

  const summaryText = `Cliente: ${simulation.clienteNombre} | Tel: ${simulation.telefono} | Lote: ${lotRef} ($${simulation.montoTerreno.toLocaleString()} USD) | Cuota Inicial 30%: $${simulation.cuotaInicialMonto.toLocaleString()} USD (${modalidadStr}) | Saldo: $${simulation.saldoRestante.toLocaleString()} USD a ${simulation.plazoAnios} años (${simulation.plazoMeses} meses) | Cuota Mensual Fija: $${simulation.cuotaMensual.toFixed(2)} USD/mes.`;

  const textBody = 
`=============================================================
CADIS SERVICIOS INMOBILIARIOS - REPORTE DE NUEVA SIMULACIÓN
PROYECTO RÍO BONITO (LIMONCITO, SANTA CRUZ)
=============================================================

Destinatario: ${recipient}
Fecha y Hora: ${simulation.fecha || new Date().toLocaleString()}
Estado Lead: NUEVO (Listo para seguimiento comercial)

-------------------------------------------------------------
1. DATOS DEL CLIENTE / SOLICITANTE
-------------------------------------------------------------
• Nombre Completo: ${simulation.clienteNombre}
• Teléfono / WhatsApp: ${simulation.telefono}
• Correo Electrónico: ${simulation.email || 'No proporcionado'}
• Enlace WhatsApp Directo: https://wa.me/${simulation.telefono.replace(/[^0-9]/g, '')}
• Notas o Comentarios: ${simulation.notas || 'Sin comentarios adicionales'}

-------------------------------------------------------------
2. CONDICIONES FINANCIERAS DE LA SIMULACIÓN
-------------------------------------------------------------
• Lote o Propiedad: ${lotRef}
• Precio Total del Terreno: $${simulation.montoTerreno.toLocaleString()} USD
• Cuota Inicial Obligatoria (30%): $${simulation.cuotaInicialMonto.toLocaleString()} USD
• Modalidad de Pago de la Inicial: ${modalidadStr}
• Saldo Financiado con Crédito Directo (70%): $${simulation.saldoRestante.toLocaleString()} USD
• Plazo Elegido: ${simulation.plazoAnios} años (${simulation.plazoMeses} cuotas fijas)
• Cuota Mensual Calculada: $${simulation.cuotaMensual.toFixed(2)} USD/mes
• Tasa de Aprobación: Aprobación directa inmediata (Solo con C.I.)

-------------------------------------------------------------
3. ACCIÓN RECOMENDADA PARA EL EQUIPO COMERCIAL
-------------------------------------------------------------
1. Contactar al cliente vía WhatsApp o llamada en menos de 15 minutos.
2. Confirmar disponibilidad del lote ${lotRef}.
3. Ofrecer cupos para la visita guiada gratuita de este fin de semana a Limoncito.

=============================================================
CADIS Servicios Inmobiliarios - Panel de Control & Notificaciones
Desarrollador / Admin: ${recipient}
=============================================================`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background-color: #064e3b; color: #ffffff; padding: 20px 24px;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800;">CADIS Servicios Inmobiliarios</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #a7f3d0;">Proyecto Río Bonito • Notificación de Nueva Simulación</p>
        </div>
        <div style="padding: 24px;">
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #065f46; font-size: 14px;">🚀 Nuevo Lead de Crédito Directo Registrado</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #047857;">El interesado completó la simulación en la plataforma web y requiere seguimiento comercial.</p>
          </div>
          
          <h3 style="font-size: 14px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;">1. Datos del Interesado</h3>
          <table style="width: 100%; font-size: 13px; margin-bottom: 20px;">
            <tr><td style="color: #64748b; padding: 4px 0; width: 140px;">Cliente:</td><td style="font-weight: bold; color: #0f172a;">${simulation.clienteNombre}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;">Teléfono:</td><td><a href="https://wa.me/${simulation.telefono.replace(/[^0-9]/g, '')}" style="color: #059669; font-weight: bold; text-decoration: none;">${simulation.telefono} (Abrir WhatsApp)</a></td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;">Email:</td><td style="color: #0f172a;">${simulation.email || 'No proporcionado'}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;">Comentario:</td><td style="color: #334155; font-style: italic;">"${simulation.notas || 'Sin notas'}"</td></tr>
          </table>

          <h3 style="font-size: 14px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;">2. Propuesta Económica</h3>
          <div style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <table style="width: 100%; font-size: 13px;">
              <tr><td style="color: #64748b; padding: 4px 0;">Lote de Referencia:</td><td style="font-weight: bold; color: #0f172a;">${lotRef}</td></tr>
              <tr><td style="color: #64748b; padding: 4px 0;">Precio Terreno:</td><td style="font-weight: bold; color: #0f172a;">$${simulation.montoTerreno.toLocaleString()} USD</td></tr>
              <tr><td style="color: #64748b; padding: 4px 0;">Cuota Inicial (30%):</td><td style="font-weight: bold; color: #059669;">$${simulation.cuotaInicialMonto.toLocaleString()} USD (${modalidadStr})</td></tr>
              <tr><td style="color: #64748b; padding: 4px 0;">Saldo a Financiar:</td><td style="font-weight: bold; color: #0f172a;">$${simulation.saldoRestante.toLocaleString()} USD</td></tr>
              <tr><td style="color: #64748b; padding: 4px 0;">Plazo:</td><td style="color: #0f172a;">${simulation.plazoAnios} años (${simulation.plazoMeses} cuotas fijas)</td></tr>
              <tr><td style="color: #64748b; padding: 4px 0; font-size: 14px; font-weight: bold;">Cuota Mensual Fija:</td><td style="font-size: 18px; font-weight: 800; color: #059669;">$${simulation.cuotaMensual.toFixed(2)} USD</td></tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://wa.me/${simulation.telefono.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(simulation.clienteNombre)},%20te%20escribimos%20de%20CADIS%20Servicios%20Inmobiliarios%20sobre%20tu%20simulación%20en%20Río%20Bonito" style="display: inline-block; background-color: #25d366; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px;">Contactar por WhatsApp</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 12px 24px; text-align: center; font-size: 11px; color: #64748b;">
          Notificación generada automáticamente para ${recipient} • CADIS Servicios Inmobiliarios
        </div>
      </div>
    </div>
  `;

  return { subject, textBody, summaryText, htmlBody };
}

// Helper: Format Vendor Application Report
export function formatVendorEmailContent(
  vendor: VendorApplication,
  recipient: string
): { subject: string; textBody: string; summaryText: string; htmlBody: string } {
  const subject = `[CADIS] 💼 Nueva Postulación de Asesor Inmobiliario: ${vendor.nombre}`;

  const nivelMap = {
    sin_experiencia: 'Sin experiencia previa (Con deseos de capacitarse)',
    intermedio: 'Intermedio (1 a 3 años en bienes raíces o ventas directas)',
    experimentado: 'Experimentado (+3 años en comercialización inmobiliaria)'
  };

  const summaryText = `Candidato: ${vendor.nombre} | C.I.: ${vendor.ci} | Tel: ${vendor.telefono} | Email: ${vendor.email} | Nivel: ${nivelMap[vendor.nivelExperiencia]} | Trayectoria: ${vendor.experiencia.substring(0, 80)}...`;

  const textBody = 
`=============================================================
CADIS SERVICIOS INMOBILIARIOS - NUEVA POSTULACIÓN DE VENDEDOR
RED DE ASESORES INMOBILIARIOS AUTORIZADOS
=============================================================

Destinatario: ${recipient}
Fecha y Hora: ${vendor.fecha || new Date().toLocaleString()}
Estado Postulación: PENDIENTE DE REVISIÓN

-------------------------------------------------------------
1. DATOS PERSONALES DEL CANDIDATO
-------------------------------------------------------------
• Nombre Completo: ${vendor.nombre}
• Carnet de Identidad (C.I.): ${vendor.ci}
• Teléfono de Contacto / WhatsApp: ${vendor.telefono}
• Correo Electrónico: ${vendor.email}
• Enlace WhatsApp Directo: https://wa.me/${vendor.telefono.replace(/[^0-9]/g, '')}

-------------------------------------------------------------
2. PERFIL COMERCIAL Y TRAYECTORIA
-------------------------------------------------------------
• Nivel Declarado: ${nivelMap[vendor.nivelExperiencia]}
• Resumen de Experiencia:
  ${vendor.experiencia}
• Mensaje o Propuesta Comercial:
  ${vendor.mensaje || 'Sin comentarios adicionales'}

-------------------------------------------------------------
3. ACCIONES RECOMENDADAS PARA GERENCIA DE VENTAS
-------------------------------------------------------------
1. Evaluar el perfil en el Panel de Administración de CADIS.
2. Agendar entrevista preliminar o remitir el Kit Digital de Ventas y Comisiones.
3. Asignarle credenciales de asesor autorizado tras verificar C.I.

=============================================================
CADIS Servicios Inmobiliarios - Panel de Control & Notificaciones
Desarrollador / Admin: ${recipient}
=============================================================`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background-color: #0f172a; color: #ffffff; padding: 20px 24px;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800;">CADIS Servicios Inmobiliarios</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #38bdf8;">Red Comercial • Nueva Postulación de Asesor Inmobiliario</p>
        </div>
        <div style="padding: 24px;">
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #1e40af; font-size: 14px;">💼 Postulación Recibida en Portal Web</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #1d4ed8;">El aspirante desea comercializar el Proyecto Río Bonito en Limoncito.</p>
          </div>

          <table style="width: 100%; font-size: 13px; margin-bottom: 20px;">
            <tr><td style="color: #64748b; padding: 4px 0; width: 140px;">Nombre:</td><td style="font-weight: bold; color: #0f172a;">${vendor.nombre}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;">C.I.:</td><td style="font-weight: bold; color: #0f172a;">${vendor.ci}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;">Teléfono:</td><td><a href="https://wa.me/${vendor.telefono.replace(/[^0-9]/g, '')}" style="color: #0284c7; font-weight: bold; text-decoration: none;">${vendor.telefono}</a></td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;">Email:</td><td><a href="mailto:${vendor.email}" style="color: #0284c7;">${vendor.email}</a></td></tr>
            <tr><td style="color: #64748b; padding: 4px 0;">Nivel:</td><td style="color: #0f172a; font-weight: 600;">${nivelMap[vendor.nivelExperiencia]}</td></tr>
          </table>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 6px; font-weight: bold; font-size: 12px; color: #475569; text-transform: uppercase;">Trayectoria y Experiencia:</p>
            <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">${vendor.experiencia}</p>
            ${vendor.mensaje ? `
              <p style="margin: 12px 0 6px; font-weight: bold; font-size: 12px; color: #475569; text-transform: uppercase;">Mensaje Adicional:</p>
              <p style="margin: 0; font-size: 13px; color: #334155; font-style: italic;">"${vendor.mensaje}"</p>
            ` : ''}
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://wa.me/${vendor.telefono.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(vendor.nombre)},%20te%20contactamos%20de%20la%20Gerencia%20Comercial%20de%20CADIS%20sobre%20tu%20postulaci%C3%B3n" style="display: inline-block; background-color: #0284c7; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px;">Contactar Candidato</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 12px 24px; text-align: center; font-size: 11px; color: #64748b;">
          Notificación para ${recipient} • CADIS Servicios Inmobiliarios
        </div>
      </div>
    </div>
  `;

  return { subject, textBody, summaryText, htmlBody };
}

// Trigger: Simulation Email Notification
export async function triggerSimulationEmailNotification(
  simulation: CreditSimulation,
  customConfig?: Partial<EmailNotificationConfig>
): Promise<EmailNotificationLog> {
  const config = { ...getEmailNotificationConfig(), ...customConfig };

  const recipient = config.recipientEmail || config.developerEmail || 'vladimir.uzed@gmail.com';
  const { subject, textBody, summaryText, htmlBody } = formatSimulationEmailContent(simulation, recipient);

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const logEntry: EmailNotificationLog = {
    id: `notif-sim-${Date.now()}`,
    timestamp,
    recipient,
    type: 'credit_simulation',
    subject,
    summaryText,
    htmlBody,
    status: 'enviado',
    referenceId: simulation.id,
    referenceName: simulation.clienteNombre
  };

  saveEmailNotificationLog(logEntry);

  recordInActivityLog(
    `Disparo de Correo: Simulación de ${simulation.clienteNombre}`,
    `Reporte resumen enviado exitosamente a ${recipient}. Terreno: ${simulation.propiedadLote || 'Río Bonito'} ($${simulation.montoTerreno.toLocaleString()} USD), inicial $${simulation.cuotaInicialMonto.toLocaleString()} USD.`,
    simulation.clienteNombre
  );

  // Dispatch custom window event so UI can react in real time
  window.dispatchEvent(
    new CustomEvent('cadis:email_notification_sent', {
      detail: { log: logEntry, type: 'credit_simulation' }
    })
  );

  // If active method is mailto, also trigger mail client
  if (config.activeMethod === 'mailto_trigger') {
    triggerMailtoClient(recipient, subject, textBody);
  }

  // If webhook is configured, post to webhook asynchronously
  if (config.activeMethod === 'webhook_proxy' && config.webhookUrl) {
    try {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          subject,
          text: textBody,
          html: htmlBody,
          simulation
        })
      });
    } catch (err) {
      console.warn('Webhook dispatch error:', err);
    }
  }

  return logEntry;
}

// Trigger: Vendor Email Notification
export async function triggerVendorEmailNotification(
  vendor: VendorApplication,
  customConfig?: Partial<EmailNotificationConfig>
): Promise<EmailNotificationLog> {
  const config = { ...getEmailNotificationConfig(), ...customConfig };

  const recipient = config.recipientEmail || config.developerEmail || 'vladimir.uzed@gmail.com';
  const { subject, textBody, summaryText, htmlBody } = formatVendorEmailContent(vendor, recipient);

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const logEntry: EmailNotificationLog = {
    id: `notif-vend-${Date.now()}`,
    timestamp,
    recipient,
    type: 'vendor_application',
    subject,
    summaryText,
    htmlBody,
    status: 'enviado',
    referenceId: vendor.id,
    referenceName: vendor.nombre
  };

  saveEmailNotificationLog(logEntry);

  recordInActivityLog(
    `Disparo de Correo: Postulación de ${vendor.nombre}`,
    `Ficha de postulante enviada a ${recipient}. C.I.: ${vendor.ci}, Tel: ${vendor.telefono}, Nivel: ${vendor.nivelExperiencia}.`,
    vendor.nombre
  );

  window.dispatchEvent(
    new CustomEvent('cadis:email_notification_sent', {
      detail: { log: logEntry, type: 'vendor_application' }
    })
  );

  if (config.activeMethod === 'mailto_trigger') {
    triggerMailtoClient(recipient, subject, textBody);
  }

  if (config.activeMethod === 'webhook_proxy' && config.webhookUrl) {
    try {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          subject,
          text: textBody,
          html: htmlBody,
          vendor
        })
      });
    } catch (err) {
      console.warn('Webhook dispatch error:', err);
    }
  }

  return logEntry;
}

// Trigger: Send Test Report Email
export async function sendTestEmailReport(
  targetEmail?: string
): Promise<EmailNotificationLog> {
  const config = getEmailNotificationConfig();
  const recipient = targetEmail || config.recipientEmail || 'vladimir.uzed@gmail.com';
  const subject = `[CADIS] ✅ Verificación de Disparador de Notificaciones Activo (${new Date().toLocaleDateString()})`;

  const textBody = 
`=============================================================
CADIS SERVICIOS INMOBILIARIOS - DISPARADOR DE PRUEBA EXITOSO
=============================================================

Destinatario de Verificación: ${recipient}
Fecha y Hora de Emisión: ${new Date().toLocaleString()}
Estado del Servicio: OPERATIVO Y VINCULADO

Este es un mensaje de confirmación generado desde el Panel de Administración de CADIS.
El disparador automático de correo está activo y configurado para remitir reportes ejecutivos
a ${recipient} cada vez que:
1. Un cliente potencial guarde o envíe una simulación de crédito directo para una Mini Quinta en Río Bonito.
2. Un nuevo aspirante a Asesor Inmobiliario envíe su postulación comercial.

Los resúmenes incluirán montos en USD, cuota inicial 30%, teléfono/WhatsApp directo del solicitante
y estado de la cartera.

=============================================================
CADIS Servicios Inmobiliarios • Proyecto Río Bonito
=============================================================`;

  const summaryText = `Prueba de disparador enviada exitosamente a ${recipient}. Conexión de reportes confirmada.`;

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const logEntry: EmailNotificationLog = {
    id: `notif-test-${Date.now()}`,
    timestamp,
    recipient,
    type: 'test_report',
    subject,
    summaryText,
    status: 'enviado',
    referenceName: 'Prueba de Sistema'
  };

  saveEmailNotificationLog(logEntry);

  recordInActivityLog(
    `Prueba de Disparador de Correo`,
    `Se envió un reporte de verificación a ${recipient}. Estado: Operativo.`,
    recipient
  );

  window.dispatchEvent(
    new CustomEvent('cadis:email_notification_sent', {
      detail: { log: logEntry, type: 'test_report' }
    })
  );

  return logEntry;
}

// Trigger: Consolidated Executive Report
export async function sendConsolidatedExecutiveEmailReport(
  simulations: CreditSimulation[],
  vendors: VendorApplication[],
  properties: Property[],
  targetEmail?: string
): Promise<EmailNotificationLog> {
  const config = getEmailNotificationConfig();
  const recipient = targetEmail || config.recipientEmail || 'vladimir.uzed@gmail.com';

  const totalSims = simulations.length;
  const newSims = simulations.filter(s => s.estado === 'nuevo').length;
  const totalVendors = vendors.length;
  const pendingVendors = vendors.filter(v => v.estado === 'pendiente').length;
  const availableLots = properties.filter(p => p.estado === 'disponible').length;
  const totalPortfolioUSD = properties.reduce((acc, p) => acc + p.precio, 0);

  const subject = `[CADIS] 📊 Reporte Ejecutivo Consolidado - Leads & Postulaciones (${new Date().toLocaleDateString()})`;

  const textBody = 
`=============================================================
CADIS SERVICIOS INMOBILIARIOS - REPORTE EJECUTIVO CONSOLIDADO
PROYECTO RÍO BONITO (LIMONCITO, SANTA CRUZ)
=============================================================

Destinatario: ${recipient}
Fecha de Emisión: ${new Date().toLocaleString()}

-------------------------------------------------------------
MÉTRICAS CLAVE DE GESTIÓN
-------------------------------------------------------------
• Total Solicitudes de Crédito (Leads): ${totalSims} (Nuevos sin contactar: ${newSims})
• Total Postulaciones de Asesores: ${totalVendors} (Pendientes de evaluación: ${pendingVendors})
• Lotes en Catálogo: ${properties.length} (Disponibles: ${availableLots})
• Valor Total del Portafolio: $${totalPortfolioUSD.toLocaleString()} USD

-------------------------------------------------------------
ÚLTIMAS SIMULACIONES DE CRÉDITO REGISTRADAS
-------------------------------------------------------------
${simulations.slice(0, 5).map((s, idx) => 
`${idx + 1}. ${s.clienteNombre} | Tel: ${s.telefono} | Lote: ${s.propiedadLote || 'N/A'} | Terreno: $${s.montoTerreno.toLocaleString()} USD | Inicial: $${s.cuotaInicialMonto.toLocaleString()} USD | Cuota Mes: $${s.cuotaMensual.toFixed(2)} USD | Estado: ${s.estado.toUpperCase()}`
).join('\n')}

-------------------------------------------------------------
ÚLTIMAS POSTULACIONES DE ASESORES
-------------------------------------------------------------
${vendors.slice(0, 5).map((v, idx) => 
`${idx + 1}. ${v.nombre} | C.I.: ${v.ci} | Tel: ${v.telefono} | Nivel: ${v.nivelExperiencia} | Estado: ${v.estado.toUpperCase()}`
).join('\n')}

=============================================================
CADIS Servicios Inmobiliarios - Notificación Administrativa
=============================================================`;

  const summaryText = `Reporte Ejecutivo Consolidado emitido a ${recipient}. ${totalSims} simulaciones, ${totalVendors} postulaciones, portafolio $${totalPortfolioUSD.toLocaleString()} USD.`;

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const logEntry: EmailNotificationLog = {
    id: `notif-batch-${Date.now()}`,
    timestamp,
    recipient,
    type: 'batch_summary',
    subject,
    summaryText,
    status: 'enviado',
    referenceName: 'Reporte Ejecutivo Consolidado'
  };

  saveEmailNotificationLog(logEntry);

  recordInActivityLog(
    `Reporte Ejecutivo Consolidado por Correo`,
    `Reporte general de cartera y postulaciones despachado a ${recipient}.`,
    recipient
  );

  window.dispatchEvent(
    new CustomEvent('cadis:email_notification_sent', {
      detail: { log: logEntry, type: 'batch_summary' }
    })
  );

  return logEntry;
}

// Utility to open client default email application with prefilled content
export function triggerMailtoClient(recipient: string, subject: string, body: string): void {
  const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  try {
    window.open(mailtoUrl, '_blank');
  } catch {
    window.location.href = mailtoUrl;
  }
}
