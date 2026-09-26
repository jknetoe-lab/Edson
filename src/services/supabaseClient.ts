import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  UserProfile, 
  Lead, 
  Project, 
  Subscription, 
  SearchLog, 
  UserPlan, 
  UserRole, 
  AccountType,
  PaymentRecord,
  PaymentEvent,
  FinancialTransaction,
  PaymentStatus,
  SubscriptionStatus
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================================
// OWNER VERIFICATION HELPER
// ============================================================================
export const isOwnerUser = (user: UserProfile | null | undefined): boolean => {
  return Boolean(user && user.role === 'admin' && user.account_type === 'owner');
};

// ============================================================================
// SIMULAÇÃO LOCAL PERSISTENTE (FALLBACK DE DESENVOLVIMENTO & TESTES)
// ============================================================================

const STORAGE_KEYS = {
  CURRENT_USER: 'leadforge_current_user',
  PROFILES: 'leadforge_profiles',
  LEADS: 'leadforge_leads',
  PROJECTS: 'leadforge_projects',
  SUBSCRIPTIONS: 'leadforge_subscriptions',
  SEARCHES: 'leadforge_searches',
  PAYMENTS: 'leadforge_payments',
  PAYMENT_EVENTS: 'leadforge_payment_events',
  FINANCIAL_TRANSACTIONS: 'leadforge_financial_transactions',
};

// Conta Proprietário (Owner) - NUNCA precisa de plano ou pagamento; buscas e IA ilimitadas
export const DEFAULT_OWNER: UserProfile = {
  id: 'usr_owner_001',
  user_id: 'usr_owner_001',
  name: 'Proprietário LeadForge (Owner)',
  email: 'jknetoe@gmail.com',
  avatar_url: '/src/assets/images/avatar_founder_user_1790369977977.jpg',
  role: 'admin',
  account_type: 'owner',
  plan: 'premium',
  searches_remaining: 999999,
  is_active: true,
  created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

// Conta Cliente Normal (Customer) - Segue limites normais (5 buscas gratuitas)
export const DEFAULT_CUSTOMER: UserProfile = {
  id: 'usr_customer_002',
  user_id: 'usr_customer_002',
  name: 'Rodrigo Alcantara (Freelancer)',
  email: 'rodrigo@agenciadigital.com.br',
  avatar_url: '/src/assets/images/avatar_founder_user_1790369977977.jpg',
  role: 'user',
  account_type: 'customer',
  plan: 'gratis',
  searches_remaining: 5,
  is_active: true,
  created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_sample_01',
    user_id: 'usr_customer_002',
    lead_id: 'lead_01',
    name: 'Dra. Camila Soares Odontologia',
    slug: 'dra-camila-odontologia',
    custom_slug: 'dra-camila-odontologia',
    description: 'Site institucional de alta conversão para clínica odontológica na Savassi em Belo Horizonte.',
    status: 'Publicado',
    website_url: '/site/dra-camila-odontologia',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    site_data: {
      business_name: 'Dra. Camila Soares Odontologia',
      category: 'Dentistas & Odontologia',
      tagline: 'Seu sorriso renovado com tecnologia, conforto e estética de alta precisão.',
      description: 'Clínica odontológica de referência na Savassi em Belo Horizonte. Especializada em implantes dentários, alinhadores invisíveis, lentes de contato dental e odontologia humanizada com tecnologia 3D.',
      phone: '(31) 3284-5510',
      whatsapp: '5531998765432',
      email: 'contato@camilasoaresodonto.com.br',
      address: 'Av. do Contorno, 6200 - Savassi, Belo Horizonte - MG',
      instagram: '@dracamilasoaresodonto',
      primary_color: '#0F172A',
      secondary_color: '#0D9488',
      style: 'Moderno, Clínico e Sofisticado',
      hero: {
        title: 'Transforme o seu sorriso com odontologia moderna e sem dor',
        subtitle: 'Atendimento humanizado na Savassi com tecnologia de escaneamento digital 3D e agendamento descomplicado.',
        cta_primary: 'Agendar Consulta no WhatsApp',
        cta_secondary: 'Conhecer Tratamentos',
      },
      about: {
        title: 'Excelência em cada detalhe do seu sorriso',
        text: 'Com mais de 12 anos de atuação e formação pelas principais instituições do país, a Dra. Camila Soares e sua equipe multidisciplinar oferecem tratamentos odontológicos avançados e personalizados em ambiente acolhedor.',
        highlights: [
          'Escaneamento digital intraoral 3D sem moldagens desconfortáveis',
          'Ambiente esterilizado com normas hospitalares e sedação consciente',
          'Planejamento de sorriso computadorizado antes de iniciar',
          'Estacionamento conveniado e localização privilegiada na Savassi',
        ],
      },
      services: [
        {
          id: 's1',
          title: 'Alinhadores Invisíveis',
          description: 'Correção ortodôntica discreta, rápida e confortável com placas transparentes removíveis.',
          icon: 'Sparkles',
          highlight: 'Mais procurado',
        },
        {
          id: 's2',
          title: 'Implantes Guiados por Computador',
          description: 'Recupere dentes perdidos com cirurgia guiada minimamente invasiva e cicatrização rápida.',
          icon: 'ShieldCheck',
        },
        {
          id: 's3',
          title: 'Lentes de Contato Dental',
          description: 'Facetas cerâmicas ultra-resistentes para harmonizar cor, forma e proporção dos dentes.',
          icon: 'Award',
        },
        {
          id: 's4',
          title: 'Clareamento a Laser em Consultório',
          description: 'Dentes até 4 tons mais brancos em sessão única com proteção para dentes sensíveis.',
          icon: 'Clock',
        },
      ],
      gallery: [
        {
          title: 'Consultório Principal',
          image_url: '/src/assets/images/website_sample_preview_1790369987556.jpg',
          caption: 'Cadeiras anatômicas e tecnologia de imagens em tempo real',
        },
        {
          title: 'Recepção Climatizada',
          image_url: '/src/assets/images/hero_saas_showcase_1790369968815.jpg',
          caption: 'Espaço com lounge café e Wi-Fi para sua conveniência',
        },
        {
          title: 'Dra. Camila Soares',
          image_url: '/src/assets/images/avatar_founder_user_1790369977977.jpg',
          caption: 'Cirurgiã-dentista especialista em estética e reabilitação oral',
        },
      ],
      differentials: [
        {
          title: 'Sem Dor ou Desconforto',
          description: 'Protocolos de anestesia computadorizada sem picada perceptível',
          icon: 'ShieldCheck',
        },
        {
          title: 'Tecnologia 3D Digital',
          description: 'Veja o resultado esperado no computador antes de iniciar',
          icon: 'Sparkles',
        },
        {
          title: 'Pontualidade Rigorosa',
          description: 'Respeito ao seu tempo com horários marcados e sem filas de espera',
          icon: 'Clock',
        },
        {
          title: 'Condições Flexíveis',
          description: 'Parcelamento em até 12x no cartão de crédito ou desconto à vista no Pix',
          icon: 'Award',
        },
      ],
      testimonials: [
        {
          name: 'Mariana Guimarães',
          role: 'Paciente de Alinhadores',
          content: 'Fiz meu tratamento de alinhadores com a Dra. Camila e em menos de 8 meses meus dentes estavam perfeitos. O atendimento é impecável!',
          rating: 5,
        },
        {
          name: 'Lucas Brandão',
          role: 'Paciente de Implante',
          content: 'Tinha muito medo de colocar implante, mas não senti absolutamente nada durante e depois do procedimento. Nota 10.',
          rating: 5,
        },
        {
          name: 'Beatriz Fonseca',
          role: 'Paciente de Estética',
          content: 'A clínica é linda, super limpa e pontual. O clareamento deixou meu sorriso natural e muito bonito.',
          rating: 5,
        },
      ],
      faq: [
        {
          question: 'Como funciona a primeira consulta de avaliação?',
          answer: 'Na primeira consulta realizamos o exame clínico completo, fotos diagnósticas e conversamos sobre suas queixas e desejos para montar o plano ideal.',
        },
        {
          question: 'A clínica aceita convênios odontológicos?',
          answer: 'Trabalhamos no formato particular com emissão de recibo e laudo detalhado para reembolso no seu plano de saúde.',
        },
        {
          question: 'O clareamento dental causa dor ou sensibilidade?',
          answer: 'Utilizamos gel dessensibilizante prévio e aplicação de laser com potência calibrada, tornando o procedimento muito confortável.',
        },
        {
          question: 'Qual o horário de atendimento da clínica?',
          answer: 'Atendemos de segunda a sexta-feira, das 08h às 19h, com horários flexíveis para profissionais que trabalham até mais tarde.',
        },
      ],
      contact: {
        opening_hours: 'Segunda a Sexta: 08h às 19h | Sábado: 08h às 13h',
        address_display: 'Av. do Contorno, 6200 - Sala 704 - Savassi, Belo Horizonte - MG',
        contact_phone: '(31) 3284-5510',
      },
    },
  },
  {
    id: 'proj_sample_02',
    user_id: 'usr_customer_002',
    lead_id: 'lead_02',
    name: 'Barbearia Don Corleone',
    slug: 'barbearia-don-corleone',
    custom_slug: 'barbearia-don-corleone',
    description: 'Site exclusivo para barbearia clássica com agendamento online e corte de precisão.',
    status: 'Publicado',
    website_url: '/site/barbearia-don-corleone',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    site_data: {
      business_name: 'Barbearia Don Corleone',
      category: 'Barbearias & Estética Masculina',
      tagline: 'Cortes clássicos, barba na navalha com toalha quente e chopp gelado.',
      description: 'O verdadeiro clube do homem moderno em Belo Horizonte. Ambiente vintage sofisticado, barbeiros premiados e agendamento rápido pelo WhatsApp.',
      phone: '(31) 3344-9988',
      whatsapp: '5531987654321',
      email: 'contato@doncorleonebarbearia.com.br',
      address: 'Rua Sergipe, 1140 - Funcionários, Belo Horizonte - MG',
      instagram: '@barbeariadoncorleone',
      primary_color: '#18181B',
      secondary_color: '#D97706',
      style: 'Vintage Industrial e Premium',
      hero: {
        title: 'Estilo clássico e respeito à tradição da navalha',
        subtitle: 'Mais que um corte de cabelo: uma experiência completa com toalha quente, massagem capilar e chopp cortesia.',
        cta_primary: 'Agendar Horário no WhatsApp',
        cta_secondary: 'Ver Serviços e Preços',
      },
      about: {
        title: 'A autêntica barbearia tradicional',
        text: 'Criada para homens que valorizam cuidado pessoal de alto padrão, a Don Corleone une as técnicas tradicionais dos mestres barbeiros italianos ao conforto e conveniência do século XXI.',
        highlights: [
          'Barba tradicional com toalha quente e óleos essenciais importados',
          'Chopp artesanal gelado cortesia em cada atendimento',
          'Espaço com sinuca, videogame e poltronas retrô em couro legítimo',
          'Atendimento pontual com agendamento online descomplicado',
        ],
      },
      services: [
        {
          id: 'b1',
          title: 'Corte Tradicional ou Fade',
          description: 'Lavagem com produtos importados, corte personalizado na tesoura ou máquina e finalização com pomada modeladora.',
          icon: 'Sparkles',
          highlight: 'Carro-chefe',
        },
        {
          id: 'b2',
          title: 'Barboterapia com Toalha Quente',
          description: 'Abertura de poros, hidratação profunda, desenho na navalha afiada e toalha fria para fechamento.',
          icon: 'ShieldCheck',
        },
        {
          id: 'b3',
          title: 'Combo Cabelo + Barba + Chopp',
          description: 'O pacote completo para sair impecável para qualquer compromisso ou final de semana.',
          icon: 'Award',
        },
        {
          id: 'b4',
          title: 'Camuflagem de Fios Brancos',
          description: 'Tonalização sutil e rápida que devolve a cor natural sem aspecto artificial.',
          icon: 'Clock',
        },
      ],
      gallery: [
        {
          title: 'Espaço Retrô',
          image_url: '/src/assets/images/website_sample_preview_1790369987556.jpg',
          caption: 'Cadeiras vintage de barbeiro restauradas e ambiente climatizado',
        },
        {
          title: 'Bar & Lounge',
          image_url: '/src/assets/images/hero_saas_showcase_1790369968815.jpg',
          caption: 'Torneira de chopp artesanal e mesa de sinuca',
        },
      ],
      differentials: [
        {
          title: 'Pontualidade de Respeito',
          description: 'Chegue e seja atendido no horário agendado, sem perda de tempo',
          icon: 'Clock',
        },
        {
          title: 'Produtos Importados',
          description: 'Tratamentos com pomadas, óleos e balms de marcas internacionais',
          icon: 'Award',
        },
        {
          title: 'Ambiente Masculino',
          description: 'Música boa, chopp e espaço ideal para relaxar após o trabalho',
          icon: 'Sparkles',
        },
        {
          title: 'Barbeiros Especialistas',
          description: 'Equipe em constante atualização com tendências mundiais de visagismo',
          icon: 'ShieldCheck',
        },
      ],
      testimonials: [
        {
          name: 'Thiago Martins',
          role: 'Cliente há 2 anos',
          content: 'Melhor barbearia de BH. A barboterapia é relaxamento puro e o atendimento dos caras é de outro nível.',
          rating: 5,
        },
        {
          name: 'Guilherme Sampaio',
          role: 'Empresário',
          content: 'Pontualidade britânica e cerveja sempre trincando. Recomendo de olhos fechados.',
          rating: 5,
        },
      ],
      faq: [
        {
          question: 'Preciso agendar com antecedência?',
          answer: 'Sim, recomendamos agendamento prévio pelo WhatsApp para garantir seu barbeiro de preferência no horário exato.',
        },
        {
          question: 'O chopp é realmente cortesia?',
          answer: 'Com certeza! Todo cliente ganha 1 chopp artesanal gelado cortesia a cada atendimento.',
        },
        {
          question: 'Vocês realizam atendimento no domingo?',
          answer: 'Funcionamos de terça a sábado, das 09h às 20h. Fechamos aos domingos e segundas para descanso da equipe.',
        },
      ],
      contact: {
        opening_hours: 'Terça a Sábado: 09h às 20h',
        address_display: 'Rua Sergipe, 1140 - Funcionários, Belo Horizonte - MG',
        contact_phone: '(31) 3344-9988',
      },
    },
  },
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead_01',
    user_id: 'usr_customer_002',
    business_name: 'Dra. Camila Soares Odontologia',
    category: 'Dentistas & Odontologia',
    city: 'Belo Horizonte',
    state: 'Minas Gerais',
    country: 'Brasil',
    phone: '(31) 3284-5510',
    whatsapp: '5531998765432',
    address: 'Av. do Contorno, 6200 - Savassi, Belo Horizonte - MG',
    google_maps_url: 'https://maps.google.com/?q=Dra+Camila+Soares+Odontologia+Savassi',
    rating: 4.9,
    review_count: 54,
    has_website: false,
    status: 'Novo',
    notes: 'Excelente clínica na Savassi, 54 avaliações 5 estrelas sem site próprio. Potencial alto para landing page com agendamento.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'lead_02',
    user_id: 'usr_customer_002',
    business_name: 'Boutique dos Pães & Confeitaria',
    category: 'Padarias & Confeitarias',
    city: 'Belo Horizonte',
    state: 'Minas Gerais',
    country: 'Brasil',
    phone: '(31) 3344-9988',
    whatsapp: '5531987651234',
    address: 'Rua Fernandes Tourinho, 340 - Funcionários, Belo Horizonte - MG',
    google_maps_url: 'https://maps.google.com/?q=Boutique+dos+Paes+Belo+Horizonte',
    rating: 4.7,
    review_count: 88,
    has_website: false,
    status: 'Em negociação',
    notes: 'Proprietário Marcos demonstrou interesse em cardápio digital e cardápio de encomendas para festas.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'lead_03',
    user_id: 'usr_customer_002',
    business_name: 'Auto Mecânica Express Premium',
    category: 'Oficinas Mecânicas',
    city: 'São Paulo',
    state: 'São Paulo',
    country: 'Brasil',
    phone: '(11) 2389-1122',
    whatsapp: '5511977665544',
    address: 'Av. Santo Amaro, 1420 - Itaim Bibi, São Paulo - SP',
    google_maps_url: 'https://maps.google.com/?q=Auto+Mecanica+Express+Itaim+Bibi',
    rating: 4.8,
    review_count: 112,
    has_website: true,
    website: 'http://mecanicaexpressantiga.com.br',
    status: 'Contatado',
    notes: 'Site antigo não adaptado para celular, cliente quer reformulação completa com orçamento rápido por WhatsApp.',
    created_at: new Date(Date.now() - 259200000).toISOString(),
  }
];

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Error reading key ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing key ${key} to localStorage:`, err);
  }
}

// Ensure default accounts exist with correct roles & account_types
const currentProfiles = getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, []);
const hasOwner = currentProfiles.some(p => p.role === 'admin' && p.account_type === 'owner');
const hasCustomer = currentProfiles.some(p => p.email === DEFAULT_CUSTOMER.email);

if (!hasOwner || !hasCustomer || currentProfiles.length === 0) {
  // Fresh initialization with clean owner and customer
  setStored(STORAGE_KEYS.PROFILES, [DEFAULT_OWNER, DEFAULT_CUSTOMER]);
}

if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
  setStored(STORAGE_KEYS.LEADS, INITIAL_LEADS);
}
if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
  setStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
}
if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) {
  setStored(STORAGE_KEYS.SUBSCRIPTIONS, [
    {
      id: 'sub_001',
      user_id: DEFAULT_OWNER.user_id,
      plan: 'premium',
      status: 'active',
      payment_method: 'gratis',
      created_at: DEFAULT_OWNER.created_at,
    },
    {
      id: 'sub_002',
      user_id: DEFAULT_CUSTOMER.user_id,
      plan: 'gratis',
      status: 'active',
      payment_method: 'gratis',
      created_at: DEFAULT_CUSTOMER.created_at,
    }
  ]);
}
if (!localStorage.getItem(STORAGE_KEYS.SEARCHES)) {
  setStored(STORAGE_KEYS.SEARCHES, []);
}
if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
  const initialPayments: PaymentRecord[] = [
    {
      id: 'pay_init_01',
      customer_id: DEFAULT_CUSTOMER.user_id,
      customer_name: DEFAULT_CUSTOMER.name,
      customer_email: DEFAULT_CUSTOMER.email,
      plan_id: 'basic',
      amount: 19.90,
      currency: 'BRL',
      payment_method: 'pix',
      status: 'approved',
      mercado_pago_id: 'mp_pay_98234123',
      subscription_id: 'sub_002',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      approved_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    }
  ];
  setStored(STORAGE_KEYS.PAYMENTS, initialPayments);
}
if (!localStorage.getItem(STORAGE_KEYS.FINANCIAL_TRANSACTIONS)) {
  const initialTx: FinancialTransaction[] = [
    {
      id: 'tx_init_01',
      payment_id: 'pay_init_01',
      customer_id: DEFAULT_CUSTOMER.user_id,
      customer_name: DEFAULT_CUSTOMER.name,
      customer_email: DEFAULT_CUSTOMER.email,
      plan: 'basic',
      amount: 19.90,
      net_amount: 19.70,
      fee: 0.20,
      payment_method: 'pix',
      status: 'approved',
      mercado_pago_id: 'mp_pay_98234123',
      date: new Date(Date.now() - 15 * 86400000).toISOString(),
      renewal_date: new Date(Date.now() + 15 * 86400000).toISOString(),
    }
  ];
  setStored(STORAGE_KEYS.FINANCIAL_TRANSACTIONS, initialTx);
}
if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_EVENTS)) {
  setStored(STORAGE_KEYS.PAYMENT_EVENTS, []);
}

export const LocalDbService = {
  // Profiles
  getProfiles(callerUser?: UserProfile | null): UserProfile[] {
    // SECURITY: Only admin/owner can fetch all user profiles
    if (!callerUser || callerUser.role !== 'admin') {
      return [];
    }
    return getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, [DEFAULT_OWNER, DEFAULT_CUSTOMER]);
  },
  getProfileByUserId(userId: string): UserProfile | null {
    const profiles = getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, [DEFAULT_OWNER, DEFAULT_CUSTOMER]);
    return profiles.find(p => p.user_id === userId) || null;
  },
  getProfileByEmail(email: string): UserProfile | null {
    const profiles = getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, [DEFAULT_OWNER, DEFAULT_CUSTOMER]);
    return profiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
  },
  
  /**
   * Atualização de perfil com proteção contra escalada de privilégios.
   * Usuários normais NÃO podem alterar role, account_type, plan ou searches_remaining.
   */
  saveProfile(profile: UserProfile, callerUser?: UserProfile | null): void {
    const profiles = getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, [DEFAULT_OWNER, DEFAULT_CUSTOMER]);
    const index = profiles.findIndex(p => p.user_id === profile.user_id);
    
    if (index >= 0) {
      const existing = profiles[index];
      const isCallerAdmin = callerUser && callerUser.role === 'admin';

      // Trava de segurança: somente admin pode alterar campos restritos
      const safeRole: UserRole = isCallerAdmin ? profile.role : existing.role;
      const safeAccountType: AccountType = isCallerAdmin ? profile.account_type : existing.account_type;
      const safePlan: UserPlan = isCallerAdmin ? profile.plan : existing.plan;
      const safeSearches: number = isCallerAdmin ? profile.searches_remaining : existing.searches_remaining;

      profiles[index] = {
        ...profile,
        role: safeRole,
        account_type: safeAccountType,
        plan: safePlan,
        searches_remaining: safeSearches,
        updated_at: new Date().toISOString(),
      };
    } else {
      profiles.push(profile);
    }
    setStored(STORAGE_KEYS.PROFILES, profiles);
  },

  updateSearchesRemaining(userId: string, delta: number): number {
    const profile = this.getProfileByUserId(userId);
    if (!profile) return 0;

    // REGRA DE OURO DO PROPRIETÁRIO:
    // Se role = 'admin' E account_type = 'owner', as buscas são ILIMITADAS (nunca decrementam)
    if (isOwnerUser(profile)) {
      return 999999;
    }

    const newCount = Math.max(0, (profile.searches_remaining ?? 5) + delta);
    const profiles = getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, [DEFAULT_OWNER, DEFAULT_CUSTOMER]);
    const idx = profiles.findIndex(p => p.user_id === userId);
    if (idx >= 0) {
      profiles[idx].searches_remaining = newCount;
      profiles[idx].updated_at = new Date().toISOString();
      setStored(STORAGE_KEYS.PROFILES, profiles);
    }
    return newCount;
  },

  setSearchesRemaining(userId: string, count: number, callerUser?: UserProfile | null): void {
    if (!callerUser || callerUser.role !== 'admin') {
      console.warn('Tentativa não autorizada de alterar buscas.');
      return;
    }
    const profiles = getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, [DEFAULT_OWNER, DEFAULT_CUSTOMER]);
    const idx = profiles.findIndex(p => p.user_id === userId);
    if (idx >= 0) {
      profiles[idx].searches_remaining = count;
      profiles[idx].updated_at = new Date().toISOString();
      setStored(STORAGE_KEYS.PROFILES, profiles);
    }
  },

  updatePlan(userId: string, newPlan: UserPlan): void {
    const profile = this.getProfileByUserId(userId);
    if (profile) {
      // O proprietário não muda de plano por compra
      if (isOwnerUser(profile)) return;

      const profiles = getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, [DEFAULT_OWNER, DEFAULT_CUSTOMER]);
      const idx = profiles.findIndex(p => p.user_id === userId);
      if (idx >= 0) {
        profiles[idx].plan = newPlan;
        if (newPlan === 'basic') {
          profiles[idx].searches_remaining = 50;
        } else if (newPlan === 'pro' || newPlan === 'premium') {
          profiles[idx].searches_remaining = 200;
        } else if (newPlan === 'gratis') {
          profiles[idx].searches_remaining = 5;
        }
        profiles[idx].updated_at = new Date().toISOString();
        setStored(STORAGE_KEYS.PROFILES, profiles);
      }
    }
  },

  updateUserRoleAndAccountType(
    userId: string, 
    newRole: UserRole, 
    newAccountType: AccountType, 
    callerUser?: UserProfile | null
  ): boolean {
    // Somente admin/proprietário pode gerenciar cargos
    if (!callerUser || callerUser.role !== 'admin') {
      console.warn('Tentativa não autorizada de alteração de role/account_type bloqueada.');
      return false;
    }

    const profiles = getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, [DEFAULT_OWNER, DEFAULT_CUSTOMER]);
    const idx = profiles.findIndex(p => p.user_id === userId);
    if (idx >= 0) {
      profiles[idx].role = newRole;
      profiles[idx].account_type = newAccountType;
      if (newRole === 'admin' && newAccountType === 'owner') {
        profiles[idx].searches_remaining = 999999;
      }
      profiles[idx].updated_at = new Date().toISOString();
      setStored(STORAGE_KEYS.PROFILES, profiles);
      return true;
    }
    return false;
  },

  toggleUserActive(userId: string, callerUser?: UserProfile | null): boolean {
    if (!callerUser || callerUser.role !== 'admin') {
      console.warn('Tentativa não autorizada de alterar status de usuário.');
      return false;
    }
    const profiles = getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, [DEFAULT_OWNER, DEFAULT_CUSTOMER]);
    const idx = profiles.findIndex(p => p.user_id === userId);
    if (idx >= 0) {
      profiles[idx].is_active = !profiles[idx].is_active;
      profiles[idx].updated_at = new Date().toISOString();
      setStored(STORAGE_KEYS.PROFILES, profiles);
      return profiles[idx].is_active;
    }
    return false;
  },

  // Leads
  getLeads(userId?: string, callerUser?: UserProfile | null): Lead[] {
    const all = getStored<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    if (userId) {
      return all.filter(l => l.user_id === userId);
    }
    // Somente admin pode ver todos os leads do sistema
    return callerUser && callerUser.role === 'admin' ? all : [];
  },
  getLeadById(id: string): Lead | null {
    const all = getStored<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    return all.find(l => l.id === id) || null;
  },
  saveLead(lead: Lead): void {
    const leads = getStored<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    const index = leads.findIndex(l => l.id === lead.id);
    if (index >= 0) {
      leads[index] = lead;
    } else {
      leads.unshift(lead);
    }
    setStored(STORAGE_KEYS.LEADS, leads);
  },
  deleteLead(id: string): void {
    const leads = getStored<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    setStored(STORAGE_KEYS.LEADS, leads.filter(l => l.id !== id));
  },

  // Projects
  getProjects(userId?: string, callerUser?: UserProfile | null): Project[] {
    const all = getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    if (userId) {
      return all.filter(p => p.user_id === userId);
    }
    return callerUser && callerUser.role === 'admin' ? all : all;
  },
  getProjectById(id: string): Project | null {
    const all = getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    return all.find(p => p.id === id) || null;
  },
  getProjectBySlug(slug: string): Project | null {
    const all = getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const cleanSlug = slugify(slug);
    const found = all.find(p => {
      const pSlug = p.slug ? slugify(p.slug) : '';
      const cSlug = p.custom_slug ? slugify(p.custom_slug) : '';
      const bSlug = p.site_data?.business_name ? slugify(p.site_data.business_name) : '';
      const nSlug = p.name ? slugify(p.name) : '';
      return pSlug === cleanSlug || cSlug === cleanSlug || bSlug === cleanSlug || nSlug === cleanSlug || p.id === slug;
    });
    return found || null;
  },
  saveProject(project: Project): Project {
    const projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    
    // Ensure slug is clean and present
    let safeSlug = project.slug ? slugify(project.slug) : '';
    if (!safeSlug && project.custom_slug) {
      safeSlug = slugify(project.custom_slug);
    }
    if (!safeSlug && project.site_data?.business_name) {
      safeSlug = slugify(project.site_data.business_name);
    }
    if (!safeSlug) {
      safeSlug = 'site-' + Date.now().toString().slice(-6);
    }

    const updatedProject: Project = {
      ...project,
      slug: safeSlug,
      custom_slug: safeSlug,
      website_url: `/site/${safeSlug}`,
      updated_at: new Date().toISOString(),
    };

    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = updatedProject;
    } else {
      projects.unshift(updatedProject);
    }
    setStored(STORAGE_KEYS.PROJECTS, projects);

    // Asynchronously sync with server store so clients can access immediately
    fetch('/api/public/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProject),
    }).catch(err => console.warn('Could not sync project with server:', err));

    return updatedProject;
  },
  deleteProject(id: string): void {
    const projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    setStored(STORAGE_KEYS.PROJECTS, projects.filter(p => p.id !== id));
    
    fetch(`/api/public/projects/${id}`, {
      method: 'DELETE',
    }).catch(err => console.warn('Could not delete project from server:', err));
  },

  // Searches Log
  logSearch(search: Omit<SearchLog, 'id' | 'created_at'>): void {
    const searches = getStored<SearchLog[]>(STORAGE_KEYS.SEARCHES, []);
    const newLog: SearchLog = {
      ...search,
      id: 'search_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    searches.unshift(newLog);
    setStored(STORAGE_KEYS.SEARCHES, searches);
  },
  getSearches(userId?: string, callerUser?: UserProfile | null): SearchLog[] {
    const all = getStored<SearchLog[]>(STORAGE_KEYS.SEARCHES, []);
    if (userId) {
      return all.filter(s => s.user_id === userId);
    }
    return callerUser && callerUser.role === 'admin' ? all : [];
  },

  // Subscriptions
  getSubscriptions(callerUser?: UserProfile | null): Subscription[] {
    if (!callerUser || callerUser.role !== 'admin') {
      return [];
    }
    return getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
  },
  getUserSubscription(userId: string): Subscription | null {
    const all = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    return all.find(s => s.user_id === userId) || null;
  },
  addSubscription(sub: Subscription): void {
    const subs = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    subs.unshift(sub);
    setStored(STORAGE_KEYS.SUBSCRIPTIONS, subs);
  },
  activateSubscription(
    userId: string,
    plan: UserPlan,
    paymentMethod: 'pix' | 'cartao',
    mercadoPagoId?: string
  ): void {
    const all = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
    const idx = all.findIndex(s => s.user_id === userId);
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        plan,
        status: 'active',
        payment_method: paymentMethod,
        mercado_pago_subscription_id: mercadoPagoId || all[idx].mercado_pago_subscription_id,
        expires_at: expiresAt,
      };
    } else {
      all.push({
        id: 'sub_' + Date.now(),
        user_id: userId,
        plan,
        status: 'active',
        payment_method: paymentMethod,
        mercado_pago_subscription_id: mercadoPagoId,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      });
    }
    setStored(STORAGE_KEYS.SUBSCRIPTIONS, all);
    this.updatePlan(userId, plan);
  },
  cancelUserSubscription(userId: string): boolean {
    const all = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    const idx = all.findIndex(s => s.user_id === userId);
    if (idx >= 0) {
      all[idx].status = 'canceled';
      setStored(STORAGE_KEYS.SUBSCRIPTIONS, all);
      return true;
    }
    return false;
  },
  downgradeToFree(userId: string): void {
    this.updatePlan(userId, 'gratis');
    const all = getStored<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    const idx = all.findIndex(s => s.user_id === userId);
    if (idx >= 0) {
      all[idx].status = 'expired';
      setStored(STORAGE_KEYS.SUBSCRIPTIONS, all);
    }
  },

  // Payments
  getPayments(userId?: string, callerUser?: UserProfile | null): PaymentRecord[] {
    const all = getStored<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, []);
    if (userId) {
      return all.filter(p => p.customer_id === userId);
    }
    return callerUser && callerUser.role === 'admin' ? all : [];
  },
  getPaymentById(id: string): PaymentRecord | null {
    const all = getStored<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, []);
    return all.find(p => p.id === id || p.mercado_pago_id === id) || null;
  },
  savePayment(payment: PaymentRecord): void {
    const all = getStored<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, []);
    const idx = all.findIndex(p => p.id === payment.id || (p.mercado_pago_id && p.mercado_pago_id === payment.mercado_pago_id));
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...payment };
    } else {
      all.unshift(payment);
    }
    setStored(STORAGE_KEYS.PAYMENTS, all);
  },
  updatePaymentStatus(id: string, status: PaymentStatus, approved_at?: string): PaymentRecord | null {
    const all = getStored<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, []);
    const idx = all.findIndex(p => p.id === id || p.mercado_pago_id === id);
    if (idx >= 0) {
      all[idx].status = status;
      if (approved_at) all[idx].approved_at = approved_at;
      setStored(STORAGE_KEYS.PAYMENTS, all);
      return all[idx];
    }
    return null;
  },

  // Payment Events (for Webhook Idempotency)
  getPaymentEvents(callerUser?: UserProfile | null): PaymentEvent[] {
    if (!callerUser || callerUser.role !== 'admin') {
      return [];
    }
    return getStored<PaymentEvent[]>(STORAGE_KEYS.PAYMENT_EVENTS, []);
  },
  savePaymentEvent(event: PaymentEvent): void {
    const all = getStored<PaymentEvent[]>(STORAGE_KEYS.PAYMENT_EVENTS, []);
    all.unshift(event);
    setStored(STORAGE_KEYS.PAYMENT_EVENTS, all);
  },
  isEventProcessed(mercadoPagoId: string, eventType: string): boolean {
    const all = getStored<PaymentEvent[]>(STORAGE_KEYS.PAYMENT_EVENTS, []);
    return all.some(e => e.mercado_pago_id === mercadoPagoId && e.event_type === eventType);
  },

  // Financial Transactions
  getFinancialTransactions(callerUser?: UserProfile | null): FinancialTransaction[] {
    if (!callerUser || callerUser.role !== 'admin') {
      return [];
    }
    return getStored<FinancialTransaction[]>(STORAGE_KEYS.FINANCIAL_TRANSACTIONS, []);
  },
  saveFinancialTransaction(tx: FinancialTransaction): void {
    const all = getStored<FinancialTransaction[]>(STORAGE_KEYS.FINANCIAL_TRANSACTIONS, []);
    const idx = all.findIndex(t => t.id === tx.id || t.payment_id === tx.payment_id || (t.mercado_pago_id && t.mercado_pago_id === tx.mercado_pago_id));
    if (idx >= 0) {
      all[idx] = tx;
    } else {
      all.unshift(tx);
    }
    setStored(STORAGE_KEYS.FINANCIAL_TRANSACTIONS, all);
  }
};
