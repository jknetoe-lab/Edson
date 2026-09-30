import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { PricingPage } from './components/PricingPage';
import { AuthModal } from './components/auth/AuthPages';
import { DashboardLayout, DashboardTab } from './components/dashboard/DashboardLayout';
import { OverviewPage } from './components/dashboard/OverviewPage';
import { ProspectingPage } from './components/dashboard/ProspectingPage';
import { LeadsPage } from './components/dashboard/LeadsPage';
import { WebsiteCreatorPage } from './components/dashboard/WebsiteCreatorPage';
import { ProjectsPage } from './components/dashboard/ProjectsPage';
import { ContractsPage } from './components/dashboard/ContractsPage';
import { CalculatorPage } from './components/dashboard/CalculatorPage';
import { MentorPage } from './components/dashboard/MentorPage';
import { SettingsPage } from './components/dashboard/SettingsPage';
import { AdminPage } from './components/admin/AdminPage';
import { PublicSiteView } from './components/website/PublicSiteView';
import { Lead, BusinessSearchResult, Project } from './types';
import { Lock } from 'lucide-react';

function getInitialPublicSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  if (path.startsWith('/site/')) {
    const slug = path.replace('/site/', '').split('/')[0].trim();
    if (slug) return slug;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const siteParam = searchParams.get('site');
  if (siteParam) return siteParam.trim();

  const hash = window.location.hash;
  if (hash.includes('site/')) {
    const parts = hash.split('site/');
    if (parts[1]) return parts[1].split('/')[0].split('?')[0].trim();
  }
  return null;
}

interface ParsedRoute {
  view: 'landing' | 'planos' | 'dashboard';
  tab: DashboardTab;
}

function parseCurrentRoute(): ParsedRoute {
  if (typeof window === 'undefined') {
    return { view: 'landing', tab: 'overview' };
  }

  const rawPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab') as DashboardTab | null;

  if (rawPath === '/planos' || searchParams.get('view') === 'planos') {
    return { view: 'planos', tab: 'planos' };
  }

  const pathToTabMap: Record<string, DashboardTab> = {
    '/dashboard': 'overview',
    '/overview': 'overview',
    '/prospeccao': 'prospeccao',
    '/leads': 'leads',
    '/criar-site': 'criar-site',
    '/projetos': 'projetos',
    '/contratos': 'contratos',
    '/calculadora': 'calculadora',
    '/mentor': 'mentor',
    '/planos-saas': 'planos',
    '/configuracoes': 'configuracoes',
    '/admin': 'admin',
    '/painel-admin': 'admin',
  };

  if (pathToTabMap[rawPath]) {
    return { view: 'dashboard', tab: pathToTabMap[rawPath] };
  }

  if (tabParam && ['overview', 'prospeccao', 'leads', 'criar-site', 'projetos', 'contratos', 'calculadora', 'mentor', 'planos', 'configuracoes', 'admin'].includes(tabParam)) {
    return { view: 'dashboard', tab: tabParam };
  }

  return { view: 'landing', tab: 'overview' };
}

function updateBrowserUrl(view: 'landing' | 'planos' | 'dashboard', tab?: DashboardTab) {
  if (typeof window === 'undefined') return;

  let targetPath = '/';
  if (view === 'planos') {
    targetPath = '/planos';
  } else if (view === 'dashboard') {
    if (tab === 'admin') {
      targetPath = '/admin';
    } else if (tab && tab !== 'overview') {
      targetPath = `/${tab}`;
    } else {
      targetPath = '/dashboard';
    }
  }

  if (window.location.pathname !== targetPath && !window.location.pathname.startsWith('/site/')) {
    window.history.pushState({}, '', targetPath);
  }
}

function MainApp() {
  const { user, loading: authLoading } = useAuth();
  
  // Public client site slug if visiting a client website link
  const [publicSiteSlug, setPublicSiteSlug] = useState<string | null>(getInitialPublicSlug);

  // Navigation states initialized from the current URL
  const initialRoute = parseCurrentRoute();
  const [currentView, setCurrentView] = useState<'landing' | 'planos' | 'dashboard'>(initialRoute.view);
  const [currentDashboardTab, setCurrentDashboardTab] = useState<DashboardTab>(initialRoute.tab);
  const [pendingTabAfterAuth, setPendingTabAfterAuth] = useState<DashboardTab | null>(
    initialRoute.view === 'dashboard' ? initialRoute.tab : null
  );

  // Lead handover to website creator
  const [selectedLeadForCreation, setSelectedLeadForCreation] = useState<Lead | BusinessSearchResult | null>(null);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');

  // React to URL changes (back/forward navigation)
  useEffect(() => {
    const handleUrlChange = () => {
      const slug = getInitialPublicSlug();
      setPublicSiteSlug(slug);
      if (!slug) {
        const route = parseCurrentRoute();
        setCurrentView(route.view);
        setCurrentDashboardTab(route.tab);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // When auth finishes loading, reconcile intended route
  useEffect(() => {
    if (authLoading) return;

    const route = parseCurrentRoute();
    if (route.view === 'dashboard') {
      if (user) {
        if (route.tab === 'admin' && user.role !== 'admin') {
          setCurrentView('dashboard');
          setCurrentDashboardTab('overview');
          updateBrowserUrl('dashboard', 'overview');
        } else {
          setCurrentView('dashboard');
          setCurrentDashboardTab(route.tab);
          updateBrowserUrl('dashboard', route.tab);
        }
      } else {
        // Not logged in but trying to access protected route (e.g. /admin or /dashboard)
        setPendingTabAfterAuth(route.tab);
        setAuthMode('login');
        setAuthModalOpen(true);
      }
    }
  }, [authLoading, user]);

  const handleOpenAuth = (mode: 'login' | 'register' | 'forgot-password', targetTab?: DashboardTab) => {
    if (targetTab) {
      setPendingTabAfterAuth(targetTab);
    }
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigate = (view: string, tab?: DashboardTab) => {
    if (publicSiteSlug) {
      window.history.pushState({}, '', '/');
      setPublicSiteSlug(null);
    }

    if (view === 'dashboard' && !user) {
      handleOpenAuth('login', tab || 'overview');
      return;
    }

    if (view === 'dashboard') {
      const selectedTab = tab || currentDashboardTab || 'overview';
      setCurrentView('dashboard');
      setCurrentDashboardTab(selectedTab);
      updateBrowserUrl('dashboard', selectedTab);
    } else if (view === 'planos') {
      setCurrentView('planos');
      updateBrowserUrl('planos');
    } else {
      setCurrentView('landing');
      updateBrowserUrl('landing');
    }
  };

  const handleTabSelect = (tab: DashboardTab) => {
    setCurrentDashboardTab(tab);
    updateBrowserUrl('dashboard', tab);
  };

  const handleSelectLeadForSite = (lead: Lead | BusinessSearchResult) => {
    setSelectedLeadForCreation(lead);
    setCurrentDashboardTab('criar-site');
  };

  const handleEditProject = (project: Project) => {
    // When editing project, fill in the creator preserving custom_prompt and business details
    setSelectedLeadForCreation({
      id: project.id,
      name: project.site_data.business_name,
      category: project.site_data.category,
      city: project.site_data.city || (project.site_data.contact?.address_display || ''),
      state: project.site_data.state || '',
      phone: project.site_data.phone,
      whatsapp: project.site_data.whatsapp,
      whatsapp_status: project.site_data.whatsapp_status || 'unconfirmed',
      address: project.site_data.address,
      rating: project.site_data.rating,
      review_count: project.site_data.review_count,
      google_maps_url: project.site_data.google_maps_url || '',
      has_website: true,
      custom_prompt: project.custom_prompt || (project.site_data as any).custom_prompt || '',
    } as any);
    setCurrentDashboardTab('criar-site');
  };

  // If viewing a public customer site, render the dedicated PublicSiteView
  if (publicSiteSlug) {
    return (
      <PublicSiteView 
        slug={publicSiteSlug} 
        onNavigateHome={() => {
          window.history.pushState({}, '', '/');
          setPublicSiteSlug(null);
          setCurrentView('landing');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* If inside Dashboard view, render the DashboardLayout */}
      {currentView === 'dashboard' && user ? (
        <DashboardLayout
          currentTab={currentDashboardTab}
          onSelectTab={handleTabSelect}
          onNavigateHome={() => handleNavigate('landing')}
        >
          {currentDashboardTab === 'overview' && (
            <OverviewPage onNavigateTab={handleTabSelect} />
          )}

          {currentDashboardTab === 'prospeccao' && (
            <ProspectingPage
              onNavigateTab={handleTabSelect}
              onSelectLeadForSiteCreation={handleSelectLeadForSite}
            />
          )}

          {currentDashboardTab === 'leads' && (
            <LeadsPage
              onNavigateTab={handleTabSelect}
              onSelectLeadForSiteCreation={handleSelectLeadForSite}
            />
          )}

          {currentDashboardTab === 'criar-site' && (
            <WebsiteCreatorPage
              onNavigateTab={handleTabSelect}
              preselectedLead={selectedLeadForCreation}
            />
          )}

          {currentDashboardTab === 'projetos' && (
            <ProjectsPage
              onNavigateTab={handleTabSelect}
              onEditProject={handleEditProject}
            />
          )}

          {currentDashboardTab === 'contratos' && (
            <ContractsPage />
          )}

          {currentDashboardTab === 'calculadora' && (
            <CalculatorPage />
          )}

          {currentDashboardTab === 'mentor' && (
            <MentorPage />
          )}

          {currentDashboardTab === 'planos' && (
            <PricingPage onBackToApp={() => handleTabSelect('overview')} />
          )}

          {currentDashboardTab === 'configuracoes' && (
            <SettingsPage />
          )}

          {currentDashboardTab === 'admin' && (
            user?.role === 'admin' ? (
              <AdminPage />
            ) : (
              <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-md mx-auto my-12 shadow-sm animate-in fade-in">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900">403 - Acesso Negado</h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Você não possui autorização para acessar esta área restrita.
                </p>
              </div>
            )
          )}
        </DashboardLayout>
      ) : (
        /* Public Pages (Landing Page & Pricing Page) */
        <div className="flex-1 flex flex-col">
          <Navbar
            currentView={currentView}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />

          <main className="flex-1">
            {currentView === 'planos' ? (
              <PricingPage onBackToApp={() => handleNavigate('landing')} />
            ) : (
              <LandingPage
                onOpenAuth={handleOpenAuth}
                onNavigate={handleNavigate}
              />
            )}
          </main>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          const targetTab = pendingTabAfterAuth || currentDashboardTab || 'overview';
          setCurrentView('dashboard');
          setCurrentDashboardTab(targetTab);
          updateBrowserUrl('dashboard', targetTab);
          setPendingTabAfterAuth(null);
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
