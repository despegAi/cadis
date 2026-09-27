import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { AdminUser, UserRole } from '../types';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AdminUser) => void;
  onClose: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onClose
}) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .rpc('verify_admin_pin', { p_username: username.trim(), p_pin: pin.trim() })
        .single();

      if (error) {
        console.error('verify_admin_pin error', error);
        setErrorMsg('No se pudo verificar el acceso. Intenta de nuevo en un momento.');
        return;
      }

      const result = data as {
        ok: boolean;
        role: UserRole | null;
        label_rol: string | null;
        nombre_completo: string | null;
        email: string | null;
        permisos: Record<string, boolean> | null;
      };

      if (!result?.ok || !result.role) {
        setErrorMsg('Usuario o clave incorrecta.');
        return;
      }

      const loggedUser: AdminUser = {
        id: `usr-${username.trim().toLowerCase()}`,
        username: username.trim().toLowerCase(),
        nombreCompleto: result.nombre_completo ?? username.trim(),
        role: result.role,
        email: result.email ?? '',
        ultimoAcceso: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      try {
        localStorage.setItem('cadis_admin_user', JSON.stringify(loggedUser));
      } catch (err) {
        console.warn('LocalStorage not available');
      }
      onLoginSuccess(loggedUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">

      {/* Top Brand Banner */}
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight">Control de Acceso & Autenticación</h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                CADIS 2026
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Acceso restringido al equipo de CADIS.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
        >
          Cerrar
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Usuario del Sistema</label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full p-2.5 pl-9 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clave de Seguridad / Contraseña</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ingresa tu clave"
                className="w-full p-2.5 pl-9 pr-10 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            id="btn-login-submit"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            <span>{loading ? 'Verificando...' : 'Ingresar al Panel'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
