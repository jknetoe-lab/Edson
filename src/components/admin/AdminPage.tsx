import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { LocalDbService } from '../../services/supabaseClient';
import { UserProfile, UserPlan, UserRole, AccountType, Lead, Project, SearchLog, Subscription } from '../../types';
import { 
  ShieldAlert, 
  Users, 
  Search, 
  FolderKanban, 
  UserCheck, 
  UserX, 
  Check, 
  Edit3, 
  Lock, 
  TrendingUp,
  CreditCard,
  FileText,
  Activity,
  BarChart3,
  Globe,
  Star,
  MapPin,
  Clock,
  Phone,
  DollarSign
} from 'lucide-react';
import { AdminFinancialSection } from './AdminFinancialSection';

type AdminTab = 'financeiro' | 'usuarios' | 'leads' | 'projetos' | 'buscas' | 'assinaturas' | 'estatisticas';

export const AdminPage: React.FC = () => {
  const { user, isOwner, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('financeiro');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editSearches, setEditSearches] = useState<number>(5);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [serverAuthorized, setServerAuthorized] = useState<boolean | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const loadAllData = () => {
    if (user?.role === 'admin') {
      const list = LocalDbService.getProfiles(user);
      setProfiles(list);
    }
  };

  useEffect(() => {
    async function checkServerAuth() {
      // Aguardar carregamento da sessão do usuário se ainda estiver inicializando
      if (authLoading) return;

      if (!user || user.role !== 'admin') {
        setServerAuthorized(false);
        setAuthChecking(false);
        return;
      }

      setAuthChecking(true);
      try {
        const response = await fetch('/api/admin/verify-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: user.role,
            account_type: user.account_type,
            user_id: user.user_id || user.id,
            email: user.email,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authorized) {
            setServerAuthorized(true);
            const list = LocalDbService.getProfiles(user);
            setProfiles(list);
          } else {
            setServerAuthorized(false);
          }
        } else if (response.status === 403) {
          setServerAuthorized(false);
        } else {
          // Em caso de falha de rede/proxy no ambiente serverless, fallback seguro se o usuário for admin local verificado
          if (user.role === 'admin') {
            setServerAuthorized(true);
            const list = LocalDbService.getProfiles(user);
            setProfiles(list);
          } else {
            setServerAuthorized(false);
          }
        }
      } catch (err) {
        // Fallback for offline mode if local user is admin
        if (user && user.role === 'admin') {
          setServerAuthorized(true);
          const list = LocalDbService.getProfiles(user);
          setProfiles(list);
        } else {
          setServerAuthorized(false);
        }
      } finally {
        setAuthChecking(false);
      }
    }

    checkServerAuth();
  }, [user, authLoading]);

  // Loading state
  if (authLoading || authChecking) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto my-12 shadow-sm animate-in fade-in">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Verificando autorização com o servidor...</p>
      </div>
    );
  }

  // Strict Admin protection check: user MUST have role = 'admin' AND server authorization
  if (!serverAuthorized || user?.role !== 'admin') {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-md mx-auto my-12 shadow-sm animate-in fade-in">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">403 - Acesso Não Autorizado</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Esta rota é protegida por validação de segurança server-side. Sua conta não possui permissões administrativas para visualizar dados ou estatísticas da plataforma.
        </p>
      </div>
    );
  }

  const allLeads: Lead[] = LocalDbService.getLeads(undefined, user);
  const allProjects: Project[] = LocalDbService.getProjects(undefined, user);
  const allSearches: SearchLog[] = LocalDbService.getSearches(undefined, user);
  const allSubs: Subscription[] = LocalDbService.getSubscriptions(user);

  // Metrics
  const totalUsers = profiles.length;
  const activeUsers = profiles.filter(p => p.is_active).length;
  const freeUsers = profiles.filter(p => p.plan === 'gratis').length;
  const paidUsers = profiles.filter(p => p.plan === 'pro' || p.plan === 'premium').length;
  const totalSearchesCount = allSearches.length;
  const totalLeadsCount = allLeads.length;
  const totalProjectsCount = allProjects.length;

  // Estimated Monthly Recurring Revenue (MRR)
  const estimatedRevenue = profiles.reduce((acc, p) => {
    if (p.account_type === 'owner') return acc; // Owner doesn't pay
    if (p.plan === 'pro') return acc + 97;
    if (p.plan === 'premium') return acc + 197;
    return acc;
  }, 0);

  const handlePlanChange = (userId: string, newPlan: UserPlan) => {
    LocalDbService.updatePlan(userId, newPlan);
    loadAllData();
    showFeedback(`Plano do usuário atualizado para ${newPlan.toUpperCase()}`);
  };

  const handleRoleChange = (userId: string, newRole: UserRole, newAccountType: AccountType) => {
    const success = LocalDbService.updateUserRoleAndAccountType(userId, newRole, newAccountType, user);
    if (success) {
      loadAllData();
      showFeedback(`Cargo atualizado para ${newRole.toUpperCase()} (${newAccountType})`);
    } else {
      showFeedback('Erro: Você não tem permissão para executar esta alteração.');
    }
  };

  const handleToggleActive = (userId: string) => {
    const status = LocalDbService.toggleUserActive(userId);
    loadAllData();
    showFeedback(`Usuário ${status ? 'ativado' : 'desativado'} com sucesso.`);
  };

  const handleSaveSearches = (userId: string) => {
    LocalDbService.setSearchesRemaining(userId, editSearches);
    setEditingUserId(null);
    loadAllData();
    showFeedback('Limite de buscas alterado com sucesso.');
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>👑</span>
            <span>{isOwner ? 'Proprietário Geral da Plataforma' : 'Painel de Administração'}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Painel de Controle LeadForge AI
          </h1>
          <p className="text-xs text-slate-500">
            Gestão completa de usuários, controle de permissões, leads, projetos e histórico de buscas.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Admin KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">Total de Usuários</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{totalUsers}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">{activeUsers} ativos</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">Usuários Clientes</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-600 tabular-nums">{paidUsers}</span>
            <span className="text-[10px] text-slate-400 font-mono">({freeUsers} grátis)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">Faturamento Estimado (MRR)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
              R$ {estimatedRevenue.toLocaleString('pt-BR')}
            </span>
            <span className="text-[10px] text-slate-400">/mês</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">Leads & Projetos</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{totalLeadsCount}</span>
            <span className="text-[10px] text-slate-500">leads · {totalProjectsCount} sites</span>
          </div>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 p-1 rounded-xl">
        {[
          { id: 'financeiro' as AdminTab, label: 'Financeiro Mercado Pago', icon: DollarSign },
          { id: 'usuarios' as AdminTab, label: 'Usuários & Permissões', icon: Users, count: totalUsers },
          { id: 'leads' as AdminTab, label: 'Todos os Leads', icon: FileText, count: totalLeadsCount },
          { id: 'projetos' as AdminTab, label: 'Sites & Projetos', icon: FolderKanban, count: totalProjectsCount },
          { id: 'buscas' as AdminTab, label: 'Logs de Prospecção', icon: Search, count: totalSearchesCount },
          { id: 'assinaturas' as AdminTab, label: 'Assinaturas', icon: CreditCard, count: allSubs.length },
          { id: 'estatisticas' as AdminTab, label: 'Estatísticas', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 0: Financeiro Mercado Pago */}
      {activeTab === 'financeiro' && (
        <AdminFinancialSection />
      )}

      {/* Tab 1: Usuários & Permissões */}
      {activeTab === 'usuarios' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Gerenciamento de Contas e Cargos ({profiles.length})
            </h2>
            <span className="text-[11px] text-slate-500">
              Controle de Cotas e Acesso do Proprietário
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Cargo (Role)</th>
                  <th className="py-3 px-4">Tipo (Account)</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4">Buscas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {profiles.map((p) => {
                  const isUserOwner = p.role === 'admin' && p.account_type === 'owner';
                  const isEditingSearches = editingUserId === p.user_id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div>
                          <strong className="block text-slate-900 font-semibold flex items-center gap-1.5">
                            {isUserOwner && <span>👑</span>}
                            <span>{p.name}</span>
                          </strong>
                          <span className="text-[11px] text-slate-400 font-mono">{p.email}</span>
                        </div>
                      </td>

                      {/* Role Selector (User vs Admin) */}
                      <td className="py-3 px-4">
                        <select
                          value={p.role}
                          disabled={isUserOwner} // Cannot demote root owner
                          onChange={(e) => handleRoleChange(p.user_id, e.target.value as UserRole, p.account_type)}
                          className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      {/* Account Type Selector (Customer vs Owner) */}
                      <td className="py-3 px-4">
                        <select
                          value={p.account_type}
                          disabled={isUserOwner}
                          onChange={(e) => handleRoleChange(p.user_id, p.role, e.target.value as AccountType)}
                          className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="customer">Customer</option>
                          <option value="owner">Owner (Proprietário)</option>
                        </select>
                      </td>

                      {/* Plan Selector */}
                      <td className="py-3 px-4">
                        {isUserOwner ? (
                          <span className="text-amber-800 font-semibold text-[11px]">
                            Acesso do proprietário
                          </span>
                        ) : (
                          <select
                            value={p.plan}
                            onChange={(e) => handlePlanChange(p.user_id, e.target.value as UserPlan)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize"
                          >
                            <option value="gratis">Grátis (5 buscas)</option>
                            <option value="pro">Pro (100 buscas)</option>
                            <option value="premium">Premium (Ilimitado)</option>
                          </select>
                        )}
                      </td>

                      {/* Searches */}
                      <td className="py-3 px-4 font-mono">
                        {isUserOwner ? (
                          <span className="font-bold text-emerald-600 text-xs">Ilimitadas</span>
                        ) : isEditingSearches ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editSearches}
                              onChange={(e) => setEditSearches(parseInt(e.target.value, 10) || 0)}
                              className="w-16 px-1.5 py-0.5 text-xs bg-slate-50 border border-slate-300 rounded font-mono"
                            />
                            <button
                              onClick={() => handleSaveSearches(p.user_id)}
                              className="p-1 bg-slate-900 text-white rounded hover:bg-slate-800"
                              title="Salvar"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 tabular-nums">
                              {p.plan === 'premium' ? '∞' : p.searches_remaining}
                            </span>
                            <button
                              onClick={() => {
                                setEditingUserId(p.user_id);
                                setEditSearches(p.searches_remaining);
                              }}
                              className="text-slate-400 hover:text-slate-600"
                              title="Editar limite"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {p.is_active ? 'Ativo' : 'Desativado'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        {!isUserOwner && (
                          <button
                            onClick={() => handleToggleActive(p.user_id)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                              p.is_active
                                ? 'text-red-600 hover:bg-red-50 border border-red-200'
                                : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                            }`}
                          >
                            {p.is_active ? 'Desativar' : 'Ativar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Todos os Leads */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Leads Cadastrados no Sistema ({allLeads.length})
            </h2>
            <span className="text-[11px] text-slate-500">
              Base Consolidada de Prospecção
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Localização</th>
                  <th className="py-3 px-4">Telefone / WhatsApp</th>
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {allLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">{lead.business_name}</td>
                    <td className="py-3 px-4 text-slate-600">{lead.category}</td>
                    <td className="py-3 px-4">{lead.city} - {lead.state}</td>
                    <td className="py-3 px-4 font-mono">{lead.whatsapp || lead.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        lead.has_website ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {lead.has_website ? 'Possui site' : 'Sem site'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 font-semibold">
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Sites & Projetos */}
      {activeTab === 'projetos' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Projetos Gerados com IA ({allProjects.length})
            </h2>
            <span className="text-[11px] text-slate-500">
              Sites Institucionais na Plataforma
            </span>
          </div>

          {allProjects.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum projeto de site salvo até o momento.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {allProjects.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{p.name}</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">{p.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Criado em {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    p.status === 'Publicado' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Logs de Prospecção */}
      {activeTab === 'buscas' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Logs de Buscas & Atividades ({allSearches.length})
            </h2>
            <span className="text-[11px] text-slate-500">
              Auditoria de Consultas Realizadas
            </span>
          </div>

          {allSearches.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhuma busca registrada no histórico ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Localização</th>
                    <th className="py-3 px-4">Nicho</th>
                    <th className="py-3 px-4">Filtro</th>
                    <th className="py-3 px-4">Resultados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allSearches.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(s.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 font-semibold">{s.city} - {s.state}</td>
                      <td className="py-3 px-4">{s.category}</td>
                      <td className="py-3 px-4">{s.filter}</td>
                      <td className="py-3 px-4 font-mono font-bold">{s.results_count} empresas</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Assinaturas */}
      {activeTab === 'assinaturas' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Assinaturas Registradas ({allSubs.length})
            </h2>
            <span className="text-[11px] text-slate-500">
              Contratos Ativos e Pagamentos
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {allSubs.map((sub) => (
              <div key={sub.id} className="p-4 flex items-center justify-between">
                <div>
                  <strong className="block text-slate-900 font-semibold capitalize">
                    Plano {sub.plan}
                  </strong>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {sub.id} · Método: {sub.payment_method}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-50 text-emerald-700 font-semibold uppercase">
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Estatísticas Gerais */}
      {activeTab === 'estatisticas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Distribuição de Usuários
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Plano Grátis (5 buscas):</span>
                <strong className="text-slate-900 font-mono">{freeUsers}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plano Pro (R$ 97):</span>
                <strong className="text-indigo-600 font-mono">
                  {profiles.filter(p => p.plan === 'pro').length}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plano Premium (R$ 197):</span>
                <strong className="text-indigo-600 font-mono">
                  {profiles.filter(p => p.plan === 'premium').length}
                </strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500">Proprietários com Acesso Total:</span>
                <strong className="text-amber-800 font-mono">
                  {profiles.filter(p => p.role === 'admin' && p.account_type === 'owner').length}
                </strong>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Métricas Operacionais
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Média de Leads por Usuário:</span>
                <strong className="text-slate-900 font-mono">
                  {totalUsers > 0 ? (totalLeadsCount / totalUsers).toFixed(1) : 0}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Média de Sites por Usuário:</span>
                <strong className="text-slate-900 font-mono">
                  {totalUsers > 0 ? (totalProjectsCount / totalUsers).toFixed(1) : 0}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total de Buscas Executadas:</span>
                <strong className="text-slate-900 font-mono">{totalSearchesCount}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500">Faturamento Projetado Anual:</span>
                <strong className="text-emerald-600 font-mono">
                  R$ {(estimatedRevenue * 12).toLocaleString('pt-BR')}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
