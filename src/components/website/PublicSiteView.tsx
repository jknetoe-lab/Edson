import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import { LocalDbService, slugify } from '../../services/supabaseClient';
import { WebsiteRenderer } from './WebsiteRenderer';
import { 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  MessageSquare, 
  ArrowLeft, 
  Globe, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface PublicSiteViewProps {
  slug: string;
  onNavigateHome?: () => void;
}

export const PublicSiteView: React.FC<PublicSiteViewProps> = ({ slug, onNavigateHome }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerCollapsed, setBannerCollapsed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSite() {
      setLoading(true);
      const cleanSlug = slugify(slug);

      // 1. Check local DB first
      const localFound = LocalDbService.getProjectBySlug(cleanSlug);
      if (localFound) {
        if (isMounted) {
          setProject(localFound);
          setLoading(false);
          document.title = `${localFound.site_data.business_name} | Website Oficial`;
        }
        return;
      }

      // 2. Fetch from server API (in case user opened on mobile or another computer)
      try {
        const res = await fetch(`/api/public/site/${cleanSlug}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.project && isMounted) {
            setProject(data.project);
            document.title = `${data.project.site_data.business_name} | Website Oficial`;
          }
        }
      } catch (err) {
        console.error('Erro ao buscar site do cliente:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSite();

    return () => {
      isMounted = false;
      document.title = 'LeadForge AI - Encontre Clientes e Crie Sites com IA';
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center animate-pulse mb-4">
          <Globe className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-base font-bold text-slate-100">Carregando website do cliente...</h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">/site/{slug}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 text-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4 shadow-sm">
          <Globe className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Site não encontrado ou ainda não publicado</h1>
        <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed">
          O link com o nome <code className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">/site/{slug}</code> não foi encontrado ou está em modo rascunho privado no LeadForge.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              else window.location.href = '/';
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o LeadForge AI</span>
          </button>
        </div>
      </div>
    );
  }

  const cleanPhone = (project.site_data.whatsapp || project.site_data.phone || '').replace(/\D/g, '');
  const waTarget = cleanPhone.length === 10 || cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
  const waUrl = `https://wa.me/${waTarget}?text=${encodeURIComponent(`Olá! Vi o site da ${project.site_data.business_name} e gostaria de agendar um atendimento!`)}`;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* Top Floating Client Preview Banner */}
      <div className="sticky top-0 z-50 bg-slate-950 text-white shadow-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-xs">
          
          <div className="flex items-center gap-2.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-semibold text-slate-200 truncate">
              {project.site_data.business_name}
            </span>
            <span className="hidden sm:inline text-slate-500 font-mono text-[11px]">
              · {window.location.host}/site/{project.slug || slug}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* WhatsApp Direct */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-md shadow-2xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp do Negócio</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>

            {/* Return to App */}
            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                else window.location.href = '/';
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
              title="Acessar plataforma LeadForge AI"
            >
              <span>LeadForge</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Website Render */}
      <main className="flex-1">
        <WebsiteRenderer data={project.site_data} isInteractivePreview={false} />
      </main>

      {/* Discrete Client Footer Credit */}
      <footer className="bg-slate-950 text-slate-400 text-[11px] py-4 border-t border-slate-900 text-center">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {project.site_data.business_name}. Todos os direitos reservados.
          </span>
          <div className="flex items-center gap-2 text-slate-500 text-[10px]">
            <span>Desenvolvido e hospedado com alta performance via</span>
            <button 
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                else window.location.href = '/';
              }}
              className="text-indigo-400 hover:underline font-semibold"
            >
              LeadForge AI
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
