import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Building2, 
  Calculator, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BarChart2,
  ChevronRight,
  DollarSign,
  Sparkles,
  Info
} from 'lucide-react';
import { Property, CreditSimulation, VendorApplication, AccountingSummary } from '../types';

interface AdminTopSummarySectionProps {
  properties: Property[];
  simulations: CreditSimulation[];
  vendors: VendorApplication[];
  accountingSummary: AccountingSummary;
  onNavigateTab: (tab: 'analytics' | 'simulations' | 'properties' | 'accounting' | 'documents' | 'activity' | 'vendors' | 'subscribers' | 'notifications' | 'sql') => void;
}

interface MonthlySimulationVolume {
  monthKey: string;      // e.g. "2026-05"
  monthLabel: string;    // e.g. "May", "Jun", "Jul", "Ago", "Sep"
  fullMonthName: string; // e.g. "Mayo 2026"
  count: number;
  totalMontoUSD: number;
  nuevos: number;
  contactados: number;
  enNegociacion: number;
  cerrados: number;
}

export const AdminTopSummarySection: React.FC<AdminTopSummarySectionProps> = ({
  properties,
  simulations,
  vendors,
  accountingSummary,
  onNavigateTab
}) => {
  const d3SvgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredData, setHoveredData] = useState<MonthlySimulationVolume | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // 1. Key Metrics Calculations
  // Total Active Properties
  const totalActiveProperties = useMemo(() => {
    return properties.filter(p => p.estado === 'disponible').length;
  }, [properties]);

  const activePropertiesValueUSD = useMemo(() => {
    return properties
      .filter(p => p.estado === 'disponible')
      .reduce((sum, p) => sum + p.precio, 0);
  }, [properties]);

  const activePropertiesAreaM2 = useMemo(() => {
    return properties
      .filter(p => p.estado === 'disponible')
      .reduce((sum, p) => sum + p.metraje, 0);
  }, [properties]);

  // Pending Simulations
  const pendingSimulationsCount = useMemo(() => {
    return simulations.filter(s => s.estado === 'nuevo').length;
  }, [simulations]);

  const inProgressSimulationsCount = useMemo(() => {
    return simulations.filter(s => s.estado === 'contactado' || s.estado === 'en_negociacion').length;
  }, [simulations]);

  const pendingSimulationsVolumeUSD = useMemo(() => {
    return simulations
      .filter(s => s.estado === 'nuevo')
      .reduce((sum, s) => sum + s.montoTerreno, 0);
  }, [simulations]);

  // Recent Vendor Applications
  const pendingVendorsCount = useMemo(() => {
    return vendors.filter(v => v.estado === 'pendiente').length;
  }, [vendors]);

  const approvedVendorsCount = useMemo(() => {
    return vendors.filter(v => v.estado === 'aprobado').length;
  }, [vendors]);

  const latestVendor = useMemo(() => {
    if (vendors.length === 0) return null;
    return vendors[0];
  }, [vendors]);

  // 2. Compute Monthly Simulation Data for D3.js Bar Chart
  const monthlyData: MonthlySimulationVolume[] = useMemo(() => {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const fullMonthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Determine target 5-month window up to current date (2026-09)
    const now = new Date(2026, 8, 15); // Sept 2026 reference
    const monthsMap = new Map<string, MonthlySimulationVolume>();

    // Generate past 5 months sequence: May, Jun, Jul, Aug, Sep 2026
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = d.getMonth(); // 0-indexed
      const monthKey = `${year}-${String(monthNum + 1).padStart(2, '0')}`;
      
      monthsMap.set(monthKey, {
        monthKey,
        monthLabel: monthNames[monthNum],
        fullMonthName: `${fullMonthNames[monthNum]} ${year}`,
        count: 0,
        totalMontoUSD: 0,
        nuevos: 0,
        contactados: 0,
        enNegociacion: 0,
        cerrados: 0
      });
    }

    // Populate with real simulation instances
    simulations.forEach(sim => {
      if (!sim.fecha) return;
      const key = sim.fecha.substring(0, 7); // e.g. "2026-05"
      let item = monthsMap.get(key);
      if (!item) {
        // Parse date for month labels if outside initial window
        const [yearStr, monthStr] = key.split('-');
        const y = parseInt(yearStr, 10);
        const m = parseInt(monthStr, 10) - 1;
        if (!isNaN(y) && !isNaN(m) && m >= 0 && m < 12) {
          item = {
            monthKey: key,
            monthLabel: monthNames[m],
            fullMonthName: `${fullMonthNames[m]} ${y}`,
            count: 0,
            totalMontoUSD: 0,
            nuevos: 0,
            contactados: 0,
            enNegociacion: 0,
            cerrados: 0
          };
          monthsMap.set(key, item);
        }
      }

      if (item) {
        item.count += 1;
        item.totalMontoUSD += sim.montoTerreno || 0;
        if (sim.estado === 'nuevo') item.nuevos += 1;
        else if (sim.estado === 'contactado') item.contactados += 1;
        else if (sim.estado === 'en_negociacion') item.enNegociacion += 1;
        else if (sim.estado === 'cerrado') item.cerrados += 1;
      }
    });

    // Sort chronologically and take last 5 months
    return Array.from(monthsMap.values())
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(-5);
  }, [simulations]);

  // 3. D3.js Bar Chart Rendering
  useEffect(() => {
    if (!d3SvgRef.current || monthlyData.length === 0) return;

    const svg = d3.select(d3SvgRef.current);
    svg.selectAll('*').remove();

    const viewBoxWidth = 420;
    const viewBoxHeight = 150;
    const margin = { top: 26, right: 12, bottom: 26, left: 28 };
    const innerWidth = viewBoxWidth - margin.left - margin.right;
    const innerHeight = viewBoxHeight - margin.top - margin.bottom;

    // Gradient Definitions
    const defs = svg.append('defs');

    // Default bar gradient (Emerald Theme)
    const emeraldGrad = defs.append('linearGradient')
      .attr('id', 'd3-emerald-bar')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    emeraldGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981');
    emeraldGrad.append('stop').attr('offset', '100%').attr('stop-color', '#047857');

    // Current month/active bar gradient (Sky/Cyan Theme)
    const activeGrad = defs.append('linearGradient')
      .attr('id', 'd3-active-bar')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    activeGrad.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8');
    activeGrad.append('stop').attr('offset', '100%').attr('stop-color', '#0284c7');

    // Glow filter for interactive highlight
    const filter = defs.append('filter')
      .attr('id', 'bar-glow')
      .attr('x', '-20%').attr('y', '-20%')
      .attr('width', '140%').attr('height', '140%');
    filter.append('feDropShadow')
      .attr('dx', '0').attr('dy', '2')
      .attr('stdDeviation', '2.5')
      .attr('flood-color', '#0284c7')
      .attr('flood-opacity', '0.35');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // D3 Scales
    const x = d3.scaleBand()
      .domain(monthlyData.map(d => d.monthLabel))
      .range([0, innerWidth])
      .padding(0.38);

    const maxCount = d3.max(monthlyData, d => d.count) || 4;
    const yMax = Math.max(maxCount + 1, 4);
    const y = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    // Horizontal dashed gridlines
    const yTicks = y.ticks(3).filter(t => Number.isInteger(t));
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#f1f5f9')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1);

    // Bars
    const barGroups = g.selectAll('.bar-group')
      .data(monthlyData)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('cursor', 'pointer');

    // Background track bar (subtle visual container)
    barGroups.append('rect')
      .attr('x', d => x(d.monthLabel) || 0)
      .attr('y', 0)
      .attr('width', x.bandwidth())
      .attr('height', innerHeight)
      .attr('rx', 4)
      .attr('fill', '#f8fafc')
      .attr('opacity', 0.8);

    // Active fill bar
    const bars = barGroups.append('rect')
      .attr('class', 'volume-bar')
      .attr('x', d => x(d.monthLabel) || 0)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.count))
      .attr('height', d => Math.max(2, innerHeight - y(d.count)))
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', (d, i) => i === monthlyData.length - 1 ? 'url(#d3-active-bar)' : 'url(#d3-emerald-bar)')
      .style('transition', 'transform 0.15s ease, opacity 0.15s ease');

    // Value Labels on top of bars
    barGroups.append('text')
      .attr('class', 'bar-value-label')
      .attr('x', d => (x(d.monthLabel) || 0) + x.bandwidth() / 2)
      .attr('y', d => Math.max(y(d.count) - 5, 10))
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '800')
      .attr('fill', (d, i) => i === monthlyData.length - 1 ? '#0369a1' : '#0f766e')
      .text(d => d.count);

    // X Axis (Month Names)
    const xAxis = d3.axisBottom(x).tickSize(0).tickPadding(8);
    const xAxisGroup = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', '#e2e8f0').attr('stroke-width', 1);
    xAxisGroup.selectAll('text')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', (d, i) => i === monthlyData.length - 1 ? '#0284c7' : '#64748b');

    // Y Axis (Count values)
    const yAxis = d3.axisLeft(y).ticks(3).tickSize(0).tickPadding(4).tickFormat(d3.format('d'));
    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('text')
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .attr('fill', '#94a3b8');

    // Interactive Hover Handlers using D3 events
    barGroups
      .on('mouseenter', function (event, d) {
        d3.select(this).select('.volume-bar')
          .attr('filter', 'url(#bar-glow)')
          .attr('opacity', 0.9);

        const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
        setHoveredData(d);
        setHoverPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 8
        });
      })
      .on('mousemove', function (event, d) {
        const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
        setHoveredData(d);
        setHoverPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 8
        });
      })
      .on('mouseleave', function () {
        d3.select(this).select('.volume-bar')
          .attr('filter', null)
          .attr('opacity', 1);
        setHoveredData(null);
        setHoverPos(null);
      })
      .on('click', () => {
        onNavigateTab('simulations');
      });

  }, [monthlyData, onNavigateTab]);

  const totalSimulationVolumeAllMonths = useMemo(() => {
    return monthlyData.reduce((acc, curr) => acc + curr.count, 0);
  }, [monthlyData]);

  return (
    <section 
      aria-label="Resumen Ejecutivo y Métricas Clave" 
      className="p-3 sm:p-5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 text-white relative"
    >
      {/* Top Header Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
            Panel de Control Ejecutivo • CADIS Inmobiliaria
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            En Tiempo Real
          </span>
        </div>

        {/* Quick financial snapshot pill */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => onNavigateTab('accounting')}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-700/50 flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
            title="Ver Módulo Contable & Caja"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Caja Neta: <strong>${accountingSummary.balanceNetoUSD.toLocaleString()} USD</strong></span>
            <ArrowUpRight className="w-3 h-3 text-emerald-400 opacity-70" />
          </button>
        </div>
      </div>

      {/* Grid: 3 Summary Cards + 1 D3.js Bar Chart Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-3 sm:gap-3.5">
        
        {/* CARD 1: Total Active Properties */}
        <div 
          onClick={() => onNavigateTab('properties')}
          className="lg:col-span-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 rounded-xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden flex flex-col justify-between"
          title="Ver inventario de propiedades activas"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Active Properties</span>
              </span>
              <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                {Math.round((totalActiveProperties / (properties.length || 1)) * 100)}% Disp.
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {totalActiveProperties}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                / {properties.length} lotes totales
              </span>
            </div>

            <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Inventario activo listo para venta</span>
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
            <div>
              <span className="text-slate-400 text-[10px] block">Capital en cartera</span>
              <strong className="text-white">${(activePropertiesValueUSD / 1000).toFixed(0)}k USD</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block">Área disponible</span>
              <strong className="text-white">{activePropertiesAreaM2.toLocaleString()} m²</strong>
            </div>
          </div>
        </div>

        {/* CARD 2: Pending Simulations */}
        <div 
          onClick={() => onNavigateTab('simulations')}
          className="lg:col-span-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/60 rounded-xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden flex flex-col justify-between"
          title="Ver y gestionar simulaciones de crédito pendientes"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-sky-500/10 transition-colors"></div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-sky-400" />
                <span>Pending Simulations</span>
              </span>
              <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400 text-[10px] font-black border border-sky-500/20">
                {simulations.length} Total
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-sky-400 tracking-tight">
                {pendingSimulationsCount}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                leads nuevos por contactar
              </span>
            </div>

            <p className="text-[11px] text-amber-400 font-semibold mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{inProgressSimulationsCount} adicionales en seguimiento</span>
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
            <div>
              <span className="text-slate-400 text-[10px] block">Monto en evaluación</span>
              <strong className="text-sky-300">${(pendingSimulationsVolumeUSD / 1000).toFixed(0)}k USD</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block">Acción rápida</span>
              <span className="inline-flex items-center gap-0.5 text-sky-400 font-bold group-hover:translate-x-0.5 transition-transform">
                Contactar <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: Recent Vendor Applications */}
        <div 
          onClick={() => onNavigateTab('vendors')}
          className="lg:col-span-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/60 rounded-xl p-3.5 transition-all cursor-pointer group shadow-xs relative overflow-hidden flex flex-col justify-between"
          title="Revisar postulaciones recientes del equipo comercial"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-purple-400 transition-colors flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Recent Vendor Applications</span>
              </span>
              <span className="p-1 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-black border border-purple-500/20">
                {approvedVendorsCount} Aprobados
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight">
                {pendingVendorsCount}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                postulaciones pendientes
              </span>
            </div>

            <p className="text-[11px] text-purple-300 font-semibold mt-1 flex items-center gap-1 truncate">
              <AlertCircle className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="truncate">
                {latestVendor ? `Último: ${latestVendor.nombre}` : 'Sin postulaciones pendientes'}
              </span>
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
            <div>
              <span className="text-slate-400 text-[10px] block">Red comercial</span>
              <strong className="text-white">{vendors.length} candidatos</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block">Acción</span>
              <span className="inline-flex items-center gap-0.5 text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform">
                Evaluar <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* CARD 4: D3.js Monthly Simulation Volume Bar Chart */}
        <div 
          className="lg:col-span-3 bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 relative shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Volumen Mensual (D3.js)
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {totalSimulationVolumeAllMonths} Leads
            </span>
          </div>

          <p className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
            <span>Tendencia últimos 5 meses</span>
            <span className="text-sky-400 font-semibold text-[9px]">Mes actual destacado</span>
          </p>

          {/* D3 SVG Chart Container */}
          <div className="relative w-full h-[125px] flex items-center justify-center">
            <svg 
              ref={d3SvgRef}
              viewBox="0 0 420 150" 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Gráfico de barras D3.js de volumen mensual de simulaciones de crédito"
            />
          </div>

          {/* Footer of Chart */}
          <div className="mt-1 pt-1.5 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block"></span>
              Histórico
              <span className="w-2 h-2 rounded-xs bg-sky-400 inline-block ml-1"></span>
              Actual
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('simulations')}
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <span>Ver detalle</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Floating D3 Tooltip */}
      {hoveredData && hoverPos && (
        <div 
          className="fixed z-50 pointer-events-none bg-slate-950 text-white border border-slate-700 rounded-lg p-2.5 shadow-xl text-xs backdrop-blur-md transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${hoverPos.x}px`,
            top: `${hoverPos.y}px`
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1 mb-1.5">
            <span className="font-extrabold text-emerald-400">{hoveredData.fullMonthName}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
              {hoveredData.count} {hoveredData.count === 1 ? 'simulación' : 'simulaciones'}
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Capital solicitado:</span>
              <strong className="text-white">${hoveredData.totalMontoUSD.toLocaleString()} USD</strong>
            </div>
            <div className="flex justify-between gap-3 text-[10px]">
              <span className="text-sky-400">• Nuevos: {hoveredData.nuevos}</span>
              <span className="text-purple-400">• En Negoc: {hoveredData.enNegociacion}</span>
              <span className="text-emerald-400">• Cerrados: {hoveredData.cerrados}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
