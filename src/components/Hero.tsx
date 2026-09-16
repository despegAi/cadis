import React from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Shield, 
  Zap, 
  Droplets, 
  Trees, 
  Clock,
  Compass,
  MessageCircle,
  PhoneCall
} from 'lucide-react';
import { RioBonitoBadge } from './CadisLogo';
import { CADIS_WHATSAPP_NUMBER, CADIS_WHATSAPP_DISPLAY } from '../config/contact';
import { Property } from '../types';

interface HeroProps {
  properties: Property[];
  onGoToSimulator: () => void;
  onGoToProperties: () => void;
}

export const Hero: React.FC<HeroProps> = ({ properties, onGoToSimulator, onGoToProperties }) => {
  const lotesDisponibles = properties.filter((p) => p.estado === 'disponible').length;
  return (
    <section id="inicio" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Subtle architectural background grids & soft gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Copy Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <RioBonitoBadge />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200/70">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Crédito Directo CADIS</span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#009698] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                CADIS BIENES RAÍCES
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Tu Mini Quinta en <br className="hidden sm:inline" />
                <span className="text-[#009698]">
                  Limoncito, Santa Cruz
                </span>
              </h1>
              <p className="text-lg sm:text-xl font-bold text-slate-700 italic">
                "Conectamos oportunidades inmobiliarias con el futuro de la familia cruceña"
              </p>
              <p className="text-base font-semibold text-slate-600">
                Proyecto Exclusivo <span className="text-[#009698] font-extrabold">"Río Bonito"</span> • Tu espacio, tu futuro..
              </p>
            </div>

            {/* Value Proposition Callout Card */}
            <div className="p-5 rounded-2xl bg-white border-2 border-teal-500/20 shadow-lg shadow-teal-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-0 pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-[#009698] bg-teal-100/80 px-2.5 py-1 rounded-md">
                    OFERTA ESTRELLA DE LANZAMIENTO
                  </span>
                  <div className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 flex items-baseline gap-2">
                    <span>Desde $8,000</span>
                    <span className="text-lg font-bold text-slate-600">USD</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mt-1">
                    Terrenos campestres con entrega inmediata y plan de 1 a 8 años.
                  </p>
                </div>

                <div className="sm:border-l sm:border-slate-200 sm:pl-6 space-y-1.5">
                  <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#009698]" />
                    <span>Crédito directo sin bancos</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    <Clock className="w-4 h-4 shrink-0 text-[#009698]" />
                    <span>Inicial del 30% ($2,400 USD) al contado o en 3 meses</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tasa fija del 10% anual</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={onGoToSimulator}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#009698] to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-700/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                id="hero-simulator-cta-btn"
              >
                <Calculator className="w-5 h-5 text-teal-200" />
                <span>Simular Crédito Directo (1 a 8 Años)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${CADIS_WHATSAPP_NUMBER}?text=Hola%20CADIS%20Bienes%20Ra%C3%ADces%2C%20quisiera%20recibir%20asesor%C3%ADa%20y%20detalles%20sobre%20el%20Proyecto%20R%C3%ADo%20Bonito%20en%20Limoncito`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-bold text-white bg-[#25D366] hover:bg-[#20ba59] shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                id="hero-whatsapp-cta-btn"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                <span>WhatsApp Directo {CADIS_WHATSAPP_DISPLAY.replace('+591 ', '')}</span>
              </a>

              <button
                onClick={onGoToProperties}
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all cursor-pointer"
                id="hero-properties-cta-btn"
              >
                <Compass className="w-5 h-5 text-slate-600" />
                <span>Lotes y Planos</span>
              </button>
            </div>

            {/* Core Features Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/80">
              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">100% Legal</p>
                  <p className="text-[11px] text-slate-500">Documentos al día</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Agua de Pozo</p>
                  <p className="text-[11px] text-slate-500">Vertiente pura</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Red Eléctrica</p>
                  <p className="text-[11px] text-slate-500">Servicio activo</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <Trees className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Entorno Río</p>
                  <p className="text-[11px] text-slate-500">Naturaleza virgen</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-3xl blur-md opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              
              <div className="relative rounded-2xl bg-white p-3 shadow-2xl border border-slate-100">
                {/* Image showcase */}
                <div className="relative h-80 sm:h-96 rounded-xl overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
                    alt="Proyecto Río Bonito en Limoncito - Mini Quintas Campestres"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-600/90 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow">
                      <MapPin className="w-3.5 h-3.5" />
                      Limoncito, Santa Cruz
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-emerald-300 text-xs font-extrabold backdrop-blur-md border border-emerald-500/40">
                      {lotesDisponibles} Lote{lotesDisponibles === 1 ? '' : 's'} Disponible{lotesDisponibles === 1 ? '' : 's'}
                    </span>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
                    <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold">
                      Proyecto Residencial Campestre
                    </p>
                    <h3 className="text-xl font-black leading-tight">
                      Río Bonito • Vida Natural y Plusvalía Garantizada
                    </h3>
                    <p className="text-xs text-slate-200 font-medium">
                      A solo 45 minutos de la ciudad. Aire puro, clima templado y alta valorización inmobiliaria.
                    </p>
                  </div>
                </div>

                {/* Quick Simulation Card snippet */}
                <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Ejemplo Cuota 10 Años</span>
                    <p className="text-lg font-black text-emerald-700">$46.67 <span className="text-xs font-bold text-slate-600">USD / mes</span></p>
                  </div>
                  <button
                    onClick={onGoToSimulator}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Calcular ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
