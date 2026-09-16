import React, { useState } from 'react';
import { Property } from '../types';
import { 
  MapPin, 
  Layers, 
  ExternalLink, 
  Maximize2, 
  Trees, 
  Waves, 
  Compass, 
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface RioBonitoVisualMapProps {
  properties: Property[];
  onScrollToProperty: (propertyId: string) => void;
}

interface LotCoordinates {
  id: string;
  loteNumero: string;
  // Lot polygon center marker
  markerX: number;
  markerY: number;
  // Lot polygon points (x1,y1 x2,y2 ...)
  points: string;
  label: string;
  zone: string;
}

// Fixed coordinates layout for the masterplan grid (viewBox 0 0 960 560)
const LOT_COORDINATES: Record<string, LotCoordinates> = {
  'prop-1': {
    id: 'prop-1',
    loteNumero: 'Lote RB-01',
    markerX: 250,
    markerY: 200,
    points: '160,150 340,150 340,250 160,250',
    label: 'RB-01',
    zone: 'Sector El Manantial'
  },
  'prop-4': {
    id: 'prop-4',
    loteNumero: 'Lote RB-04',
    markerX: 480,
    markerY: 200,
    points: '370,150 590,150 590,250 370,250',
    label: 'RB-04',
    zone: 'Primera Línea de Río'
  },
  'prop-2': {
    id: 'prop-2',
    loteNumero: 'Lote RB-02',
    markerX: 720,
    markerY: 200,
    points: '620,150 820,150 820,250 620,250',
    label: 'RB-02',
    zone: 'Sector Los Samanes'
  },
  'prop-3': {
    id: 'prop-3',
    loteNumero: 'Lote RB-03',
    markerX: 250,
    markerY: 330,
    points: '160,270 340,270 340,390 160,390',
    label: 'RB-03',
    zone: 'Colinas Panorámicas'
  },
  'prop-7': {
    id: 'prop-7',
    loteNumero: 'Lote RB-07',
    markerX: 720,
    markerY: 330,
    points: '620,270 820,270 820,390 620,390',
    label: 'RB-07',
    zone: 'Meseta Alta'
  },
  'prop-5': {
    id: 'prop-5',
    loteNumero: 'Lote RB-05',
    markerX: 230,
    markerY: 460,
    points: '130,410 330,410 330,510 130,510',
    label: 'RB-05',
    zone: 'Av. Comercial Principal'
  },
  'prop-8': {
    id: 'prop-8',
    loteNumero: 'Lote RB-08',
    markerX: 480,
    markerY: 460,
    points: '370,410 590,410 590,510 370,510',
    label: 'RB-08',
    zone: 'Orilla del Bosque'
  },
  'prop-6': {
    id: 'prop-6',
    loteNumero: 'Lote RB-06',
    markerX: 740,
    markerY: 460,
    points: '630,410 850,410 850,510 630,510',
    label: 'RB-06',
    zone: 'Sector Los Cedros'
  }
};

export const RioBonitoVisualMap: React.FC<RioBonitoVisualMapProps> = ({
  properties,
  onScrollToProperty
}) => {
  const [hoveredLotId, setHoveredLotId] = useState<string | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

  const hoveredProperty = properties.find((p) => p.id === hoveredLotId);
  const selectedProperty = properties.find((p) => p.id === selectedLotId);
  const activeProperty = hoveredProperty || selectedProperty;

  const handleMarkerClick = (propertyId: string) => {
    setSelectedLotId(propertyId);
    onScrollToProperty(propertyId);
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
              Masterplan Visual Interactivo
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Plano y Distribución de Mini Quintas
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Explora la ubicación topográfica de cada lote en Limoncito con respecto al río, avenidas y reservas naturales. 
            <strong className="text-emerald-400 font-semibold"> Haz clic en cualquier marcador</strong> para ir directamente a su ficha detallada en la galería.
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

      {/* Main Map Container */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden shadow-inner">
        
        {/* SVG Canvas */}
        <svg
          viewBox="0 0 960 560"
          className="w-full h-auto select-none block"
          style={{ maxHeight: '600px' }}
        >
          <defs>
            {/* River Gradient */}
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.85" />
            </linearGradient>

            {/* Beach Sand Gradient */}
            <linearGradient id="beachGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.2" />
            </linearGradient>

            {/* Grass Pattern */}
            <pattern id="landPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="#091410" />
              <circle cx="20" cy="20" r="1" fill="#10b981" fillOpacity="0.15" />
            </pattern>

            {/* Filter for Drop Shadows on Markers */}
            <filter id="markerShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background Land */}
          <rect width="960" height="560" fill="url(#landPattern)" />

          {/* Topographic Contour Lines (Subtle) */}
          <g opacity="0.08" stroke="#10b981" strokeWidth="1" fill="none">
            <path d="M-50,200 Q200,160 450,230 T950,200" />
            <path d="M-50,330 Q250,290 500,360 T1000,310" />
            <path d="M-50,470 Q300,420 600,480 T1000,450" />
          </g>

          {/* ========================================================
              RIVER ZONE (TOP)
             ======================================================== */}
          {/* Beach strip along the river */}
          <path
            d="M 0,0 L 960,0 L 960,110 Q 720,125 480,95 T 0,115 Z"
            fill="url(#beachGradient)"
          />
          {/* River Water Body */}
          <path
            d="M 0,0 L 960,0 L 960,85 Q 720,105 480,75 T 0,90 Z"
            fill="url(#riverGradient)"
          />

          {/* River Waves / Currents */}
          <path
            d="M 60,35 Q 120,45 180,35 T 300,35"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M 380,45 Q 440,55 500,45 T 620,45"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M 700,30 Q 760,40 820,30 T 940,30"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* River Label */}
          <text
            x="480"
            y="48"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="14"
            fontWeight="900"
            letterSpacing="3"
            opacity="0.95"
            className="font-sans"
          >
            🌊 RÍO BONITO • AGUAS CRISTALINAS Y PLAYA NATURAL
          </text>
          <text
            x="480"
            y="98"
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="9"
            fontWeight="700"
            letterSpacing="2"
            opacity="0.8"
          >
            ZONA DE ESPARCIMIENTO PRIVADO PARA PROPIETARIOS
          </text>

          {/* ========================================================
              ROADS & AVENUES INFRASTRUCTURE
             ======================================================== */}
          {/* Road along river (Av. Costanera) */}
          <rect x="0" y="118" width="960" height="22" fill="#1e293b" />
          <line x1="0" y1="129" x2="960" y2="129" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="8 8" opacity="0.4" />
          <text x="480" y="133" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="700" letterSpacing="1.5">
            AV. COSTANERA RIBEREÑA (12M RIPIADA)
          </text>

          {/* Middle horizontal street */}
          <rect x="130" y="252" width="720" height="16" fill="#1e293b" />
          <line x1="130" y1="260" x2="850" y2="260" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 6" opacity="0.3" />

          {/* Bottom horizontal street */}
          <rect x="130" y="392" width="720" height="16" fill="#1e293b" />
          <line x1="130" y1="400" x2="850" y2="400" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 6" opacity="0.3" />

          {/* Main vertical connector street */}
          <rect x="342" y="140" width="26" height="380" fill="#1e293b" />
          <line x1="355" y1="140" x2="355" y2="520" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 6" opacity="0.3" />

          {/* Second vertical connector street */}
          <rect x="592" y="140" width="26" height="380" fill="#1e293b" />
          <line x1="605" y1="140" x2="605" y2="520" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 6" opacity="0.3" />

          {/* Main Highway at the very bottom */}
          <rect x="0" y="520" width="960" height="40" fill="#0f172a" />
          <line x1="0" y1="540" x2="960" y2="540" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="12 12" opacity="0.6" />
          <text x="480" y="544" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="900" letterSpacing="2">
            CARRETERA PRINCIPAL SANTA CRUZ - LIMONCITO • ACCESO CONTROLADO CADIS
          </text>

          {/* ========================================================
              CENTRAL GREEN PARK / NATURE PRESERVE
             ======================================================== */}
          <rect
            x="370"
            y="270"
            width="220"
            height="120"
            rx="12"
            fill="#064e3b"
            fillOpacity="0.4"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text x="480" y="318" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="800">
            PARQUE ECOLÓGICO CENTRAL
          </text>
          <text x="480" y="336" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="600" opacity="0.8">
            Área de Preservación & Vertiente Natural
          </text>
          <circle cx="430" cy="355" r="4" fill="#10b981" opacity="0.6" />
          <circle cx="480" cy="355" r="5" fill="#10b981" opacity="0.8" />
          <circle cx="530" cy="355" r="4" fill="#10b981" opacity="0.6" />

          {/* Entrance gate arch at bottom */}
          <rect x="330" y="508" width="50" height="14" rx="3" fill="#10b981" />
          <text x="355" y="518" textAnchor="middle" fill="#022c22" fontSize="7" fontWeight="900">
            PORTÓN CADIS
          </text>

          {/* ========================================================
              LOT POLYGONS & BOUNDARIES
             ======================================================== */}
          {Object.entries(LOT_COORDINATES).map(([propId, coords]) => {
            const prop = properties.find((p) => p.id === propId);
            const isHovered = hoveredLotId === propId;
            const isSelected = selectedLotId === propId;
            const status = prop?.estado || 'disponible';

            let fillColor = '#065f46';
            let strokeColor = '#10b981';
            let opacity = '0.35';

            if (status === 'disponible') {
              fillColor = isHovered || isSelected ? '#059669' : '#047857';
              strokeColor = isHovered || isSelected ? '#34d399' : '#10b981';
              opacity = isHovered || isSelected ? '0.7' : '0.4';
            } else if (status === 'reservado') {
              fillColor = isHovered || isSelected ? '#d97706' : '#b45309';
              strokeColor = '#fbbf24';
              opacity = isHovered || isSelected ? '0.6' : '0.35';
            } else {
              fillColor = '#334155';
              strokeColor = '#64748b';
              opacity = isHovered || isSelected ? '0.5' : '0.25';
            }

            return (
              <g key={propId} className="transition-all duration-300">
                {/* Lot Surface Polygon */}
                <polygon
                  points={coords.points}
                  fill={fillColor}
                  fillOpacity={opacity}
                  stroke={strokeColor}
                  strokeWidth={isHovered || isSelected ? 2.5 : 1.5}
                  strokeDasharray={status === 'disponible' ? 'none' : '3 3'}
                  className="cursor-pointer transition-all duration-300 hover:fill-opacity-80"
                  onClick={() => handleMarkerClick(propId)}
                  onMouseEnter={() => setHoveredLotId(propId)}
                  onMouseLeave={() => setHoveredLotId(null)}
                />

                {/* Subdued Lot Code inside polygon */}
                <text
                  x={coords.markerX}
                  y={coords.markerY - 22}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="800"
                  className="pointer-events-none select-none"
                  opacity={isHovered || isSelected ? 0.9 : 0.5}
                >
                  {coords.loteNumero}
                </text>
              </g>
            );
          })}

          {/* ========================================================
              SVG MARKERS (PINS WITH LOT NUMBER, PRICE & STATUS)
             ======================================================== */}
          {Object.entries(LOT_COORDINATES).map(([propId, coords]) => {
            const prop = properties.find((p) => p.id === propId);
            const isHovered = hoveredLotId === propId;
            const isSelected = selectedLotId === propId;
            const status = prop?.estado || 'disponible';
            const isAvailable = status === 'disponible';
            const isReserved = status === 'reservado';

            // Pin styling
            const pinColor = isAvailable ? '#10b981' : isReserved ? '#f59e0b' : '#64748b';
            const ringColor = isAvailable ? '#34d399' : isReserved ? '#fbbf24' : '#94a3b8';

            return (
              <g
                key={`marker-${propId}`}
                transform={`translate(${coords.markerX}, ${coords.markerY})`}
                className="cursor-pointer group"
                onClick={() => handleMarkerClick(propId)}
                onMouseEnter={() => setHoveredLotId(propId)}
                onMouseLeave={() => setHoveredLotId(null)}
                filter="url(#markerShadow)"
              >
                {/* Pulsing Radar Ring on Available Lots */}
                {isAvailable && (
                  <circle
                    cx="0"
                    cy="0"
                    r={isHovered ? 26 : 20}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="2"
                    opacity={isHovered ? '0.9' : '0.4'}
                    className={isHovered ? 'animate-ping' : ''}
                  />
                )}

                {/* Pin Base Circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isHovered || isSelected ? 18 : 15}
                  fill={pinColor}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />

                {/* Pin Icon / Number */}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#022c22"
                  fontSize={isHovered || isSelected ? '9' : '8'}
                  fontWeight="900"
                  className="select-none font-mono"
                >
                  {coords.label.replace('RB-', '')}
                </text>

                {/* Price Pill Tag under Pin */}
                {prop && (
                  <g transform="translate(0, 22)">
                    <rect
                      x="-38"
                      y="0"
                      width="76"
                      height="16"
                      rx="8"
                      fill={isHovered || isSelected ? '#0f172a' : '#1e293b'}
                      stroke={pinColor}
                      strokeWidth={isHovered || isSelected ? 1.5 : 1}
                    />
                    <text
                      x="0"
                      y="11"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="800"
                      className="select-none"
                    >
                      ${(prop.precio / 1000).toFixed(0)}k USD
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Compass Rose (Top Right) */}
          <g transform="translate(900, 160)" opacity="0.8">
            <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <polygon points="0,-18 5,-2 0,0 -5,-2" fill="#ef4444" />
            <polygon points="0,18 5,2 0,0 -5,2" fill="#94a3b8" />
            <polygon points="18,0 2,5 0,0 2,-5" fill="#94a3b8" />
            <polygon points="-18,0 -2,5 0,0 -2,-5" fill="#94a3b8" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
            <text x="0" y="-22" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="900">N</text>
          </g>

          {/* Scale Bar (Bottom Left) */}
          <g transform="translate(40, 500)" opacity="0.8">
            <rect x="0" y="0" width="100" height="4" fill="#e2e8f0" />
            <line x1="0" y1="-2" x2="0" y2="6" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="50" y1="-2" x2="50" y2="6" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="100" y1="-2" x2="100" y2="6" stroke="#e2e8f0" strokeWidth="1" />
            <text x="0" y="-5" fill="#cbd5e1" fontSize="8" fontWeight="700">0</text>
            <text x="50" y="-5" fill="#cbd5e1" fontSize="8" fontWeight="700">50m</text>
            <text x="100" y="-5" fill="#cbd5e1" fontSize="8" fontWeight="700">100m</text>
          </g>
        </svg>

        {/* Hover / Active Floating Card Details */}
        {activeProperty && (
          <div className="absolute bottom-4 right-4 max-w-xs sm:max-w-sm bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/50 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black border border-emerald-500/40">
                  {activeProperty.loteNumero}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    activeProperty.estado === 'disponible'
                      ? 'bg-emerald-500 text-slate-950'
                      : activeProperty.estado === 'reservado'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {activeProperty.estado}
                </span>
              </div>
              <span className="text-sm font-black text-emerald-400">
                ${activeProperty.precio.toLocaleString()} USD
              </span>
            </div>

            <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1">
              {activeProperty.titulo}
            </h4>

            <p className="text-xs text-slate-400 mt-0.5">
              Superficie: <strong className="text-slate-200">{activeProperty.metraje} m²</strong> ({activeProperty.dimensiones})
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Inicial (30%): <strong className="text-emerald-400">${(activeProperty.precio * 0.3).toLocaleString()} USD</strong>
              </span>
              <button
                type="button"
                onClick={() => handleMarkerClick(activeProperty.id)}
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
            const isSelected = selectedLotId === prop.id;

            return (
              <button
                key={prop.id}
                type="button"
                onClick={() => handleMarkerClick(prop.id)}
                onMouseEnter={() => setHoveredLotId(prop.id)}
                onMouseLeave={() => setHoveredLotId(null)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected || isHovered
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
                  ${(prop.precio / 1000).toFixed(0)}k USD
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
