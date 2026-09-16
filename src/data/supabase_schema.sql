-- ==============================================================================
-- CADIS SERVICIOS INMOBILIARIOS - SUPABASE SQL SCHEMA
-- Proyecto Estrella: Río Bonito (Limoncito)
-- Arquitectura de Base de Datos para Producción
-- ==============================================================================

-- Habilitar extensión UUID para identificadores seguros
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABLA: propiedades
-- Almacena las Mini Quintas y lotes campestres comercializados por CADIS
-- ------------------------------------------------------------------------------
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para búsqueda rápida en catálogo
CREATE INDEX IF NOT EXISTS idx_propiedades_proyecto ON public.propiedades(proyecto);
CREATE INDEX IF NOT EXISTS idx_propiedades_estado ON public.propiedades(estado);
CREATE INDEX IF NOT EXISTS idx_propiedades_precio ON public.propiedades(precio);

-- ------------------------------------------------------------------------------
-- 2. TABLA: simulaciones_credito
-- Registra los cálculos realizados por clientes potenciales con opción a reserva
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.simulaciones_credito (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    monto_terreno NUMERIC(12, 2) NOT NULL,
    cuota_inicial NUMERIC(12, 2) NOT NULL,
    modalidad_inicial VARCHAR(30) NOT NULL DEFAULT 'diferido_3m' CHECK (modalidad_inicial IN ('contado', 'diferido_3m')),
    saldo_restante NUMERIC(12, 2) NOT NULL,
    plazo_anios INT NOT NULL CHECK (plazo_anios IN (3, 5, 10)),
    cuota_mensual NUMERIC(12, 2) NOT NULL,
    propiedad_lote VARCHAR(50),
    notas TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'contactado', 'en_negociacion', 'cerrado')),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_simulaciones_fecha ON public.simulaciones_credito(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_simulaciones_estado ON public.simulaciones_credito(estado);

-- ------------------------------------------------------------------------------
-- 3. TABLA: vendedores
-- Captación de agentes inmobiliarios independientes para comercializar CADIS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    ci VARCHAR(50) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    experiencia TEXT NOT NULL,
    nivel_experiencia VARCHAR(30) DEFAULT 'intermedio',
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    mensaje TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vendedores_estado ON public.vendedores(estado);
CREATE INDEX IF NOT EXISTS idx_vendedores_email ON public.vendedores(email);

-- ------------------------------------------------------------------------------
-- 4. TABLA: boletin
-- Suscriptores al boletín de noticias, promociones y ofertas relámpago
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.boletin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_boletin_email ON public.boletin(email);

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) - SEGURIDAD POR DEFECTO
-- ------------------------------------------------------------------------------
ALTER TABLE public.propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulaciones_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boletin ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para catálogo de propiedades
CREATE POLICY "Lectura pública de propiedades disponibles"
    ON public.propiedades FOR SELECT
    USING (true);

-- Políticas para insertar simulaciones de crédito desde la web pública
CREATE POLICY "Inserción pública de simulaciones"
    ON public.simulaciones_credito FOR INSERT
    WITH CHECK (true);

-- Políticas para registro de vendedores independientes
CREATE POLICY "Inserción pública de postulaciones de vendedores"
    ON public.vendedores FOR INSERT
    WITH CHECK (true);

-- Políticas para suscripción al boletín
CREATE POLICY "Inserción pública al boletín"
    ON public.boletin FOR INSERT
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 6. DATOS SEMILLA (SEED DATA) - MINI QUINTAS RÍO BONITO EN LIMONCITO
-- ------------------------------------------------------------------------------
INSERT INTO public.propiedades 
(lote_numero, titulo, proyecto, ubicacion, precio, cuota_inicial_porcentaje, metraje, dimensiones, servicios, disponible, estado, destacado)
VALUES
('Lote RB-01', 'Mini Quinta El Manantial - Río Bonito', 'Proyecto Río Bonito', 'Limoncito, Santa Cruz - Zona Alta', 8000.00, 30.00, 500.00, '20m x 25m', ARRAY['Agua de pozo profundo', 'Energía eléctrica', 'Vías ripiadas', 'Acceso al río'], TRUE, 'disponible', TRUE),
('Lote RB-02', 'Mini Quinta Los Samanes - Río Bonito', 'Proyecto Río Bonito', 'Limoncito, Santa Cruz - Sector Valle', 8000.00, 30.00, 500.00, '20m x 25m', ARRAY['Agua de pozo profundo', 'Energía eléctrica', 'Entorno arbolado', 'Seguridad'], TRUE, 'disponible', TRUE),
('Lote RB-03', 'Mini Quinta Las Brisas - Río Bonito', 'Proyecto Río Bonito', 'Limoncito, Santa Cruz - Colinas Panorámicas', 10500.00, 30.00, 750.00, '25m x 30m', ARRAY['Agua potable', 'Energía eléctrica', 'Vista al valle', 'Vías afirmadas'], TRUE, 'disponible', TRUE),
('Lote RB-04', 'Mini Quinta Ribera Real - Río Bonito', 'Proyecto Río Bonito', 'Limoncito, Santa Cruz - Primera Línea de Río', 12500.00, 30.00, 1000.00, '25m x 40m', ARRAY['Agua potable', 'Energía eléctrica', 'Acceso directo a playa de río', 'Senderos ecológicos'], TRUE, 'disponible', TRUE),
('Lote RB-05', 'Mini Quinta Don Limón - Río Bonito', 'Proyecto Río Bonito', 'Limoncito, Santa Cruz - Av. Principal', 15000.00, 30.00, 1250.00, '25m x 50m', ARRAY['Agua potable', 'Red eléctrica trifásica', 'Sobre vía principal', 'Uso mixto'], TRUE, 'disponible', FALSE),
('Lote RB-06', 'Mini Quinta Hacienda Los Cedros', 'Proyecto Río Bonito', 'Limoncito, Santa Cruz - Sector Bosque', 18500.00, 30.00, 1500.00, '30m x 50m', ARRAY['Agua potable', 'Energía eléctrica', 'Arboleda autóctona', 'Punto de vertiente'], TRUE, 'disponible', FALSE),
('Lote RB-07', 'Mini Quinta Mirador del Sol', 'Proyecto Río Bonito', 'Limoncito, Santa Cruz - Meseta Alta', 8000.00, 30.00, 500.00, '20m x 25m', ARRAY['Agua de pozo', 'Energía eléctrica', 'Vías consolidadas'], FALSE, 'reservado', FALSE),
('Lote RB-08', 'Mini Quinta El Descanso Verde', 'Proyecto Río Bonito', 'Limoncito, Santa Cruz - Orilla del Bosque', 9500.00, 30.00, 600.00, '20m x 30m', ARRAY['Agua de pozo', 'Energía eléctrica', 'Topografía plana'], FALSE, 'vendido', FALSE)
ON CONFLICT DO NOTHING;
