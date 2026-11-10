import React, { useState } from 'react';
import { Ocorrencia, StatusTriagem, Usuario } from '../types';
import { atualizarStatusOcorrenciaComLog } from '../db/indexedDb';
import { tocarBeep } from '../utils/audio';
import {
  Printer,
  X,
  Download,
  FileText,
  CheckCircle,
  Package,
  ShieldAlert,
  ArrowRight,
  Edit,
} from 'lucide-react';

interface FichaModalProps {
  ocorrencia: Ocorrencia | null;
  usuarioLogado: Usuario;
  onClose: () => void;
  onStatusAtualizado: () => void;
  onToast: (msg: string, tipo: 'success' | 'error' | 'info') => void;
}

export const FichaModal: React.FC<FichaModalProps> = ({
  ocorrencia,
  usuarioLogado,
  onClose,
  onStatusAtualizado,
  onToast,
}) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [novoStatus, setNovoStatus] = useState<StatusTriagem>('Pendente');
  const [justificativa, setJustificativa] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  if (!ocorrencia) return null;

  const podeAlterarStatus =
    usuarioLogado.funcao === 'ADM' || usuarioLogado.funcao === 'FARMACEUTICO';

  const handlePrint = () => {
    window.print();
  };

  const handleIniciarEdicaoStatus = () => {
    setNovoStatus(ocorrencia.statusTriagem || 'Pendente');
    setJustificativa('');
    setIsEditingStatus(true);
  };

  const handleSalvarNovoStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podeAlterarStatus) {
      onToast('Apenas Farmacêuticos e Administradores podem deliberar o status.', 'error');
      return;
    }

    setIsSavingStatus(true);
    try {
      const atualizado = await atualizarStatusOcorrenciaComLog(
        ocorrencia.id,
        novoStatus,
        usuarioLogado,
        justificativa
      );

      if (atualizado) {
        ocorrencia.statusTriagem = novoStatus;
        tocarBeep(true);
        onToast(
          `Status alterado para "${novoStatus}" e registrado no log de auditoria com sucesso!`,
          'success'
        );
        setIsEditingStatus(false);
        onStatusAtualizado();
      }
    } catch (err) {
      console.error(err);
      tocarBeep(false);
      onToast('Erro ao atualizar status e gravar log de auditoria.', 'error');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const getStatusBadgeStyle = (st: StatusTriagem) => {
    switch (st) {
      case 'Concluído':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Aprovado Reenvio':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Aprovado Descarte':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Em Análise':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print">
      <div
        id="print-area"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header do Modal / Laudo */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Laudo Técnico & Ficha de Vistoria de Avaria
              </h2>
              <span className="text-[11px] text-slate-400">
                Stin Pharma ERP · Ocorrência #{ocorrencia.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors no-print"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo da Ficha */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Tabela de Dados Principais */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-500 w-1/3">Data / Hora de Registro:</td>
                  <td className="p-3 font-semibold text-slate-900">{ocorrencia.dataHora}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-bold text-slate-500">Nº do Pedido / Malote:</td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    Pedido: {ocorrencia.pedido} {ocorrencia.malote ? `· Malote: ${ocorrencia.malote}` : ''}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-500">Cliente / Paciente Destinatário:</td>
                  <td className="p-3 font-semibold text-slate-900">
                    {ocorrencia.cliente} {ocorrencia.estado ? `(${ocorrencia.estado})` : ''}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-bold text-slate-500">Transportadora Responsável:</td>
                  <td className="p-3 font-semibold text-blue-700">{ocorrencia.transportadora}</td>
                </tr>
                {ocorrencia.vendedor && (
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-500">Vendedor / Consultor:</td>
                    <td className="p-3 font-semibold text-slate-900">{ocorrencia.vendedor}</td>
                  </tr>
                )}
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-bold text-slate-500">Classificação / Setor:</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-900">{ocorrencia.tipo}</span>
                    <span className="text-slate-400 mx-1.5">·</span>
                    <span className="text-slate-600">Setor: {ocorrencia.setor}</span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-500">Modalidade de Retorno:</td>
                  <td className="p-3 font-semibold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        ocorrencia.isParcial
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {ocorrencia.itemSinalizado}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-bold text-slate-500">Composição Financeira do Prejuízo:</td>
                  <td className="p-3 font-mono">
                    Produtos: R$ {ocorrencia.valorProduto.toFixed(2)} + Frete: R$ {ocorrencia.valorFrete.toFixed(2)} ={' '}
                    <strong className="text-rose-700 font-bold">R$ {ocorrencia.valorTotal.toFixed(2)}</strong>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-500">Motivo Apurado & Ação Adotada:</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-900">{ocorrencia.motivo}</span>
                    <span className="text-slate-400 mx-1.5">➔</span>
                    <span className="text-emerald-700 font-medium">{ocorrencia.acao}</span>
                  </td>
                </tr>

                {/* Linha Especial de Status de Triagem com Auditoria */}
                <tr className="border-b border-slate-100 bg-amber-50/40">
                  <td className="p-3 font-bold text-slate-700">Status da Triagem (Auditável):</td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getStatusBadgeStyle(
                          ocorrencia.statusTriagem || 'Pendente'
                        )}`}
                      >
                        {ocorrencia.statusTriagem || 'Pendente'}
                      </span>

                      {/* Controle RBAC: Apenas ADM e Farmacêutico podem alterar */}
                      {podeAlterarStatus ? (
                        !isEditingStatus ? (
                          <button
                            type="button"
                            onClick={handleIniciarEdicaoStatus}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white px-2 py-1 rounded border border-blue-200 hover:border-blue-400 transition-all no-print shadow-2xs"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Alterar Status (Gerar Log)</span>
                          </button>
                        ) : null
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          🔒 Somente Farmacêuticos e Administradores podem deliberar o status
                        </span>
                      )}
                    </div>

                    {/* Caixa de Edição de Status com Gravação de Auditoria */}
                    {isEditingStatus && (
                      <form
                        onSubmit={handleSalvarNovoStatus}
                        className="mt-3 p-3 bg-white border border-blue-200 rounded-lg shadow-sm space-y-2.5 no-print"
                      >
                        <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                          <span>Nova deliberação de status por:</span>
                          <span className="font-normal text-blue-700 font-mono">
                            {usuarioLogado.nome} ({usuarioLogado.funcao})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                              Novo Status:
                            </label>
                            <select
                              value={novoStatus}
                              onChange={(e) => setNovoStatus(e.target.value as StatusTriagem)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                            >
                              <option value="Pendente">🟡 Pendente (Aguardando)</option>
                              <option value="Em Análise">🔵 Em Análise Técnica</option>
                              <option value="Aprovado Reenvio">🟢 Aprovado Reenvio</option>
                              <option value="Aprovado Descarte">🔴 Aprovado Descarte</option>
                              <option value="Concluído">✅ Concluído</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                              Justificativa Técnica (Opcional):
                            </label>
                            <input
                              type="text"
                              value={justificativa}
                              onChange={(e) => setJustificativa(e.target.value)}
                              placeholder="Motivo da aprovação, laudo ou descarte..."
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsEditingStatus(false)}
                            className="px-2.5 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100 text-slate-700"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingStatus}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <ArrowRight className="w-3 h-3" />
                            <span>{isSavingStatus ? 'Gravando Log...' : 'Confirmar e Registrar Log'}</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </td>
                </tr>

                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-500">Registrado Por:</td>
                  <td className="p-3 font-semibold text-slate-800">{ocorrencia.registradoPor || 'S/Inf'}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-500">Parecer Técnico / Observações:</td>
                  <td className="p-3 text-slate-700 leading-relaxed italic">
                    {ocorrencia.obs || 'Nenhuma observação complementar registrada.'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Anexos e Imagens da Avaria */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <span>Evidências, Fotos da Avaria & Laudos Técnicos</span>
              <span className="text-slate-400">({ocorrencia.anexos?.length || 0} arquivos)</span>
            </h3>

            {ocorrencia.anexos && ocorrencia.anexos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ocorrencia.anexos.map((a) => {
                  const isImg = a.type?.startsWith('image/');
                  return (
                    <div
                      key={a.id}
                      className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 flex flex-col items-center justify-between gap-2"
                    >
                      {isImg ? (
                        <a
                          href={a.dataUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-full overflow-hidden rounded group relative"
                        >
                          <img
                            src={a.dataUrl}
                            alt={a.name}
                            className="w-full h-32 object-cover rounded border border-slate-200 group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                            Ampliar Foto
                          </span>
                        </a>
                      ) : (
                        <div className="w-full h-32 flex flex-col items-center justify-center bg-white rounded border border-slate-200 text-slate-400">
                          <FileText className="w-10 h-10 mb-1 text-slate-500" />
                          <span className="text-[10px] uppercase font-mono font-bold">Documento</span>
                        </div>
                      )}

                      <div className="w-full text-center">
                        <span className="text-[11px] font-medium text-slate-700 truncate block" title={a.name}>
                          {a.name}
                        </span>
                        <a
                          href={a.dataUrl}
                          download={a.name}
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800"
                        >
                          <Download className="w-3 h-3" />
                          Baixar Arquivo
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                Nenhuma foto ou anexo anexado a esta ocorrência.
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Documento apto para auditoria de devoluções</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Imprimir Laudo A4
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
