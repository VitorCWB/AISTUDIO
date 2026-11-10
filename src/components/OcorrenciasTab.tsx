import React, { useState, useEffect } from 'react';
import { AnexoItem, Ocorrencia, PedidoBase, Usuario } from '../types';
import {
  buscarPedidoPorIndice,
  importarPedidosEmLote,
  obterContagemPedidos,
  salvarOcorrencia,
} from '../db/indexedDb';
import { processarArquivoExcel } from '../utils/excel';
import { tocarBeep } from '../utils/audio';
import {
  Barcode,
  UploadCloud,
  FileSpreadsheet,
  Paperclip,
  Check,
  RotateCcw,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Trash2,
  Package,
} from 'lucide-react';

interface OcorrenciasTabProps {
  usuarioLogado: Usuario;
  onOcorrenciaSalva: () => void;
  onToast: (msg: string, tipo: 'success' | 'error' | 'info') => void;
}

export const OcorrenciasTab: React.FC<OcorrenciasTabProps> = ({
  usuarioLogado,
  onOcorrenciaSalva,
  onToast,
}) => {
  const [baseCount, setBaseCount] = useState<number>(0);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Form states
  const [bipInput, setBipInput] = useState<string>('');
  const [pedido, setPedido] = useState<string>('');
  const [malote, setMalote] = useState<string>('');
  const [cliente, setCliente] = useState<string>('');
  const [vendedor, setVendedor] = useState<string>('');
  const [transportadora, setTransportadora] = useState<string>('TRANSPORTADORA');
  const [valProduto, setValProduto] = useState<string>('');
  const [valFrete, setValFrete] = useState<string>('');
  const [valTotal, setValTotal] = useState<string>('0.00');
  const [estado, setEstado] = useState<string>('');

  const [isParcial, setIsParcial] = useState<boolean>(false);
  const [itemParcialNome, setItemParcialNome] = useState<string>('');
  const [itemParcialQtd, setItemParcialQtd] = useState<number>(1);

  const [tipo, setTipo] = useState<string>('Quebra Operacional');
  const [setor, setSetor] = useState<string>('Laboratorio');
  const [motivo, setMotivo] = useState<string>('Frasco Quebrado / Vazamento');
  const [acao, setAcao] = useState<string>('Reenvio (Novo Pedido)');
  const [statusTriagem, setStatusTriagem] = useState<import('../types').StatusTriagem>('Pendente');
  const [obs, setObs] = useState<string>('');

  const [anexos, setAnexos] = useState<AnexoItem[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Atualizar contagem de pedidos ao montar
  useEffect(() => {
    carregarContagemPedidos();
  }, []);

  const carregarContagemPedidos = async () => {
    const total = await obterContagemPedidos();
    setBaseCount(total);
  };

  // Recalcular valor total ao mudar produto ou frete
  useEffect(() => {
    const p = parseFloat(valProduto) || 0;
    const f = parseFloat(valFrete) || 0;
    setValTotal((p + f).toFixed(2));
  }, [valProduto, valFrete]);

  // Handler de importação da planilha Excel
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const pedidosExtraidos = await processarArquivoExcel(file);
      if (pedidosExtraidos.length === 0) {
        onToast('Nenhum pedido válido com número e dados foi localizado na planilha.', 'error');
        tocarBeep(false);
        setIsImporting(false);
        return;
      }

      await importarPedidosEmLote(pedidosExtraidos);
      await carregarContagemPedidos();
      tocarBeep(true);
      onToast(
        `✅ ${pedidosExtraidos.length} pedidos da aba 4-Pedidos gravados e indexados com sucesso!`,
        'success'
      );
    } catch (err: unknown) {
      console.error(err);
      tocarBeep(false);
      const msg = err instanceof Error ? err.message : 'Falha ao processar arquivo';
      onToast(`Erro ao importar planilha: ${msg}`, 'error');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  // Consulta indexada veloz disparada por bipagem ou digitação
  const handleBipSearch = async (termo: string) => {
    setBipInput(termo);
    const termoLimpo = termo.trim();
    if (termoLimpo.length < 3) return;

    try {
      const pedidoEncontrado = await buscarPedidoPorIndice(termoLimpo);
      if (pedidoEncontrado) {
        aplicarDadosDoPedido(pedidoEncontrado);
        tocarBeep(true);
        onToast(`Pedido #${pedidoEncontrado.pedido} localizado na base indexada!`, 'success');
      }
    } catch (err) {
      console.error('Erro na busca indexada:', err);
    }
  };

  const handleBipKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const termoLimpo = bipInput.trim();
      if (!termoLimpo) return;

      const pedidoEncontrado = await buscarPedidoPorIndice(termoLimpo);
      if (pedidoEncontrado) {
        aplicarDadosDoPedido(pedidoEncontrado);
        tocarBeep(true);
        onToast(`Pedido #${pedidoEncontrado.pedido} localizado!`, 'success');
      } else {
        tocarBeep(false);
        onToast(`Pedido/Malote "${termoLimpo}" não foi encontrado na base indexada.`, 'error');
      }
    }
  };

  const aplicarDadosDoPedido = (p: PedidoBase) => {
    setPedido(p.pedido);
    setMalote(p.malote || '');
    setCliente(p.cliente || '');
    setVendedor(p.vendedor || '');
    setEstado(p.estado || '');
    setValProduto(p.total > 0 ? p.total.toFixed(2) : '');
    setValFrete(p.frete > 0 ? p.frete.toFixed(2) : '');

    // Tratar transportadora
    const transpVal = (p.transportadora || '').toUpperCase();
    const opcoesTransp = [
      'TRANSPORTADORA',
      'MOTOBOY',
      'AZUL AEREAS',
      'ATIVA',
      'SEDEX',
      'MOTO ESPORADICO',
      'OUTRA',
    ];
    if (opcoesTransp.includes(transpVal)) {
      setTransportadora(transpVal);
    } else {
      setTransportadora('OUTRA');
    }
  };

  // Anexação de arquivos
  const handleArquivoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        setAnexos((prev) => [
          ...prev,
          {
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            dataUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removerAnexo = (id: string) => {
    setAnexos((prev) => prev.filter((a) => a.id !== id));
  };

  // Submissão da ocorrência
  const handleSubmitOcorrencia = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pedido.trim() || !cliente.trim()) {
      onToast('Preencha os campos obrigatórios: Pedido e Cliente.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      let itemSinalizado = 'Devolução Total';
      if (isParcial) {
        const nomeProd = itemParcialNome.trim() || 'Item não especificado';
        itemSinalizado = `⚠️ PARCIAL: ${nomeProd} (${itemParcialQtd} un)`;
      }

      const novaOcorrencia: Ocorrencia = {
        id: Date.now(),
        dataHora: new Date().toLocaleString('pt-BR'),
        pedido: pedido.trim(),
        malote: malote.trim() || undefined,
        cliente: cliente.trim(),
        transportadora,
        valorProduto: parseFloat(valProduto) || 0,
        valorFrete: parseFloat(valFrete) || 0,
        valorTotal: parseFloat(valTotal) || 0,
        estado: estado.trim().toUpperCase() || undefined,
        vendedor: vendedor.trim() || undefined,
        tipo,
        setor,
        motivo,
        acao,
        statusTriagem,
        isParcial,
        itemSinalizado,
        obs: obs.trim() || undefined,
        anexos,
        registradoPor: usuarioLogado.nome,
      };

      await salvarOcorrencia(novaOcorrencia);
      tocarBeep(true);
      onToast('Ocorrência e laudo gravados com sucesso no banco IndexedDB!', 'success');
      limparFormulario();
      onOcorrenciaSalva();
    } catch (err) {
      console.error(err);
      tocarBeep(false);
      onToast('Erro ao salvar ocorrência no banco!', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const limparFormulario = () => {
    setBipInput('');
    setPedido('');
    setMalote('');
    setCliente('');
    setVendedor('');
    setTransportadora('TRANSPORTADORA');
    setValProduto('');
    setValFrete('');
    setValTotal('0.00');
    setEstado('');
    setIsParcial(false);
    setItemParcialNome('');
    setItemParcialQtd(1);
    setTipo('Quebra Operacional');
    setSetor('Laboratorio');
    setMotivo('Frasco Quebrado / Vazamento');
    setAcao('Reenvio (Novo Pedido)');
    setStatusTriagem('Pendente');
    setObs('');
    setAnexos([]);
  };

  return (
    <div className="space-y-6">
      {/* Banner de Importação de Planilha Excel (1125.xlsx) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Base de Pedidos Logística (1125.xlsx)</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Aba 4-Pedidos
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Importa valores de faturamento e frete por pedido para bipagem instantânea.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-400 block font-medium">Cadastrados no Banco</span>
            <span className="text-sm font-bold text-slate-800 font-mono tabular-nums">
              {baseCount.toLocaleString('pt-BR')} pedidos
            </span>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold tracking-wide transition-all shadow-xs">
            <UploadCloud className="w-4 h-4" />
            <span>{isImporting ? 'Processando...' : 'Importar Planilha (XLSX)'}</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              disabled={isImporting}
              onChange={handleExcelUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Formulário Principal de Registro */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Registrar Ocorrência, Quebra ou Devolução
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Operador: <strong className="text-slate-700">{usuarioLogado.nome}</strong>
          </span>
        </div>

        <form onSubmit={handleSubmitOcorrencia} className="p-6 space-y-6">
          {/* Campo Especial de Bipagem */}
          <div className="p-4 rounded-xl bg-amber-50/60 border-2 border-amber-300">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
              <Barcode className="w-4 h-4 text-amber-700" />
              BIPAR OU BUSCAR CÓDIGO DO PEDIDO / MALOTE:
            </label>
            <div className="relative">
              <input
                type="text"
                value={bipInput}
                onChange={(e) => handleBipSearch(e.target.value)}
                onKeyDown={handleBipKeyDown}
                placeholder="Bipe com o leitor ótico ou digite ex: 101409 ou Malote 048935..."
                className="w-full px-4 py-3 bg-white border border-amber-300 rounded-lg text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-wide"
                autoFocus
              />
              <span className="absolute right-3 top-3.5 text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold hidden sm:inline">
                Pressione Enter para confirmar
              </span>
            </div>
          </div>

          {/* Dados do Pedido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nº do Pedido *
              </label>
              <input
                type="text"
                required
                value={pedido}
                onChange={(e) => setPedido(e.target.value)}
                placeholder="Ex: 101409"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nº do Malote
              </label>
              <input
                type="text"
                value={malote}
                onChange={(e) => setMalote(e.target.value)}
                placeholder="Ex: 048935"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cliente / Paciente *
              </label>
              <input
                type="text"
                required
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nome do cliente ou destinatário"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome do Vendedor
              </label>
              <input
                type="text"
                value={vendedor}
                onChange={(e) => setVendedor(e.target.value)}
                placeholder="Vendedor / Consultor da venda"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Transportadora *
              </label>
              <select
                value={transportadora}
                onChange={(e) => setTransportadora(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Valor dos Produtos (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={valProduto}
                onChange={(e) => setValProduto(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Valor do Frete Planilha (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={valFrete}
                onChange={(e) => setValFrete(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Prejuízo Total Bruto (R$)
              </label>
              <input
                type="text"
                readOnly
                value={`R$ ${valTotal}`}
                className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm font-bold text-rose-700 font-mono tracking-wide"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estado (UF)
              </label>
              <input
                type="text"
                maxLength={2}
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                placeholder="Ex: SP"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>
          </div>

          {/* Modalidade de Retorno / Recebimento */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Modalidade de Retorno / Recebimento:
            </span>
            <div className="flex flex-wrap gap-6 text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="radio"
                  name="modalidadeRetorno"
                  checked={!isParcial}
                  onChange={() => setIsParcial(false)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>🔴 Devolução Total do Pedido</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="radio"
                  name="modalidadeRetorno"
                  checked={isParcial}
                  onChange={() => setIsParcial(true)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                <span>⚠️ Devolução Parcial (Sinalizar Produto Específico)</span>
              </label>
            </div>

            {isParcial && (
              <div className="mt-3 p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg space-y-2 animate-in fade-in-50 duration-200">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                  ⚠️ Sinalizar Produto Retornado:
                </label>
                <div className="flex flex-wrap sm:flex-nowrap gap-3">
                  <input
                    type="text"
                    value={itemParcialNome}
                    onChange={(e) => setItemParcialNome(e.target.value)}
                    placeholder="Nome do produto especificamente retornado (ex: Serum Vitamina C 30ml)"
                    className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                  <div className="w-28 shrink-0">
                    <input
                      type="number"
                      min={1}
                      value={itemParcialQtd}
                      onChange={(e) => setItemParcialQtd(parseInt(e.target.value) || 1)}
                      placeholder="Qtd"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-md text-sm text-slate-900 font-mono focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Classificação Técnica & Triagem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tipo de Ocorrência *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="Devolução de Cliente">Devolução de Cliente</option>
                <option value="Quebra Operacional">Quebra Operacional / Avaria</option>
                <option value="Extravio Transporte">Extravio / Sinistro Transporte</option>
                <option value="Desvio Temperatura">Desvio de Temperatura (Gelo)</option>
                <option value="Erro Rótulo/Etiqueta">Erro de Rótulo / Divergência</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Setor Responsável *
              </label>
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="Transportadora">Transportadora (Trânsito)</option>
                <option value="Laboratorio">Laboratório / Manipulação</option>
                <option value="Expedicao">Expedição / Embalagem</option>
                <option value="Cliente">Cliente / Endereço Incorreto</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Motivo Primário *
              </label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="Endereço não localizado / Ausente">Endereço não localizado / Ausente</option>
                <option value="Frasco Quebrado / Vazamento">Frasco Quebrado / Vazamento</option>
                <option value="Recusado pelo cliente">Recusado pelo cliente</option>
                <option value="Temperatura fora do padrão / Gelo derretido">
                  Temperatura fora do padrão / Gelo derretido
                </option>
                <option value="Carga Roubada / Extraviada">Carga Roubada / Extraviada</option>
                <option value="Avariado na Manipulação">Avariado na Manipulação</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ação Tomada *
              </label>
              <select
                value={acao}
                onChange={(e) => setAcao(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="Reenvio (Novo Pedido)">Reenvio (Novo Pedido)</option>
                <option value="Descarte / Lixo Hospitalar">Descarte / Lixo Hospitalar</option>
                <option value="Retorno ao Estoque">Retorno ao Estoque (Íntegro)</option>
                <option value="Cobrança Transportadora">Cobrança de Ressarcimento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status de Triagem *
              </label>
              <select
                value={statusTriagem}
                onChange={(e) => setStatusTriagem(e.target.value as import('../types').StatusTriagem)}
                className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-sm font-bold text-amber-950 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="Pendente">🟡 Pendente (Aguardando)</option>
                <option value="Em Análise">🔵 Em Análise Técnica</option>
                <option value="Aprovado Reenvio">🟢 Aprovado Reenvio</option>
                <option value="Aprovado Descarte">🔴 Aprovado Descarte</option>
                <option value="Concluído">✅ Concluído</option>
              </select>
            </div>
          </div>

          {/* Anexos: Upload de Imagens / Laudos */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-slate-500" />
              Anexar Documentos, Fotos da Avaria ou Laudos Técnicos:
            </label>

            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl p-5 text-center cursor-pointer transition-all block">
              <input
                type="file"
                multiple
                accept="image/*, .pdf, .doc, .docx"
                onChange={handleArquivoSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-1.5">
                <ImageIcon className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-semibold text-slate-700">
                  Clique aqui para selecionar fotos de avarias, laudos ou PDFs
                </span>
                <span className="text-[11px] text-slate-400">
                  Os arquivos serão gravados diretamente no banco IndexedDB local
                </span>
              </div>
            </label>

            {anexos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2.5">
                {anexos.map((a) => {
                  const isImg = a.type.startsWith('image/');
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      {isImg ? (
                        <img
                          src={a.dataUrl}
                          alt={a.name}
                          className="w-8 h-8 rounded object-cover border border-slate-300"
                        />
                      ) : (
                        <FileText className="w-6 h-6 text-slate-500" />
                      )}
                      <span className="max-w-[140px] truncate font-medium text-slate-700" title={a.name}>
                        {a.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removerAnexo(a.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remover anexo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Observações Técnicas Adicionais
            </label>
            <textarea
              rows={2}
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Descreva detalhes específicos da avaria, lote do medicamento, violação da embalagem..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Gravando no Banco...' : 'Gravar Ocorrência com Anexos no Banco'}</span>
            </button>
            <button
              type="button"
              onClick={limparFormulario}
              className="px-5 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Limpar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
