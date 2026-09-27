import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Configúralas en .env.local (desarrollo) o en el panel de Secrets de AI Studio (producción).'
  );
}

// La anon key es pública por diseño (va en el bundle del navegador, como
// cualquier clave "publishable"): la seguridad real la da RLS y las
// funciones security definer del lado de Supabase, no esta clave.
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
