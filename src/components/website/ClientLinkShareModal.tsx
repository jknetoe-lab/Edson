import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Project } from '../../types';
import { slugify, LocalDbService } from '../../services/supabaseClient';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  QrCode, 
  MessageSquare, 
  Globe, 
  Link as LinkIcon,
  Sparkles,
  Lock,
  Eye,
  CheckCircle2
} from 'lucide-react';

interface ClientLinkShareModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: (updated: Project) => void;
}

export const ClientLinkShareModal: React.FC<ClientLinkShareModalProps> = ({
  project,
  isOpen,
  onClose,
  onProjectUpdated,
}) => {
  const [slug, setSlug] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [customPitch, setCustomPitch] = useState('');

  // Origem atual (fallback limpo)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://leadforge.site';

  useEffect(() => {
    if (project) {
      const initialSlug = project.slug || project.custom_slug || slugify(project.site_data.business_name);
      setSlug(initialSlug);
      
      const fullUrl = `${origin}/site/${initialSlug}`;
      setCustomPitch(
        `Olá! Aqui é da agência digital. Conforme combinamos, desenvolvi uma demonstração exclusiva do novo site profissional da *${project.site_data.business_name}* com inteligência artificial.\n\nFicou muito moderno, com agendamento direto no WhatsApp e pronto para celulares! 📱🚀\n\nAcesse o link oficial da sua empresa para conferir:\n👉 ${fullUrl}\n\nO que você achou? Ficou com a cara do seu negócio?`
      );
    }
  }, [project, origin, isOpen]);

  // Generate QR Code when slug or visibility changes
  useEffect(() => {
    if (slug) {
      const fullUrl = `${origin}/site/${slug}`;
      QRCode.toDataURL(fullUrl, { width: 260, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Erro ao gerar QRCode:', err));
    }
  }, [slug, origin]);

  if (!isOpen) return null;

  const currentCleanSlug = slugify(slug || project.site_data.business_name);
  const fullPublicUrl = `${origin}/site/${currentCleanSlug}`;
  const directQueryUrl = `${origin}/?site=${currentCleanSlug}`;

  const handleSlugChange = (val: string) => {
    // Permite digitação mas limpa caracteres inválidos
    const sanitized = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(sanitized);
    setSaveSuccess(false);
  };

  const handleSaveSlug = () => {
    setIsSaving(true);
    const updated: Project = {
      ...project,
      slug: currentCleanSlug,
      custom_slug: currentCleanSlug,
      website_url: `/site/${currentCleanSlug}`,
      status: 'Publicado', // ao salvar o link do cliente, garante status publicado
    };

    LocalDbService.saveProject(updated);
    onProjectUpdated(updated);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullPublicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customPitch);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleOpenClientWhatsApp = () => {
    const rawPhone = (project.site_data.whatsapp || project.site_data.phone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 || rawPhone.length === 11 ? `55${rawPhone}` : rawPhone;
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customPitch)}`
      : `https://wa.me/?text=${encodeURIComponent(customPitch)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Link do Site do Cliente
              </h2>
              <p className="text-xs text-slate-500">
                Personalize o nome da URL para enviar para <strong className="text-slate-700">{project.site_data.business_name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* 1. Slug Editor Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <span>Nome do Link / URL Personalizada para o Cliente</span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-normal">
                  URL Amigável
                </span>
              </label>
              {saveSuccess && (
                <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Link salvo!
                </span>
              )}
            </div>

            {/* URL Input Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <span className="text-slate-400 select-none font-mono text-[11px] sm:text-xs">
                  {origin}/site/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="nome-do-cliente"
                  className="w-full bg-transparent border-none outline-none font-mono font-semibold text-slate-900 text-xs px-0.5"
                />
              </div>

              <button
                onClick={handleSaveSlug}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Link</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Dica: use apenas letras, números e hífens. Ex: <code className="text-slate-700 bg-slate-200/60 px-1 py-0.5 rounded">dra-camila-soares</code> ou <code className="text-slate-700 bg-slate-200/60 px-1 py-0.5 rounded">barbearia-don-corleone</code>.
            </p>
          </div>

          {/* 2. Direct Actions (Copy, Open, WhatsApp, QR Code) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Copy Button */}
            <button
              onClick={handleCopyLink}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                copiedLink 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${copiedLink ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs">
                    {copiedLink ? 'Link Copiado!' : 'Copiar Link'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Enviar no chat ou email
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-indigo-600">
                {copiedLink ? 'Pronto' : 'Copiar'}
              </span>
            </button>

            {/* Test / View Button */}
            <a
              href={fullPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs">Abrir como Cliente</div>
                  <div className="text-[11px] text-slate-400">Ver exatamente como o cliente vê</div>
                </div>
              </div>
              <Eye className="w-4 h-4 text-slate-400" />
            </a>

            {/* Send WhatsApp Button */}
            <button
              onClick={handleOpenClientWhatsApp}
              className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-900 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs">Enviar no WhatsApp</div>
                  <div className="text-[11px] text-emerald-700">Com mensagem pronta de proposta</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700">Abrir WhatsApp</span>
            </button>

            {/* QR Code Toggle Button */}
            <button
              onClick={() => setShowQrCode(!showQrCode)}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                showQrCode 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${showQrCode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs">Código QR do Site</div>
                  <div className={`text-[11px] ${showQrCode ? 'text-slate-300' : 'text-slate-400'}`}>
                    Para mostrar no celular ao vivo
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold">
                {showQrCode ? 'Fechar QR' : 'Exibir QR'}
              </span>
            </button>

          </div>

          {/* 3. QR Code View (Expandable) */}
          {showQrCode && (
            <div className="bg-slate-900 text-white rounded-xl p-5 text-center space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <h4 className="text-xs font-bold text-slate-200">
                Aponte a câmera do celular para abrir o site de {project.site_data.business_name}
              </h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Ideal para reuniões presenciais: mostre o QR code na tela para o cliente escanear e ver a demonstração no próprio celular dele.
              </p>
              {qrCodeDataUrl ? (
                <div className="inline-block p-3 bg-white rounded-xl shadow-lg">
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-44 h-44 mx-auto" />
                </div>
              ) : (
                <div className="w-44 h-44 mx-auto flex items-center justify-center bg-slate-800 rounded-xl text-slate-500">
                  Gerando QR...
                </div>
              )}
              <div className="pt-1">
                <a
                  href={qrCodeDataUrl}
                  download={`qrcode-${currentCleanSlug}.png`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Baixar imagem do QR Code</span>
                </a>
              </div>
            </div>
          )}

          {/* 4. Pre-written Pitch Message for Client */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Roteiro de Abordagem para o WhatsApp do Cliente</span>
              </label>
              <button
                onClick={handleCopyMessage}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                {copiedMessage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMessage ? 'Mensagem copiada!' : 'Copiar texto'}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={customPitch}
              onChange={(e) => setCustomPitch(e.target.value)}
              className="w-full text-[11px] p-2.5 border border-slate-200 rounded-lg text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans leading-relaxed"
            />

            <p className="text-[10px] text-slate-400">
              Você pode editar o texto antes de enviar ou copiar direto para o WhatsApp Web.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 truncate max-w-xs">
            Link público: <span className="font-mono text-slate-700">{fullPublicUrl}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg transition-colors text-xs"
            >
              Fechar
            </button>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs transition-colors text-xs flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
