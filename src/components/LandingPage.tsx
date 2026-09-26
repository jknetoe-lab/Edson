import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Wand2, 
  Users, 
  FolderKanban, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  Play
} from 'lucide-react';
import { useAuth } from '../services/authContext';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onNavigate }) => {
  const { user } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Mini live demo state on landing page
  const [demoNiche, setDemoNiche] = useState('Dentistas');
  const [demoCity, setDemoCity] = useState('Belo Horizonte');

  const features = [
    {
      icon: Search,
      title: 'Encontrar empresas',
      description: 'Localize rapidamente negócios físicos e prestadores de serviços em qualquer estado e cidade do Brasil com dados completos.',
      tag: 'Prospecção Ativa',
    },
    {
      icon: Filter,
      title: 'Filtrar empresas sem site',
      description: 'Identifique na hora quais estabelecimentos ainda não possuem site cadastrado no Google ou possuem sites antigos não adaptados para celular.',
      tag: 'Alta Conversão',
    },
    {
      icon: Wand2,
      title: 'Criar sites com IA',
      description: 'Gere sites institucionais completos com headline, copy comercial, serviços, depoimentos e botão de WhatsApp prontos para apresentar.',
      tag: 'Geração Instantânea',
    },
    {
      icon: Users,
      title: 'Organizar leads',
      description: 'Gerencie seu funil de prospecção do primeiro contato até o fechamento com status de negociação e anotações privadas.',
      tag: 'Pipeline CRM',
    },
    {
      icon: FolderKanban,
      title: 'Gerenciar projetos',
      description: 'Mantenha todos os sites e rascunhos dos seus clientes organizados em um único painel profissional com preview responsivo.',
      tag: 'Gestão Centralizada',
    },
    {
      icon: TrendingUp,
      title: 'Aumentar suas vendas',
      description: 'Utilize nossa calculadora de preços sugeridos e nosso Mentor IA de vendas para enviar propostas assertivas de R$ 1.500 a R$ 3.500.',
      tag: 'Mais Lucro',
    },
  ];

  const testimonials = [
    {
      name: 'Matheus Guimarães',
      role: 'Web Designer Freelancer',
      location: 'Belo Horizonte, MG',
      content: 'Antes eu perdia horas procurando empresas no Google Maps manualmente. Com o LeadForge AI filtrei 30 dentistas sem site na Savassi e fechei 3 contratos de R$ 2.200 na primeira semana mostrando o site gerado com IA.',
      rating: 5,
    },
    {
      name: 'Larissa Albuquerque',
      role: 'Sócia na Agência Vértice Digital',
      location: 'Curitiba, PR',
      content: 'A ferramenta de gerar o contrato e a calculadora de preços facilitaram muito nosso processo comercial. Nossos clientes ficam impressionados quando mandamos a prévia do site no WhatsApp minutos após a primeira conversa.',
      rating: 5,
    },
    {
      name: 'Felipe Santana',
      role: 'Desenvolvedor Frontend',
      location: 'São Paulo, SP',
      content: 'O código gerado e a estrutura do site são muito limpos e adequados para o público brasileiro. O botão de WhatsApp flutuante já vem pronto, o que é essencial para o comércio local.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'O que é o LeadForge AI?',
      a: 'É uma plataforma SaaS tudo-em-um desenvolvida especialmente para freelancers, designers e agências digitais no Brasil. O sistema ajuda a encontrar empresas locais que precisam de um site, filtrar estabelecimentos sem site e gerar projetos profissionais com inteligência artificial para acelerar suas vendas.',
    },
    {
      q: 'Quantas buscas recebo no plano gratuito?',
      a: 'Ao criar sua conta gratuita, você recebe imediatamente 5 buscas completas de prospecção com filtros por nicho, cidade e presença de site, além de acesso ao gerador de sites com IA e dashboard.',
    },
    {
      q: 'Os sites gerados com IA funcionam em celular?',
      a: 'Sim, 100% responsivos! Todos os sites contam com cabeçalho, seções institucionais, galeria de fotos, botão oficial de WhatsApp flutuante, formulário de contato e rodapé com layout adaptado para smartphone, tablet e computador.',
    },
    {
      q: 'Posso usar meus próprios contratos e valores?',
      a: 'Com certeza. Nossa calculadora de preços e gerador de contratos são totalmente flexíveis e editáveis para que você defina seus próprios termos, valores em Reais (R$) e prazos de entrega.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>SaaS de Prospecção Inteligente & Criação de Sites</span>
          </div>

          {/* Main Title strictly matching brief */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Encontre clientes e crie sites profissionais com IA
          </h1>

          {/* Subtitle strictly matching brief */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Encontre empresas que precisam de um site, gere projetos profissionais e organize toda sua prospecção em um só lugar.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
            <button
              onClick={() => {
                if (user) onNavigate('dashboard');
                else onOpenAuth('register');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <span>Começar grátis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all"
            >
              <span>Conhecer a plataforma</span>
            </button>
          </div>

          {/* Hero Visual Asset Showcase */}
          <div className="relative max-w-5xl mx-auto rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden bg-slate-950 p-2 sm:p-3">
            <div className="relative rounded-xl overflow-hidden aspect-16/9 bg-slate-900">
              <img
                src="/src/assets/images/hero_saas_showcase_1790369968815.jpg"
                alt="LeadForge AI Dashboard Showcase"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-left text-white">
                  <span className="text-xs font-mono text-indigo-400 font-semibold block mb-1">
                    Interface Oficial · LeadForge AI
                  </span>
                  <p className="text-sm sm:text-base font-bold">
                    Prospecção de empresas sem site + Gerador de websites responsivos com IA em segundos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust stats strip */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-slate-200/70 text-left">
            <div>
              <span className="block text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">5 Buscas</span>
              <span className="text-xs text-slate-500">Gratuitas liberadas no cadastro</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">11 Seções</span>
              <span className="text-xs text-slate-500">Estruturadas em cada site IA</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">100% Brasil</span>
              <span className="text-xs text-slate-500">Cidades, DDDs e moeda em Reais</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">Pix & Card</span>
              <span className="text-xs text-slate-500">Pagamento facilitado em BRL</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FEATURE CARDS (6 Core SaaS Cards strictly matching brief) */}
      <section id="recursos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Recursos da Plataforma
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tudo o Que Você Precisa para Escalar sua Operação
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Elimine planilhas manuais e prospecções desorganizadas com uma suíte pensada para o mercado de criação de sites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600">
                  <span>Explorar recurso</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* 3. INTERACTIVE SEARCH PREVIEW BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-10 shadow-xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
              Demonstração Interativa
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Veja como é simples encontrar empresas sem site
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Experimente agora mesmo o fluxo de prospecção. Com poucos cliques você filtra negócios reais com avaliações no Google que ainda não contam com presença digital.
            </p>
          </div>

          {/* Quick Demo Search Simulator */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <span className="block text-[10px] text-slate-300 mb-1">Nicho / Categoria</span>
              <input
                type="text"
                value={demoNiche}
                onChange={(e) => setDemoNiche(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-slate-900 rounded-lg font-medium"
              />
            </div>
            <div className="flex-1 w-full">
              <span className="block text-[10px] text-slate-300 mb-1">Cidade</span>
              <input
                type="text"
                value={demoCity}
                onChange={(e) => setDemoCity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-slate-900 rounded-lg font-medium"
              />
            </div>
            <div className="w-full sm:w-auto pt-3 sm:pt-4">
              <button
                onClick={() => {
                  if (user) onNavigate('prospeccao');
                  else onOpenAuth('register');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm whitespace-nowrap transition-colors"
              >
                Buscar Empresas Sem Site
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Depoimentos Reais
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            Quem Já Prospecta com o LeadForge
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic mb-4">
                  "{t.content}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900">{t.name}</p>
                <p className="text-[11px] text-slate-500">{t.role} · {t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Tire Suas Dúvidas
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50/80"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Comece a prospectar seus primeiros clientes hoje
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-6">
            Cadastre-se gratuitamente em menos de 1 minuto e receba 5 buscas imediatas para encontrar comércios sem site na sua cidade.
          </p>
          <button
            onClick={() => {
              if (user) onNavigate('dashboard');
              else onOpenAuth('register');
            }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors"
          >
            Criar conta e ganhar 5 buscas
          </button>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-200 pt-8 mt-12 text-xs text-slate-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              LF
            </div>
            <span className="font-bold text-slate-900">LeadForge AI</span>
            <span>—</span>
            <span>Plataforma SaaS Brasil</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => onNavigate('planos')} className="hover:text-slate-900">Preços</button>
            <button onClick={() => onOpenAuth('login')} className="hover:text-slate-900">Entrar</button>
            <button onClick={() => onOpenAuth('register')} className="hover:text-slate-900">Criar conta</button>
          </div>
        </div>
        <p className="text-center sm:text-left text-[11px] text-slate-400 mt-4">
          © {new Date().getFullYear()} LeadForge AI. Todos os direitos reservados. Feito com excelência para freelancers e agências brasileiras.
        </p>
      </footer>

    </div>
  );
};
