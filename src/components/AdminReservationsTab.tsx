import React, { useState } from 'react';
import {
  Search,
  BookmarkCheck,
  MessageCircle,
  Link2
} from 'lucide-react';
import { LotReservationRequest, ChatInteractionLog, CreditSimulation, VendorApplication, UserRole } from '../types';

interface AdminReservationsTabProps {
  reservations: LotReservationRequest[];
  chatInteractions: ChatInteractionLog[];
  simulations: CreditSimulation[];
  vendors: VendorApplication[];
  userRole: UserRole;
  onUpdateReservationStatus: (id: string, newStatus: LotReservationRequest['estado']) => void;
}

const ACCION_LABELS: Record<LotReservationRequest['accion'], string> = {
  reservar: 'Reservar',
  comprar: 'Comprar',
  agendar_visita: 'Agendar Visita'
};

const INTENT_LABELS: Record<ChatInteractionLog['intent'], string> = {
  lot_inquiry: 'Consulta de Lote',
  credit_simulation: 'Crédito Directo',
  weekend_tour: 'Visita de Fin de Semana',
  vendor_agent: 'Asesor / Vendedor',
  general_inquiry: 'Consulta General'
};

export const AdminReservationsTab: React.FC<AdminReservationsTabProps> = ({
  reservations,
  chatInteractions,
  simulations,
  userRole,
  onUpdateReservationStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isReader = userRole === 'reader';

  const filteredReservations = reservations.filter((r) =>
    !searchQuery.trim() || r.loteNumero.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Lightweight cross-reference: does this lote already have a lead/simulation on file?
  const matchingSimulation = (loteNumero?: string) =>
    loteNumero ? simulations.find((s) => s.propiedadLote === loteNumero) : undefined;

  return (
    <div className="space-y-6">
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por número de lote..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-xs text-xs font-medium text-slate-800 focus:outline-none"
        />
      </div>

      {/* Reservas del Mapa Interactivo */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-black text-slate-900">Reservas desde el Mapa Interactivo</h4>
          <span className="text-[11px] text-slate-500 ml-auto">{filteredReservations.length} solicitudes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-500 border-b">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Lote</th>
                <th className="p-3">Acción</th>
                <th className="p-3">Cruce con Leads</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Sin solicitudes registradas todavía.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => {
                  const match = matchingSimulation(res.loteNumero);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/70">
                      <td className="p-3 text-slate-500">{res.fecha}</td>
                      <td className="p-3 font-extrabold text-slate-900">{res.loteNumero}</td>
                      <td className="p-3 font-semibold">{ACCION_LABELS[res.accion]}</td>
                      <td className="p-3">
                        {match ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Link2 className="w-3 h-3" />
                            Coincide con simulación de {match.clienteNombre}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Sin lead relacionado aún</span>
                        )}
                      </td>
                      <td className="p-3">
                        {isReader ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {res.estado}
                          </span>
                        ) : (
                          <select
                            value={res.estado}
                            onChange={(e) => onUpdateReservationStatus(res.id, e.target.value as LotReservationRequest['estado'])}
                            className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${
                              res.estado === 'pendiente'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : res.estado === 'contactado'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : res.estado === 'confirmada'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="contactado">Contactado</option>
                            <option value="confirmada">Confirmada</option>
                            <option value="cancelada">Cancelada</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interacciones del Chat Guiado */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-sky-600" />
          <h4 className="text-sm font-black text-slate-900">Interacciones del Chat Guiado (solo lectura)</h4>
          <span className="text-[11px] text-slate-500 ml-auto">{chatInteractions.length} sesiones</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] font-black text-slate-500 border-b">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Tema</th>
                <th className="p-3">Lote</th>
                <th className="p-3">Cuota Inicial</th>
                <th className="p-3">Crédito Propio</th>
                <th className="p-3">Resumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chatInteractions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Sin interacciones de chat registradas todavía.
                  </td>
                </tr>
              ) : (
                chatInteractions.map((chat) => (
                  <tr key={chat.id} className="hover:bg-slate-50/70">
                    <td className="p-3 text-slate-500">{chat.fecha}</td>
                    <td className="p-3 font-semibold">{INTENT_LABELS[chat.intent]}</td>
                    <td className="p-3 font-bold text-slate-900">{chat.loteNumero || '—'}</td>
                    <td className="p-3">
                      {chat.presupuestoConfirmado === 'si'
                        ? 'Lista al contado'
                        : chat.presupuestoConfirmado === 'diferido_3m'
                        ? 'Prefiere 3 meses'
                        : chat.presupuestoConfirmado === 'no_seguro'
                        ? 'No está seguro/a'
                        : '—'}
                    </td>
                    <td className="p-3">
                      {chat.tieneCreditoPropio === 'si' ? 'Sí' : chat.tieneCreditoPropio === 'no' ? 'No (busca CADIS)' : '—'}
                    </td>
                    <td className="p-3 max-w-xs">
                      <p className="text-slate-600 line-clamp-2">{chat.resumenMensaje}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
