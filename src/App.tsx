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

function MainApp() {
  const { user } = useAuth();
  
  // Public client site slug if visiting a client website link
  const [publicSiteSlug, setPublicSiteSlug] = useState<string | null>(getInitialPublicSlug);

  // Navigation states: 'landing' | 'planos' | 'dashboard'
  const [currentView, setCurrentView] = useState<'landing' | 'planos' | 'dashboard'>('landing');
  const [currentDashboardTab, setCurrentDashboardTab] = useState<DashboardTab>('overview');

  // Lead handover to website creator
  const [selectedLeadForCreation, setSelectedLeadForCreation] = useState<Lead | BusinessSearchResult | null>(null);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');

  useEffect(() => {
    const handleUrlChange = () => {
      setPublicSiteSlug(getInitialPublicSlug());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' | 'forgot-password') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigate = (view: string) => {
    if (publicSiteSlug) {
      window.history.pushState({}, '', '/');
      setPublicSiteSlug(null);
    }
    if (view === 'dashboard' && !user) {
      handleOpenAuth('login');
      return;
    }
    if (view === 'dashboard') {
      setCurrentView('dashboard');
    } else if (view === 'planos') {
      setCurrentView('planos');
    } else {
      setCurrentView('landing');
    }
  };

  const handleSelectLeadForSite = (lead: Lead | BusinessSearchResult) => {
    setSelectedLeadForCreation(lead);
    setCurrentDashboardTab('criar-site');
  };

  const handleEditProject = (project: Project) => {
    // When editing project, fill in the creator
    setSelectedLeadForCreation({
      id: project.id,
      name: project.site_data.business_name,
      category: project.site_data.category,
      city: project.site_data.contact?.address_display || '',
      state: '',
      phone: project.site_data.phone,
      whatsapp: project.site_data.whatsapp,
      address: project.site_data.address,
      rating: 5,
      review_count: 50,
      google_maps_url: '',
      has_website: true,
    });
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
          onSelectTab={setCurrentDashboardTab}
          onNavigateHome={() => setCurrentView('landing')}
        >
          {currentDashboardTab === 'overview' && (
            <OverviewPage onNavigateTab={setCurrentDashboardTab} />
          )}

          {currentDashboardTab === 'prospeccao' && (
            <ProspectingPage
              onNavigateTab={setCurrentDashboardTab}
              onSelectLeadForSiteCreation={handleSelectLeadForSite}
            />
          )}

          {currentDashboardTab === 'leads' && (
            <LeadsPage
              onNavigateTab={setCurrentDashboardTab}
              onSelectLeadForSiteCreation={handleSelectLeadForSite}
            />
          )}

          {currentDashboardTab === 'criar-site' && (
            <WebsiteCreatorPage
              onNavigateTab={setCurrentDashboardTab}
              preselectedLead={selectedLeadForCreation}
            />
          )}

          {currentDashboardTab === 'projetos' && (
            <ProjectsPage
              onNavigateTab={setCurrentDashboardTab}
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
            <PricingPage onBackToApp={() => setCurrentDashboardTab('overview')} />
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
              <PricingPage onBackToApp={() => setCurrentView('landing')} />
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
          setCurrentView('dashboard');
          setCurrentDashboardTab('overview');
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
