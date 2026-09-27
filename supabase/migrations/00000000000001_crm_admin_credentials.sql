-- =====================================================================
-- crm.admin_credentials: reemplaza los PIN hardcodeados en el código
-- (DEFAULT_ADMIN_CREDENTIALS en src/data/initialData.ts), que quedaban
-- expuestos en el repo público y hasta impresos en la pantalla de
-- login. El PIN nunca se guarda en texto plano: se compara con bcrypt
-- (pgcrypto) del lado del servidor, en una función security definer
-- que el navegador solo puede invocar por su nombre (RPC), nunca leer
-- la tabla directamente.
--
-- Mismo proyecto de Supabase que usa cadis-victoria-agent (schemas
-- finanzas/ventas); este schema (crm) es propio de la app
-- despegAi/cadis, sin cruzarse con esos.
-- =====================================================================

create schema if not exists crm;

create extension if not exists pgcrypto with schema extensions;

create table crm.admin_credentials (
  id              uuid primary key default gen_random_uuid(),
  username        text not null unique,
  pin_hash        text not null,
  label_rol       text not null
                  check (label_rol in ('Admin', 'Editor', 'Solo Lectura', 'Desarrollador')),
  descripcion     text,
  permisos        jsonb not null default '{}'::jsonb,
  nombre_completo text not null,
  role            text not null
                  check (role in ('admin', 'editor', 'reader', 'developer')),
  email           text,
  activo          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table crm.admin_credentials is
  'Credenciales del panel de admin de despegAi/cadis. pin_hash es bcrypt (pgcrypto), nunca texto plano. Solo se lee mediante crm.verify_admin_pin (security definer); el acceso directo a la tabla está revocado para anon/authenticated.';

alter table crm.admin_credentials enable row level security;
revoke all on crm.admin_credentials from public, anon, authenticated;

create or replace function crm.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger admin_credentials_set_updated_at
  before update on crm.admin_credentials
  for each row execute function crm.set_updated_at();

-- ---------------------------------------------------------------------
-- crm.verify_admin_pin: única forma de comprobar un login desde el
-- navegador. Recibe username + pin en texto plano (viaja por HTTPS,
-- como cualquier login), lo compara con el hash guardado y devuelve
-- solo los datos necesarios para armar la sesión — nunca el pin_hash.
-- Si el usuario no existe, está inactivo o el pin no matchea, ok=false
-- y el resto de columnas viene null (no revela cuál de las dos falló).
-- ---------------------------------------------------------------------
create or replace function crm.verify_admin_pin(p_username text, p_pin text)
returns table (
  ok              boolean,
  role            text,
  label_rol       text,
  nombre_completo text,
  email           text,
  permisos        jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row crm.admin_credentials%rowtype;
begin
  select * into v_row
    from crm.admin_credentials
    where crm.admin_credentials.username = lower(trim(p_username))
      and activo = true;

  if v_row.id is null or v_row.pin_hash <> extensions.crypt(p_pin, v_row.pin_hash) then
    return query select false, null::text, null::text, null::text, null::text, null::jsonb;
    return;
  end if;

  return query select true, v_row.role, v_row.label_rol, v_row.nombre_completo, v_row.email, v_row.permisos;
end;
$$;

comment on function crm.verify_admin_pin(text, text) is
  'Verifica username+pin contra crm.admin_credentials (bcrypt). Única forma de leer esta tabla desde el navegador (vía supabase.rpc de la anon key). Nunca expone pin_hash.';

revoke all on function crm.verify_admin_pin(text, text) from public;
grant execute on function crm.verify_admin_pin(text, text) to anon, authenticated;

-- Nota: esta migración NO inserta los admins (username/pin reales).
-- Eso se corre aparte, una sola vez, en el SQL Editor de Supabase —
-- nunca se versiona en git para no repetir el mismo error que estamos
-- corrigiendo.
