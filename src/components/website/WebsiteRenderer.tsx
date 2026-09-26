import React, { useState } from 'react';
import { GeneratedWebsiteData } from '../../types';
import { 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Instagram, 
  Mail, 
  CheckCircle2,
  Menu,
  X,
  ArrowRight,
  Send,
  ExternalLink,
  Navigation,
  Compass,
  Zap,
  Scissors,
  Coffee,
  UtensilsCrossed,
  Smile,
  Leaf,
  HeartHandshake,
  Cpu,
  HeartPulse,
  Heart,
  Car,
  Users,
  Wind,
  Truck,
  RotateCcw,
  Flame,
  Wheat,
  Gift,
  Wrench,
  Smartphone,
  Scale,
  Bell,
  Video,
  Laptop,
  TrendingUp,
  CreditCard,
  Check
} from 'lucide-react';

interface WebsiteRendererProps {
  data: GeneratedWebsiteData;
  isInteractivePreview?: boolean;
}

// Helper to render dynamic icon based on icon string
const DynamicIcon: React.FC<{ iconName: string; className?: string }> = ({ iconName, className = 'w-5 h-5' }) => {
  switch (iconName?.toLowerCase()) {
    case 'scissors': return <Scissors className={className} />;
    case 'coffee': return <Coffee className={className} />;
    case 'utensilscrossed':
    case 'utensils': return <UtensilsCrossed className={className} />;
    case 'smile': return <Smile className={className} />;
    case 'leaf': return <Leaf className={className} />;
    case 'hearthandshake': return <HeartHandshake className={className} />;
    case 'cpu': return <Cpu className={className} />;
    case 'heartpulse': return <HeartPulse className={className} />;
    case 'heart': return <Heart className={className} />;
    case 'car': return <Car className={className} />;
    case 'users': return <Users className={className} />;
    case 'wind': return <Wind className={className} />;
    case 'truck': return <Truck className={className} />;
    case 'rotateccw': return <RotateCcw className={className} />;
    case 'flame': return <Flame className={className} />;
    case 'wheat': return <Wheat className={className} />;
    case 'gift': return <Gift className={className} />;
    case 'wrench': return <Wrench className={className} />;
    case 'smartphone': return <Smartphone className={className} />;
    case 'scale': return <Scale className={className} />;
    case 'bell': return <Bell className={className} />;
    case 'video': return <Video className={className} />;
    case 'laptop': return <Laptop className={className} />;
    case 'trendingup': return <TrendingUp className={className} />;
    case 'creditcard': return <CreditCard className={className} />;
    case 'clock': return <Clock className={className} />;
    case 'award': return <Award className={className} />;
    case 'shieldcheck': return <ShieldCheck className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'sparkles':
    default:
      return <Sparkles className={className} />;
  }
};

export const WebsiteRenderer: React.FC<WebsiteRendererProps> = ({ data, isInteractivePreview = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<{ image_url: string; title: string; caption: string } | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
    setFormName('');
    setFormPhone('');
    setFormMessage('');
  };

  const whatsappClean = (data.whatsapp || data.phone || '').replace(/\D/g, '');
  const initialMessage = data.contact?.whatsapp_message || `Olá! Vim pelo site da ${data.business_name} e gostaria de mais informações.`;
  const whatsappUrl = whatsappClean
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(initialMessage)}`
    : '#';

  const mapsUrl = data.google_maps_url || (data.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.business_name} ${data.address}`)}` : undefined);

  // Dynamic visual presets according to niche
  const niche = data.niche_type || 'geral';
  const isDarkVibe = niche === 'barbearia';
  const isWarmGourmet = niche === 'restaurante' || niche === 'padaria';

  return (
    <div className={`font-sans antialiased selection:bg-emerald-600 selection:text-white min-h-screen flex flex-col ${
      isDarkVibe ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-800'
    }`}>
      
      {/* 1. TOP ANNOUNCEMENT STRIP (Trust & Working Hours) */}
      <div className={`py-1.5 px-4 text-[11px] font-medium border-b flex flex-wrap items-center justify-between gap-2 ${
        isDarkVibe 
          ? 'bg-slate-900 border-slate-800 text-slate-400' 
          : 'bg-slate-900 text-slate-200 border-slate-800'
      }`}>
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4 truncate">
            {data.contact?.opening_hours && (
              <span className="flex items-center gap-1.5 truncate">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{data.contact.opening_hours}</span>
              </span>
            )}
            {data.address && (
              <span className="hidden md:flex items-center gap-1.5 truncate text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{data.address}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {data.rating && data.rating > 0 && (
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-3 h-3 fill-current" />
                <span>{data.rating.toFixed(1)}</span>
                {data.review_count && (
                  <span className="text-slate-400 font-normal">({data.review_count} avaliações)</span>
                )}
              </span>
            )}
            {data.instagram && (
              <a
                href={`https://instagram.com/${data.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
              >
                <Instagram className="w-3 h-3 text-pink-400" />
                <span>{data.instagram}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. HEADER */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${
        isDarkVibe 
          ? 'bg-slate-950/90 border-slate-800/80 shadow-md' 
          : 'bg-white/95 border-slate-100 shadow-2xs'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo / Brand Name */}
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm transition-transform hover:scale-105 ${
              isDarkVibe 
                ? 'bg-amber-500 text-slate-950' 
                : 'bg-slate-900 text-white'
            }`}>
              {data.business_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className={`font-black text-base tracking-tight truncate block max-w-[200px] sm:max-w-xs ${
                isDarkVibe ? 'text-white' : 'text-slate-900'
              }`}>
                {data.business_name}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium -mt-0.5">
                {data.category}
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className={`hidden md:flex items-center gap-6 text-xs font-semibold ${
            isDarkVibe ? 'text-slate-300' : 'text-slate-600'
          }`}>
            <a href="#sobre" className="hover:text-emerald-500 transition-colors">Sobre</a>
            <a href="#servicos" className="hover:text-emerald-500 transition-colors">Serviços</a>
            <a href="#diferenciais" className="hover:text-emerald-500 transition-colors">Diferenciais</a>
            <a href="#galeria" className="hover:text-emerald-500 transition-colors">Galeria</a>
            {data.faq && data.faq.length > 0 && (
              <a href="#faq" className="hover:text-emerald-500 transition-colors">Dúvidas</a>
            )}
            <a href="#localizacao" className="hover:text-emerald-500 transition-colors">Localização</a>
          </nav>

          {/* WhatsApp Header CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>{data.contact?.whatsapp_cta || 'WhatsApp'}</span>
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${
              isDarkVibe ? 'text-slate-300 hover:bg-slate-900' : 'text-slate-700 hover:bg-slate-100'
            }`}
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-b px-4 py-4 space-y-2 text-xs font-semibold animate-in slide-in-from-top-2 ${
            isDarkVibe ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-700'
          }`}>
            <a href="#sobre" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-500">Sobre a Empresa</a>
            <a href="#servicos" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-500">Serviços & Procedimentos</a>
            <a href="#diferenciais" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-500">Por Que Nos Escolher</a>
            <a href="#galeria" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-500">Fotos & Estrutura</a>
            {data.faq && data.faq.length > 0 && (
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-500">Perguntas Frequentes</a>
            )}
            <a href="#localizacao" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-500">Endereço & Contato</a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl mt-3 font-bold shadow-sm"
            >
              {data.contact?.whatsapp_cta || 'Falar no WhatsApp'}
            </a>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section className={`relative py-14 sm:py-20 md:py-24 overflow-hidden border-b ${
        isDarkVibe 
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-slate-800' 
          : isWarmGourmet
          ? 'bg-gradient-to-b from-amber-50/70 via-white to-white border-amber-100/50'
          : 'bg-gradient-to-b from-slate-50 via-white to-white border-slate-100'
      }`}>
        
        {/* Subtle decorative backdrop glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-amber-500/10 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-2xs ${
                isDarkVibe 
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' 
                  : 'bg-slate-900 text-white'
              }">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{data.hero?.badge || `${data.category} de Referência`}</span>
              </div>

              {/* Main Headline */}
              <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] ${
                isDarkVibe ? 'text-white' : 'text-slate-900'
              }`}>
                {data.hero?.title || `${data.business_name}: Excelência e Atendimento Humanizado`}
              </h1>

              {/* Subtitle */}
              <p className={`text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal ${
                isDarkVibe ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {data.hero?.subtitle || data.description}
              </p>

              {/* Hero CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>{data.hero?.cta_primary || 'Falar pelo WhatsApp'}</span>
                </a>

                <a
                  href="#servicos"
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-2xl border transition-all ${
                    isDarkVibe 
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700' 
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
                  }`}
                >
                  <span>{data.hero?.cta_secondary || 'Conhecer Serviços'}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-500" />
                </a>
              </div>

              {/* Trust Badges Bar */}
              <div className={`pt-6 border-t flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs font-semibold ${
                isDarkVibe ? 'border-slate-800 text-slate-400' : 'border-slate-200/80 text-slate-500'
              }`}>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Atendimento Especializado</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Estrutura Confiável</span>
                </span>
                {data.rating && data.rating > 0 ? (
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Nota {data.rating.toFixed(1)} no Google</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Satisfação Garantida</span>
                  </span>
                )}
              </div>

            </div>

            {/* Right Featured Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/20 group">
                <div className="aspect-4/3 sm:aspect-16/11 overflow-hidden bg-slate-900">
                  <img
                    src={data.hero?.background_image || data.gallery?.[0]?.image_url || 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=80'}
                    alt={data.business_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Bottom Floating Badge on Hero Image */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-white flex items-center justify-between shadow-xl">
                  <div>
                    <h3 className="text-xs font-bold truncate">{data.business_name}</h3>
                    <p className="text-[11px] text-slate-300 mt-0.5">{data.tagline}</p>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white shrink-0 ml-3"
                    title="Conversar no WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SOBRE A EMPRESA */}
      <section id="sobre" className={`py-16 sm:py-20 border-b ${
        isDarkVibe ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/60 border-slate-100'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            
            {/* Image side */}
            <div className="md:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/30 shadow-lg aspect-4/3 bg-slate-200">
                <img
                  src={data.gallery?.[1]?.image_url || data.gallery?.[0]?.image_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80'}
                  alt={`Estrutura ${data.business_name}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                  <span className="text-white text-xs font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Compromisso e Rigor Técnico</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Narrative content side */}
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nossa Trajetória & Valores</span>
              </div>
              
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isDarkVibe ? 'text-white' : 'text-slate-900'
              }`}>
                {data.about?.title || `Sobre a ${data.business_name}`}
              </h2>

              <p className={`text-xs sm:text-sm leading-relaxed ${
                isDarkVibe ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {data.about?.text || data.description}
              </p>

              {/* Highlights checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                {(data.about?.highlights || [
                  'Profissionais com formação e atualização contínua',
                  'Atendimento humanizado e sem burocracia',
                  'Instalações modernas e confortáveis',
                  'Transparência total em cada etapa'
                ]).map((hl, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-medium ${
                    isDarkVibe 
                      ? 'bg-slate-900 border-slate-800 text-slate-200' 
                      : 'bg-white border-slate-200/80 text-slate-700 shadow-2xs'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-500 hover:underline"
                >
                  <span>Falar diretamente com um especialista</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. SERVIÇOS & PRODUTOS */}
      <section id="servicos" className={`py-16 sm:py-20 border-b ${
        isDarkVibe ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
              O Que Oferecemos
            </span>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isDarkVibe ? 'text-white' : 'text-slate-900'
            }`}>
              Serviços Especializados
            </h2>
            <p className={`text-xs sm:text-sm ${
              isDarkVibe ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Soluções completas planejadas sob medida para atender você com o mais alto nível de excelência.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(data.services || []).map((svc) => (
              <div
                key={svc.id}
                className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 ${
                  isDarkVibe 
                    ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 shadow-md' 
                    : 'bg-white border-slate-200/90 hover:border-emerald-300 shadow-sm hover:shadow-lg'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <DynamicIcon iconName={svc.icon} className="w-6 h-6" />
                    </div>
                    {svc.highlight && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {svc.highlight}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-base font-bold mb-2 ${
                    isDarkVibe ? 'text-white' : 'text-slate-900'
                  }`}>
                    {svc.title}
                  </h3>

                  <p className={`text-xs leading-relaxed ${
                    isDarkVibe ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {svc.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100/10">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    <span>{svc.cta_text || 'Solicitar no WhatsApp'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. GALERIA & ESTRUTURA */}
      <section id="galeria" className={`py-16 sm:py-20 border-b ${
        isDarkVibe ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/70 border-slate-100'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
              Ambiente & Estrutura
            </span>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isDarkVibe ? 'text-white' : 'text-slate-900'
            }`}>
              Conheça Nossa Estrutura
            </h2>
            <p className={`text-xs sm:text-sm ${
              isDarkVibe ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Fotos de alta qualidade da nossa estrutura e serviços para você conferir de perto.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {(data.gallery || []).map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedGalleryImg(img)}
                className={`group rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  isDarkVibe ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="aspect-4/3 overflow-hidden bg-slate-800 relative">
                  <img
                    src={img.image_url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold">
                      Ampliar Foto
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`text-xs font-bold ${isDarkVibe ? 'text-white' : 'text-slate-900'}`}>
                    {img.title}
                  </h3>
                  <p className={`text-[11px] mt-1 line-clamp-2 ${isDarkVibe ? 'text-slate-400' : 'text-slate-500'}`}>
                    {img.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedGalleryImg && (
        <div 
          onClick={() => setSelectedGalleryImg(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedGalleryImg(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedGalleryImg.image_url}
              alt={selectedGalleryImg.title}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
            <div className="p-5 text-white bg-slate-900">
              <h3 className="text-sm font-bold">{selectedGalleryImg.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedGalleryImg.caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* 7. DIFERENCIAIS */}
      <section id="diferenciais" className="py-16 sm:py-20 bg-slate-950 text-white border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              Por Que Nos Escolher
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Nossos Principais Diferenciais
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Motivos reais pelos quais nossos clientes confiam no nosso trabalho.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(data.differentials || []).map((diff, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800/80 hover:border-emerald-500/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <DynamicIcon iconName={diff.icon} className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{diff.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{diff.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. DEPOIMENTOS (Apenas se houver avaliações reais) */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section id="avaliacoes" className={`py-16 sm:py-20 border-b ${
          isDarkVibe ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                Satisfação Comprovada
              </span>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isDarkVibe ? 'text-white' : 'text-slate-900'
              }`}>
                Avaliações de Clientes Reais
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {data.testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border flex flex-col justify-between ${
                    isDarkVibe ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className={`text-xs italic leading-relaxed mb-4 ${
                      isDarkVibe ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      "{t.content}"
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200/50 flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs font-bold ${isDarkVibe ? 'text-white' : 'text-slate-900'}`}>
                        {t.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{t.role}</p>
                    </div>
                    {t.verified && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Verificado</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 9. FAQ / DÚVIDAS */}
      {data.faq && data.faq.length > 0 && (
        <section id="faq" className={`py-16 sm:py-20 border-b ${
          isDarkVibe ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/60 border-slate-100'
        }`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            
            <div className="text-center mb-10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                Esclarecimentos
              </span>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isDarkVibe ? 'text-white' : 'text-slate-900'
              }`}>
                Perguntas Frequentes
              </h2>
            </div>

            <div className="space-y-3">
              {data.faq.map((faqItem, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isDarkVibe ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className={`w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold ${
                        isDarkVibe ? 'text-white hover:bg-slate-800/50' : 'text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span>{faqItem.question}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {isOpen && (
                      <div className={`px-4 pb-4 text-xs leading-relaxed border-t pt-3 ${
                        isDarkVibe ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                      }`}>
                        {faqItem.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* 10. LOCALIZAÇÃO & CONTATO */}
      <section id="localizacao" className={`py-16 sm:py-20 border-b ${
        isDarkVibe ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            
            {/* Left: Contact Info */}
            <div className="md:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  Atendimento & Endereço
                </span>
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isDarkVibe ? 'text-white' : 'text-slate-900'
                }`}>
                  Fale Diretamente Conosco
                </h2>
                <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                  isDarkVibe ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Estamos prontos para atender você com pontualidade e dedicação.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {data.address && (
                  <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                    isDarkVibe ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <strong className={`block text-xs font-bold mb-0.5 ${isDarkVibe ? 'text-white' : 'text-slate-900'}`}>
                        Endereço
                      </strong>
                      <span className={isDarkVibe ? 'text-slate-300' : 'text-slate-600'}>{data.address}</span>
                      {mapsUrl && (
                        <div className="mt-2">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:underline"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Abrir rota no Google Maps</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(data.phone || data.whatsapp) && (
                  <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                    isDarkVibe ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className={`block text-xs font-bold mb-0.5 ${isDarkVibe ? 'text-white' : 'text-slate-900'}`}>
                        Telefone Comercial / WhatsApp
                      </strong>
                      <span className={`font-mono ${isDarkVibe ? 'text-slate-300' : 'text-slate-600'}`}>
                        {data.phone || data.whatsapp}
                      </span>
                    </div>
                  </div>
                )}

                {data.contact?.opening_hours && (
                  <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                    isDarkVibe ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className={`block text-xs font-bold mb-0.5 ${isDarkVibe ? 'text-white' : 'text-slate-900'}`}>
                        Horário de Atendimento
                      </strong>
                      <span className={isDarkVibe ? 'text-slate-300' : 'text-slate-600'}>
                        {data.contact.opening_hours}
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right: Quick Direct Form */}
            <div className="md:col-span-6">
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg ${
                isDarkVibe ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h3 className={`text-base font-bold mb-1 ${isDarkVibe ? 'text-white' : 'text-slate-900'}`}>
                  Envie uma Mensagem Rápida
                </h3>
                <p className={`text-xs mb-5 ${isDarkVibe ? 'text-slate-400' : 'text-slate-500'}`}>
                  Preencha abaixo e entraremos em contato diretamente com você pelo WhatsApp.
                </p>

                {formSubmitted ? (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-xs font-semibold flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Sua mensagem foi enviada com sucesso! Retornaremos o mais breve possível.</span>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className={`block font-semibold mb-1 ${isDarkVibe ? 'text-slate-300' : 'text-slate-700'}`}>
                        Seu Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ex: Carlos Eduardo"
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          isDarkVibe 
                            ? 'bg-slate-950 border-slate-800 text-white' 
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block font-semibold mb-1 ${isDarkVibe ? 'text-slate-300' : 'text-slate-700'}`}>
                        WhatsApp / Celular com DDD *
                      </label>
                      <input
                        type="text"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="(11) 98765-4321"
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          isDarkVibe 
                            ? 'bg-slate-950 border-slate-800 text-white' 
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block font-semibold mb-1 ${isDarkVibe ? 'text-slate-300' : 'text-slate-700'}`}>
                        Mensagem ou Dúvida
                      </label>
                      <textarea
                        rows={3}
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        placeholder="Gostaria de saber mais informações sobre horários e serviços..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          isDarkVibe 
                            ? 'bg-slate-950 border-slate-800 text-white' 
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Mensagem</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 11. FINAL HIGH CONVERSION CTA */}
      <section className="py-14 sm:py-16 bg-gradient-to-r from-emerald-700 to-teal-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Pronto para transformar sua experiência com a {data.business_name}?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-xl mx-auto">
            Fale agora com nossa equipe pelo WhatsApp oficial e garanta atendimento prioritário.
          </p>
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-emerald-900 text-sm font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
            >
              <MessageSquare className="w-5 h-5 fill-emerald-900" />
              <span>{data.contact?.whatsapp_cta || 'Conversar pelo WhatsApp'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 12. FLOATING WHATSAPP BUTTON */}
      <aside aria-label="Atendimento WhatsApp" className="fixed bottom-5 right-5 z-40">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group"
        >
          <MessageSquare className="w-5 h-5 fill-white animate-pulse" />
          <span className="hidden sm:inline font-bold">Falar no WhatsApp</span>
        </a>
      </aside>

      {/* 13. FOOTER */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-10 text-xs border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white text-sm">{data.business_name}</span>
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">· {data.category}</span>
              </div>
              <p className="text-[11px] text-slate-500 max-w-md">
                {data.tagline || `Excelência e atendimento dedicado em ${data.category}.`}
              </p>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              {data.instagram && (
                <a
                  href={`https://instagram.com/${data.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {data.phone && (
                <a href={`tel:${data.phone.replace(/\D/g, '')}`} className="hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} {data.business_name}. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1">
              <span>Site desenvolvido com</span>
              <strong className="text-slate-300 font-semibold">LeadForge AI</strong>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};
