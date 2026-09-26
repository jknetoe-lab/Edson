import React from 'react';
import { useAuth } from '../../services/authContext';
import { LocalDbService } from '../../services/supabaseClient';
import { 
  Search, 
  Users, 
  FolderKanban, 
  Globe, 
  ArrowUpRight, 
  Wand2, 
  ArrowRight, 
  PhoneCall, 
  Sparkles,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import { DashboardTab } from './DashboardLayout';

interface OverviewPageProps {
  onNavigateTab: (tab: DashboardTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigateTab }) => {
  const { user, isOwner } = useAuth();

  const leads = LocalDbService.getLeads(user?.user_id);
  const projects = LocalDbService.getProjects(user?.user_id);
  const searches = LocalDbService.getSearches(user?.user_id);

  const publishedSitesCount = projects.filter(p => p.status === 'Publicado').length;
  const contactedLeadsCount = leads.filter(l => l.status === 'Contatado' || l.status === 'Em negociação' || l.status === 'Cliente').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-indigo-200 text-xs font-medium mb-3 backdrop-blur-xs">
            {isOwner ? (
              <>
                <span>👑</span>
                <span className="font-bold text-amber-300">Acesso do Proprietário (Owner)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plataforma SaaS de Prospecção & Criação de Sites</span>
              </>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Olá, {user?.name?.split(' ')[0]}! {isOwner ? 'Painel do Proprietário' : 'Pronto para fechar novos clientes?'}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            {isOwner ? (
              <>Você possui <strong>acesso irrestrito e vitalício</strong> à plataforma. Buscas de empresas, criação de sites com IA, mensagens e contratos estão <strong className="text-white font-mono">100% liberados</strong> sem necessidade de assinaturas.</>
            ) : (
              <>Você tem <strong className="text-white font-semibold font-mono">{user?.searches_remaining ?? 0} buscas disponíveis</strong> no seu plano atual. Encontre comércios e profissionais locais sem site na sua cidade e ofereça um projeto profissional com IA.</>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('prospeccao')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Encontrar empresas agora</span>
            </button>
            <button
              onClick={() => onNavigateTab('criar-site')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg backdrop-blur-xs transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              <span>Criar site com IA</span>
            </button>
            {isOwner && (
              <button
                onClick={() => onNavigateTab('admin')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-400/30 transition-colors"
              >
                <span>👑</span>
                <span>Painel de Gestão do Proprietário</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Subtle decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Core Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Buscas restantes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Buscas restantes</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {isOwner ? 'Ilimitadas' : user?.searches_remaining}
            </span>
            {!isOwner && (
              <span className="text-xs text-slate-400 font-mono">
                / {user?.plan === 'basic' ? '50' : user?.plan === 'pro' || user?.plan === 'premium' ? '200' : '5'}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-slate-500">
              {isOwner ? 'Acesso do proprietário' : `Plano ${user?.plan}`}
            </span>
            {!isOwner && (
              <button 
                onClick={() => onNavigateTab('planos')}
                className="text-indigo-600 font-semibold hover:text-indigo-700"
              >
                Adicionar buscas
              </button>
            )}
            {isOwner && (
              <span className="text-emerald-600 font-mono font-bold text-[11px]">Vitalício</span>
            )}
          </div>
        </div>

        {/* Card 2: Leads encontrados */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Leads salvos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {leads.length}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              {contactedLeadsCount} em contato
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-slate-500">Oportunidades locais</span>
            <button 
              onClick={() => onNavigateTab('leads')}
              className="text-emerald-700 font-semibold hover:text-emerald-800"
            >
              Ver leads
            </button>
          </div>
        </div>

        {/* Card 3: Projetos criados */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Projetos criados</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {projects.length}
            </span>
            <span className="text-xs text-slate-400">sites no portfólio</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-slate-500">Gerações IA</span>
            <button 
              onClick={() => onNavigateTab('projetos')}
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Ver projetos
            </button>
          </div>
        </div>

        {/* Card 4: Sites publicados */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Sites publicados</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {publishedSitesCount}
            </span>
            <span className="text-xs text-purple-600 font-medium">prontos para entrega</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-slate-500">No ar</span>
            <button 
              onClick={() => onNavigateTab('projetos')}
              className="text-purple-600 font-semibold hover:text-purple-700"
            >
              Gerenciar
            </button>
          </div>
        </div>

      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <button
            onClick={() => onNavigateTab('prospeccao')}
            className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Encontrar empresas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Filtre clínicas, comércios e prestadores sem site na sua região.
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('criar-site')}
            className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                Criar novo site
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gere um site institucional completo com IA pronto para apresentar.
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('leads')}
            className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Ver meus leads
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Acompanhe o status de contato no WhatsApp e feche novos contratos.
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* Recent Activity & Suggested Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Leads list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Leads Recentes</h3>
              <p className="text-xs text-slate-500">Últimas empresas adicionadas ao seu pipeline</p>
            </div>
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {leads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500 mb-3">Nenhum lead salvo ainda.</p>
              <button
                onClick={() => onNavigateTab('prospeccao')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md"
              >
                Buscar minhas primeiras empresas
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {leads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{lead.business_name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        lead.has_website ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-700'
                      }`}>
                        {lead.has_website ? 'Com site' : 'Sem site'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{lead.category}</span>
                      <span>·</span>
                      <span>{lead.city}, {lead.state}</span>
                      <span>·</span>
                      <span className="font-mono text-amber-600 font-semibold">★ {lead.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {lead.whatsapp && (
                      <a
                        href={`https://wa.me/${lead.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        title="Abrir WhatsApp"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onNavigateTab('leads')}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Freelancer Tips & Workflow */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Dica de Prospecção</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">
              Como fechar contratos de R$ 1.500 a R$ 3.000
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed space-y-2 mb-4">
              Ao abordar empresas locais sem site, primeiro gere uma versão preliminar do site no <strong>Criar Site IA</strong>.
              <br /><br />
              Quando mandar mensagem no WhatsApp, envie um print da demonstração pronta. A taxa de resposta aumenta em mais de <strong>4x</strong> quando o cliente já se vê na tela.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Precisa de ajuda?</span>
            <button
              onClick={() => onNavigateTab('mentor')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Falar com Mentor IA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
