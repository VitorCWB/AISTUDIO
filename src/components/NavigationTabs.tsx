import React from 'react';
import { ConfiguracaoTema, UserRole } from '../types';
import { AlertCircle, BarChart3, FileSpreadsheet, Users, Sliders, ShieldCheck } from 'lucide-react';

export type TabId =
  | 'tab-ocorrencias'
  | 'tab-dashboard'
  | 'tab-historico'
  | 'tab-auditoria'
  | 'tab-usuarios'
  | 'tab-adm';

interface NavigationTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  userRole: UserRole;
  config: ConfiguracaoTema;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  userRole,
  config,
}) => {
  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode; roles: UserRole[] }> = [
    {
      id: 'tab-ocorrencias',
      label: config.tabOcorrencias || 'Central de Ocorrências',
      icon: <AlertCircle className="w-4 h-4" />,
      roles: ['ADM', 'FARMACEUTICO', 'OPERADOR'],
    },
    {
      id: 'tab-dashboard',
      label: config.tabDash || 'Dashboard KPIs',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['ADM', 'FARMACEUTICO', 'OPERADOR'],
    },
    {
      id: 'tab-historico',
      label: config.tabHistorico || 'Histórico & Fichas',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      roles: ['ADM', 'FARMACEUTICO', 'OPERADOR'],
    },
    {
      id: 'tab-auditoria',
      label: 'Auditoria & Logs',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      roles: ['ADM'],
    },
    {
      id: 'tab-usuarios',
      label: 'Gestão de Usuários',
      icon: <Users className="w-4 h-4" />,
      roles: ['ADM'],
    },
    {
      id: 'tab-adm',
      label: 'Poder Supremo ADM',
      icon: <Sliders className="w-4 h-4" />,
      roles: ['ADM'],
    },
  ];

  const visibleTabs = tabs.filter((t) => t.roles.includes(userRole));

  return (
    <nav
      style={{ backgroundColor: config.colorPrimary }}
      className="border-t border-white/10 px-4 sm:px-6 lg:px-8 overflow-x-auto no-print"
    >
      <div className="max-w-7xl mx-auto flex gap-1 min-w-max">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'text-white border-blue-500 bg-white/10'
                  : 'text-slate-400 hover:text-white border-transparent hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
