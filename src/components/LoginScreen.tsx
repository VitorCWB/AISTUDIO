import React, { useState } from 'react';
import { Usuario } from '../types';
import { tocarBeep } from '../utils/audio';
import { Shield, KeyRound, User as UserIcon, Zap, Lock } from 'lucide-react';

interface LoginScreenProps {
  usuarios: Usuario[];
  onLoginSuccess: (usuario: Usuario) => void;
  onToast: (msg: string, tipo: 'success' | 'error' | 'info') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ usuarios, onLoginSuccess, onToast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const usrClean = username.trim().toLowerCase();
    const found = usuarios.find(
      (u) => u.login.toLowerCase() === usrClean && (u.senha === password || (!u.senha && password === '1234'))
    );

    if (found) {
      if (!found.ativo) {
        tocarBeep(false);
        onToast('Acesso negado: Este usuário está bloqueado no sistema!', 'error');
        setIsLoading(false);
        return;
      }
      tocarBeep(true);
      onToast(`Bem-vindo, ${found.nome} (${found.funcao})!`, 'success');
      onLoginSuccess(found);
    } else {
      tocarBeep(false);
      onToast('Usuário ou senha incorretos!', 'error');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (usr: string, pwd: string) => {
    setUsername(usr);
    setPassword(pwd);
    const found = usuarios.find((u) => u.login.toLowerCase() === usr.toLowerCase());
    if (found) {
      tocarBeep(true);
      onToast(`Acesso rápido autenticado: ${found.nome}`, 'success');
      onLoginSuccess(found);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-10 text-slate-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 text-blue-600 mb-3 border border-blue-100 shadow-sm">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stin Pharma</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mt-0.5">
            Central de Avarias & Devoluções
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Identifique-se para acessar o controle de logística e auditoria técnica
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Usuário (Login)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin, farma ou operador"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            Entrar no Sistema
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-dashed border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Atalhos para Teste Rápido:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="py-2 px-2 text-xs font-semibold rounded-md border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-700 transition-all text-center"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('farma', '1234')}
              className="py-2 px-2 text-xs font-semibold rounded-md border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-700 transition-all text-center"
            >
              🧪 Farma
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('operador', '1234')}
              className="py-2 px-2 text-xs font-semibold rounded-md border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-700 transition-all text-center"
            >
              📦 Operador
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-3">
            Admin: admin / admin123 · Farma & Operador: senha 1234
          </p>
        </div>
      </div>
    </div>
  );
};
