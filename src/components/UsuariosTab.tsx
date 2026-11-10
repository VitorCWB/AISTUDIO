import React, { useState } from 'react';
import { Usuario, UserRole } from '../types';
import { alternarStatusUsuario, salvarUsuario } from '../db/indexedDb';
import { Users, UserPlus, ShieldAlert, CheckCircle2, Lock, Key } from 'lucide-react';

interface UsuariosTabProps {
  usuarios: Usuario[];
  usuarioLogado: Usuario;
  onUsuariosAtualizados: () => void;
  onToast: (msg: string, tipo: 'success' | 'error' | 'info') => void;
}

export const UsuariosTab: React.FC<UsuariosTabProps> = ({
  usuarios,
  usuarioLogado,
  onUsuariosAtualizados,
  onToast,
}) => {
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [funcao, setFuncao] = useState<UserRole>('OPERADOR');
  const [senha, setSenha] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCadastrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usuarioLogado.funcao !== 'ADM') {
      onToast('Apenas administradores podem cadastrar usuários.', 'error');
      return;
    }

    const loginLimpo = login.trim().toLowerCase();
    const jaExiste = usuarios.some((u) => u.login.toLowerCase() === loginLimpo);
    if (jaExiste) {
      onToast(`O login "${loginLimpo}" já está cadastrado no sistema. Escolha outro.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const novoUsuario: Usuario = {
        id: Date.now(),
        nome: nome.trim(),
        login: loginLimpo,
        funcao,
        senha: senha.trim() || '1234',
        ativo: true,
      };

      await salvarUsuario(novoUsuario);
      onToast(`Usuário ${novoUsuario.nome} cadastrado com sucesso!`, 'success');
      setNome('');
      setLogin('');
      setSenha('');
      setFuncao('OPERADOR');
      onUsuariosAtualizados();
    } catch {
      onToast('Erro ao gravar usuário no banco.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (usuario: Usuario) => {
    if (usuario.id === usuarioLogado.id) {
      onToast('Você não pode desativar seu próprio login enquanto estiver conectado!', 'error');
      return;
    }

    try {
      const alterado = await alternarStatusUsuario(usuario.id);
      if (alterado) {
        onToast(
          `Usuário ${alterado.nome} foi ${alterado.ativo ? 'ativado' : 'bloqueado'} com sucesso!`,
          'info'
        );
        onUsuariosAtualizados();
      }
    } catch {
      onToast('Erro ao alternar status do usuário.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Cadastro */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Cadastrar Novo Usuário</h2>
            <p className="text-xs text-slate-400">
              Controle de acessos e perfis operacionais da Stin Pharma
            </p>
          </div>
        </div>

        <form onSubmit={handleCadastrarUsuario} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Dra. Juliana Lima"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Usuário / Login *
              </label>
              <input
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Ex: juliana"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nível Hierárquico *
              </label>
              <select
                value={funcao}
                onChange={(e) => setFuncao(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="OPERADOR">Operador (Bipagem & Anexos)</option>
                <option value="FARMACEUTICO">Farmacêutico (Laudos & Análises)</option>
                <option value="ADM">Administrador (Poder Supremo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha de Acesso *
              </label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Usuário</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Usuários Cadastrados */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Usuários Cadastrados no Banco</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{usuarios.length} cadastrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nome Completo</th>
                <th className="py-3 px-4">Login</th>
                <th className="py-3 px-4">Nível Hierárquico</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => {
                const isCurrentUser = u.id === usuarioLogado.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span>{u.nome}</span>
                      {isCurrentUser && (
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                          (Você)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">@{u.login}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.funcao === 'ADM'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : u.funcao === 'FARMACEUTICO'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {u.funcao}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          u.ativo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.ativo ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ativo
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-rose-600" /> Bloqueado
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={isCurrentUser}
                        className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
                          u.ativo
                            ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                      >
                        {u.ativo ? '🚫 Bloquear' : '✅ Ativar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
