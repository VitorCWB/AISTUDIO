import { ConfiguracaoTema, LogAuditoria, Ocorrencia, PedidoBase, StatusTriagem, Usuario } from '../types';

const DB_NAME = 'StinPharmaDB';
const DB_VERSION = 3;

export const CONFIG_PADRAO: ConfiguracaoTema = {
  key: 'themeConfig',
  colorPrimary: '#0f172a',
  colorAccent: '#2563eb',
  colorBg: '#f8fafc',
  colorCard: '#ffffff',
  colorText: '#1e293b',
  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
  textTitle: 'Stin Pharma ERP',
  textSlogan: 'Central de Avarias & Gestão Logística',
  tabOcorrencias: 'Central de Ocorrências',
  tabDash: 'Dashboard KPIs',
  tabHistorico: 'Histórico & Fichas',
};

const USUARIOS_PADRAO: Usuario[] = [
  { id: 1, nome: 'Administrador Geral', login: 'admin', senha: 'admin123', funcao: 'ADM', ativo: true },
  { id: 2, nome: 'Dra. Beatriz Santos', login: 'farma', senha: '1234', funcao: 'FARMACEUTICO', ativo: true },
  { id: 3, nome: 'Carlos Oliveira', login: 'operador', senha: '1234', funcao: 'OPERADOR', ativo: true },
];

const LOGS_AMOSTRA: LogAuditoria[] = [
  {
    id: 1,
    ocorrenciaId: 1700000000001,
    pedido: '101409',
    statusAnterior: 'Pendente',
    statusNovo: 'Aprovado Reenvio',
    usuarioId: 2,
    usuarioNome: 'Dra. Beatriz Santos',
    usuarioLogin: 'farma',
    usuarioFuncao: 'FARMACEUTICO',
    dataHora: '28/10/2026 11:30:15',
    justificativa: 'Medicamento urgente para tratamento contínuo do paciente; manipulado novo lote.',
  },
  {
    id: 2,
    ocorrenciaId: 1700000000002,
    pedido: '102550',
    statusAnterior: 'Em Análise',
    statusNovo: 'Aprovado Descarte',
    usuarioId: 2,
    usuarioNome: 'Dra. Beatriz Santos',
    usuarioLogin: 'farma',
    usuarioFuncao: 'FARMACEUTICO',
    dataHora: '29/10/2026 15:45:00',
    justificativa: 'Temperatura violada (gelo derretido); laudo técnico determinou incineração hospitalar.',
  },
  {
    id: 3,
    ocorrenciaId: 1700000000005,
    pedido: '104615',
    statusAnterior: 'Pendente',
    statusNovo: 'Concluído',
    usuarioId: 1,
    usuarioNome: 'Administrador Geral',
    usuarioLogin: 'admin',
    usuarioFuncao: 'ADM',
    dataHora: '03/11/2026 14:10:22',
    justificativa: 'Conferência física atestou lacre intacto e retorno ao armazém concluído.',
  },
];

const OCORRENCIAS_AMOSTRA: Ocorrencia[] = [
  {
    id: 1700000000001,
    dataHora: '28/10/2026 10:15:00',
    pedido: '101409',
    malote: '048935',
    cliente: 'GISELLY DE FATIMA MENDES PASCOAL',
    transportadora: 'MOTOBOY',
    valorProduto: 1984.62,
    valorFrete: 45.0,
    valorTotal: 2029.62,
    estado: 'SP',
    isParcial: false,
    itemSinalizado: 'Devolução Total',
    tipo: 'Quebra Operacional',
    setor: 'Laboratorio',
    motivo: 'Frasco Quebrado / Vazamento',
    acao: 'Reenvio (Novo Pedido)',
    statusTriagem: 'Aprovado Reenvio',
    obs: 'Frasco danificado durante a manipulação interna no laboratório.',
    anexos: [],
    registradoPor: 'Dra. Beatriz Santos',
  },
  {
    id: 1700000000002,
    dataHora: '29/10/2026 14:30:00',
    pedido: '102550',
    malote: '051204',
    cliente: 'CLINICA DERMATOLOGICA ALPHA LTDA',
    transportadora: 'AZUL AEREAS',
    valorProduto: 3420.0,
    valorFrete: 110.0,
    valorTotal: 3530.0,
    estado: 'RJ',
    isParcial: true,
    itemSinalizado: '⚠️ PARCIAL: Serum Anti-Idade 50ml (2 un)',
    tipo: 'Devolução de Cliente',
    setor: 'Transportadora',
    motivo: 'Temperatura fora do padrão / Gelo derretido',
    acao: 'Descarte / Lixo Hospitalar',
    statusTriagem: 'Aprovado Descarte',
    obs: 'Carga retida no aeroporto, barreira térmica violada.',
    anexos: [],
    registradoPor: 'Carlos Oliveira',
  },
  {
    id: 1700000000003,
    dataHora: '30/10/2026 09:10:00',
    pedido: '103112',
    malote: '049870',
    cliente: 'FARMACIA NATURALIS BIO LTDA',
    transportadora: 'SEDEX',
    valorProduto: 1250.0,
    valorFrete: 58.5,
    valorTotal: 1308.5,
    estado: 'MG',
    isParcial: false,
    itemSinalizado: 'Devolução Total',
    tipo: 'Extravio Transporte',
    setor: 'Transportadora',
    motivo: 'Carga Roubada / Extraviada',
    acao: 'Cobrança Transportadora',
    statusTriagem: 'Em Análise',
    obs: 'Sinistro aberto junto aos Correios para ressarcimento integral.',
    anexos: [],
    registradoPor: 'Carlos Oliveira',
  },
  {
    id: 1700000000004,
    dataHora: '02/11/2026 16:45:00',
    pedido: '104088',
    malote: '052190',
    cliente: 'HOSPITAL SÃO LUCAS - ONCOLOGIA',
    transportadora: 'ATIVA',
    valorProduto: 4890.0,
    valorFrete: 145.0,
    valorTotal: 5035.0,
    estado: 'PR',
    isParcial: false,
    itemSinalizado: 'Devolução Total',
    tipo: 'Desvio Temperatura',
    setor: 'Transportadora',
    motivo: 'Temperatura fora do padrão / Gelo derretido',
    acao: 'Descarte / Lixo Hospitalar',
    statusTriagem: 'Pendente',
    obs: 'Data logger registrou 18°C durante o trajeto (limite de 2°C a 8°C).',
    anexos: [],
    registradoPor: 'Dra. Beatriz Santos',
  },
  {
    id: 1700000000005,
    dataHora: '03/11/2026 11:20:00',
    pedido: '104615',
    malote: '053012',
    cliente: 'DRA. PATRICIA RESENDE',
    transportadora: 'MOTOBOY',
    valorProduto: 820.0,
    valorFrete: 35.0,
    valorTotal: 855.0,
    estado: 'SP',
    isParcial: false,
    itemSinalizado: 'Devolução Total',
    tipo: 'Erro Rótulo/Etiqueta',
    setor: 'Expedicao',
    motivo: 'Endereço não localizado / Ausente',
    acao: 'Retorno ao Estoque',
    statusTriagem: 'Concluído',
    obs: 'Medicamento retornou com integridade mantida e selo inviolado.',
    anexos: [],
    registradoPor: 'Carlos Oliveira',
  },
];

let dbInstance: IDBDatabase | null = null;

export function getIndexedDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;

      // 1. Store: pedidosBase (com índices explícitos para pesquisa veloz)
      let pedidosStore: IDBObjectStore;
      if (!db.objectStoreNames.contains('pedidosBase')) {
        pedidosStore = db.createObjectStore('pedidosBase', { keyPath: 'idAuto', autoIncrement: true });
      } else {
        pedidosStore = (request.transaction as IDBTransaction).objectStore('pedidosBase');
      }

      if (!pedidosStore.indexNames.contains('idx_pedido')) {
        pedidosStore.createIndex('idx_pedido', 'pedido', { unique: false });
      }
      if (!pedidosStore.indexNames.contains('idx_malote')) {
        pedidosStore.createIndex('idx_malote', 'malote', { unique: false });
      }
      if (!pedidosStore.indexNames.contains('idx_buscaKey')) {
        pedidosStore.createIndex('idx_buscaKey', 'buscaKey', { unique: false });
      }

      // 2. Store: ocorrencias
      let ocorrenciasStore: IDBObjectStore;
      if (!db.objectStoreNames.contains('ocorrencias')) {
        ocorrenciasStore = db.createObjectStore('ocorrencias', { keyPath: 'id' });
      } else {
        ocorrenciasStore = (request.transaction as IDBTransaction).objectStore('ocorrencias');
      }

      if (!ocorrenciasStore.indexNames.contains('idx_pedido')) {
        ocorrenciasStore.createIndex('idx_pedido', 'pedido', { unique: false });
      }
      if (!ocorrenciasStore.indexNames.contains('idx_transportadora')) {
        ocorrenciasStore.createIndex('idx_transportadora', 'transportadora', { unique: false });
      }
      if (!ocorrenciasStore.indexNames.contains('idx_dataHora')) {
        ocorrenciasStore.createIndex('idx_dataHora', 'dataHora', { unique: false });
      }

      // 3. Store: usuarios
      let usuariosStore: IDBObjectStore;
      if (!db.objectStoreNames.contains('usuarios')) {
        usuariosStore = db.createObjectStore('usuarios', { keyPath: 'id' });
      } else {
        usuariosStore = (request.transaction as IDBTransaction).objectStore('usuarios');
      }
      if (!usuariosStore.indexNames.contains('idx_login')) {
        usuariosStore.createIndex('idx_login', 'login', { unique: true });
      }

      // 4. Store: configuracoes
      if (!db.objectStoreNames.contains('configuracoes')) {
        db.createObjectStore('configuracoes', { keyPath: 'key' });
      }

      // 5. Store: logsAuditoria (Histórico imutável de transição de status)
      let logsStore: IDBObjectStore;
      if (!db.objectStoreNames.contains('logsAuditoria')) {
        logsStore = db.createObjectStore('logsAuditoria', { keyPath: 'id', autoIncrement: true });
      } else {
        logsStore = (request.transaction as IDBTransaction).objectStore('logsAuditoria');
      }
      if (!logsStore.indexNames.contains('idx_ocorrenciaId')) {
        logsStore.createIndex('idx_ocorrenciaId', 'ocorrenciaId', { unique: false });
      }
      if (!logsStore.indexNames.contains('idx_usuarioId')) {
        logsStore.createIndex('idx_usuarioId', 'usuarioId', { unique: false });
      }
      if (!logsStore.indexNames.contains('idx_dataHora')) {
        logsStore.createIndex('idx_dataHora', 'dataHora', { unique: false });
      }
    };

    request.onsuccess = async (e) => {
      dbInstance = (e.target as IDBOpenDBRequest).result;
      await inicializarDadosPadrao(dbInstance);
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      console.error('Erro ao abrir IndexedDB:', e);
      reject((e.target as IDBOpenDBRequest).error);
    };
  });
}

async function inicializarDadosPadrao(db: IDBDatabase) {
  // Inicializar usuários padrão se estiver vazio
  const txUsers = db.transaction(['usuarios'], 'readwrite');
  const userStore = txUsers.objectStore('usuarios');
  const countReq = userStore.count();
  countReq.onsuccess = () => {
    if (countReq.result === 0) {
      USUARIOS_PADRAO.forEach((u) => userStore.put(u));
    }
  };

  // Inicializar ocorrências de amostra se vazio
  const txOc = db.transaction(['ocorrencias'], 'readwrite');
  const ocStore = txOc.objectStore('ocorrencias');
  const ocCountReq = ocStore.count();
  ocCountReq.onsuccess = () => {
    if (ocCountReq.result === 0) {
      OCORRENCIAS_AMOSTRA.forEach((o) => ocStore.put(o));
    }
  };

  // Inicializar configuração de tema se não existir
  const txCfg = db.transaction(['configuracoes'], 'readwrite');
  const cfgStore = txCfg.objectStore('configuracoes');
  const cfgGetReq = cfgStore.get('themeConfig');
  cfgGetReq.onsuccess = () => {
    if (!cfgGetReq.result) {
      cfgStore.put(CONFIG_PADRAO);
    }
  };

  // Inicializar logs de auditoria se vazio
  if (db.objectStoreNames.contains('logsAuditoria')) {
    const txLog = db.transaction(['logsAuditoria'], 'readwrite');
    const logStore = txLog.objectStore('logsAuditoria');
    const logCountReq = logStore.count();
    logCountReq.onsuccess = () => {
      if (logCountReq.result === 0) {
        LOGS_AMOSTRA.forEach((l) => logStore.add(l));
      }
    };
  }
}

// -------------------------------------------------------------
// CONSULTA INDEXADA VELOZ (CORREÇÃO DO ERRO DE INDEXAÇÃO)
// -------------------------------------------------------------
export async function buscarPedidoPorIndice(termo: string): Promise<PedidoBase | null> {
  const db = await getIndexedDB();
  const query = termo.trim();
  if (!query) return null;

  const queryClean = query.toLowerCase();
  const queryDigitsOnly = query.replace(/\D/g, '');

  return new Promise((resolve) => {
    const tx = db.transaction(['pedidosBase'], 'readonly');
    const store = tx.objectStore('pedidosBase');

    // 1. Tentar busca direta no índice idx_pedido
    const idxPedido = store.index('idx_pedido');
    const reqPedido = idxPedido.get(query);

    reqPedido.onsuccess = () => {
      if (reqPedido.result) {
        return resolve(reqPedido.result);
      }

      // Se tem apenas dígitos (ex: "101409"), tentar sem formatação
      if (queryDigitsOnly && queryDigitsOnly !== query) {
        const reqDigits = idxPedido.get(queryDigitsOnly);
        reqDigits.onsuccess = () => {
          if (reqDigits.result) return resolve(reqDigits.result);
          prosseguirParaMalote();
        };
        reqDigits.onerror = () => prosseguirParaMalote();
      } else {
        prosseguirParaMalote();
      }
    };

    reqPedido.onerror = () => prosseguirParaMalote();

    function prosseguirParaMalote() {
      // 2. Tentar busca direta no índice idx_malote
      const idxMalote = store.index('idx_malote');
      const reqMalote = idxMalote.get(query);

      reqMalote.onsuccess = () => {
        if (reqMalote.result) return resolve(reqMalote.result);

        // Se o malote tiver zeros à esquerda, testar com/sem padding
        if (queryDigitsOnly) {
          const padded = queryDigitsOnly.padStart(6, '0');
          const reqPadded = idxMalote.get(padded);
          reqPadded.onsuccess = () => {
            if (reqPadded.result) return resolve(reqPadded.result);
            prosseguirParaBuscaKey();
          };
          reqPadded.onerror = () => prosseguirParaBuscaKey();
        } else {
          prosseguirParaBuscaKey();
        }
      };

      reqMalote.onerror = () => prosseguirParaBuscaKey();
    }

    function prosseguirParaBuscaKey() {
      // 3. Tentar busca no índice idx_buscaKey (normalizado)
      const idxBuscaKey = store.index('idx_buscaKey');
      const reqBuscaKey = idxBuscaKey.get(queryClean);

      reqBuscaKey.onsuccess = () => {
        if (reqBuscaKey.result) return resolve(reqBuscaKey.result);

        // 4. Cursor indexado para prefixos / contenção
        const range = IDBKeyRange.bound(queryClean, queryClean + '\uffff', false, false);
        const cursorReq = idxBuscaKey.openCursor(range);

        cursorReq.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            resolve(cursor.value);
          } else {
            // Último recurso: cursor geral no store
            const fullScanReq = store.openCursor();
            fullScanReq.onsuccess = (ev) => {
              const fullCursor = (ev.target as IDBRequest<IDBCursorWithValue>).result;
              if (fullCursor) {
                const item: PedidoBase = fullCursor.value;
                const p = (item.pedido || '').toLowerCase();
                const m = (item.malote || '').toLowerCase();
                const c = (item.cliente || '').toLowerCase();
                if (p.includes(queryClean) || m.includes(queryClean) || c.includes(queryClean)) {
                  resolve(item);
                } else {
                  fullCursor.continue();
                }
              } else {
                resolve(null);
              }
            };
            fullScanReq.onerror = () => resolve(null);
          }
        };

        cursorReq.onerror = () => resolve(null);
      };

      reqBuscaKey.onerror = () => resolve(null);
    }
  });
}

// -------------------------------------------------------------
// OPERAÇÕES DE PEDIDOS BASE (IMPORTAÇÃO EXCEL)
// -------------------------------------------------------------
export async function obterContagemPedidos(): Promise<number> {
  const db = await getIndexedDB();
  return new Promise((resolve) => {
    const tx = db.transaction(['pedidosBase'], 'readonly');
    const store = tx.objectStore('pedidosBase');
    const req = store.count();
    req.onsuccess = () => resolve(req.result || 0);
    req.onerror = () => resolve(0);
  });
}

export async function importarPedidosEmLote(pedidos: PedidoBase[]): Promise<number> {
  const db = await getIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['pedidosBase'], 'readwrite');
    const store = tx.objectStore('pedidosBase');

    // Limpa base anterior para evitar duplicatas ao importar nova planilha
    store.clear();

    pedidos.forEach((p) => {
      // Normalização da chave de busca para índice
      const buscaKey = `${p.pedido || ''} ${p.malote || ''}`.trim().toLowerCase();
      store.add({ ...p, buscaKey });
    });

    tx.oncomplete = () => resolve(pedidos.length);
    tx.onerror = () => reject(tx.error);
  });
}

export async function limparPedidosBase(): Promise<void> {
  const db = await getIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['pedidosBase'], 'readwrite');
    tx.objectStore('pedidosBase').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// -------------------------------------------------------------
// OPERAÇÕES DE OCORRÊNCIAS
// -------------------------------------------------------------
export async function salvarOcorrencia(oc: Ocorrencia): Promise<void> {
  const db = await getIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['ocorrencias'], 'readwrite');
    const store = tx.objectStore('ocorrencias');
    store.put(oc);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function obterOcorrencias(): Promise<Ocorrencia[]> {
  const db = await getIndexedDB();
  return new Promise((resolve) => {
    const tx = db.transaction(['ocorrencias'], 'readonly');
    const store = tx.objectStore('ocorrencias');
    const req = store.getAll();
    req.onsuccess = () => {
      const list: Ocorrencia[] = (req.result || []).map((item: Ocorrencia) => ({
        ...item,
        statusTriagem: item.statusTriagem || 'Pendente',
      }));
      // Ordenar por ID decrescente (mais recentes primeiro)
      list.sort((a, b) => b.id - a.id);
      resolve(list);
    };
    req.onerror = () => resolve([]);
  });
}

export async function excluirOcorrencia(id: number): Promise<void> {
  const db = await getIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['ocorrencias'], 'readwrite');
    tx.objectStore('ocorrencias').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function limparTodasOcorrencias(): Promise<void> {
  const db = await getIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['ocorrencias'], 'readwrite');
    tx.objectStore('ocorrencias').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// -------------------------------------------------------------
// OPERAÇÕES DE USUÁRIOS
// -------------------------------------------------------------
export async function obterUsuarios(): Promise<Usuario[]> {
  const db = await getIndexedDB();
  return new Promise((resolve) => {
    const tx = db.transaction(['usuarios'], 'readonly');
    const req = tx.objectStore('usuarios').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

export async function salvarUsuario(usuario: Usuario): Promise<void> {
  const db = await getIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['usuarios'], 'readwrite');
    tx.objectStore('usuarios').put(usuario);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function alternarStatusUsuario(id: number): Promise<Usuario | null> {
  const db = await getIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['usuarios'], 'readwrite');
    const store = tx.objectStore('usuarios');
    const req = store.get(id);

    req.onsuccess = () => {
      const user = req.result as Usuario | undefined;
      if (!user) return resolve(null);
      user.ativo = !user.ativo;
      store.put(user);
      tx.oncomplete = () => resolve(user);
    };

    req.onerror = () => reject(req.error);
  });
}

// -------------------------------------------------------------
// OPERAÇÕES DE CONFIGURAÇÃO / TEMA
// -------------------------------------------------------------
export async function obterConfiguracoes(): Promise<ConfiguracaoTema> {
  const db = await getIndexedDB();
  return new Promise((resolve) => {
    const tx = db.transaction(['configuracoes'], 'readonly');
    const req = tx.objectStore('configuracoes').get('themeConfig');
    req.onsuccess = () => resolve(req.result || CONFIG_PADRAO);
    req.onerror = () => resolve(CONFIG_PADRAO);
  });
}

export async function salvarConfiguracoes(config: ConfiguracaoTema): Promise<void> {
  const db = await getIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['configuracoes'], 'readwrite');
    tx.objectStore('configuracoes').put(config);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// -------------------------------------------------------------
// OPERAÇÕES DE LOGS DE AUDITORIA
// -------------------------------------------------------------
export async function obterLogsAuditoria(): Promise<LogAuditoria[]> {
  const db = await getIndexedDB();
  return new Promise((resolve) => {
    if (!db.objectStoreNames.contains('logsAuditoria')) {
      return resolve([]);
    }
    const tx = db.transaction(['logsAuditoria'], 'readonly');
    const store = tx.objectStore('logsAuditoria');
    const req = store.getAll();
    req.onsuccess = () => {
      const logs: LogAuditoria[] = req.result || [];
      // Ordenar decrescente pelo ID / timestamp (mais recentes primeiro)
      logs.sort((a, b) => (b.id || 0) - (a.id || 0));
      resolve(logs);
    };
    req.onerror = () => resolve([]);
  });
}

export async function registrarLogAuditoria(log: LogAuditoria): Promise<void> {
  const db = await getIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['logsAuditoria'], 'readwrite');
    const store = tx.objectStore('logsAuditoria');
    store.add(log);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function atualizarStatusOcorrenciaComLog(
  ocorrenciaId: number,
  statusNovo: StatusTriagem,
  usuario: Usuario,
  justificativa?: string
): Promise<Ocorrencia | null> {
  const db = await getIndexedDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['ocorrencias', 'logsAuditoria'], 'readwrite');
    const ocStore = tx.objectStore('ocorrencias');
    const logStore = tx.objectStore('logsAuditoria');

    const getReq = ocStore.get(ocorrenciaId);

    getReq.onsuccess = () => {
      const oc = getReq.result as Ocorrencia | undefined;
      if (!oc) {
        return resolve(null);
      }

      const statusAnterior = (oc.statusTriagem || 'Pendente') as StatusTriagem;

      // Se não mudou o status, não gera log desnecessário
      if (statusAnterior === statusNovo) {
        return resolve(oc);
      }

      oc.statusTriagem = statusNovo;
      ocStore.put(oc);

      const novoLog: LogAuditoria = {
        ocorrenciaId: oc.id,
        pedido: oc.pedido,
        statusAnterior,
        statusNovo,
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        usuarioLogin: usuario.login,
        usuarioFuncao: usuario.funcao,
        dataHora: new Date().toLocaleString('pt-BR'),
        justificativa: justificativa?.trim() || undefined,
      };

      logStore.add(novoLog);

      tx.oncomplete = () => resolve(oc);
    };

    tx.onerror = () => reject(tx.error);
  });
}

