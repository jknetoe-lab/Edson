import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { WebsiteGeneratorService, WebsiteGenerationParams } from '../../services/websiteGeneratorService';
import { LocalDbService, slugify } from '../../services/supabaseClient';
import { GeneratedWebsiteData, Lead, BusinessSearchResult, Project } from '../../types';
import { WebsiteRenderer } from '../website/WebsiteRenderer';
import { 
  Wand2, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Save, 
  Globe, 
  Code, 
  Copy, 
  Check, 
  Sparkles, 
  Eye, 
  ArrowLeft,
  ChevronDown,
  Link as LinkIcon,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldCheck,
  Star,
  Info,
  Edit3
} from 'lucide-react';
import { DashboardTab } from './DashboardLayout';

interface WebsiteCreatorPageProps {
  onNavigateTab: (tab: DashboardTab) => void;
  preselectedLead?: Lead | BusinessSearchResult | null;
}

export const WebsiteCreatorPage: React.FC<WebsiteCreatorPageProps> = ({
  onNavigateTab,
  preselectedLead,
}) => {
  const { user } = useAuth();
  const savedLeads = LocalDbService.getLeads(user?.user_id);

  // Form Fields
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [services, setServices] = useState('');
  const [instagram, setInstagram] = useState('');
  const [openingHours, setOpeningHours] = useState('Segunda a Sexta: 08h às 18h | Sábado: 08h às 12h');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [reviewCount, setReviewCount] = useState<number | undefined>(undefined);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [desiredColors, setDesiredColors] = useState('Automático pelo Nicho');
  const [style, setStyle] = useState('Moderno e Profissional');
  const [customPrompt, setCustomPrompt] = useState('');
  const [whatsappStatus, setWhatsappStatus] = useState<'confirmed' | 'unconfirmed' | 'none'>('unconfirmed');
  const promptTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Generator State
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [generatedSiteData, setGeneratedSiteData] = useState<GeneratedWebsiteData | null>(null);
  const [customSlug, setCustomSlug] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'seo'>('preview');
  const [savedProjectSuccess, setSavedProjectSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Auto-fill from preselected lead if provided
  useEffect(() => {
    if (preselectedLead) {
      const leadName = 'business_name' in preselectedLead ? preselectedLead.business_name : preselectedLead.name;
      setBusinessName(leadName || '');
      setCategory(preselectedLead.category || '');
      setPhone(preselectedLead.phone || '');

      // Verificação rigorosa de WhatsApp: nunca inventar WhatsApp a partir de telefone fixo ou não confirmado
      const leadWhatsappStatus = ('whatsapp_status' in preselectedLead && preselectedLead.whatsapp_status)
        ? preselectedLead.whatsapp_status
        : (preselectedLead.whatsapp ? 'confirmed' : 'unconfirmed');
      setWhatsappStatus(leadWhatsappStatus);

      const verifiedWhatsapp = (leadWhatsappStatus === 'confirmed' && preselectedLead.whatsapp)
        ? preselectedLead.whatsapp
        : '';
      setWhatsapp(verifiedWhatsapp);

      setAddress(preselectedLead.address || '');
      setCity(preselectedLead.city || '');
      setState(preselectedLead.state || '');
      setRating(preselectedLead.rating || undefined);
      setReviewCount(preselectedLead.review_count || undefined);
      setGoogleMapsUrl(preselectedLead.google_maps_url || '');

      const initialCustomPrompt = ('custom_prompt' in preselectedLead && (preselectedLead as any).custom_prompt) 
        ? String((preselectedLead as any).custom_prompt) 
        : '';
      if (initialCustomPrompt) {
        setCustomPrompt(initialCustomPrompt);
      }

      const baseDesc = ('notes' in preselectedLead ? preselectedLead.notes : undefined) || `Empresa e atendimento de ${preselectedLead.category || 'serviços'} com excelente reputação de clientes locais em ${preselectedLead.city || 'nossa região'}.`;
      setDescription(baseDesc);

      const handleCleanName = (leadName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      setInstagram(`@${handleCleanName}`);
      
      // Auto generate on arrival if lead was directly clicked from prospecting or leads
      handleAutoGenerateFromLead({
        business_name: leadName || '',
        category: preselectedLead.category || '',
        description: baseDesc,
        phone: preselectedLead.phone || '',
        whatsapp: verifiedWhatsapp,
        whatsapp_status: leadWhatsappStatus,
        address: preselectedLead.address || '',
        city: preselectedLead.city || '',
        state: preselectedLead.state || '',
        rating: preselectedLead.rating,
        review_count: preselectedLead.review_count,
        google_maps_url: preselectedLead.google_maps_url,
        instagram: `@${handleCleanName}`,
        custom_prompt: initialCustomPrompt || customPrompt,
      });
    }
  }, [preselectedLead]);

  const handleSelectSavedLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    const found = savedLeads.find(l => l.id === leadId);
    if (found) {
      setBusinessName(found.business_name);
      setCategory(found.category);
      setPhone(found.phone || '');

      const isWpConfirmed = found.whatsapp_status === 'confirmed';
      setWhatsappStatus(found.whatsapp_status || (found.whatsapp ? 'confirmed' : 'unconfirmed'));
      setWhatsapp(isWpConfirmed ? (found.whatsapp || '') : '');

      setAddress(found.address);
      setCity(found.city);
      setState(found.state);
      setRating(found.rating);
      setReviewCount(found.review_count);
      setGoogleMapsUrl(found.google_maps_url || '');
      setDescription(found.notes || `Referência em ${found.category} em ${found.city}, oferecendo suporte dedicado e atendimento pontual.`);
      setInstagram(`@${found.business_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
    }
  };

  const handleAutoGenerateFromLead = async (leadData: Partial<WebsiteGenerationParams>) => {
    setGenerating(true);
    try {
      const params: WebsiteGenerationParams = {
        business_name: leadData.business_name || '',
        category: leadData.category || '',
        description: leadData.description,
        phone: leadData.phone,
        whatsapp: leadData.whatsapp,
        whatsapp_status: leadData.whatsapp_status || whatsappStatus,
        address: leadData.address,
        city: leadData.city,
        state: leadData.state,
        rating: leadData.rating,
        review_count: leadData.review_count,
        google_maps_url: leadData.google_maps_url,
        instagram: leadData.instagram,
        opening_hours: openingHours,
        desired_colors: desiredColors,
        style,
        custom_prompt: leadData.custom_prompt || customPrompt,
      };

      const result = await WebsiteGeneratorService.generateWebsite(params);
      setGeneratedSiteData(result);
      setCustomSlug(slugify(result.business_name));
    } catch (err) {
      console.error('Erro na geração automática do site:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGenerating(true);
    setSavedProjectSuccess(false);

    try {
      const params: WebsiteGenerationParams = {
        business_name: businessName,
        category,
        description,
        phone,
        whatsapp,
        whatsapp_status: whatsappStatus,
        address,
        city,
        state,
        services,
        instagram,
        opening_hours: openingHours,
        rating,
        review_count: reviewCount,
        google_maps_url: googleMapsUrl,
        desired_colors: desiredColors,
        style,
        custom_prompt: customPrompt,
      };

      const result = await WebsiteGeneratorService.generateWebsite(params);
      setGeneratedSiteData(result);
      setCustomSlug(slugify(result.business_name));
    } catch (err) {
      console.error('Erro ao gerar site:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const params: WebsiteGenerationParams = {
        business_name: businessName,
        category,
        description,
        phone,
        whatsapp,
        whatsapp_status: whatsappStatus,
        address,
        city,
        state,
        services,
        instagram,
        opening_hours: openingHours,
        rating,
        review_count: reviewCount,
        google_maps_url: googleMapsUrl,
        desired_colors: desiredColors,
        style,
        custom_prompt: customPrompt,
      };
      const result = await WebsiteGeneratorService.generateWebsite(params);
      setGeneratedSiteData(result);
    } catch (err) {
      console.error('Erro ao regenerar site:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleSaveProject = async (status: 'Rascunho' | 'Publicado' = 'Rascunho') => {
    if (!generatedSiteData || !user) return;

    const projectId = 'proj_' + Date.now();
    const cleanSlug = slugify(customSlug || generatedSiteData.business_name);
    const newProject: Project = {
      id: projectId,
      user_id: user.user_id || user.id,
      lead_id: selectedLeadId || undefined,
      name: `${generatedSiteData.business_name} - Site Institucional`,
      description: generatedSiteData.tagline,
      status,
      slug: cleanSlug,
      custom_slug: cleanSlug,
      website_url: `/site/${cleanSlug}`,
      site_data: generatedSiteData,
      custom_prompt: customPrompt || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Save in local browser storage
    LocalDbService.saveProject(newProject);

    // 2. Sync to server public registry so anyone opening on mobile gets it instantly
    try {
      await fetch('/api/public/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
    } catch (e) {
      console.warn('Sync to public project server registry:', e);
    }

    setSavedProjectSuccess(true);
    setTimeout(() => setSavedProjectSuccess(false), 4000);
  };

  const handleCopyLink = () => {
    if (!generatedSiteData) return;
    const cleanSlug = slugify(customSlug || generatedSiteData.business_name);
    const url = `${window.location.origin}/site/${cleanSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!generatedSiteData) return;
    const jsonStr = JSON.stringify(generatedSiteData, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              Criar Site com IA
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              Nível Agência Digital
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gera sites institucionais completos, com fotos em alta definição, SEO, WhatsApp estratégico e design sob medida para o nicho da empresa.
          </p>
        </div>

        {generatedSiteData && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{regenerating ? 'Regenerando...' : 'Regenerar Design'}</span>
            </button>
            <button
              onClick={() => handleSaveProject('Rascunho')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Rascunho</span>
            </button>
            <button
              onClick={() => handleSaveProject('Publicado')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Publicar Site</span>
            </button>
          </div>
        )}
      </div>

      {savedProjectSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Site salvo com sucesso! O link do cliente já está pronto para compartilhamento via WhatsApp.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="text-emerald-700 hover:text-emerald-900 underline font-bold"
            >
              Copiar Link
            </button>
            <button
              onClick={() => onNavigateTab('projetos')}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold"
            >
              Meus Projetos
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Form Inputs (Left) and Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          
          {/* Lead Selector Helper */}
          {savedLeads.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Importar dados de um Lead salvo
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleSelectSavedLead(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="">-- Selecione um lead ou digite manualmente --</option>
                {savedLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.business_name} ({l.city} - {l.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome da empresa *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: Barbearia Dom Pedro Vintage"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nicho / Segmento *
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Barbearia, Restaurante, Dentista..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp (DDD + Número) *
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="11987654321"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone Fixo / Comercial
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 3210-4400"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@empresa"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Endereço completo da empresa
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua Augusta, 1200 - Consolação, São Paulo - SP"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado (UF)
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="SP"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Serviços ou Produtos (separados por vírgula)
              </label>
              <input
                type="text"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="Ex: Corte Degradê, Barboterapia, Hidratação, Barba com Toalha Quente"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Horário de funcionamento
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="Segunda a Sábado das 09h às 20h"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apresentação ou Proposta de Valor
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Informações adicionais reais sobre o estabelecimento..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Identidade Visual
                </label>
                <select
                  value={desiredColors}
                  onChange={(e) => setDesiredColors(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  <option value="Automático pelo Nicho">Automático pelo Nicho (Recomendado)</option>
                  <option value="Slate & Dourado Vintage">Slate & Dourado Vintage</option>
                  <option value="Vinho & Laranja Gastronômico">Vinho & Laranja Gastronômico</option>
                  <option value="Azul & Ciano Tecnológico">Azul & Ciano Tecnológico</option>
                  <option value="Verde Esmeralda Natural">Verde Esmeralda Natural</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estilo
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  <option value="Moderno e Profissional">Moderno e Profissional</option>
                  <option value="Premium & Elegante">Premium & Elegante</option>
                  <option value="Acolhedor & Humanizado">Acolhedor & Humanizado</option>
                  <option value="Artesanal & Tradicional">Artesanal & Tradicional</option>
                </select>
              </div>
            </div>

            {/* ✨ Personalização da IA (Opcional) */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>✨ Personalização da IA</span>
                </label>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Opcional
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Descreva como você quer personalizar este site.
              </p>
              <textarea
                ref={promptTextareaRef}
                rows={4}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ex: Quero um site moderno e premium, com azul escuro e branco, destaque para os principais serviços e um botão de WhatsApp..."
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-y leading-relaxed font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full mt-3 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gerando site completo com IA...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Gerar Site Profissional</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Right Column: Interactive Live Preview & Code View */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          
          {/* Top Bar for Preview Controls */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            
            {/* Viewport switch */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                title="Computador / Desktop"
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
                  viewport === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                title="Tablet"
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
                  viewport === 'tablet' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                title="Celular / Mobile First"
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
                  viewport === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Celular</span>
              </button>
            </div>

            {/* Tab switch */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'preview' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Visualizar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'seo' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SEO & Tags
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'code' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Código JSON
              </button>
            </div>

          </div>

          {/* Client Public Link bar */}
          {generatedSiteData && (
            <div className="px-4 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5 shrink-0">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Link do Cliente:
                </span>
                <span className="text-slate-500 font-mono text-[11px] shrink-0">/site/</span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(slugify(e.target.value))}
                  placeholder="nome-da-empresa"
                  className="px-2.5 py-1 text-xs font-mono bg-white border border-emerald-300 rounded-lg text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 max-w-[220px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    copiedLink ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Link para WhatsApp</span>
                    </>
                  )}
                </button>
                <a
                  href={`/site/${customSlug || slugify(generatedSiteData.business_name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100/50 rounded-lg"
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Personalização utilizada Card */}
          {generatedSiteData && !generating && (
            <div className="mx-4 my-3 p-3.5 bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-emerald-50/70 border border-indigo-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Personalização utilizada
                  </span>
                </div>
                <p className="text-xs text-slate-700 bg-white/80 px-2.5 py-1.5 rounded-lg border border-indigo-100 font-medium line-clamp-2">
                  {customPrompt.trim() ? customPrompt : 'Padrão inteligente adaptado ao nicho da empresa (sem personalização extra).'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    promptTextareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    promptTextareaRef.current?.focus();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Editar prompt</span>
                </button>

                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                  <span>{regenerating ? 'Regenerando...' : 'Regenerar site'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Viewport Canvas Container */}
          <div className="p-4 bg-slate-100/80 min-h-[600px] flex items-center justify-center overflow-x-auto">
            {generating ? (
              <div className="text-center py-20 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm animate-pulse">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Gerando site completo com IA...
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Construindo layout responsivo, copy persuasivo, paleta cromática do nicho e seções de alta conversão.
                </p>
              </div>
            ) : generatedSiteData ? (
              activeTab === 'preview' ? (
                <div
                  className={`bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 border border-slate-200 max-h-[780px] overflow-y-auto ${
                    viewport === 'mobile'
                      ? 'w-[375px] ring-12 ring-slate-900 rounded-[36px]'
                      : viewport === 'tablet'
                      ? 'w-[768px] ring-8 ring-slate-800 rounded-[28px]'
                      : 'w-full'
                  }`}
                >
                  <WebsiteRenderer data={generatedSiteData} isInteractivePreview={true} />
                </div>
              ) : activeTab === 'seo' ? (
                <div className="w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">SEO & Compartilhamento Social Otimizados</h3>
                      <p className="text-xs text-slate-500">Configurado automaticamente para o Google e pré-visualização no WhatsApp</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Título da Página (Google Title Tag):</span>
                      <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800">
                        {generatedSiteData.seo?.meta_title || `${generatedSiteData.business_name} | ${generatedSiteData.category}`}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Meta Description (Snippet do Google):</span>
                      <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                        {generatedSiteData.seo?.meta_description || generatedSiteData.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Open Graph Title (WhatsApp/Facebook):</span>
                        <p className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                          {generatedSiteData.seo?.og_title || generatedSiteData.business_name}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Nicho Detectado:</span>
                        <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold uppercase tracking-wider text-[11px] border border-emerald-200">
                          {generatedSiteData.niche_type || 'geral'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-slate-950 text-slate-200 rounded-2xl p-5 font-mono text-xs overflow-auto max-h-[600px] border border-slate-800">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <span className="text-slate-400">site-data.json</span>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] flex items-center gap-1 font-sans font-semibold"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copiado!' : 'Copiar JSON'}</span>
                    </button>
                  </div>
                  <pre>{JSON.stringify(generatedSiteData, null, 2)}</pre>
                </div>
              )
            ) : (
              <div className="text-center py-20 space-y-3">
                <Wand2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">Nenhum site gerado ainda</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Preencha os campos ao lado com as informações da empresa e clique em "Gerar Site Profissional".
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessName('Dom Pedro Barbearia Clássica');
                      setCategory('Barbearia');
                      setPhone('(11) 3284-5510');
                      setWhatsapp('11998765432');
                      setAddress('Rua Oscar Freire, 1400 - Cerqueira César, São Paulo - SP');
                      setCity('São Paulo');
                      setState('SP');
                      setServices('Corte Degradê na Navalha, Barboterapia com Toalha Quente, Pigmentação de Barba, Hidratação Premium');
                      setDescription('Barbearia premium tradicional com atendimento pontual, toalha quente e ambiente climatizado com chopp artesanal.');
                    }}
                    className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
                  >
                    Carregar Exemplo de Barbearia
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
