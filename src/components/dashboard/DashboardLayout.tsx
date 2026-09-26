import React, { useState } from 'react';
import { useAuth } from '../../services/authContext';
import {
  LayoutDashboard,
  Search,
  Users,
  Wand2,
  FolderKanban,
  FileText,
  Calculator,
  Bot,
  CreditCard,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export type DashboardTab = 
  | 'overview' 
  | 'prospeccao' 
  | 'leads' 
  | 'criar-site' 
  | 'projetos' 
  | 'contratos' 
  | 'calculadora' 
  | 'mentor' 
  | 'planos' 
  | 'configuracoes'
  | 'admin';

interface DashboardLayoutProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onSelectTab,
  onNavigateHome,
  children,
}) => {
  const { user, isOwner, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { id: 'overview' as DashboardTab, label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'prospeccao' as DashboardTab, 
      label: 'Encontrar empresas', 
      icon: Search, 
      badge: isOwner ? 'Ilimitadas' : (user?.searches_remaining !== undefined ? `${user.searches_remaining} restantes` : undefined) 
    },
    { id: 'leads' as DashboardTab, label: 'Meus leads', icon: Users },
    { id: 'criar-site' as DashboardTab, label: 'Criar site', icon: Wand2, highlight: true },
    { id: 'projetos' as DashboardTab, label: 'Meus projetos', icon: FolderKanban },
    { id: 'contratos' as DashboardTab, label: 'Contratos', icon: FileText },
    { id: 'calculadora' as DashboardTab, label: 'Calculadora de preço', icon: Calculator },
    { id: 'mentor' as DashboardTab, label: 'Mentor IA', icon: Bot },
    { id: 'planos' as DashboardTab, label: 'Planos e pagamento', icon: CreditCard },
    { id: 'configuracoes' as DashboardTab, label: 'Configurações', icon: Settings },
  ];

  if (user?.role === 'admin') {
    navItems.push({
      id: 'admin' as DashboardTab,
      label: isOwner ? 'Painel do Proprietário' : 'Painel Admin',
      icon: ShieldAlert,
      badge: isOwner ? '👑 Proprietário' : 'Admin',
    });
  }

  const handleNavClick = (tab: DashboardTab) => {
    if (tab === 'admin' && user?.role !== 'admin') {
      return;
    }
    onSelectTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-900">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-bold text-slate-900 text-sm">LeadForge AI</span>
        </div>
        <div className="flex items-center gap-2">
          {isOwner ? (
            <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
              <span>👑</span>
              <span>Proprietário</span>
            </span>
          ) : (
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-semibold">
              {user?.searches_remaining} buscas
            </span>
          )}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out
        md:static md:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-2xs group-hover:bg-indigo-600 transition-colors">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                LeadForge <span className="text-indigo-600">AI</span>
              </span>
              <span className="block text-[10px] text-slate-400 -mt-0.5">SaaS Brasil</span>
            </div>
          </button>
          
          <button 
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left
                  ${isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Quota Indicator */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          {isOwner ? (
            /* OWNER UI - Strictly conforming to requirements */
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-3.5 rounded-xl border border-slate-800 shadow-xs mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>👑</span>
                  <span>Proprietário</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-semibold">
                  Ativo
                </span>
              </div>
              
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Plano:</span>
                  <span className="font-semibold text-white">Acesso do proprietário</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-semibold">Ativo</span>
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t border-white/10">
                  <span className="text-slate-400">Buscas:</span>
                  <span className="font-mono font-bold text-white text-xs">Ilimitadas</span>
                </div>
              </div>
              {/* NO UPGRADE BUTTON FOR OWNER */}
            </div>
          ) : (
            /* REGULAR CUSTOMER UI */
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700">Buscas restantes</span>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {user?.plan === 'premium' ? '∞' : `${user?.searches_remaining ?? 0}`}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{
                    width: user?.plan === 'premium' ? '100%' : `${Math.min(100, ((user?.searches_remaining ?? 0) / 5) * 100)}%`
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="capitalize">Plano {user?.plan}</span>
                <button 
                  onClick={() => handleNavClick('planos')}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Upgrade
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar contract desktop */}
        <header className="hidden md:flex h-14 bg-white border-b border-slate-200 px-6 items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>LeadForge</span>
            <span>/</span>
            <span className="font-semibold text-slate-800 capitalize">
              {navItems.find(n => n.id === currentTab)?.label || currentTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <span>Ver Landing Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <button
              onClick={() => handleNavClick('criar-site')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-2xs whitespace-nowrap"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Criar Site IA</span>
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}
    </div>
  );
};
