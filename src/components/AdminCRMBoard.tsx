import React from 'react';
import { PhoneCall, Wallet, MapPin } from 'lucide-react';
import { CreditSimulation } from '../types';
import { INITIAL_SIMULATIONS, INITIAL_PAYMENT_PLANS } from '../data/initialData';

/**
 * Mini-CRM pipeline derived from:
 *  - INITIAL_SIMULATIONS / INITIAL_PAYMENT_PLANS (clientes con nombre, WhatsApp,
 *    lote y cronograma de pagos ya presentes en la app).
 *  - Los libros contables en /src/data/excel (CADIS_Control_Ingresos_Egresos...,
 *    Planilla_CADIS_MINI_QUINTAS_RIO_BONITO.xlsx). Esas planillas registran
 *    ventas y reservas por nombre y monto en Bs., pero no incluyen teléfono ni
 *    número de lote formal, por lo que esos campos quedan marcados como
 *    pendientes de completar en los leads de origen "registro_contable_excel".
 */

export type CRMStage = 'nuevo' | 'contactado' | 'cita_agendada' | 'reservado' | 'vendido';

export interface CRMLead {
  id: string;
  nombre: string;
  telefono?: string;
  loteAsignado: string;
  precioTotalUSD: number;
  montoPagadoUSD: number;
  saldoPendienteUSD: number;
  estado: CRMStage;
  origen: 'simulador_credito' | 'plan_de_pagos' | 'registro_contable_excel';
  notas?: string;
}

// Tipo de cambio oficial fijo Bolivia (Bs. -> USD), usado para los registros
// tomados de los libros contables que solo consignan montos en Bs.
const BOB_TO_USD_RATE = 6.96;
const bsToUsd = (bs: number): number => Number((bs / BOB_TO_USD_RATE).toFixed(2));

function stageFromSimulation(estado: CreditSimulation['estado']): CRMStage {
  switch (estado) {
    case 'cerrado':
      return 'vendido';
    case 'en_negociacion':
    case 'contactado':
      return 'contactado';
    default:
      return 'nuevo';
  }
}

const paymentPlanByLote = new Map(INITIAL_PAYMENT_PLANS.map((p) => [p.loteNumero, p]));

function montoPagadoDePlan(plan: (typeof INITIAL_PAYMENT_PLANS)[number]): number {
  const cuotasPagadas = plan.cronogramaCuotas
    .filter((c) => c.estado === 'pagado')
    .reduce((acc, c) => acc + c.montoCuotaUSD, 0);
  return Number((plan.cuotaInicialUSD + cuotasPagadas).toFixed(2));
}

// Leads con simulador de crédito (y su plan de pagos, si ya tiene uno asignado)
const LEADS_FROM_SIMULATIONS: CRMLead[] = INITIAL_SIMULATIONS.map((sim) => {
  const plan = sim.propiedadLote ? paymentPlanByLote.get(sim.propiedadLote) : undefined;
  const estado = stageFromSimulation(sim.estado);

  let montoPagadoUSD = 0;
  let precioTotalUSD = sim.montoTerreno;

  if (plan) {
    montoPagadoUSD = montoPagadoDePlan(plan);
    precioTotalUSD = plan.precioTotalUSD;
  } else if (estado === 'vendido') {
    montoPagadoUSD = sim.cuotaInicialMonto;
  }

  return {
    id: `crm-sim-${sim.id}`,
    nombre: sim.clienteNombre,
    telefono: sim.telefono,
    loteAsignado: sim.propiedadLote || 'Sin lote asignado',
    precioTotalUSD,
    montoPagadoUSD,
    saldoPendienteUSD: Number((precioTotalUSD - montoPagadoUSD).toFixed(2)),
    estado,
    origen: plan ? 'plan_de_pagos' : 'simulador_credito',
    notas: sim.notas
  };
});

// Clientes con plan de pagos formal que no tienen una simulación asociada
const LEADS_FROM_PLANS_ONLY: CRMLead[] = INITIAL_PAYMENT_PLANS
  .filter((plan) => !INITIAL_SIMULATIONS.some((sim) => sim.propiedadLote === plan.loteNumero))
  .map((plan) => {
    const montoPagadoUSD = montoPagadoDePlan(plan);
    return {
      id: `crm-plan-${plan.id}`,
      nombre: plan.clienteNombre,
      telefono: plan.telefono,
      loteAsignado: plan.loteNumero,
      precioTotalUSD: plan.precioTotalUSD,
      montoPagadoUSD,
      saldoPendienteUSD: Number((plan.precioTotalUSD - montoPagadoUSD).toFixed(2)),
      estado: 'vendido',
      origen: 'plan_de_pagos',
      notas: `Adjudicación contractual vigente desde ${plan.fechaInicioContractual}.`
    };
  });

// Leads extraídos de los libros contables en Excel (ventas y reservas por nombre,
// sin teléfono ni lote formal registrado en la planilla)
const LEADS_FROM_EXCEL_LEDGER: CRMLead[] = [
  {
    id: 'crm-excel-papa-arteaga',
    nombre: 'Padre de Carlos Arteaga',
    telefono: undefined,
    loteAsignado: 'Por asignar (venta registrada en libro contable)',
    precioTotalUSD: 45977,
    montoPagadoUSD: 13793.1,
    saldoPendienteUSD: 32183.9,
    estado: 'vendido',
    origen: 'registro_contable_excel',
    notas: 'Venta de mini quintas por Bs. 96.000 (03/09/2026), registrada en CADIS_Control_Ingresos_Egresos_Mini_Quintas_Rio_Bonito_v2.xlsx. Teléfono pendiente de registrar.'
  },
  {
    id: 'crm-excel-carlos-arteaga-mz2',
    nombre: 'Carlos Arteaga',
    telefono: undefined,
    loteAsignado: '3 Mini Quintas - Manzano 2 (MZ2, por asignar)',
    precioTotalUSD: 23946.37,
    montoPagadoUSD: 7183.91,
    saldoPendienteUSD: 16762.46,
    estado: 'vendido',
    origen: 'registro_contable_excel',
    notas: 'Venta de 3 mini quintas MZ2 por Bs. 50.000 (07/09/2026), registrada en CADIS_Control_Ingresos_Egresos_Mini_Quintas_Rio_Bonito_v2.xlsx. Teléfono pendiente de registrar.'
  },
  {
    id: 'crm-excel-hnos-carlos',
    nombre: 'Familia Carlos (Hnos.)',
    telefono: undefined,
    loteAsignado: '3 Mini Quintas (por asignar)',
    precioTotalUSD: 24000,
    montoPagadoUSD: 718.39,
    saldoPendienteUSD: 23281.61,
    estado: 'reservado',
    origen: 'registro_contable_excel',
    notas: 'Reserva de 3 mini quintas por Bs. 5.000 (03/09/2026), registrada en libro contable. Teléfono pendiente de registrar.'
  },
  {
    id: 'crm-excel-cliente-roly',
    nombre: 'Cliente Roly',
    telefono: undefined,
    loteAsignado: 'Por asignar (reserva registrada en libro contable)',
    precioTotalUSD: 8000,
    montoPagadoUSD: 172.41,
    saldoPendienteUSD: 7827.59,
    estado: 'reservado',
    origen: 'registro_contable_excel',
    notas: 'Reserva por Bs. 1.200 (04/09/2026), registrada en libro contable. Teléfono pendiente de registrar.'
  }
];

const STAGE_ORDER: CRMStage[] = ['nuevo', 'contactado', 'cita_agendada', 'reservado', 'vendido'];

const STAGE_CONFIG: Record<CRMStage, { label: string; header: string; badge: string }> = {
  nuevo: {
    label: 'Nuevo',
    header: 'text-blue-900 bg-blue-50/70',
    badge: 'bg-blue-100 text-blue-800'
  },
  contactado: {
    label: 'Contactado',
    header: 'text-amber-900 bg-amber-50/70',
    badge: 'bg-amber-100 text-amber-800'
  },
  cita_agendada: {
    label: 'Cita Agendada',
    header: 'text-purple-900 bg-purple-50/70',
    badge: 'bg-purple-100 text-purple-800'
  },
  reservado: {
    label: 'Reservado',
    header: 'text-orange-900 bg-orange-50/70',
    badge: 'bg-orange-100 text-orange-800'
  },
  vendido: {
    label: 'Vendido',
    header: 'text-emerald-900 bg-emerald-50/70',
    badge: 'bg-emerald-100 text-emerald-800'
  }
};

function loteSortKey(lote: string): number {
  const match = lote.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

export const CRM_LEADS: CRMLead[] = [
  ...LEADS_FROM_SIMULATIONS,
  ...LEADS_FROM_PLANS_ONLY,
  ...LEADS_FROM_EXCEL_LEDGER
].sort((a, b) => {
  const stageDiff = STAGE_ORDER.indexOf(a.estado) - STAGE_ORDER.indexOf(b.estado);
  if (stageDiff !== 0) return stageDiff;
  return loteSortKey(a.loteAsignado) - loteSortKey(b.loteAsignado);
});

function buildWhatsappLink(lead: CRMLead): string | null {
  if (!lead.telefono) return null;
  const digits = lead.telefono.replace(/[^0-9]/g, '');
  if (!digits) return null;
  const mensaje = `Hola ${lead.nombre}, te saludo de CADIS Servicios Inmobiliarios sobre tu ${lead.loteAsignado} en el Proyecto Río Bonito. ¿Cómo va todo?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(mensaje)}`;
}

const LeadCard: React.FC<{ lead: CRMLead }> = ({ lead }) => {
  const whatsappLink = buildWhatsappLink(lead);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 space-y-2">
      <div>
        <p className="font-bold text-slate-900 text-xs leading-tight">{lead.nombre}</p>
        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{lead.loteAsignado}</span>
        </p>
      </div>

      <div className="flex items-center justify-between text-[10px] bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
        <div className="flex items-center gap-1 text-emerald-700 font-bold">
          <Wallet className="w-3 h-3" />
          <span>${lead.montoPagadoUSD.toLocaleString()} pagado</span>
        </div>
        <div className="text-slate-500 font-semibold">
          ${lead.saldoPendienteUSD.toLocaleString()} saldo
        </div>
      </div>
      <p className="text-[9px] text-slate-400 font-medium">
        Precio total: ${lead.precioTotalUSD.toLocaleString()} USD
      </p>

      {whatsappLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="Teléfono pendiente de registrar"
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 font-bold text-[11px] cursor-not-allowed"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Sin teléfono</span>
        </button>
      )}
    </div>
  );
};

export const AdminCRMBoard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {STAGE_ORDER.map((stage) => {
        const config = STAGE_CONFIG[stage];
        const leads = CRM_LEADS.filter((lead) => lead.estado === stage);

        return (
          <div key={stage} className="space-y-2.5">
            <div className={`py-2 px-3 rounded-lg flex items-center justify-between ${config.header}`}>
              <span className="text-xs font-black uppercase tracking-wider">{config.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${config.badge}`}>
                {leads.length}
              </span>
            </div>

            <div className="space-y-2.5 min-h-[80px]">
              {leads.length === 0 ? (
                <div className="text-[10px] text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">
                  Sin registros en esta etapa
                </div>
              ) : (
                leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminCRMBoard;
