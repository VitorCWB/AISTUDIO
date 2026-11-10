export type UserRole = 'ADM' | 'FARMACEUTICO' | 'OPERADOR';

export type StatusTriagem =
  | 'Pendente'
  | 'Em Análise'
  | 'Aprovado Reenvio'
  | 'Aprovado Descarte'
  | 'Concluído';

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  senha?: string;
  funcao: UserRole;
  ativo: boolean;
}

export interface AnexoItem {
  id: string;
  name: string;
  type: string;
  size?: number;
  dataUrl: string;
}

export interface PedidoBase {
  idAuto?: number;
  pedido: string;
  malote?: string;
  buscaKey: string; // chave normalizada para consulta indexada
  cliente: string;
  transportadora: string;
  produto?: string;
  total: number;
  frete: number;
  estado?: string;
  vendedor?: string;
}

export interface Ocorrencia {
  id: number;
  dataHora: string;
  pedido: string;
  malote?: string;
  cliente: string;
  transportadora: string;
  valorProduto: number;
  valorFrete: number;
  valorTotal: number;
  estado?: string;
  vendedor?: string;
  tipo: string;
  setor: string;
  motivo: string;
  acao: string;
  statusTriagem?: StatusTriagem;
  isParcial: boolean;
  itemSinalizado: string;
  obs?: string;
  anexos: AnexoItem[];
  registradoPor: string;
}

export interface ConfiguracaoTema {
  key: string;
  colorPrimary: string;
  colorAccent: string;
  colorBg: string;
  colorCard: string;
  colorText: string;
  fontFamily: string;
  textTitle: string;
  textSlogan: string;
  tabOcorrencias: string;
  tabDash: string;
  tabHistorico: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  tipo: 'success' | 'error' | 'info';
}

export interface LogAuditoria {
  id?: number;
  ocorrenciaId: number;
  pedido: string;
  statusAnterior: StatusTriagem;
  statusNovo: StatusTriagem;
  usuarioId: number;
  usuarioNome: string;
  usuarioLogin: string;
  usuarioFuncao: UserRole;
  dataHora: string;
  justificativa?: string;
}
