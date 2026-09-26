import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { 
  Sparkles, 
  Menu, 
  X, 
  Search, 
  ArrowRight, 
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand single text element */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-600 transition-colors">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              LeadForge <span className="text-indigo-600">AI</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button 
            onClick={() => onNavigate('landing')} 
            className={`hover:text-slate-900 transition-colors ${currentView === 'landing' ? 'text-indigo-600 font-semibold' : ''}`}
          >
            Início
          </button>
          <button 
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className="hover:text-slate-900 transition-colors"
          >
            Recursos
          </button>
          <button 
            onClick={() => onNavigate('planos')} 
            className={`hover:text-slate-900 transition-colors ${currentView === 'planos' ? 'text-indigo-600 font-semibold' : ''}`}
          >
            Preços
          </button>
          <button 
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className="hover:text-slate-900 transition-colors"
          >
            Perguntas Frequentes
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Acessar Painel</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                Entrar
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
              >
                <span>Criar conta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
            >
              Painel
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-base font-medium text-slate-800"
          >
            Início
          </button>
          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
              setTimeout(() => document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className="block w-full text-left py-2 text-base font-medium text-slate-800"
          >
            Recursos
          </button>
          <button
            onClick={() => { onNavigate('planos'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-base font-medium text-slate-800"
          >
            Preços
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {user ? (
              <button
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-slate-900 rounded-lg"
              >
                Ir para o Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-center text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
                >
                  Entrar na conta
                </button>
                <button
                  onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 rounded-lg"
                >
                  Criar conta grátis (5 buscas)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
