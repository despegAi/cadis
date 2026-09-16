import React, { useState } from 'react';
import { Property, LotReservationRequest } from '../types';
import { CADIS_WHATSAPP_NUMBER } from '../config/contact';
import {
  MapPin,
  Layers,
  ExternalLink,
  CalendarCheck,
  ShoppingBag,
  BookmarkPlus,
  Info
} from 'lucide-react';

interface RioBonitoVisualMapProps {
  properties: Property[];
  onScrollToProperty: (propertyId: string) => void;
  onSaveReservation: (data: Omit<LotReservationRequest, 'id' | 'fecha' | 'estado'>) => void;
}

interface LotMarker {
  propId: string;
  // Position as a percentage of the plano image, calibrated by eye against
  // public/assets/artevld.jpg. Re-calibrate visually in-browser if the lots
  // ever look off relative to the real drawing.
  xPercent: number;
  yPercent: number;
}

// Only the 8 curated Property records get a marker. The real plano
// (public/assets/artevld.jpg) shows ~27 raw survey lots across two manzanas,
// but CADIS's actual sellable inventory is these 8 named mini-quintas — we
// deliberately do not fabricate polygon boundaries for lots that aren't part
// of the real catalog.
const LOT_MARKERS: LotMarker[] = [
  { propId: 'prop-1', xPercent: 19, yPercent: 27 },
  { propId: 'prop-2', xPercent: 29, yPercent: 21 },
  { propId: 'prop-3', xPercent: 22, yPercent: 40 },
  { propId: 'prop-4', xPercent: 33, yPercent: 33 },
  { propId: 'prop-5', xPercent: 35, yPercent: 63 },
  { propId: 'prop-6', xPercent: 45, yPercent: 69 },
  { propId: 'prop-7', xPercent: 28, yPercent: 74 },
  { propId: 'prop-8', xPercent: 41, yPercent: 59 }
];

type LotAction = 'reservar' | 'comprar' | 'agendar_visita';

const ACTION_LABELS: Record<LotAction, string> = {
  reservar: 'Reservar',
  comprar: 'Comprar',
  agendar_visita: 'Agendar Cita'
};

export const RioBonitoVisualMap: React.FC<RioBonitoVisualMapProps> = ({
  properties,
  onScrollToProperty,
  onSaveReservation
}) => {
  const [hoveredLotId, setHoveredLotId] = useState<string | null>(null);
  const [activeLotId, setActiveLotId] = useState<string | null>(null);

  const activeProperty = properties.find((p) => p.id === activeLotId);
  const hoveredProperty = properties.find((p) => p.id === hoveredLotId);
  const cardProperty = hoveredProperty || activeProperty;

  const handleMarkerClick = (propertyId: string) => {
    setActiveLotId((prev) => (prev === propertyId ? null : propertyId));
  };

  const handleLotAction = (property: Property, accion: LotAction) => {
    const actionText =
      accion === 'reservar'
        ? `quiero *reservar* el ${property.loteNumero}`
        : accion === 'comprar'
        ? `quiero *comprar* el ${property.loteNumero}`
        : `quiero *agendar una visita* al ${property.loteNumero}`;

    const message = `Hola CADIS, vi el plano interactivo de Río Bonito y ${actionText} (${property.titulo}, $${property.precio.toLocaleString()} USD).`;

    onSaveReservation({ loteNumero: property.loteNumero, accion, origen: 'mapa_interactivo' });

    window.open(`https://wa.me/${CADIS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setActiveLotId(null);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Decorative ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Plano Oficial de Loteamiento
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Plano y Distribución de Mini Quintas
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Este es el plano de mensura real del Proyecto Río Bonito en Limoncito.
            <strong className="text-emerald-400 font-semibold"> Haz clic en cualquier marcador</strong> para reservar, comprar o agendar una visita directo por WhatsApp.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
            <span className="text-slate-300 font-medium">Disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-xs shadow-amber-400/50" />
            <span className="text-slate-300 font-medium">Reservado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-600" />
            <span className="text-slate-400 font-medium">Vendido</span>
          </div>
        </div>
      </div>

      {/* Main Map Container: real plano image with overlaid HTML markers */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden shadow-inner">
        <div className="relative w-full">
          <img
            src="/assets/artevld.jpg"
            alt="Plano de Mensura Oficial del Proyecto Río Bonito en Limoncito"
            className="w-full h-auto block select-none"
          />

          {LOT_MARKERS.map((marker) => {
            const prop = properties.find((p) => p.id === marker.propId);
            if (!prop) return null;

            const isHovered = hoveredLotId === marker.propId;
            const isActive = activeLotId === marker.propId;
            const isAvailable = prop.estado === 'disponible';
            const isReserved = prop.estado === 'reservado';
            const pinColor = isAvailable ? 'bg-emerald-500' : isReserved ? 'bg-amber-400' : 'bg-slate-500';
            const ringColor = isAvailable ? 'ring-emerald-400' : isReserved ? 'ring-amber-300' : 'ring-slate-400';

            return (
              <div
                key={marker.propId}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${marker.xPercent}%`, top: `${marker.yPercent}%` }}
              >
                {/* Pulsing ring for available lots */}
                {isAvailable && (
                  <span className={`absolute inset-0 rounded-full ${ringColor} ring-2 opacity-70 ${isHovered || isActive ? 'animate-ping' : ''}`} />
                )}

                <button
                  type="button"
                  onClick={() => handleMarkerClick(marker.propId)}
                  onMouseEnter={() => setHoveredLotId(marker.propId)}
                  onMouseLeave={() => setHoveredLotId(null)}
                  aria-label={`Ver opciones para ${prop.loteNumero}`}
                  className={`relative flex items-center justify-center rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform ${pinColor} ${
                    isHovered || isActive ? 'w-9 h-9 scale-110' : 'w-7 h-7'
                  }`}
                >
                  <span className="text-[10px] font-black text-slate-950 font-mono select-none">
                    {prop.loteNumero.replace('Lote RB-', '')}
                  </span>
                </button>

                {/* Action Popover */}
                {isActive && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 bg-slate-900 border border-emerald-500/40 rounded-xl shadow-2xl p-3 space-y-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-xs font-black text-white text-center pb-1.5 border-b border-slate-700">
                      {prop.loteNumero} · ${prop.precio.toLocaleString()} USD
                    </p>
                    {isAvailable ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleLotAction(prop, 'reservar')}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>{ACTION_LABELS.reservar}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLotAction(prop, 'comprar')}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{ACTION_LABELS.comprar}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLotAction(prop, 'agendar_visita')}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>{ACTION_LABELS.agendar_visita}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-[11px] text-slate-400 text-center py-1">
                          Este lote está {prop.estado}.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleLotAction(prop, 'agendar_visita')}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>{ACTION_LABELS.agendar_visita}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onScrollToProperty(prop.id);
                            setActiveLotId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-400 hover:text-emerald-300 text-xs font-bold cursor-pointer transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ver Lotes Similares</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hover / Active Floating Card Details */}
        {cardProperty && (
          <div className="absolute bottom-4 right-4 max-w-xs sm:max-w-sm bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/50 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-20 hidden sm:block">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black border border-emerald-500/40">
                  {cardProperty.loteNumero}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    cardProperty.estado === 'disponible'
                      ? 'bg-emerald-500 text-slate-950'
                      : cardProperty.estado === 'reservado'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {cardProperty.estado}
                </span>
              </div>
              <span className="text-sm font-black text-emerald-400">
                ${cardProperty.precio.toLocaleString()} USD
              </span>
            </div>

            <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1">
              {cardProperty.titulo}
            </h4>

            <p className="text-xs text-slate-400 mt-0.5">
              Superficie: <strong className="text-slate-200">{cardProperty.metraje} m²</strong> ({cardProperty.dimensiones})
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Inicial (30%): <strong className="text-emerald-400">${(cardProperty.precio * 0.3).toLocaleString()} USD</strong>
              </span>
              <button
                type="button"
                onClick={() => onScrollToProperty(cardProperty.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <span>Ver Ficha</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Lot Chips for Quick Jump */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            Acceso Rápido por Lote • Haz clic para navegar directamente:
          </span>
          <span className="text-[11px] text-slate-500">
            {properties.length} lotes mapeados
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {properties.map((prop) => {
            const isAvailable = prop.estado === 'disponible';
            const isReserved = prop.estado === 'reservado';
            const isHovered = hoveredLotId === prop.id;
            const isActive = activeLotId === prop.id;

            return (
              <button
                key={prop.id}
                type="button"
                onClick={() => onScrollToProperty(prop.id)}
                onMouseEnter={() => setHoveredLotId(prop.id)}
                onMouseLeave={() => setHoveredLotId(null)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive || isHovered
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md scale-[1.03]'
                    : isAvailable
                    ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : isReserved
                    ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/40 text-amber-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black">
                    {prop.loteNumero}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAvailable ? 'bg-emerald-400' : isReserved ? 'bg-amber-400' : 'bg-slate-500'
                    }`}
                  />
                </div>
                <div className="text-[11px] font-bold mt-1 truncate">
                  ${prop.precio.toLocaleString()} USD
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {prop.metraje} m²
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
