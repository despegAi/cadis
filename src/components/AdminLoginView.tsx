import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  UserCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Sparkles, 
  ShieldAlert, 
  FileSpreadsheet, 
  Check, 
  Layers,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Unlock
} from 'lucide-react';
import { AdminCredential, DEFAULT_ADMIN_CREDENTIALS } from '../data/initialData';
import { AdminUser, UserRole } from '../types';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AdminUser) => void;
  onClose: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onClose
}) => {
  const [username, setUsername] = useState('admin');
  const [pin, setPin] = useState('cadis2026');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedCredential = DEFAULT_ADMIN_CREDENTIALS.find(
    (c) => c.username.toLowerCase() === username.trim().toLowerCase()
  );

  const handleSelectPreset = (credential: AdminCredential) => {
    setUsername(credential.username);
    setPin(credential.pin);
    setErrorMsg(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const match = DEFAULT_ADMIN_CREDENTIALS.find(
      (c) => c.username.toLowerCase() === username.trim().toLowerCase() && c.pin === pin.trim()
    );

    if (match) {
      // Save authenticated session in localStorage for high-speed subsequent access
      const loggedUser: AdminUser = {
        ...match.user,
        ultimoAcceso: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      try {
        localStorage.setItem('cadis_admin_user', JSON.stringify(loggedUser));
      } catch (err) {
        console.warn('LocalStorage not available');
      }
      onLoginSuccess(loggedUser);
    } else {
      setErrorMsg('Usuario o clave incorrecta. Por favor selecciona uno de los perfiles disponibles o verifica tus credenciales.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
      
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
              Sistema con perfiles de seguridad: <strong>Admin</strong>, <strong>Editor</strong> y <strong>Solo Lectura</strong>.
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
        
        {/* Role Presets Quick Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-black uppercase text-slate-600 tracking-wider">
              Selecciona tu Perfil de Usuario:
            </label>
            <span className="text-[11px] text-emerald-600 font-semibold">1 Clic para autocompletar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DEFAULT_ADMIN_CREDENTIALS.filter(c => c.user.role !== 'developer').map((cred) => {
              const isSelected = username === cred.username;
              const isRoleAdmin = cred.user.role === 'admin';
              const isRoleEditor = cred.user.role === 'editor';
              const isRoleReader = cred.user.role === 'reader';

              return (
                <button
                  key={cred.username}
                  type="button"
                  onClick={() => handleSelectPreset(cred)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected 
                      ? isRoleAdmin
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/30 shadow-xs'
                        : isRoleEditor
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30 shadow-xs'
                        : 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isRoleAdmin
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRoleEditor
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isRoleAdmin ? <ShieldCheck className="w-3 h-3" /> : isRoleEditor ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{cred.labelRol}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-slate-800" />}
                    </div>
                    
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{cred.user.nombreCompleto}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight line-clamp-2">
                      {cred.descripcion}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-500">
                      User: <strong className="text-slate-800">{cred.username}</strong>
                    </span>
                    <span className="font-mono text-slate-500">
                      PIN: <strong className="text-slate-800">{cred.pin}</strong>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Profile Permissions Matrix Badge */}
        {selectedCredential && (
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Permisos del Perfil Seleccionado ({selectedCredential.labelRol}):</span>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                selectedCredential.user.role === 'admin'
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedCredential.user.role === 'editor'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedCredential.labelRol}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className={`p-2 rounded-xl flex items-center gap-2 border ${
                selectedCredential.permisos.editar
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/60 border-rose-200 text-rose-900'
              }`}>
                {selectedCredential.permisos.editar ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold">Acciones de Edición</p>
                  <p className="text-[10px] opacity-80">
                    {selectedCredential.permisos.editar ? 'Habilitadas (Lotes, leads, estados)' : 'Bloqueadas (Solo lectura)'}
                  </p>
                </div>
              </div>

              <div className={`p-2 rounded-xl flex items-center gap-2 border ${
                selectedCredential.permisos.eliminar
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/60 border-rose-200 text-rose-900'
              }`}>
                {selectedCredential.permisos.eliminar ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold">Acciones de Eliminación</p>
                  <p className="text-[10px] opacity-80">
                    {selectedCredential.permisos.eliminar ? 'Habilitadas (Lotes, docs, historial)' : 'Restringidas (Protección activa)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Usuario del Sistema</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa usuario (admin, editor, lector)"
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
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            id="btn-login-submit"
          >
            <Lock className="w-4 h-4" />
            <span>Ingresar al Panel con Perfil {selectedCredential?.labelRol || 'Seleccionado'}</span>
          </button>
        </form>

      </div>

    </div>
  );
};
