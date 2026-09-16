import {
  Property,
  CreditSimulation,
  VendorApplication,
  NewsletterSubscriber,
  AccountingEntry,
  AdminDocument,
  AdminUser,
  ActivityLogItem,
  LotReservationRequest,
  ChatInteractionLog
} from '../types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    loteNumero: 'Lote RB-01',
    titulo: 'Mini Quinta El Manantial',
    proyecto: 'Proyecto Río Bonito',
    ubicacion: 'Limoncito, Santa Cruz - Zona Alta',
    precio: 8000,
    cuotaInicialPorcentaje: 30,
    metraje: 500,
    dimensiones: '20m x 25m',
    servicios: ['Agua de Pozo Profundo', 'Energía Eléctrica (En proyecto / Próximamente)', 'Vías Ripiadas', 'Acceso al Río'],
    imagen: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    disponible: true,
    estado: 'disponible',
    destacado: true,
    caracteristicas: ['Topografía plana', 'A 450m del río', 'Documentación al día', 'Entrega inmediata']
  },
  {
    id: 'prop-2',
    loteNumero: 'Lote RB-02',
    titulo: 'Mini Quinta Los Samanes',
    proyecto: 'Proyecto Río Bonito',
    ubicacion: 'Limoncito, Santa Cruz - Sector Valle',
    precio: 8000,
    cuotaInicialPorcentaje: 30,
    metraje: 500,
    dimensiones: '20m x 25m',
    servicios: ['Agua de Pozo Profundo', 'Energía Eléctrica', 'Entorno Arbolado', 'Seguridad'],
    imagen: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
    disponible: true,
    estado: 'disponible',
    destacado: true,
    caracteristicas: ['Árboles nativos', 'Sombra natural', 'Ideal casa de campo', 'A minutos del pueblo']
  },
  {
    id: 'prop-3',
    loteNumero: 'Lote RB-03',
    titulo: 'Mini Quinta Las Brisas Panorámicas',
    proyecto: 'Proyecto Río Bonito',
    ubicacion: 'Limoncito, Santa Cruz - Colinas',
    precio: 8000,
    cuotaInicialPorcentaje: 30,
    metraje: 750,
    dimensiones: '25m x 30m',
    servicios: ['Agua Potable', 'Energía Eléctrica', 'Vista Panorámica', 'Vías Afirmadas'],
    imagen: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80',
    disponible: true,
    estado: 'disponible',
    destacado: false,
    caracteristicas: ['Brisa fresca constante', 'Vista 360° al valle', 'Suelo fértil', 'Excelente drenaje']
  },
  {
    id: 'prop-4',
    loteNumero: 'Lote RB-04',
    titulo: 'Mini Quinta Ribera Real',
    proyecto: 'Proyecto Río Bonito',
    ubicacion: 'Limoncito, Santa Cruz - Primera Línea',
    precio: 8000,
    cuotaInicialPorcentaje: 30,
    metraje: 1000,
    dimensiones: '25m x 40m',
    servicios: ['Agua Potable', 'Energía Eléctrica', 'Acceso a Playa de Río', 'Senderos Ecológicos'],
    imagen: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1000&q=80',
    disponible: true,
    estado: 'disponible',
    destacado: true,
    caracteristicas: ['Acceso privado al río', '1,000 m² de relax', 'Entorno ecológico protegido', 'Alta plusvalía']
  },
  {
    id: 'prop-5',
    loteNumero: 'Lote RB-05',
    titulo: 'Mini Quinta Don Limón Comercial',
    proyecto: 'Proyecto Río Bonito',
    ubicacion: 'Limoncito, Santa Cruz - Avenida Principal',
    precio: 8000,
    cuotaInicialPorcentaje: 30,
    metraje: 1250,
    dimensiones: '25m x 50m',
    servicios: ['Agua Potable', 'Energía Trifásica', 'Sobre Vía Principal', 'Uso Mixto / Comercial'],
    imagen: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    disponible: true,
    estado: 'disponible',
    destacado: false,
    caracteristicas: ['Frente a avenida', 'Ideal para lodge o quinta vacacional', 'Mayor metraje', 'Acceso directo']
  },
  {
    id: 'prop-6',
    loteNumero: 'Lote RB-06',
    titulo: 'Hacienda Los Cedros',
    proyecto: 'Proyecto Río Bonito',
    ubicacion: 'Limoncito, Santa Cruz - Sector Bosque',
    precio: 8000,
    cuotaInicialPorcentaje: 30,
    metraje: 1500,
    dimensiones: '30m x 50m',
    servicios: ['Agua de Manantial', 'Energía Eléctrica', 'Arboleda Frutal', 'Punto de Vertiente'],
    imagen: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1000&q=80',
    disponible: true,
    estado: 'disponible',
    destacado: false,
    caracteristicas: ['Superficie amplia de 1,500 m²', 'Frutales en producción', 'Privacidad total', 'Entorno campestre']
  },
  {
    id: 'prop-7',
    loteNumero: 'Lote RB-07',
    titulo: 'Mini Quinta Mirador del Sol',
    proyecto: 'Proyecto Río Bonito',
    ubicacion: 'Limoncito, Santa Cruz - Meseta Alta',
    precio: 8000,
    cuotaInicialPorcentaje: 30,
    metraje: 500,
    dimensiones: '20m x 25m',
    servicios: ['Agua de Pozo', 'Energía Eléctrica', 'Vías Consolidadas'],
    imagen: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80',
    disponible: false,
    estado: 'reservado',
    destacado: false,
    caracteristicas: ['Reservado en feria de inversiones', 'Firma de promesa en curso']
  },
  {
    id: 'prop-8',
    loteNumero: 'Lote RB-08',
    titulo: 'Mini Quinta El Descanso Verde',
    proyecto: 'Proyecto Río Bonito',
    ubicacion: 'Limoncito, Santa Cruz - Orilla del Bosque',
    precio: 8000,
    cuotaInicialPorcentaje: 30,
    metraje: 600,
    dimensiones: '20m x 30m',
    servicios: ['Agua de Pozo', 'Energía Eléctrica', 'Topografía Plana'],
    imagen: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80',
    disponible: false,
    estado: 'vendido',
    destacado: false,
    caracteristicas: ['Vendido con crédito directo a 5 años', 'Propietario construyendo cabaña']
  }
];

export const INITIAL_SIMULATIONS: CreditSimulation[] = [
  {
    id: 'sim-95',
    clienteNombre: 'Gonzalo Arnez Pinto',
    telefono: '+591 71012345',
    email: 'gonzalo.arnez@gmail.com',
    montoTerreno: 8000,
    cuotaInicialPorcentaje: 30,
    cuotaInicialMonto: 2400,
    modalidadInicial: 'contado',
    cuotaInicialMensual: 2400,
    saldoRestante: 5600,
    plazoAnios: 5,
    plazoMeses: 60,
    cuotaMensual: 93.33,
    propiedadLote: 'Lote RB-01',
    fecha: '2026-05-14 10:20',
    estado: 'cerrado',
    notas: 'Cliente inicial que formalizó su reserva en Limoncito.'
  },
  {
    id: 'sim-96',
    clienteNombre: 'Claudia Roxana Salvatierra',
    telefono: '+591 72198000',
    email: 'claudia.salvatierra@outlook.com',
    montoTerreno: 12000,
    cuotaInicialPorcentaje: 30,
    cuotaInicialMonto: 3600,
    modalidadInicial: 'diferido_3m',
    cuotaInicialMensual: 1200,
    saldoRestante: 8400,
    plazoAnios: 3,
    plazoMeses: 36,
    cuotaMensual: 233.33,
    propiedadLote: 'Lote RB-03',
    fecha: '2026-05-28 16:40',
    estado: 'cerrado',
    notas: 'Optó por 3 años de plazo. Construcción programada.'
  },
  {
    id: 'sim-97',
    clienteNombre: 'Jorge Luis Aguilera',
    telefono: '+591 75066442',
    email: 'jorge.aguilera@yahoo.com',
    montoTerreno: 8000,
    cuotaInicialPorcentaje: 30,
    cuotaInicialMonto: 2400,
    modalidadInicial: 'diferido_3m',
    cuotaInicialMensual: 800,
    saldoRestante: 5600,
    plazoAnios: 10,
    plazoMeses: 120,
    cuotaMensual: 46.67,
    propiedadLote: 'Lote RB-02',
    fecha: '2026-06-12 11:30',
    estado: 'cerrado',
    notas: 'Simulación convertida en compra de lote RB-02.'
  },
  {
    id: 'sim-98',
    clienteNombre: 'Sandra Milena Barba',
    telefono: '+591 76044321',
    email: 'sandra.barba@gmail.com',
    montoTerreno: 15000,
    cuotaInicialPorcentaje: 30,
    cuotaInicialMonto: 4500,
    modalidadInicial: 'contado',
    cuotaInicialMensual: 4500,
    saldoRestante: 10500,
    plazoAnios: 5,
    plazoMeses: 60,
    cuotaMensual: 175.00,
    propiedadLote: 'Lote RB-05',
    fecha: '2026-06-25 15:10',
    estado: 'en_negociacion',
    notas: 'Interesada en lote con acceso directo a la playa del río.'
  },
  {
    id: 'sim-99',
    clienteNombre: 'Mauricio Antelo Roca',
    telefono: '+591 77312984',
    email: 'mauricio.antelo@gmail.com',
    montoTerreno: 9500,
    cuotaInicialPorcentaje: 30,
    cuotaInicialMonto: 2850,
    modalidadInicial: 'diferido_3m',
    cuotaInicialMensual: 950,
    saldoRestante: 6650,
    plazoAnios: 5,
    plazoMeses: 60,
    cuotaMensual: 110.83,
    propiedadLote: 'Lote RB-08',
    fecha: '2026-07-08 09:45',
    estado: 'cerrado',
    notas: 'Lote RB-08 adquirido con crédito directo.'
  },
  {
    id: 'sim-100',
    clienteNombre: 'Valeria Justiniano Dorado',
    telefono: '+591 78455210',
    email: 'valeria.jd@hotmail.com',
    montoTerreno: 8000,
    cuotaInicialPorcentaje: 30,
    cuotaInicialMonto: 2400,
    modalidadInicial: 'contado',
    cuotaInicialMensual: 2400,
    saldoRestante: 5600,
    plazoAnios: 3,
    plazoMeses: 36,
    cuotaMensual: 155.56,
    propiedadLote: 'Lote RB-07',
    fecha: '2026-07-22 17:20',
    estado: 'en_negociacion',
    notas: 'Reserva preventiva de lote RB-07.'
  },
  {
    id: 'sim-101',
    clienteNombre: 'Carlos Eduardo Mendoza',
    telefono: '+591 71234567',
    email: 'carlos.mendoza@gmail.com',
    montoTerreno: 8000,
    cuotaInicialPorcentaje: 30,
    cuotaInicialMonto: 2400,
    modalidadInicial: 'diferido_3m',
    cuotaInicialMensual: 800,
    saldoRestante: 5600,
    plazoAnios: 5,
    plazoMeses: 60,
    cuotaMensual: 93.33,
    propiedadLote: 'Lote RB-01',
    fecha: '2026-08-05 14:30',
    estado: 'nuevo',
    notas: 'Interesado en visita este sábado a Limoncito con su familia.'
  },
  {
    id: 'sim-102',
    clienteNombre: 'María Reneé Suárez',
    telefono: '+591 76543210',
    email: 'm.suarez.renee@hotmail.com',
    montoTerreno: 12500,
    cuotaInicialPorcentaje: 30,
    cuotaInicialMonto: 3750,
    modalidadInicial: 'contado',
    cuotaInicialMensual: 3750,
    saldoRestante: 8750,
    plazoAnios: 3,
    plazoMeses: 36,
    cuotaMensual: 243.06,
    propiedadLote: 'Lote RB-04',
    fecha: '2026-08-19 11:15',
    estado: 'contactado',
    notas: 'Cuenta con la cuota inicial al contado. Quiere lote con salida al río.'
  },
  {
    id: 'sim-103',
    clienteNombre: 'Fernando Justiniano Paz',
    telefono: '+591 78901234',
    email: 'fer.justiniano@outlook.com',
    montoTerreno: 8000,
    cuotaInicialPorcentaje: 30,
    cuotaInicialMonto: 2400,
    modalidadInicial: 'diferido_3m',
    cuotaInicialMensual: 800,
    saldoRestante: 5600,
    plazoAnios: 10,
    plazoMeses: 120,
    cuotaMensual: 46.67,
    propiedadLote: 'Lote RB-02',
    fecha: '2026-08-29 18:45',
    estado: 'en_negociacion',
    notas: 'Optó por 10 años para pagar cuota mensual de $46.67 USD.'
  },
  {
    id: 'sim-104',
    clienteNombre: 'Paola Andrea Mercado',
    telefono: '+591 70098123',
    email: 'pao.mercado@gmail.com',
    montoTerreno: 18500,
    cuotaInicialPorcentaje: 30,
    cuotaInicialMonto: 5550,
    modalidadInicial: 'diferido_3m',
    cuotaInicialMensual: 1850,
    saldoRestante: 12950,
    plazoAnios: 5,
    plazoMeses: 60,
    cuotaMensual: 215.83,
    propiedadLote: 'Lote RB-06',
    fecha: '2026-09-02 12:10',
    estado: 'nuevo',
    notas: 'Consulta sobre lote amplio de 1,500m² para casa de campo.'
  },
  {
    id: 'sim-105',
    clienteNombre: 'Marcelo Ribera Saucedo',
    telefono: '+591 73145678',
    email: 'marcelo.ribera@yahoo.com',
    montoTerreno: 8000,
    cuotaInicialPorcentaje: 30,
    cuotaInicialMonto: 2400,
    modalidadInicial: 'diferido_3m',
    cuotaInicialMensual: 800,
    saldoRestante: 5600,
    plazoAnios: 5,
    plazoMeses: 60,
    cuotaMensual: 93.33,
    propiedadLote: 'Lote RB-01',
    fecha: '2026-09-11 09:30',
    estado: 'contactado',
    notas: 'Requiere información de transporte para la visita de fin de semana.'
  }
];

export const INITIAL_VENDORS: VendorApplication[] = [
  {
    id: 'vend-1',
    nombre: 'Patricia Vaca Diez',
    ci: '5849302 SC',
    telefono: '+591 72198765',
    email: 'patricia.vacadiez@gmail.com',
    experiencia: '4 años en ventas inmobiliarias en urbanizaciones cerradas y terrenos campestres.',
    nivelExperiencia: 'experimentado',
    estado: 'pendiente',
    fecha: '2026-09-11 09:20',
    mensaje: 'Deseo integrarme al equipo comercial de CADIS para ofrecer Río Bonito a mi cartera de clientes.'
  },
  {
    id: 'vend-2',
    nombre: 'Alejandro Torrico Balcázar',
    ci: '8392014 SC',
    telefono: '+591 70045678',
    email: 'alejandro.torrico@gmail.com',
    experiencia: '2 años en corretaje de propiedades y marketing digital inmobiliario.',
    nivelExperiencia: 'intermedio',
    estado: 'aprobado',
    fecha: '2026-09-09 16:40',
    mensaje: 'Tengo experiencia en campañas de captación en Facebook y TikTok para terrenos.'
  },
  {
    id: 'vend-3',
    nombre: 'Valeria Montero Céspedes',
    ci: '6712093 SC',
    telefono: '+591 73388990',
    email: 'valeria.montero@gmail.com',
    experiencia: 'Inicio en el sector inmobiliario con amplia red de contactos empresariales.',
    nivelExperiencia: 'sin_experiencia',
    estado: 'aprobado',
    fecha: '2026-09-08 12:10',
    mensaje: 'Motivada por el modelo de comisiones altas y el respaldo legal de CADIS.'
  }
];

export const INITIAL_SUBSCRIBERS: NewsletterSubscriber[] = [
  { id: 'sub-1', email: 'inversiones.santacruz@gmail.com', fecha: '2026-09-11' },
  { id: 'sub-2', email: 'roberto.castillo@empresa.bo', fecha: '2026-09-10' },
  { id: 'sub-3', email: 'dra.laura.veizaga@gmail.com', fecha: '2026-09-09' }
];

export const INITIAL_RESERVATIONS: LotReservationRequest[] = [
  {
    id: 'res-1',
    fecha: '2026-09-14 11:05',
    loteNumero: 'Lote RB-01',
    accion: 'reservar',
    estado: 'contactado',
    origen: 'mapa_interactivo',
    notas: 'Interesado hizo clic en Reservar desde el mapa interactivo.'
  },
  {
    id: 'res-2',
    fecha: '2026-09-13 17:40',
    loteNumero: 'Lote RB-04',
    accion: 'agendar_visita',
    estado: 'confirmada',
    origen: 'mapa_interactivo',
    notas: 'Visita guiada de fin de semana coordinada por WhatsApp.'
  },
  {
    id: 'res-3',
    fecha: '2026-09-12 09:22',
    loteNumero: 'Lote RB-07',
    accion: 'comprar',
    estado: 'pendiente',
    origen: 'mapa_interactivo'
  }
];

export const INITIAL_CHAT_INTERACTIONS: ChatInteractionLog[] = [
  {
    id: 'chat-1',
    fecha: '2026-09-14 10:52',
    intent: 'credit_simulation',
    loteNumero: 'Lote RB-01',
    presupuestoConfirmado: 'diferido_3m',
    tieneCreditoPropio: 'no',
    resumenMensaje: 'Consultó cuota inicial en 3 meses para el Lote RB-01, sin crédito bancario propio.',
    estado: 'contactado'
  },
  {
    id: 'chat-2',
    fecha: '2026-09-13 16:10',
    intent: 'weekend_tour',
    presupuestoConfirmado: 'si',
    tieneCreditoPropio: 'no',
    resumenMensaje: 'Quiere reservar cupo para el recorrido de fin de semana a Río Bonito.',
    estado: 'nuevo'
  }
];

export const FAQ_ITEMS = [
  {
    pregunta: '¿Cuáles son los requisitos para acceder al Crédito Directo de CADIS?',
    respuesta: 'En CADIS brindamos Crédito Directo sin burocracia bancaria. Solo requieres: 1) Fotocopia simple de tu Cédula de Identidad (C.I./DNI), 2) Pago o compromiso de tu cuota inicial del 30% (al contado o en 3 cuotas mensuales), y 3) Firma de tu contrato de compraventa con reconocimiento de firmas ante Notario de Fe Pública.'
  },
  {
    pregunta: '¿Cómo funciona la modalidad de cuota inicial diferida en 3 meses?',
    respuesta: 'Para un terreno estándar de $8,000 USD, la cuota inicial obligatoria del 30% equivale a $2,400 USD. Puedes pagarla en 3 partes mensuales iguales de $800 USD. Una vez cancelada la inicial, comienzas con tus cuotas del saldo financiado al plazo elegido (3, 5 o 10 años).'
  },
  {
    pregunta: '¿El Proyecto Río Bonito cuenta con servicios básicos y títulos?',
    respuesta: 'Sí, todas las Mini Quintas del Proyecto Río Bonito en Limoncito cuentan con plano de loteamiento aprobado, demarcación topográfica con estacas, red de energía eléctrica, acceso a agua de pozo profundo de vertiente y caminos ripiados y transitables durante todo el año.'
  },
  {
    pregunta: '¿Puedo visitar el terreno antes de tomar una decisión?',
    respuesta: '¡Por supuesto! Organizamos salidas y visitas guiadas gratuitas todos los sábados y domingos con transporte ida y vuelta desde Santa Cruz hasta el Proyecto Río Bonito en Limoncito. Puedes agendar tu cupo directamente con un asesor por WhatsApp.'
  },
  {
    pregunta: '¿Puedo adelantar cuotas o cancelar el total anticipadamente sin penalidad?',
    respuesta: 'Sí, tienes total libertad de realizar amortizaciones extraordinarias al capital o cancelación total anticipada en cualquier momento sin ninguna multa ni penalidad financiera.'
  }
];

export interface AdminCredential {
  username: string;
  pin: string;
  user: AdminUser;
  labelRol: 'Admin' | 'Editor' | 'Solo Lectura' | 'Desarrollador';
  descripcion: string;
  permisos: {
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    contabilidad: boolean;
  };
}

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredential[] = [
  {
    username: 'admin',
    pin: 'cadis2026',
    labelRol: 'Admin',
    descripcion: 'Control total del sistema: creación, edición y eliminación de lotes, documentos y módulos contables.',
    permisos: {
      crear: true,
      editar: true,
      eliminar: true,
      contabilidad: true
    },
    user: {
      id: 'usr-admin',
      username: 'admin',
      nombreCompleto: 'Lic. Javier Mendoza (Gerencia General)',
      role: 'admin',
      email: 'gerencia@cadisinmobiliaria.com',
      ultimoAcceso: 'Hoy, 08:30 AM'
    }
  },
  {
    username: 'editor',
    pin: 'editor123',
    labelRol: 'Editor',
    descripcion: 'Gestión comercial y catálogo: alta y edición de propiedades, cambio de estados y subida de documentos. Eliminación bloqueada.',
    permisos: {
      crear: true,
      editar: true,
      eliminar: false,
      contabilidad: false
    },
    user: {
      id: 'usr-editor',
      username: 'editor',
      nombreCompleto: 'Camila Rojas (Jefatura Comercial)',
      role: 'editor',
      email: 'comercial@cadisinmobiliaria.com',
      ultimoAcceso: 'Ayer, 17:45 PM'
    }
  },
  {
    username: 'lector',
    pin: 'lector123',
    labelRol: 'Solo Lectura',
    descripcion: 'Supervisión y auditoría: visualización de métricas, reportes y tablas. Acciones de edición y eliminación restringidas.',
    permisos: {
      crear: false,
      editar: false,
      eliminar: false,
      contabilidad: false
    },
    user: {
      id: 'usr-lector',
      username: 'lector',
      nombreCompleto: 'Auditoría / Consulta Externa',
      role: 'reader',
      email: 'auditoria@cadisinmobiliaria.com',
      ultimoAcceso: 'Hace 3 días'
    }
  },
  {
    username: 'dev',
    pin: 'dev2026!',
    labelRol: 'Desarrollador',
    descripcion: 'Mantenimiento técnico y scripts de base de datos relacionales.',
    permisos: {
      crear: true,
      editar: true,
      eliminar: true,
      contabilidad: true
    },
    user: {
      id: 'usr-dev',
      username: 'dev',
      nombreCompleto: 'Ing. Sistemas & Dev Team',
      role: 'developer',
      email: 'sistemas@cadisinmobiliaria.com',
      ultimoAcceso: 'Hoy, 09:15 AM'
    }
  }
];

export const INITIAL_ACCOUNTING_ENTRIES: AccountingEntry[] = [
  {
    id: 'acc-1',
    fecha: '2026-09-02',
    tipo: 'ingreso_cuota_inicial',
    concepto: 'Pago Cuota Inicial 30% Lote RB-04 (Ribera Real)',
    loteReferencia: 'Lote RB-04',
    clienteReferencia: 'Ing. Roberto Aguilera',
    montoUSD: 3600,
    metodoPago: 'transferencia',
    comprobante: 'TRF-BNB-998124',
    registradoPor: 'admin',
    origen: 'manual'
  },
  {
    id: 'acc-2',
    fecha: '2026-09-05',
    tipo: 'ingreso_reserva',
    concepto: 'Reserva formal 10% Lote RB-07 (Las Acacias)',
    loteReferencia: 'Lote RB-07',
    clienteReferencia: 'Dra. Verónica Justiniano',
    montoUSD: 850,
    metodoPago: 'qr',
    comprobante: 'QR-BMSC-445012',
    registradoPor: 'editor',
    origen: 'manual'
  },
  {
    id: 'acc-3',
    fecha: '2026-09-08',
    tipo: 'ingreso_cuota_mensual',
    concepto: 'Cuota mensual amortización Mes 1 - Lote RB-04',
    loteReferencia: 'Lote RB-04',
    clienteReferencia: 'Ing. Roberto Aguilera',
    montoUSD: 140,
    metodoPago: 'transferencia',
    comprobante: 'TRF-BNB-999331',
    registradoPor: 'admin',
    origen: 'manual'
  },
  {
    id: 'acc-4',
    fecha: '2026-09-10',
    tipo: 'egreso_operativo',
    concepto: 'Topografía, demarcación con estacas y apertura caminos ripiados Fase 2',
    loteReferencia: 'Proyecto General',
    clienteReferencia: 'Servicios de Maquinaria Limoncito',
    montoUSD: -1200,
    metodoPago: 'transferencia',
    comprobante: 'FAC-TOP-1102',
    registradoPor: 'admin',
    origen: 'manual'
  },
  {
    id: 'acc-5',
    fecha: '2026-09-12',
    tipo: 'comision_vendedor',
    concepto: 'Comisión 4% por cierre de venta Lote RB-04 a Asesor Autorizado',
    loteReferencia: 'Lote RB-04',
    clienteReferencia: 'Agente Carlos Siles',
    montoUSD: -480,
    metodoPago: 'transferencia',
    comprobante: 'REC-COM-092',
    registradoPor: 'admin',
    origen: 'manual'
  }
];

export const INITIAL_DOCUMENTS: AdminDocument[] = [
  {
    id: 'doc-excel-1',
    nombre: 'CADIS_Control_Ingresos_Egresos_Mini_Quintas_Rio_Bonito_v2.xlsx',
    tipo: 'reporte_excel',
    tamano: '22.3 KB',
    fechaSubida: '2026-09-15 10:00',
    subidoPor: 'admin',
    loteAsociado: 'Proyecto Río Bonito',
    clienteAsociado: 'Control de Caja General',
    archivoUrl: '/data/excel/CADIS_Control_Ingresos_Egresos_Mini_Quintas_Rio_Bonito_v2.xlsx',
    notas: 'Planilla oficial de Control de Ingresos y Egresos de Mini Quintas Río Bonito v2.'
  },
  {
    id: 'doc-excel-2',
    nombre: 'Planilla_CADIS_Ingreso_Comisiones_Socios.xlsx',
    tipo: 'reporte_excel',
    tamano: '15.0 KB',
    fechaSubida: '2026-09-15 10:00',
    subidoPor: 'admin',
    loteAsociado: 'Socios & Vendedores',
    clienteAsociado: 'Comisiones Comerciales',
    archivoUrl: '/data/excel/Planilla_CADIS_Ingreso_Comisiones_Socios.xlsx',
    notas: 'Planilla oficial de Registro de Ingresos y Comisiones de Socios/Vendedores CADIS.'
  },
  {
    id: 'doc-excel-3',
    nombre: 'Planilla_CADIS_MINI_QUINTAS_RIO_BONITO.xlsx',
    tipo: 'reporte_excel',
    tamano: '15.1 KB',
    fechaSubida: '2026-09-15 10:00',
    subidoPor: 'admin',
    loteAsociado: 'Comisiones por Venta',
    clienteAsociado: 'Carlos Arteaga (Asesor)',
    archivoUrl: '/data/excel/Planilla_CADIS_MINI_QUINTAS_RIO_BONITO.xlsx',
    notas: 'Planilla de Control de Pagos de Comisiones a Asesores y Servicios Inmobiliarios (hojas: Registro de Comisiones y Resumen Mensual).'
  },
  {
    id: 'doc-excel-4',
    nombre: 'Planilla_Gastos_Rio_Bonito_CADIS.xlsx',
    tipo: 'reporte_excel',
    tamano: '13.6 KB',
    fechaSubida: '2026-09-15 10:00',
    subidoPor: 'admin',
    loteAsociado: 'Administración y Oficina',
    clienteAsociado: 'Gastos Operativos Internos',
    archivoUrl: '/data/excel/Planilla_Gastos_Rio_Bonito_CADIS.xlsx',
    notas: 'Planilla oficial de Gastos de Oficina del Proyecto Mini Quintas Río Bonito (agosto-septiembre 2026).'
  },
  {
    id: 'doc-2',
    nombre: 'Contrato_Compraventa_Credito_Directo_Modelo_CADIS.pdf',
    tipo: 'contrato',
    tamano: '240.1 KB',
    fechaSubida: '2026-09-10 16:45',
    subidoPor: 'dev',
    loteAsociado: 'Modelo Estándar',
    clienteAsociado: 'General',
    notas: 'Minuta contractual con cláusula de reserva de propiedad hasta cancelación total.'
  },
  {
    id: 'doc-3',
    nombre: 'Plano_General_Topografico_Limoncito_RioBonito.pdf',
    tipo: 'plano',
    tamano: '1.8 MB',
    fechaSubida: '2026-09-08 09:10',
    subidoPor: 'admin',
    loteAsociado: 'Manzanos 1 y 2',
    clienteAsociado: 'Proyecto Río Bonito',
    notas: 'Plano catastral y altimétrico con accesos a la ribera del río Piraí.'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-15 09:35:10',
    usuario: 'editor',
    userRole: 'editor',
    accion: 'cambio_estado_lote',
    titulo: 'Cambio de estado en Lote RB-07',
    detalles: 'Estado del lote modificado de "disponible" a "reservado" tras acreditación de comprobante.',
    entidadAfectada: 'Lote RB-07',
    tipo: 'warning'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-15 09:12:45',
    usuario: 'editor',
    userRole: 'editor',
    accion: 'cambio_estado_lead',
    titulo: 'Actualización de lead comercial: Gonzalo Arnez Pinto',
    detalles: 'Estado del lead actualizado de "nuevo" a "contactado" vía llamada telefónica de seguimiento.',
    entidadAfectada: 'Gonzalo Arnez Pinto',
    tipo: 'info'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-14 16:40:22',
    usuario: 'editor',
    userRole: 'editor',
    accion: 'carga_documento',
    titulo: 'Documento cargado: Recibo_Reserva_Lote_RB07_Justiniano.pdf',
    detalles: 'Tipo: recibo, lote: Lote RB-07, cliente: Dra. Verónica Justiniano (84.2 KB).',
    entidadAfectada: 'Lote RB-07',
    tipo: 'info'
  },
  {
    id: 'log-4',
    timestamp: '2026-09-14 11:15:00',
    usuario: 'admin',
    userRole: 'admin',
    accion: 'decision_vendedor',
    titulo: 'Postulación de asesor: Carlos Gómez Añez',
    detalles: 'Se aprobó la postulación como Asesor Inmobiliario Externo con nivel de experiencia comercial Intermedio.',
    entidadAfectada: 'Carlos Gómez Añez',
    tipo: 'success'
  },
  {
    id: 'log-5',
    timestamp: '2026-09-13 15:20:10',
    usuario: 'editor',
    userRole: 'editor',
    accion: 'creacion_lote',
    titulo: 'Alta de nueva mini quinta Lote RB-08',
    detalles: 'Lote creado en catálogo: Mini Quinta El Descanso Verde, superficie: 600 m², precio: $9,500 USD.',
    entidadAfectada: 'Lote RB-08',
    tipo: 'success'
  },
  {
    id: 'log-6',
    timestamp: '2026-09-12 10:05:18',
    usuario: 'dev',
    userRole: 'developer',
    accion: 'asiento_contable',
    titulo: 'Sincronización contable de ventas',
    detalles: 'Conciliación inicial de balance contable y verificación de integridad relacional en Supabase.',
    entidadAfectada: 'Libro Mayor Contable',
    tipo: 'info'
  }
];

export const INITIAL_PAYMENT_PLANS: import('../types').ClientPaymentPlan[] = [
  {
    id: 'plan-rb01',
    clienteNombre: 'Gonzalo Arnez Pinto',
    ci: '4589123 SC',
    telefono: '+591 71012345',
    email: 'gonzalo.arnez@gmail.com',
    loteNumero: 'Lote RB-01',
    precioTotalUSD: 8000,
    cuotaInicialUSD: 2000,
    saldoFinanciarUSD: 6000,
    plazoAnios: 5,
    tasaInteresAnual: 10,
    cuotaMensualUSD: 127.48,
    fechaInicioContractual: '2026-05-15',
    cronogramaCuotas: Array.from({ length: 60 }, (_, i) => {
      const num = i + 1;
      const isPagado = num <= 4; // First 4 months paid
      return {
        numeroCuota: num,
        fechaVencimiento: `2026-${( (5 + i) % 12 + 1 ).toString().padStart(2, '0')}-15`,
        montoCuotaUSD: 127.48,
        interesUSD: Number((50 - num * 0.5).toFixed(2)),
        capitalUSD: Number((77.48 + num * 0.5).toFixed(2)),
        saldoRestanteUSD: Number((6000 - num * 85).toFixed(2)),
        estado: isPagado ? 'pagado' : 'pendiente',
        fechaPagoReal: isPagado ? `2026-0${Math.min(9, 5 + i)}-14` : undefined,
        comprobante: isPagado ? `TRF-BNB-901${num}` : undefined,
        metodoPago: 'transferencia',
        registradoPor: 'admin'
      };
    })
  },
  {
    id: 'plan-rb04',
    clienteNombre: 'Ing. Roberto Aguilera',
    ci: '3920194 SC',
    telefono: '+591 72198000',
    email: 'roberto.aguilera@gmail.com',
    loteNumero: 'Lote RB-04',
    precioTotalUSD: 12500,
    cuotaInicialUSD: 3600,
    saldoFinanciarUSD: 8900,
    plazoAnios: 3,
    tasaInteresAnual: 10,
    cuotaMensualUSD: 287.12,
    fechaInicioContractual: '2026-06-01',
    cronogramaCuotas: Array.from({ length: 36 }, (_, i) => {
      const num = i + 1;
      const isPagado = num <= 3;
      return {
        numeroCuota: num,
        fechaVencimiento: `2026-${( (6 + i) % 12 + 1 ).toString().padStart(2, '0')}-01`,
        montoCuotaUSD: 287.12,
        interesUSD: Number((74 - num * 1.5).toFixed(2)),
        capitalUSD: Number((213.12 + num * 1.5).toFixed(2)),
        saldoRestanteUSD: Number((8900 - num * 220).toFixed(2)),
        estado: isPagado ? 'pagado' : 'pendiente',
        fechaPagoReal: isPagado ? `2026-0${Math.min(9, 6 + i)}-01` : undefined,
        comprobante: isPagado ? `TRF-BNB-880${num}` : undefined,
        metodoPago: 'transferencia',
        registradoPor: 'admin'
      };
    })
  }
];
