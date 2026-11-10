import React, { useState, useEffect, useCallback } from 'react';
import { ConfiguracaoTema, LogAuditoria, Ocorrencia, ToastMessage, Usuario } from './types';
import {
  CONFIG_PADRAO,
  getIndexedDB,
  obterConfiguracoes,
  obterLogsAuditoria,
  obterOcorrencias,
  obterUsuarios,
} from './db/indexedDb';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { NavigationTabs, TabId } from './components/NavigationTabs';
import { OcorrenciasTab } from './components/OcorrenciasTab';
import { DashboardTab } from './components/DashboardTab';
import { HistoricoTab } from './components/HistoricoTab';
import { FichaModal } from './components/FichaModal';
import { AuditoriaTab } from './components/AuditoriaTab';
import { UsuariosTab } from './components/UsuariosTab';
import { AdmConfigTab } from './components/AdmConfigTab';
import { Toast } from './components/Toast';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('tab-ocorrencias');
  const [configTema, setConfigTema] = useState<ConfiguracaoTema>(CONFIG_PADRAO);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [logsAuditoria, setLogsAuditoria] = useState<LogAuditoria[]>([]);
  const [fichaModal, setFichaModal] = useState<Ocorrencia | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Inicialização do IndexedDB e carregamento inicial
  useEffect(() => {
    async function inicializar() {
      try {
        await getIndexedDB();
        setIsDbReady(true);
        await recarregarTudo();
      } catch (err) {
        console.error('Falha ao inicializar o banco IndexedDB:', err);
      }
    }
    inicializar();
  }, []);

  const adicionarToast = useCallback((message: string, tipo: 'success' | 'error' | 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const descartarToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const recarregarTudo = async () => {
    try {
      const [cfg, usrs, ocs, logs] = await Promise.all([
        obterConfiguracoes(),
        obterUsuarios(),
        obterOcorrencias(),
        obterLogsAuditoria(),
      ]);
      setConfigTema(cfg);
      setUsuarios(usrs);
      setOcorrencias(ocs);
      setLogsAuditoria(logs);
      aplicarTemaCss(cfg);
    } catch (err) {
      console.error('Erro ao recarregar dados do IndexedDB:', err);
    }
  };

  const aplicarTemaCss = (cfg: ConfiguracaoTema) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', cfg.colorPrimary);
    root.style.setProperty('--accent-color', cfg.colorAccent);
    root.style.setProperty('--bg-color', cfg.colorBg);
    root.style.setProperty('--card-bg-color', cfg.colorCard);
    root.style.setProperty('--text-color', cfg.colorText);
    root.style.setProperty('--font-family', cfg.fontFamily);
    document.body.style.fontFamily = cfg.fontFamily;
  };

  const handleConfigAlterada = (novaConfig: ConfiguracaoTema) => {
    setConfigTema(novaConfig);
    aplicarTemaCss(novaConfig);
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    setActiveTab('tab-ocorrencias');
    adicionarToast('Sessão encerrada com sucesso.', 'info');
  };

  // Se o banco ainda estiver inicializando
  if (!isDbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-medium text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Carregando motor IndexedDB Stin Pharma...</span>
        </div>
      </div>
    );
  }

  // Se não houver usuário logado, exibir tela de autenticação
  if (!usuarioLogado) {
    return (
      <>
        <LoginScreen
          usuarios={usuarios}
          onLoginSuccess={(u) => {
            setUsuarioLogado(u);
            setActiveTab('tab-ocorrencias');
          }}
          onToast={adicionarToast}
        />
        <Toast toasts={toasts} onDismiss={descartarToast} />
      </>
    );
  }

  return (
    <div
      style={{ backgroundColor: configTema.colorBg, color: configTema.colorText }}
      className="min-h-screen flex flex-col font-sans transition-colors duration-300"
    >
      {/* Topbar e Navegação */}
      <Header usuario={usuarioLogado} config={configTema} onLogout={handleLogout} />
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={usuarioLogado.funcao}
        config={configTema}
      />

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'tab-ocorrencias' && (
          <OcorrenciasTab
            usuarioLogado={usuarioLogado}
            onOcorrenciaSalva={recarregarTudo}
            onToast={adicionarToast}
          />
        )}

        {activeTab === 'tab-dashboard' && <DashboardTab ocorrencias={ocorrencias} />}

        {activeTab === 'tab-historico' && (
          <HistoricoTab
            ocorrencias={ocorrencias}
            usuarioLogado={usuarioLogado}
            onVerFicha={(oc) => setFichaModal(oc)}
            onAtualizarHistorico={recarregarTudo}
            onToast={adicionarToast}
          />
        )}

        {activeTab === 'tab-auditoria' && usuarioLogado.funcao === 'ADM' && (
          <AuditoriaTab logs={logsAuditoria} />
        )}

        {activeTab === 'tab-usuarios' && usuarioLogado.funcao === 'ADM' && (
          <UsuariosTab
            usuarios={usuarios}
            usuarioLogado={usuarioLogado}
            onUsuariosAtualizados={recarregarTudo}
            onToast={adicionarToast}
          />
        )}

        {activeTab === 'tab-adm' && usuarioLogado.funcao === 'ADM' && (
          <AdmConfigTab
            config={configTema}
            usuarioLogado={usuarioLogado}
            onConfigAlterada={handleConfigAlterada}
            onToast={adicionarToast}
          />
        )}
      </main>

      {/* Modal de Ficha de Vistoria / Laudo Técnico com Auditoria */}
      <FichaModal
        ocorrencia={fichaModal}
        usuarioLogado={usuarioLogado}
        onClose={() => setFichaModal(null)}
        onStatusAtualizado={recarregarTudo}
        onToast={adicionarToast}
      />

      {/* Notificações Flutuantes */}
      <Toast toasts={toasts} onDismiss={descartarToast} />
    </div>
  );
}
