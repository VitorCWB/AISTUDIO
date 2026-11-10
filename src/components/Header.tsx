import React from 'react';
import { ConfiguracaoTema, Usuario } from '../types';
import { LogOut, PackageCheck } from 'lucide-react';

interface HeaderProps {
  usuario: Usuario;
  config: ConfiguracaoTema;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ usuario, config, onLogout }) => {
  const getBadgeStyle = (funcao: string) => {
    switch (funcao) {
      case 'ADM':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'FARMACEUTICO':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <header
      style={{ backgroundColor: config.colorPrimary }}
      className="text-white border-b border-slate-800 shadow-sm transition-colors duration-300 no-print"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                {config.textTitle}
              </h1>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 hidden sm:inline-block">
                ERP Logístico
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-none mt-0.5">{config.textSlogan}</p>
          </div>
        </div>

        {/* User Panel */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                usuario.funcao
              )}`}
            >
              {usuario.funcao}
            </span>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-slate-200 block leading-tight">{usuario.nome}</span>
              <span className="text-[10px] text-slate-400 font-mono">@{usuario.login}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sair do sistema"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
