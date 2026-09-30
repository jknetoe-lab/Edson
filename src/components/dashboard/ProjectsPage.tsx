import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { LocalDbService, slugify } from '../../services/supabaseClient';
import { Project, ProjectStatus } from '../../types';
import { WebsiteRenderer } from '../website/WebsiteRenderer';
import { ClientLinkShareModal } from '../website/ClientLinkShareModal';
import { 
  FolderKanban, 
  Globe, 
  Edit3, 
  Eye, 
  Trash2, 
  Sparkles, 
  ExternalLink, 
  Wand2, 
  X,
  CheckCircle2,
  Calendar,
  Link as LinkIcon,
  Copy,
  Check,
  Share2,
  MessageSquare
} from 'lucide-react';
import { DashboardTab } from './DashboardLayout';

interface ProjectsPageProps {
  onNavigateTab: (tab: DashboardTab) => void;
  onEditProject: (project: Project) => void;
}

const STATUS_BADGES: Record<ProjectStatus, { label: string; color: string }> = {
  Rascunho: { label: 'Rascunho', color: 'bg-slate-100 text-slate-700' },
  'Em edição': { label: 'Em edição', color: 'bg-amber-50 text-amber-700' },
  Publicado: { label: 'Publicado', color: 'bg-emerald-50 text-emerald-700' },
};

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigateTab, onEditProject }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [shareModalProject, setShareModalProject] = useState<Project | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const loadProjects = () => {
    if (!user) return;
    const items = LocalDbService.getProjects(user.user_id);
    setProjects(items);
  };

  useEffect(() => {
    loadProjects();
  }, [user]);

  const handleTogglePublish = (project: Project) => {
    const newStatus: ProjectStatus = project.status === 'Publicado' ? 'Rascunho' : 'Publicado';
    const currentSlug = project.slug || slugify(project.site_data.business_name);
    const updated: Project = {
      ...project,
      status: newStatus,
      slug: currentSlug,
      custom_slug: currentSlug,
      website_url: newStatus === 'Publicado' ? `/site/${currentSlug}` : undefined,
    };
    LocalDbService.saveProject(updated);
    loadProjects();
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      LocalDbService.deleteProject(id);
      loadProjects();
    }
  };

  const handleQuickCopyLink = (proj: Project) => {
    const cleanSlug = proj.slug || slugify(proj.site_data.business_name);
    const url = `${origin}/site/${cleanSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(proj.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Meus Projetos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie os sites gerados para seus clientes, publique ou edite o conteúdo a qualquer momento.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('criar-site')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Wand2 className="w-4 h-4" />
          <span>Criar novo site</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
          <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">Nenhum projeto criado ainda</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Utilize a ferramenta de Criação com IA para gerar o primeiro site profissional para um cliente da sua lista de leads.
          </p>
          <button
            onClick={() => onNavigateTab('criar-site')}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
          >
            Criar meu primeiro site com IA
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const statusCfg = STATUS_BADGES[proj.status] || STATUS_BADGES.Rascunho;
            return (
              <div
                key={proj.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Mock Visual Top preview banner */}
                  <div className="h-32 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                    <img
                      src={proj.site_data?.gallery?.[0]?.image_url || '/src/assets/images/website_sample_preview_1790369987556.jpg'}
                      alt={proj.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewProject(proj)}
                        className="px-3 py-1.5 bg-white text-slate-900 rounded-md text-xs font-semibold shadow-md flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualizar Site</span>
                      </button>
                    </div>

                    <span className={`absolute top-2.5 right-2.5 text-[10px] px-2 py-0.5 rounded font-semibold ${statusCfg.color} shadow-2xs`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <span className="text-[10px] font-semibold text-indigo-600 block mb-0.5">
                      {proj.site_data?.category || 'Website Profissional'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {proj.description || proj.site_data?.tagline}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(proj.created_at).toLocaleDateString('pt-BR')}</span>
                      {proj.status === 'Publicado' && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600 font-mono font-medium truncate">
                            Online
                          </span>
                        </>
                      )}
                    </div>

                    {/* Personalização Salva */}
                    {proj.custom_prompt && (
                      <div className="mt-2.5 px-2.5 py-1.5 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-start gap-1.5 text-[11px] text-indigo-900">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          <strong>Personalização:</strong> {proj.custom_prompt}
                        </span>
                      </div>
                    )}

                    {/* Client Custom Link Bar */}
                    <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-200/80 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-indigo-600" />
                          Link do Cliente
                        </span>
                        <button
                          onClick={() => setShareModalProject(proj)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Personalizar
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-slate-200">
                        <span className="font-mono text-[11px] text-slate-700 truncate font-medium">
                          /site/{proj.slug || slugify(proj.site_data.business_name)}
                        </span>
                        <button
                          onClick={() => handleQuickCopyLink(proj)}
                          className={`ml-2 p-1 rounded hover:bg-slate-100 transition-colors text-[11px] font-semibold flex items-center gap-1 ${
                            copiedId === proj.id ? 'text-emerald-600' : 'text-slate-600'
                          }`}
                          title="Copiar Link para Cliente"
                        >
                          {copiedId === proj.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-[10px]">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShareModalProject(proj)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-1.5"
                      title="Compartilhar Link e Roteiro de Vendas"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Link & QR</span>
                    </button>
                    <button
                      onClick={() => setPreviewProject(proj)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors text-xs"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditProject(proj)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors text-xs"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors text-xs"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleTogglePublish(proj)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                      proj.status === 'Publicado'
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{proj.status === 'Publicado' ? 'Despublicar' : 'Publicar'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {previewProject && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
          <div className="h-14 bg-slate-900 px-6 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">Preview ao Vivo:</span>
              <span className="text-sm font-bold">{previewProject.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const proj = previewProject;
                  setPreviewProject(null);
                  setShareModalProject(proj);
                }}
                className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-1.5 shadow-sm"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link do Cliente</span>
              </button>
              {previewProject.status === 'Publicado' && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded font-mono">
                  Site Publicado
                </span>
              )}
              <button
                onClick={() => setPreviewProject(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            <WebsiteRenderer data={previewProject.site_data} isInteractivePreview={false} />
          </div>
        </div>
      )}

      {/* Client Link Customization & Sharing Modal */}
      {shareModalProject && (
        <ClientLinkShareModal
          project={shareModalProject}
          isOpen={Boolean(shareModalProject)}
          onClose={() => setShareModalProject(null)}
          onProjectUpdated={(updated) => {
            loadProjects();
            setShareModalProject(updated);
          }}
        />
      )}

    </div>
  );
};
