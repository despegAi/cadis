export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- CADIS SERVICIOS INMOBILIARIOS - SUPABASE SQL SCHEMA
-- Proyecto Estrella: Río Bonito (Limoncito)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: propiedades
CREATE TABLE IF NOT EXISTS public.propiedades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lote_numero VARCHAR(50) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    proyecto VARCHAR(100) NOT NULL DEFAULT 'Proyecto Río Bonito',
    ubicacion VARCHAR(255) NOT NULL DEFAULT 'Limoncito, Santa Cruz',
    precio NUMERIC(12, 2) NOT NULL CHECK (precio > 0),
    cuota_inicial_porcentaje NUMERIC(5, 2) NOT NULL DEFAULT 30.00,
    metraje NUMERIC(10, 2) NOT NULL,
    dimensiones VARCHAR(100),
    servicios TEXT[] DEFAULT ARRAY['Agua potable', 'Energía eléctrica', 'Vías de acceso'],
    imagen_url TEXT,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    estado VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'reservado', 'vendido')),
    destacado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: simulaciones_credito
CREATE TABLE IF NOT EXISTS public.simulaciones_credito (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    monto_terreno NUMERIC(12, 2) NOT NULL,
    cuota_inicial NUMERIC(12, 2) NOT NULL,
    modalidad_inicial VARCHAR(30) NOT NULL DEFAULT 'diferido_3m',
    saldo_restante NUMERIC(12, 2) NOT NULL,
    plazo_anios INT NOT NULL CHECK (plazo_anios IN (3, 5, 10)),
    cuota_mensual NUMERIC(12, 2) NOT NULL,
    propiedad_lote VARCHAR(50),
    notas TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'nuevo',
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: vendedores
CREATE TABLE IF NOT EXISTS public.vendedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    ci VARCHAR(50) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    experiencia TEXT NOT NULL,
    nivel_experiencia VARCHAR(30) DEFAULT 'intermedio',
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: boletin
CREATE TABLE IF NOT EXISTS public.boletin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. POLÍTICAS RLS (Row Level Security)
ALTER TABLE public.propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulaciones_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boletin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública propiedades" ON public.propiedades FOR SELECT USING (true);
CREATE POLICY "Inserción pública simulaciones" ON public.simulaciones_credito FOR INSERT WITH CHECK (true);
CREATE POLICY "Inserción pública vendedores" ON public.vendedores FOR INSERT WITH CHECK (true);
CREATE POLICY "Inserción pública boletín" ON public.boletin FOR INSERT WITH CHECK (true);
`;
