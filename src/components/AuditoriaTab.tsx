import React, { useState, useMemo } from 'react';
import { LogAuditoria, StatusTriagem, UserRole } from '../types';
import {
  ShieldCheck,
  Search,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  History,
} from 'lucide-react';

interface AuditoriaTabProps {
  logs: LogAuditoria[];
}

export const AuditoriaTab: React.FC<AuditoriaTabProps> = ({ logs }) => {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroFuncao, setFiltroFuncao] = useState<string>('');

  const logsFiltrados = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return logs.filter((l) => {
      const matchBusca =
        !b ||
        l.pedido.toLowerCase().includes(b) ||
        l.usuarioNome.toLowerCase().includes(b) ||
        l.usuarioLogin.toLowerCase().includes(b) ||
        (l.justificativa && l.justificativa.toLowerCase().includes(b)) ||
        String(l.ocorrenciaId).includes(b);

      const matchStatus = !filtroStatus || l.statusNovo === filtroStatus;
      const matchFuncao = !filtroFuncao || l.usuarioFuncao === filtroFuncao;

      return matchBusca && matchStatus && matchFuncao;
    });
  }, [logs, busca, filtroStatus, filtroFuncao]);

  // Contadores analíticos
  const contadores = useMemo(() => {
    const total = logs.length;
    let reenvios = 0;
    let descartes = 0;
    let concluidos = 0;

    logs.forEach((l) => {
      if (l.statusNovo === 'Aprovado Reenvio') reenvios++;
      if (l.statusNovo === 'Aprovado Descarte') descartes++;
      if (l.statusNovo === 'Concluído') concluidos++;
    });

    const ultimoLog = logs[0] || null;

    return { total, reenvios, descartes, concluidos, ultimoLog };
  }, [logs]);

  const getStatusBadge = (status: StatusTriagem) => {
    switch (status) {
      case 'Concluído':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Aprovado Reenvio':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Aprovado Descarte':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Em Análise':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Métricas de Auditoria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Total de Logs</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {contadores.total} <span className="text-sm font-medium text-slate-400">transições</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Registros imutáveis gravados no IndexedDB</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Reenvios Aprovados</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-700 font-mono tabular-nums">
            {contadores.reenvios}
          </div>
          <p className="text-xs text-slate-500 mt-1">Autorizados pela equipe técnica</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Descartes Aprovados</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-700 font-mono tabular-nums">
            {contadores.descartes}
          </div>
          <p className="text-xs text-slate-500 mt-1">Incineração / perda hospitalar confirmada</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Última Atividade</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          {contadores.ultimoLog ? (
            <div>
              <span className="text-xs font-bold text-slate-900 block truncate">
                {contadores.ultimoLog.usuarioNome}
              </span>
              <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                {contadores.ultimoLog.dataHora}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Sem registros</span>
          )}
          <p className="text-xs text-slate-500 mt-1">Sessão mais recente registrada</p>
        </div>
      </div>

      {/* Painel Principal de Auditoria */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Trilha de Auditoria Regulatória (Status Triagem)
              </h2>
              <p className="text-xs text-slate-400">
                Log indelével de transições de status com identificação de usuário, cargo e data/hora
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {logsFiltrados.length} de {logs.length} log(s)
          </span>
        </div>

        {/* Filtros de Pesquisa */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por Nº do Pedido, Nome do Usuário, Login ou Justificativa..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
            >
              <option value="">Todos os Novos Status</option>
              <option value="Pendente">🟡 Pendente</option>
              <option value="Em Análise">🔵 Em Análise</option>
              <option value="Aprovado Reenvio">🟢 Aprovado Reenvio</option>
              <option value="Aprovado Descarte">🔴 Aprovado Descarte</option>
              <option value="Concluído">✅ Concluído</option>
            </select>
          </div>

          <div>
            <select
              value={filtroFuncao}
              onChange={(e) => setFiltroFuncao(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
            >
              <option value="">Todas as Funções</option>
              <option value="ADM">👑 Administrador (ADM)</option>
              <option value="FARMACEUTICO">🧪 Farmacêutico</option>
            </select>
          </div>
        </div>

        {/* Tabela de Logs */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Pedido</th>
                <th className="py-3 px-4">Transição de Status (Triagem)</th>
                <th className="py-3 px-4">Usuário Responsável</th>
                <th className="py-3 px-4">Nível de Acesso</th>
                <th className="py-3 px-4">Justificativa / Parecer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum registro de log de auditoria encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                logsFiltrados.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {log.dataHora}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 font-mono">#{log.pedido}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        ID: {log.ocorrenciaId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                            log.statusAnterior
                          )}`}
                        >
                          {log.statusAnterior}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                            log.statusNovo
                          )}`}
                        >
                          {log.statusNovo}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {log.usuarioNome.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">
                            {log.usuarioNome}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {log.usuarioId} · @{log.usuarioLogin}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          log.usuarioFuncao === 'ADM'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {log.usuarioFuncao}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      {log.justificativa ? (
                        <p className="truncate text-xs" title={log.justificativa}>
                          {log.justificativa}
                        </p>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Transição padrão de triagem</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
