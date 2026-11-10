import React, { useState, useMemo } from 'react';
import { Ocorrencia, Usuario } from '../types';
import { excluirOcorrencia, limparTodasOcorrencias } from '../db/indexedDb';
import { Search, Eye, Trash2, Paperclip, FileSpreadsheet } from 'lucide-react';

interface HistoricoTabProps {
  ocorrencias: Ocorrencia[];
  usuarioLogado: Usuario;
  onVerFicha: (oc: Ocorrencia) => void;
  onAtualizarHistorico: () => void;
  onToast: (msg: string, tipo: 'success' | 'error' | 'info') => void;
}

export const HistoricoTab: React.FC<HistoricoTabProps> = ({
  ocorrencias,
  usuarioLogado,
  onVerFicha,
  onAtualizarHistorico,
  onToast,
}) => {
  const [busca, setBusca] = useState<string>('');
  const [filtroTransp, setFiltroTransp] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');

  // Filtragem reativa na memória
  const ocorrenciasFiltradas = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return ocorrencias.filter((item) => {
      const matchBusca =
        !b ||
        (item.pedido && item.pedido.toLowerCase().includes(b)) ||
        (item.cliente && item.cliente.toLowerCase().includes(b)) ||
        (item.malote && item.malote.toLowerCase().includes(b)) ||
        (item.motivo && item.motivo.toLowerCase().includes(b)) ||
        (item.statusTriagem && item.statusTriagem.toLowerCase().includes(b));

      const matchTransp = !filtroTransp || item.transportadora === filtroTransp;
      const matchStatus = !filtroStatus || (item.statusTriagem || 'Pendente') === filtroStatus;

      return matchBusca && matchTransp && matchStatus;
    });
  }, [ocorrencias, busca, filtroTransp, filtroStatus]);

  const handleExcluirIndividual = async (id: number) => {
    if (usuarioLogado.funcao !== 'ADM') {
      onToast('Apenas administradores podem excluir ocorrências.', 'error');
      return;
    }
    if (window.confirm('Deseja realmente excluir esta ocorrência do banco de dados?')) {
      try {
        await excluirOcorrencia(id);
        onToast('Ocorrência removida com sucesso!', 'info');
        onAtualizarHistorico();
      } catch {
        onToast('Erro ao excluir ocorrência.', 'error');
      }
    }
  };

  const handleLimparTudo = async () => {
    if (usuarioLogado.funcao !== 'ADM') return;
    if (
      window.confirm(
        'ATENÇÃO: Deseja apagar TODO o histórico de ocorrências e laudos do banco IndexedDB? Esta ação não pode ser desfeita.'
      )
    ) {
      try {
        await limparTodasOcorrencias();
        onToast('Todo o histórico de ocorrências foi apagado.', 'info');
        onAtualizarHistorico();
      } catch {
        onToast('Erro ao limpar histórico.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Cabeçalho do Card */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Histórico de Ocorrências & Laudos</h2>
              <p className="text-xs text-slate-400">
                {ocorrenciasFiltradas.length} de {ocorrencias.length} ocorrência(s) listada(s)
              </p>
            </div>
          </div>

          {usuarioLogado.funcao === 'ADM' && (
            <button
              onClick={handleLimparTudo}
              disabled={ocorrencias.length === 0}
              className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Apagar Todo o Histórico</span>
            </button>
          )}
        </div>

        {/* Barra de Filtros */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por Nº do Pedido, Malote, Nome do Cliente ou Motivo..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <select
              value={filtroTransp}
              onChange={(e) => setFiltroTransp(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
            >
              <option value="">Todas as Transportadoras</option>
              <option value="TRANSPORTADORA">TRANSPORTADORA</option>
              <option value="MOTOBOY">MOTOBOY</option>
              <option value="AZUL AEREAS">AZUL AÉREAS</option>
              <option value="ATIVA">ATIVA</option>
              <option value="SEDEX">SEDEX</option>
              <option value="MOTO ESPORADICO">MOTO ESPORÁDICO</option>
              <option value="OUTRA">OUTRA</option>
            </select>
          </div>

          <div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-bold"
            >
              <option value="">Todos os Status de Triagem</option>
              <option value="Pendente">🟡 Pendente</option>
              <option value="Em Análise">🔵 Em Análise</option>
              <option value="Aprovado Reenvio">🟢 Aprovado Reenvio</option>
              <option value="Aprovado Descarte">🔴 Aprovado Descarte</option>
              <option value="Concluído">✅ Concluído</option>
            </select>
          </div>
        </div>

        {/* Tabela de Resultados */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Pedido / Malote</th>
                <th className="py-3 px-4">Cliente Destinatário</th>
                <th className="py-3 px-4">Transportadora</th>
                <th className="py-3 px-4">Modalidade / Item</th>
                <th className="py-3 px-4">Status Triagem</th>
                <th className="py-3 px-4">Anexos</th>
                <th className="py-3 px-4">Prejuízo Total</th>
                <th className="py-3 px-4">Registrado Por</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ocorrenciasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    Nenhuma ocorrência encontrada com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                ocorrenciasFiltradas.map((item) => {
                  const qtdAnexos = item.anexos?.length || 0;
                  const st = item.statusTriagem || 'Pendente';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {item.dataHora}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 font-mono">#{item.pedido}</span>
                        {item.malote && (
                          <span className="text-[11px] text-slate-400 block font-mono">
                            Malote: {item.malote}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-[200px] truncate" title={item.cliente}>
                        {item.cliente}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {item.transportadora}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide whitespace-nowrap ${
                            item.isParcial
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {item.itemSinalizado}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            st === 'Concluído'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : st === 'Aprovado Reenvio'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : st === 'Aprovado Descarte'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : st === 'Em Análise'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {st}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {qtdAnexos > 0 ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                            <Paperclip className="w-3 h-3" />
                            {qtdAnexos} {qtdAnexos === 1 ? 'arquivo' : 'arquivos'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Sem anexos</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-700 whitespace-nowrap tabular-nums">
                        R$ {item.valorTotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{item.registradoPor || '-'}</td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onVerFicha(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 text-xs font-semibold transition-all"
                            title="Visualizar laudo técnico"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Ficha</span>
                          </button>

                          {usuarioLogado.funcao === 'ADM' && (
                            <button
                              onClick={() => handleExcluirIndividual(item.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Excluir ocorrência"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
