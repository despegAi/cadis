import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  DollarSign, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Property, CreditSimulation } from '../types';

interface AdminChartsProps {
  simulations: CreditSimulation[];
  properties: Property[];
}

const STATUS_COLORS: Record<string, string> = {
  disponible: '#10B981', // Emerald 500
  reservado: '#F59E0B',  // Amber 500
  vendido: '#64748B'    // Slate 500
};

const STATUS_LABELS: Record<string, string> = {
  disponible: 'Disponibles',
  reservado: 'Reservados',
  vendido: 'Vendidos'
};

export const AdminCharts: React.FC<AdminChartsProps> = ({ simulations, properties }) => {
  const [metricView, setMetricView] = useState<'count' | 'amount'>('count');

  // 1. Agrupación mensual de simulaciones en tiempo real
  const monthlyData = useMemo(() => {
    const monthsMap: Record<string, { monthKey: string; monthLabel: string; count: number; totalAmount: number; avgAmount: number; sortKey: string }> = {};

    simulations.forEach((sim) => {
      // Formato esperado de fecha: 'YYYY-MM-DD ...' o 'YYYY-MM'
      const dateStr = sim.fecha || '2026-09-01';
      const parts = dateStr.split(' ')[0].split('-');
      const year = parts[0] || '2026';
      const monthNum = parts[1] || '09';
      const sortKey = `${year}-${monthNum}`;

      const monthNames: Record<string, string> = {
        '01': 'Ene',
        '02': 'Feb',
        '03': 'Mar',
        '04': 'Abr',
        '05': 'May',
        '06': 'Jun',
        '07': 'Jul',
        '08': 'Ago',
        '09': 'Sep',
        '10': 'Oct',
        '11': 'Nov',
        '12': 'Dic'
      };

      const monthLabel = `${monthNames[monthNum] || monthNum} ${year.slice(2)}`;

      if (!monthsMap[sortKey]) {
        monthsMap[sortKey] = {
          monthKey: sortKey,
          monthLabel,
          count: 0,
          totalAmount: 0,
          avgAmount: 0,
          sortKey
        };
      }

      monthsMap[sortKey].count += 1;
      monthsMap[sortKey].totalAmount += sim.montoTerreno || 8000;
    });

    const result = Object.values(monthsMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    return result.map(m => ({
      ...m,
      avgAmount: m.count > 0 ? Math.round(m.totalAmount / m.count) : 0
    }));
  }, [simulations]);

  // 2. Estado de propiedades en tiempo real
  const propertyStatusData = useMemo(() => {
    const counts = {
      disponible: 0,
      reservado: 0,
      vendido: 0
    };

    const values = {
      disponible: 0,
      reservado: 0,
      vendido: 0
    };

    const areas = {
      disponible: 0,
      reservado: 0,
      vendido: 0
    };

    properties.forEach((p) => {
      const st = p.estado || (p.disponible ? 'disponible' : 'vendido');
      if (st in counts) {
        counts[st as keyof typeof counts] += 1;
        values[st as keyof typeof values] += p.precio;
        areas[st as keyof typeof areas] += p.metraje;
      }
    });

    const total = properties.length || 1;

    return [
      {
        id: 'disponible',
        name: STATUS_LABELS.disponible,
        value: counts.disponible,
        totalUSD: values.disponible,
        totalM2: areas.disponible,
        percentage: Math.round((counts.disponible / total) * 100),
        color: STATUS_COLORS.disponible
      },
      {
        id: 'reservado',
        name: STATUS_LABELS.reservado,
        value: counts.reservado,
        totalUSD: values.reservado,
        totalM2: areas.reservado,
        percentage: Math.round((counts.reservado / total) * 100),
        color: STATUS_COLORS.reservado
      },
      {
        id: 'vendido',
        name: STATUS_LABELS.vendido,
        value: counts.vendido,
        totalUSD: values.vendido,
        totalM2: areas.vendido,
        percentage: Math.round((counts.vendido / total) * 100),
        color: STATUS_COLORS.vendido
      }
    ];
  }, [properties]);

  // 3. Preferencia de plazos de financiamiento (3, 5 y 10 años)
  const financingTermData = useMemo(() => {
    const terms = { '3': 0, '5': 0, '10': 0 };
    simulations.forEach((s) => {
      const term = s.plazoAnios?.toString() || '5';
      if (term in terms) {
        terms[term as keyof typeof terms] += 1;
      }
    });

    return [
      { plazo: '3 años (36m)', count: terms['3'], label: '3 Años' },
      { plazo: '5 años (60m)', count: terms['5'], label: '5 Años' },
      { plazo: '10 años (120m)', count: terms['10'], label: '10 Años' }
    ];
  }, [simulations]);

  // Métricas calculadas
  const totalValue = properties.reduce((acc, curr) => acc + curr.precio, 0);
  const placedPercent = Math.round(
    (((properties.length - (propertyStatusData[0]?.value || 0)) / (properties.length || 1)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Executive Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Simulaciones Totales</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{simulations.length}</span>
              <span className="text-xs font-semibold text-emerald-600">+100% en tiempo real</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Colocación del Proyecto</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{placedPercent}%</span>
              <span className="text-xs font-semibold text-sky-600">Reservado o Vendido</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Valor Portafolio Total</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">${(totalValue / 1000).toFixed(1)}k</span>
              <span className="text-xs font-semibold text-slate-500">USD Río Bonito</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Flujo Mensual & Estado de Propiedades */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRÁFICA 1: Flujo de Nuevas Simulaciones por Mes (AreaChart) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500 text-white shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Flujo de Nuevas Simulaciones por Mes
                  </h4>
                  <p className="text-xs text-slate-500">
                    Evolución histórica y demanda activa de financiamiento para lotes
                  </p>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center p-1 bg-slate-100 rounded-lg shrink-0">
                <button
                  onClick={() => setMetricView('count')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    metricView === 'count'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  N° Leads
                </button>
                <button
                  onClick={() => setMetricView('amount')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    metricView === 'amount'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monto ($ USD)
                </button>
              </div>
            </div>

            {/* Recharts Area Component */}
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="monthLabel" 
                    tickLine={false} 
                    axisLine={{ stroke: '#CBD5E1' }}
                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                    allowDecimals={false}
                    tickFormatter={(val) => metricView === 'amount' ? `$${(val / 1000).toFixed(0)}k` : val}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                            <p className="font-extrabold text-emerald-400 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
                              <span>{label}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Mes registrado</span>
                            </p>
                            <p className="flex justify-between gap-4 pt-0.5">
                              <span className="text-slate-300">Simulaciones:</span>
                              <span className="font-black text-white">{data.count} leads</span>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span className="text-slate-300">Monto total simulado:</span>
                              <span className="font-black text-emerald-400">${data.totalAmount.toLocaleString()} USD</span>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span className="text-slate-300">Ticket promedio:</span>
                              <span className="font-bold text-sky-300">${data.avgAmount.toLocaleString()} USD</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={metricView === 'count' ? 'count' : 'totalAmount'}
                    name={metricView === 'count' ? 'Nuevas Simulaciones' : 'Monto Simulado ($ USD)'}
                    stroke={metricView === 'count' ? '#059669' : '#0284C7'}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={metricView === 'count' ? 'url(#colorCount)' : 'url(#colorAmount)'}
                    activeDot={{ r: 6, fill: metricView === 'count' ? '#10B981' : '#0EA5E9', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Sub-metrics footer */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Meses Activos</span>
              <p className="text-sm font-black text-slate-900">{monthlyData.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Pico Mensual</span>
              <p className="text-sm font-black text-emerald-600">
                {Math.max(...monthlyData.map(m => m.count), 0)} leads
              </p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Ticket Promedio</span>
              <p className="text-sm font-black text-sky-700">
                ${simulations.length > 0 
                  ? Math.round(simulations.reduce((a, b) => a + b.montoTerreno, 0) / simulations.length).toLocaleString() 
                  : '8,000'}
              </p>
            </div>
          </div>
        </div>

        {/* GRÁFICA 2: Estado de las Propiedades en Tiempo Real (PieChart / Donut) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-500 text-white shadow-xs">
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Estado de las Propiedades
                  </h4>
                  <p className="text-xs text-slate-500">
                    Inventario en tiempo real ({properties.length} lotes totales)
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                En Vivo
              </span>
            </div>

            {/* Recharts Pie Donut */}
            <div className="h-56 w-full relative flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {propertyStatusData.map((entry) => (
                      <Cell 
                        key={`cell-${entry.id}`} 
                        fill={entry.color} 
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border border-slate-800 text-xs">
                            <p className="font-extrabold" style={{ color: data.color }}>
                              {data.name}
                            </p>
                            <p className="font-black text-white text-sm mt-0.5">
                              {data.value} lote(s) ({data.percentage}%)
                            </p>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              Valor: ${(data.totalUSD).toLocaleString()} USD
                            </p>
                            <p className="text-[11px] text-slate-300">
                              Área: {(data.totalM2).toLocaleString()} m²
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Indicator */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">{properties.length}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lotes RB</span>
              </div>
            </div>
          </div>

          {/* Interactive Status List & Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {propertyStatusData.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">{item.name}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-medium">
                      ({item.totalM2.toLocaleString()} m²)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-slate-900">{item.value}</span>
                  <span className="text-[11px] text-slate-500 font-bold ml-1.5">
                    ({item.percentage}%)
                  </span>
                  <p className="text-[10px] font-semibold text-emerald-700">
                    ${(item.totalUSD / 1000).toFixed(1)}k USD
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* GRÁFICA 3: Preferencia de Plazos de Financiamiento Directo (BarChart) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500 text-white shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">
                Preferencia de Plazos de Crédito Directo CADIS
              </h4>
              <p className="text-xs text-slate-500">
                Distribución de clientes según el plazo elegido (3, 5 o 10 años)
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            30% Inicial • 0% Interés Bancario
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 items-center">
          <div className="md:col-span-8 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={financingTermData}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="plazo" 
                  tickLine={false} 
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-extrabold text-amber-400">{label}</p>
                          <p className="font-bold">{payload[0].value} clientes eligieron este plazo</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  name="Simulaciones" 
                  fill="#F59E0B" 
                  radius={[8, 8, 0, 0]}
                  barSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="md:col-span-4 space-y-3 bg-amber-50/60 p-4 rounded-xl border border-amber-200/70">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Insight de Cartera</span>
            </div>
            <p className="text-xs text-amber-950/80 leading-relaxed font-medium">
              El plazo a <strong>5 y 10 años</strong> representa la mayor atracción comercial en el proyecto Río Bonito, permitiendo cuotas mensuales desde tan solo <strong>$46.67 USD/mes</strong>.
            </p>
            <div className="pt-2 border-t border-amber-200 text-xs font-bold text-amber-900 flex justify-between">
              <span>Cuota Inicial Flexible:</span>
              <span className="text-emerald-700 font-black">Hasta en 3 meses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
