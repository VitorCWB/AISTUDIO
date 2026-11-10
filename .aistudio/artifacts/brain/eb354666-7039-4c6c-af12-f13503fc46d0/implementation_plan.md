# Sistema de Log de Auditoria de Status no IndexedDB — Stin Pharma ERP

Implementação de um motor de auditoria regulatória e rastreabilidade no IndexedDB para registrar de forma imutável todas as transições de status de triagem nas ocorrências, capturando identificador do usuário, nome, papel hierárquico (RBAC), data/hora exata e status anterior/novo, com painel dedicado de visualização restrito a Administradores.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões confirmadas pelo usuário:**
> 1. **Visualização Centralizada**: Os logs de auditoria serão exibidos em uma nova aba do sistema intitulada **"Auditoria & Logs"**, com acesso estritamente restrito a usuários com perfil de **Administrador (ADM)**.
> 2. **Permissão de Alteração de Status (RBAC)**: Apenas usuários com perfil **Administrador (ADM)** e **Farmacêutico** possuem autorização para alterar o status de triagem das ocorrências. Operadores de logística terão visualização do status em modo somente-leitura.

---

### 1. Overview & Core Concept

- **O que faz**: Cria um rastro de conformidade (audit trail) no banco IndexedDB para cada movimentação de status de triagem (ex: *Pendente* ➔ *Em Análise* ➔ *Aprovado Reenvio* / *Aprovado Descarte* / *Concluído*). Toda alteração aciona a gravação automática de um registro indelével contendo:
  - ID da ocorrência e número do pedido
  - Status anterior e novo status aplicado
  - ID, nome e login do usuário autor da mudança
  - Papel hierárquico do usuário (`ADM` ou `FARMACEUTICO`)
  - Timestamp formatado da transição (`DD/MM/AAAA HH:mm:ss`)
- **Público-Alvo**: Administradores da Stin Pharma e auditores farmacêuticos (garantia da qualidade e rastreabilidade ANVISA).
- **Valor Principal**: Conformidade técnica, responsabilização individual e histórico transparente de quem autorizou reenvios ou descartes de medicamentos.

---

### 2. User Experience & Visual Design

- **Fluxos Principais do Usuário**:
  1. *Transição de Status*: Na **Ficha / Laudo Técnico** ou na listagem do **Histórico**, o Farmacêutico ou Administrador seleciona o novo status da ocorrência em um seletor ativo.
  2. *Registro Transparente de Log*: Ao confirmar a alteração, o status da ocorrência é atualizado no IndexedDB e simultaneamente uma entrada de auditoria é gravada na store `logsAuditoria`.
  3. *Bloqueio para Operadores*: Se um Operador abrir a ficha, o controle de status é exibido como um badge fixo sem permissão de alteração.
  4. *Painel de Auditoria do Administrador*: Administradores acessam a nova aba **"Auditoria & Logs"** na barra de navegação, contando com:
     - Tabela em alta densidade com paginação/listagem temporal decrescente.
     - Filtros rápidos por número de pedido, nome de usuário ou tipo de transição.
     - Indicadores visuais claros do fluxo (*De Status A* ➔ *Para Status B*).

- **Identidade Visual & Tabela de Auditoria**:
  - Estilo de console corporativo com tipografia `Plus Jakarta Sans`, números tabulares (`font-mono tabular-nums`), badges de usuário destacados por papel (`ADM` em vermelho, `FARMACEUTICO` em azul).
  - Ícone dedicado de escudo de segurança (`ShieldCheck`) na navegação superior.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Nova Store `logsAuditoria` com Chaves Indexadas**:
  - *Abordagem*: Adicionar a store `logsAuditoria` no IndexedDB com chave primária auto-incrementada e índices `idx_ocorrenciaId`, `idx_usuarioId` e `idx_dataHora`.
  - *Por que*: Separa o ciclo de vida do registro da ocorrência do seu histórico de auditoria, garantindo que mesmo que uma ocorrência seja consultada milhares de vezes, o histórico permaneça leve e auditável.
- **Decisão 2: Enforçamento de Regras de Papel (RBAC)**:
  - *Abordagem*: O seletor de status só dispara a mutação se `usuarioLogado.funcao` for `'ADM'` ou `'FARMACEUTICO'`. Caso contrário, a UI não renderiza o dropdown interativo.
  - *Por que*: Respeita a governança de que operadores registram quebras/bipagens, enquanto farmacêuticos e administradores deliberam sobre o destino dos lotes.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌────────────────────────────────────────────────────────┐
│         Ação: Farmacêutico / ADM Altera Status         │
│          (Ficha Técnica ou Tabela de Ocorrências)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            atualizarStatusOcorrenciaComLog()           │
│                                                        │
│   1. Atualiza campo statusTriagem em 'ocorrencias'     │
│   2. Cria registro em 'logsAuditoria':                 │
│      • id: autoIncrement                               │
│      • ocorrenciaId & pedido                           │
│      • statusAnterior & statusNovo                     │
│      • usuarioId, usuarioNome, usuarioFuncao           │
│      • dataHora: timestamp formatado                   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            Aba Exclusiva ADM: AuditoriaTab             │
│   • Listagem temporal com filtro de busca              │
│   • Histórico de transições de status auditáveis       │
└────────────────────────────────────────────────────────┘
```

#### Arquivos Envolvidos na Implementação:
1. `src/types.ts`: Adição da interface `LogAuditoria`.
2. `src/db/indexedDb.ts`: Criação da store `logsAuditoria` e métodos `registrarLogAuditoria`, `obterLogsAuditoria`, `atualizarStatusOcorrenciaComLog`.
3. `src/components/NavigationTabs.tsx`: Adição da aba `tab-auditoria` disponível exclusivamente para `ADM`.
4. `src/components/FichaModal.tsx`: Componente de alteração de status com gravação de log direto e bloqueio para Operadores.
5. `src/components/AuditoriaTab.tsx`: Nova visão de console com tabela filtrável de auditoria.
6. `src/App.tsx`: Conexão do novo fluxo e gerenciamento de permissões.
