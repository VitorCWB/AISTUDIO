import React, { useState, useMemo } from 'react';
import { Ocorrencia, StatusTriagem } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  DollarSign,
  Truck,
  Layers,
  TrendingUp,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface DashboardTabProps {
  ocorrencias: Ocorrencia[];
}

const CORES_STATUS: Record<string, string> = {
  Pendente: '#f59e0b', // Âmbar
  'Em Análise': '#6366f1', // Índigo
  'Aprovado Reenvio': '#2563eb', // Azul
  'Aprovado Descarte': '#ef4444', // Vermelho
  Concluído: '#10b981', // Verde
};

const CORES_TIPOS: Record<string, string> = {
  'Quebra Operacional': '#dc2626',
  'Devolução de Cliente': '#2563eb',
  'Extravio Transporte': '#9333ea',
  'Desvio Temperatura': '#d97706',
  'Erro Rótulo/Etiqueta': '#0891b2',
};

// Tooltip personalizada elegante com formatação em Real brasileiro
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    payload?: any;
  }>;
  label?: string;
}

const CustomBarTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as {
      nome: string;
      quantidade: number;
      valorTotal: number;
    };

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
        <p className="font-bold text-slate-200 border-b border-slate-700/80 pb-1">{label || data.nome}</p>
        <div className="flex justify-between items-center text-slate-300">
          <span>Ocorrências:</span>
          <span className="font-bold font-mono text-white">{data.quantidade}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Prejuízo Total:</span>
          <span className="font-bold font-mono text-rose-400">
            R$ {data.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const data = item.payload as { name: string; value: number; totalValor?: number };
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1 min-w-[180px]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <p className="font-bold text-slate-200">{data.name}</p>
        </div>
        <div className="flex justify-between text-slate-300 pt-1">
          <span>Quantidade:</span>
          <span className="font-bold font-mono text-white">{data.value}</span>
        </div>
        {data.totalValor !== undefined && data.totalValor > 0 && (
          <div className="flex justify-between text-slate-300">
            <span>Prejuízo:</span>
            <span className="font-bold font-mono text-rose-400">
              R$ {data.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const DashboardTab: React.FC<DashboardTabProps> = ({ ocorrencias }) => {
  const [filtroTriagem, setFiltroTriagem] = useState<string>('TODOS');

  // Filtra as ocorrências se um status for selecionado
  const ocorrenciasFiltradas = useMemo(() => {
    if (filtroTriagem === 'TODOS') return ocorrencias;
    return ocorrencias.filter((o) => (o.statusTriagem || 'Pendente') === filtroTriagem);
  }, [ocorrencias, filtroTriagem]);

  // Métricas Consolidadas
  const metricas = useMemo(() => {
    let totalPrejuizo = 0;
    let totalFrete = 0;
    let parciaisCount = 0;
    let totaisCount = 0;

    const mapaTransp: Record<string, { quantidade: number; valorTotal: number }> = {};
    const mapaTipos: Record<string, { quantidade: number; valorTotal: number }> = {};
    const mapaStatus: Record<string, { quantidade: number; valorTotal: number }> = {
      Pendente: { quantidade: 0, valorTotal: 0 },
      'Em Análise': { quantidade: 0, valorTotal: 0 },
      'Aprovado Reenvio': { quantidade: 0, valorTotal: 0 },
      'Aprovado Descarte': { quantidade: 0, valorTotal: 0 },
      Concluído: { quantidade: 0, valorTotal: 0 },
    };

    ocorrenciasFiltradas.forEach((o) => {
      const vTotal = o.valorTotal || 0;
      const vFrete = o.valorFrete || 0;

      totalPrejuizo += vTotal;
      totalFrete += vFrete;

      if (o.isParcial) {
        parciaisCount++;
      } else {
        totaisCount++;
      }

      // Por Transportadora
      const transp = o.transportadora || 'NÃO INFORMADA';
      if (!mapaTransp[transp]) {
        mapaTransp[transp] = { quantidade: 0, valorTotal: 0 };
      }
      mapaTransp[transp].quantidade += 1;
      mapaTransp[transp].valorTotal += vTotal;

      // Por Tipo de Ocorrência
      const tipo = o.tipo || 'Outro';
      if (!mapaTipos[tipo]) {
        mapaTipos[tipo] = { quantidade: 0, valorTotal: 0 };
      }
      mapaTipos[tipo].quantidade += 1;
      mapaTipos[tipo].valorTotal += vTotal;

      // Por Status de Triagem
      const st = o.statusTriagem || 'Pendente';
      if (!mapaStatus[st]) {
        mapaStatus[st] = { quantidade: 0, valorTotal: 0 };
      }
      mapaStatus[st].quantidade += 1;
      mapaStatus[st].valorTotal += vTotal;
    });

    // Top Transportadora
    let topTranspNome = '-';
    let topTranspValor = 0;
    Object.entries(mapaTransp).forEach(([t, val]) => {
      if (val.valorTotal > topTranspValor) {
        topTranspValor = val.valorTotal;
        topTranspNome = t;
      }
    });

    // Formatar Dados para Recharts
    const dataTipos = Object.entries(mapaTipos).map(([nome, d]) => ({
      nome,
      quantidade: d.quantidade,
      valorTotal: d.valorTotal,
    }));

    const dataStatus = Object.entries(mapaStatus)
      .map(([nome, d]) => ({
        name: nome,
        value: d.quantidade,
        totalValor: d.valorTotal,
      }))
      .filter((item) => item.value > 0);

    const dataTransp = Object.entries(mapaTransp)
      .map(([nome, d]) => ({
        nome,
        valorTotal: d.valorTotal,
        quantidade: d.quantidade,
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal);

    const dataModalidade = [
      { name: 'Devolução Total', value: totaisCount, color: '#ef4444' },
      { name: 'Devolução Parcial', value: parciaisCount, color: '#f59e0b' },
    ].filter((item) => item.value > 0);

    return {
      totalPrejuizo,
      totalFrete,
      parciaisCount,
      totaisCount,
      topTranspNome,
      topTranspValor,
      dataTipos,
      dataStatus,
      dataTransp,
      dataModalidade,
    };
  }, [ocorrenciasFiltradas]);

  return (
    <div className="space-y-6">
      {/* Barra de Filtro de Triagem */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Filtro por Status de Triagem:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFiltroTriagem('TODOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroTriagem === 'TODOS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({ocorrencias.length})
          </button>
          <button
            onClick={() => setFiltroTriagem('Pendente')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroTriagem === 'Pendente'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            🟡 Pendente
          </button>
          <button
            onClick={() => setFiltroTriagem('Em Análise')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroTriagem === 'Em Análise'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            🔵 Em Análise
          </button>
          <button
            onClick={() => setFiltroTriagem('Aprovado Reenvio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroTriagem === 'Aprovado Reenvio'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            🟢 Aprovado Reenvio
          </button>
          <button
            onClick={() => setFiltroTriagem('Aprovado Descarte')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroTriagem === 'Aprovado Descarte'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            🔴 Aprovado Descarte
          </button>
          <button
            onClick={() => setFiltroTriagem('Concluído')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filtroTriagem === 'Concluído'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            ✅ Concluído
          </button>
        </div>
      </div>

      {/* Grade de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Prejuízo Acumulado */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Prejuízo no Recorte</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            R$ {metricas.totalPrejuizo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Produtos + fretes de {ocorrenciasFiltradas.length} caso(s)</p>
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600" />
        </div>

        {/* KPI 2: Frete Perdido */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Frete Desperdiçado</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            R$ {metricas.totalFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Custo logístico faturado sem sucesso</p>
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
        </div>

        {/* KPI 3: Devoluções Parciais vs Totais */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Parciais vs Totais</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {metricas.parciaisCount} <span className="text-xs font-semibold text-slate-400">parciais</span> / {metricas.totaisCount}{' '}
            <span className="text-xs font-semibold text-slate-400">totais</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Segregação por modalidade de entrega</p>
          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600" />
        </div>

        {/* KPI 4: Top Transportadora em Perdas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Top Transportadora</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 truncate" title={metricas.topTranspNome}>
            {metricas.topTranspNome}
          </div>
          <p className="text-xs font-semibold text-rose-600 font-mono mt-1">
            R$ {metricas.topTranspValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em avarias
          </p>
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
        </div>
      </div>

      {/* Gráficos Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Ocorrências por Tipo (Recharts BarChart) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Ocorrências por Tipo (Quebras, Avarias & Devoluções)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Volumetria e prejuízo financeiro acumulado por natureza de sinistro
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {metricas.dataTipos.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Nenhum dado registrado para o filtro selecionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricas.dataTipos} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="nome"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(val) => `R$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="quantidade"
                    name="Qtd Ocorrências"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="valorTotal"
                    name="Prejuízo (R$)"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 2: Distribuição por Status de Triagem (Recharts PieChart / Donut) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Distribuição do Fluxo de Triagem Operacional
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Situação atual dos pacotes na triagem farmacêutica e logística
              </p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {metricas.dataStatus.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Nenhum dado registrado para o filtro selecionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: 11, lineHeight: '22px' }}
                  />
                  <Pie
                    data={metricas.dataStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="40%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {metricas.dataStatus.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={CORES_STATUS[entry.name] || '#94a3b8'}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 3: Perdas Financeiras por Transportadora (Recharts Horizontal BarChart) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Prejuízo Acumulado por Transportadora (R$)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ranking de perdas financeiras em produtos e fretes desperdiçados
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {metricas.dataTransp.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Nenhuma ocorrência registrada.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metricas.dataTransp}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(val) => `R$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                    width={90}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="valorTotal"
                    name="Prejuízo (R$)"
                    fill="#2563eb"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 4: Proporção Modalidade Retorno (Recharts Donut) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Proporção: Devolução Total vs. Devolução Parcial
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Segregação de integridade do pacote retornado
              </p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {metricas.dataModalidade.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Nenhum dado registrado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                  />
                  <Pie
                    data={metricas.dataModalidade}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {metricas.dataModalidade.map((entry) => (
                      <Cell
                        key={`modalidade-${entry.name}`}
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
