export interface Property {
  id: string;
  loteNumero: string;
  titulo: string;
  proyecto: string;
  ubicacion: string;
  precio: number;
  cuotaInicialPorcentaje: number;
  metraje: number;
  dimensiones: string;
  servicios: string[];
  imagen: string;
  disponible: boolean;
  estado: 'disponible' | 'reservado' | 'vendido';
  destacado?: boolean;
  caracteristicas?: string[];
}

export interface CreditSimulation {
  id: string;
  clienteNombre: string;
  telefono: string;
  email?: string;
  montoTerreno: number;
  cuotaInicialPorcentaje: number;
  cuotaInicialMonto: number;
  modalidadInicial: 'contado' | 'diferido_3m';
  cuotaInicialMensual: number;
  saldoRestante: number;
  plazoAnios: number; // 1 a 8 años
  plazoMeses: number; // 12 a 96 meses
  tasaInteresAnual?: number; // Ej: 10%
  cuotaMensual: number;
  totalFinanciadoUSD?: number;
  propiedadLote?: string;
  fecha: string;
  estado: 'nuevo' | 'contactado' | 'en_negociacion' | 'cerrado';
  notas?: string;
}

export interface PaymentScheduleQuota {
  numeroCuota: number;
  fechaVencimiento: string;
  montoCuotaUSD: number;
  interesUSD: number;
  capitalUSD: number;
  saldoRestanteUSD: number;
  estado: 'pendiente' | 'pagado' | 'vencido';
  fechaPagoReal?: string;
  comprobante?: string;
  metodoPago?: 'transferencia' | 'efectivo' | 'qr' | 'deposito';
  registradoPor?: string;
}

export interface ClientPaymentPlan {
  id: string;
  clienteNombre: string;
  ci: string;
  telefono: string;
  email?: string;
  loteNumero: string;
  precioTotalUSD: number;
  cuotaInicialUSD: number;
  saldoFinanciarUSD: number;
  plazoAnios: number;
  tasaInteresAnual: number;
  cuotaMensualUSD: number;
  fechaInicioContractual: string;
  cronogramaCuotas: PaymentScheduleQuota[];
}

export interface VendorApplication {
  id: string;
  nombre: string;
  ci: string;
  telefono: string;
  email: string;
  experiencia: string;
  nivelExperiencia: 'sin_experiencia' | 'intermedio' | 'experimentado';
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fecha: string;
  mensaje?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  fecha: string;
}

export interface ContactMessage {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  asunto: string;
  mensaje: string;
  fecha: string;
}

export type UserRole = 'developer' | 'admin' | 'editor' | 'reader';

export interface AdminUser {
  id: string;
  username: string;
  nombreCompleto: string;
  role: UserRole;
  email: string;
  ultimoAcceso?: string;
}

export interface AdminDocument {
  id: string;
  nombre: string;
  tipo: 'reporte_excel' | 'contrato' | 'recibo' | 'plano' | 'ci_cliente' | 'otro';
  tamano: string;
  fechaSubida: string;
  subidoPor: string;
  loteAsociado?: string;
  clienteAsociado?: string;
  archivoUrl?: string;
  notas?: string;
}

export interface AccountingEntry {
  id: string;
  fecha: string;
  tipo: 'ingreso_cuota_inicial' | 'ingreso_cuota_mensual' | 'ingreso_reserva' | 'egreso_operativo' | 'comision_vendedor';
  concepto: string;
  loteReferencia?: string;
  clienteReferencia?: string;
  montoUSD: number;
  metodoPago: 'transferencia' | 'efectivo' | 'qr' | 'deposito';
  comprobante?: string;
  registradoPor: string;
  origen: 'manual' | 'importacion_excel' | 'simulador_cerrado';
}

export interface AccountingSummary {
  totalIngresosUSD: number;
  totalEgresosUSD: number;
  balanceNetoUSD: number;
  carteraPorCobrarUSD: number;
  cuotasCobradasMesUSD: number;
  lotesVendidosTotal: number;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  usuario: string;
  userRole: UserRole;
  accion: 
    | 'cambio_estado_lote' 
    | 'eliminacion_lote' 
    | 'creacion_lote' 
    | 'cambio_estado_lead' 
    | 'decision_vendedor' 
    | 'carga_documento' 
    | 'eliminacion_documento' 
    | 'asiento_contable' 
    | 'importacion_excel'
    | 'exportacion_datos'
    | 'notificacion_correo'
    | 'otro';
  titulo: string;
  detalles: string;
  entidadAfectada?: string;
  tipo: 'info' | 'warning' | 'danger' | 'success';
}

export interface EmailNotificationConfig {
  recipientEmail: string;
  developerEmail: string;
  adminEmail: string;
  notifyOnSimulation: boolean;
  notifyOnVendorApplication: boolean;
  includeExecutiveSummary: boolean;
  activeMethod: 'automated_dispatch' | 'mailto_trigger' | 'webhook_proxy';
  webhookUrl?: string;
}

export interface EmailNotificationLog {
  id: string;
  timestamp: string;
  recipient: string;
  type: 'credit_simulation' | 'vendor_application' | 'test_report' | 'batch_summary';
  subject: string;
  summaryText: string;
  htmlBody?: string;
  status: 'enviado' | 'simulado' | 'fallido';
  referenceId?: string;
  referenceName?: string;
}
