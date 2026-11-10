import React, { useState } from 'react';
import { ConfiguracaoTema, Usuario } from '../types';
import { CONFIG_PADRAO, salvarConfiguracoes } from '../db/indexedDb';
import { Sliders, Save, RotateCcw, Palette, Type, Edit3, Crown } from 'lucide-react';

interface AdmConfigTabProps {
  config: ConfiguracaoTema;
  usuarioLogado: Usuario;
  onConfigAlterada: (novaConfig: ConfiguracaoTema) => void;
  onToast: (msg: string, tipo: 'success' | 'error' | 'info') => void;
}

export const AdmConfigTab: React.FC<AdmConfigTabProps> = ({
  config,
  usuarioLogado,
  onConfigAlterada,
  onToast,
}) => {
  const [formConfig, setFormConfig] = useState<ConfiguracaoTema>({ ...config });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (campo: keyof ConfiguracaoTema, valor: string) => {
    const atualizado = { ...formConfig, [campo]: valor };
    setFormConfig(atualizado);
    // Aplicação live para preview imediato
    onConfigAlterada(atualizado);
  };

  const handleSalvarNoBanco = async () => {
    if (usuarioLogado.funcao !== 'ADM') {
      onToast('Apenas administradores têm permissão para alterar configurações.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await salvarConfiguracoes(formConfig);
      onToast('Personalização gravada com sucesso no banco IndexedDB!', 'success');
    } catch {
      onToast('Erro ao salvar configurações no banco.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestaurarPadrao = async () => {
    if (usuarioLogado.funcao !== 'ADM') return;
    if (window.confirm('Deseja restaurar as cores, fontes e títulos para as configurações padrão?')) {
      setFormConfig({ ...CONFIG_PADRAO });
      onConfigAlterada({ ...CONFIG_PADRAO });
      try {
        await salvarConfiguracoes(CONFIG_PADRAO);
        onToast('Configurações originais restauradas!', 'info');
      } catch {
        onToast('Erro ao restaurar padrões.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header do Módulo */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Poder Supremo ADM — Personalização Integral do Sistema
              </h2>
              <p className="text-xs text-slate-400">
                Altere cores, fontes, títulos corporativos e rótulos com gravação persistente local
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Seção 1: Paleta de Cores */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Palette className="w-4 h-4 text-blue-600" />
              <span>1. Paleta de Cores Globais do ERP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Cor Primária (Header)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formConfig.colorPrimary}
                    onChange={(e) => handleChange('colorPrimary', e.target.value)}
                    className="w-10 h-10 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={formConfig.colorPrimary}
                    onChange={(e) => handleChange('colorPrimary', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Cor de Destaque (Accent)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formConfig.colorAccent}
                    onChange={(e) => handleChange('colorAccent', e.target.value)}
                    className="w-10 h-10 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={formConfig.colorAccent}
                    onChange={(e) => handleChange('colorAccent', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Cor de Fundo da Tela</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formConfig.colorBg}
                    onChange={(e) => handleChange('colorBg', e.target.value)}
                    className="w-10 h-10 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={formConfig.colorBg}
                    onChange={(e) => handleChange('colorBg', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Cor dos Cards / Paineis</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formConfig.colorCard}
                    onChange={(e) => handleChange('colorCard', e.target.value)}
                    className="w-10 h-10 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={formConfig.colorCard}
                    onChange={(e) => handleChange('colorCard', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Cor de Texto Geral</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formConfig.colorText}
                    onChange={(e) => handleChange('colorText', e.target.value)}
                    className="w-10 h-10 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={formConfig.colorText}
                    onChange={(e) => handleChange('colorText', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Tipografia */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Type className="w-4 h-4 text-purple-600" />
              <span>2. Tipografia e Família Tipográfica</span>
            </div>

            <div className="max-w-md">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fonte Principal da Interface
              </label>
              <select
                value={formConfig.fontFamily}
                onChange={(e) => handleChange('fontFamily', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Corporativo Moderno)</option>
                <option value="'Inter', sans-serif">Inter (Limpo e Técnico)</option>
                <option value="'Roboto', sans-serif">Roboto (Clean / Google)</option>
                <option value="'Montserrat', sans-serif">Montserrat (Marcante e Geométrico)</option>
                <option value="'Courier Prime', monospace">Courier Prime (Terminal Industrial)</option>
              </select>
            </div>
          </div>

          {/* Seção 3: Rótulos e Textos do Sistema */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Edit3 className="w-4 h-4 text-emerald-600" />
              <span>3. Personalização de Títulos e Rótulos das Abas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Título do Cabeçalho
                </label>
                <input
                  type="text"
                  value={formConfig.textTitle}
                  onChange={(e) => handleChange('textTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Slogan do Cabeçalho
                </label>
                <input
                  type="text"
                  value={formConfig.textSlogan}
                  onChange={(e) => handleChange('textSlogan', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rótulo: Aba Ocorrências
                </label>
                <input
                  type="text"
                  value={formConfig.tabOcorrencias}
                  onChange={(e) => handleChange('tabOcorrencias', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rótulo: Aba Dashboard
                </label>
                <input
                  type="text"
                  value={formConfig.tabDash}
                  onChange={(e) => handleChange('tabDash', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rótulo: Aba Histórico
                </label>
                <input
                  type="text"
                  value={formConfig.tabHistorico}
                  onChange={(e) => handleChange('tabHistorico', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleSalvarNoBanco}
              disabled={isSaving}
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Personalização no Banco'}</span>
            </button>

            <button
              onClick={handleRestaurarPadrao}
              className="py-2.5 px-5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Padrões Originais</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
