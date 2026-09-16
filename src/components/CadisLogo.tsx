import React from 'react';

interface CadisLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'color' | 'white' | 'dark';
}

export const CadisLogo: React.FC<CadisLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'color'
}) => {
  const heightMap = {
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24'
  };

  return (
    <div className={`flex items-center gap-2 select-none ${heightMap[size]} ${className}`} id="cadis-official-logo">
      <img
        src="/assets/cadis_logotipo_oficial.jpg"
        alt="CADIS BIENES RAÍCES Servicios Inmobiliarios"
        className="h-full w-auto object-contain rounded-md"
        onError={(e) => {
          // Fallback to text representation if image loading fails
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
      <div className="flex flex-col justify-center leading-none">
        <span className={`font-black tracking-tight text-base sm:text-lg ${variant === 'white' ? 'text-white' : 'text-[#009698]'}`}>
          CADIS <span className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-extrabold uppercase">Bienes Raíces</span>
        </span>
        <span className={`text-[10px] font-bold tracking-wider uppercase ${variant === 'white' ? 'text-slate-200' : 'text-slate-500'}`}>
          Servicios Inmobiliarios
        </span>
      </div>
    </div>
  );
};

export const RioBonitoBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 ${className}`}>
      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
        Proyecto Oficial Río Bonito • Limoncito
      </span>
    </div>
  );
};
