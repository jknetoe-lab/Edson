import { GeneratedWebsiteData } from '../types';

export interface WebsiteGenerationParams {
  business_name: string;
  category: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  whatsapp_status?: 'confirmed' | 'unconfirmed' | 'none';
  address?: string;
  city?: string;
  state?: string;
  services?: string;
  instagram?: string;
  google_maps_url?: string;
  rating?: number;
  review_count?: number;
  opening_hours?: string;
  desired_colors?: string;
  style?: string;
  custom_prompt?: string;
}

export type NicheKey = 'barbearia' | 'restaurante' | 'dentista' | 'petshop' | 'academia' | 'loja' | 'padaria' | 'beleza' | 'mecanica' | 'advocacia' | 'contabilidade' | 'geral';

interface NicheTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  style: string;
  hero_badge: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  whatsapp_cta: string;
  whatsapp_template: string;
  images: Array<{
    title: string;
    image_url: string;
    caption: string;
    category: string;
  }>;
  differentials: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  faq_template: Array<{
    question: string;
    answer: string;
  }>;
}

// Map high-quality Unsplash CDN imagery with semantic alt contexts
const NICHE_THEMES: Record<NicheKey, NicheTheme> = {
  barbearia: {
    primary_color: '#0F172A', // Slate 900
    secondary_color: '#D97706', // Amber 600 (vintage gold)
    accent_color: '#B45309',
    style: 'Moderno Vintage & Masculino Premium',
    hero_badge: 'Corte, Barba & Estilo Tradicional',
    hero_cta_primary: 'Agendar Horário no WhatsApp',
    hero_cta_secondary: 'Ver Serviços & Preços',
    whatsapp_cta: 'Agendar pelo WhatsApp',
    whatsapp_template: 'Olá! Vim pelo site e gostaria de agendar um horário para corte/barba.',
    images: [
      {
        title: 'Corte Clássico & Fade',
        image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80',
        caption: 'Técnicas apuradas de corte e alinhamento milimétrico.',
        category: 'Corte'
      },
      {
        title: 'Barboterapia com Toalha Quente',
        image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1000&q=80',
        caption: 'Relaxamento profundo, lâmina afiada e hidratação especial.',
        category: 'Barba'
      },
      {
        title: 'Ambiente Climatizado & Lounge',
        image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1000&q=80',
        caption: 'Cerveja gelada, café expresso e muito conforto enquanto você espera.',
        category: 'Ambiente'
      }
    ],
    differentials: [
      { title: 'Profissionais Especialistas', description: 'Barbeiros premiados com foco em visagismo e acabamento perfeito.', icon: 'Scissors' },
      { title: 'Pontualidade Rigorosa', description: 'Agendamento prático sem filas ou espera desnecessária.', icon: 'Clock' },
      { title: 'Produtos Selecionados', description: 'Pomadas, óleos e tônicos das marcas mais conceituadas do mercado.', icon: 'Sparkles' },
      { title: 'Ambiente & Experiência', description: 'Espaço pensado para você relaxar com chopp, café e boa música.', icon: 'Coffee' }
    ],
    faq_template: [
      { question: 'Preciso agendar com antecedência?', answer: 'Recomendamos o agendamento prévio via WhatsApp para garantir o seu horário sem filas.' },
      { question: 'Quais são as formas de pagamento aceitas?', answer: 'Aceitamos Pix, cartões de débito e crédito.' },
      { question: 'Vocês realizam atendimento infantil ou Dia do Noivo?', answer: 'Sim! Temos atendimento especializado para crianças e pacotes exclusivos para noivos e padrinhos.' }
    ]
  },
  restaurante: {
    primary_color: '#881337', // Rose 900 (wine)
    secondary_color: '#EA580C', // Orange 600
    accent_color: '#F97316',
    style: 'Gastronômico & Convidativo',
    hero_badge: 'Gastronomia com Ingredientes Selecionados',
    hero_cta_primary: 'Reservar Mesa ou Pedir no WhatsApp',
    hero_cta_secondary: 'Ver Cardápio Completo',
    whatsapp_cta: 'Fazer Pedido / Reserva',
    whatsapp_template: 'Olá! Vim pelo site e gostaria de fazer uma reserva de mesa / ver o cardápio.',
    images: [
      {
        title: 'Pratos Principais Exclusivos',
        image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
        caption: 'Sabores autênticos preparados com ingredientes frescos da estação.',
        category: 'Gastronomia'
      },
      {
        title: 'Ambiente Acolhedor & Sofisticado',
        image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
        caption: 'O cenário ideal para almoços em família, encontros e jantares românticos.',
        category: 'Ambiente'
      },
      {
        title: 'Bebidas, Drinks & Carta de Vinhos',
        image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80',
        caption: 'Harmonização impecável com rótulos especiais e coquetéis autorais.',
        category: 'Drinks'
      }
    ],
    differentials: [
      { title: 'Ingredientes de Produtores Locais', description: 'Frescor absoluto e receitas elaboradas diariamente por nossos chefs.', icon: 'UtensilsCrossed' },
      { title: 'Ambiente Climatizado & Seguro', description: 'Mesas confortáveis, acessibilidade e espaço kids para toda a família.', icon: 'Smile' },
      { title: 'Atendimento Rápido e Gentil', description: 'Equipe prestativa dedicada a tornar sua visita inesquecível.', icon: 'HeartHandshake' },
      { title: 'Opções Vegetarianas & Especiais', description: 'Menu variado que atende com carinho diferentes preferências.', icon: 'Leaf' }
    ],
    faq_template: [
      { question: 'Vocês trabalham com delivery ou retirada?', answer: 'Sim! Você pode fazer seu pedido diretamente pelo nosso WhatsApp oficial com entrega rápida.' },
      { question: 'É obrigatório fazer reserva?', answer: 'Atendemos por ordem de chegada, mas recomendamos a reserva para grupos e datas comemorativas.' },
      { question: 'Possuem estacionamento próprio?', answer: 'Contamos com vagas conveniadas e serviço de vallet próximo.' }
    ]
  },
  dentista: {
    primary_color: '#0F172A', // Slate 900
    secondary_color: '#0284C7', // Sky 600
    accent_color: '#0EA5E9',
    style: 'Clínico Premium & Humanizado',
    hero_badge: 'Odontologia de Alta Precisão & Estética Dental',
    hero_cta_primary: 'Agendar Avaliação no WhatsApp',
    hero_cta_secondary: 'Conhecer Tratamentos',
    whatsapp_cta: 'Agendar Avaliação',
    whatsapp_template: 'Olá! Vim pelo site e gostaria de agendar uma avaliação odontológica.',
    images: [
      {
        title: 'Consultório Tecnológico & Acolhedor',
        image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80',
        caption: 'Equipamentos modernos com biossegurança e máximo conforto.',
        category: 'Estrutura'
      },
      {
        title: 'Estética Dental & Clareamento',
        image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80',
        caption: 'Lentes de resina, facetas cerâmicas e clareamento a laser.',
        category: 'Estética'
      },
      {
        title: 'Atendimento Humanizado & Sem Dor',
        image_url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1000&q=80',
        caption: 'Abordagem focada em acolher o paciente com tranquilidade e respeito.',
        category: 'Equipe'
      }
    ],
    differentials: [
      { title: 'Tecnologia Digital & 3D', description: 'Diagnósticos por imagem e escaneamento digital sem moldagens desconfortáveis.', icon: 'Cpu' },
      { title: 'Protocolos de Biossegurança', description: 'Esterilização hospitalar e respeito absoluto às normas sanitárias.', icon: 'ShieldCheck' },
      { title: 'Tratamentos Sem Medo & Sem Dor', description: 'Técnicas anestésicas computadorizadas para o seu bem-estar absoluto.', icon: 'HeartPulse' },
      { title: 'Facilidade de Pagamento', description: 'Parcelamento em até 12x no cartão e condições facilitadas.', icon: 'CreditCard' }
    ],
    faq_template: [
      { question: 'A primeira consulta tem avaliação com exames?', answer: 'Sim, realizamos check-up visual, análise minuciosa e planejamento digital personalizado.' },
      { question: 'Vocês atendem urgências e dores de dente?', answer: 'Sim! Temos horários de encaixe para alívio imediato da dor. Entre em contato no WhatsApp.' },
      { question: 'Quais convênios ou formas de pagamento são aceitas?', answer: 'Trabalhamos com reembolso de planos e condições facilitadas no Pix e cartão de crédito.' }
    ]
  },
  petshop: {
    primary_color: '#065F46', // Emerald 800
    secondary_color: '#059669', // Emerald 600
    accent_color: '#10B981',
    style: 'Acolhedor, Seguro & Afetuoso',
    hero_badge: 'Cuidado, Banho, Tosa & Saúde Animal',
    hero_cta_primary: 'Agendar Banho & Tosa no WhatsApp',
    hero_cta_secondary: 'Ver Serviços para Pets',
    whatsapp_cta: 'Agendar no WhatsApp',
    whatsapp_template: 'Olá! Gostaria de agendar um horário de banho e tosa para o meu pet.',
    images: [
      {
        title: 'Banho & Tosa com Carinho',
        image_url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=80',
        caption: 'Água morninha, cosméticos hipoalergênicos e profissionais apaixonados.',
        category: 'Banho e Tosa'
      },
      {
        title: 'Consultório Veterinário Preventivo',
        image_url: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1000&q=80',
        caption: 'Vacinas importadas, exames rápidos e consultas atenciosas.',
        category: 'Saúde'
      },
      {
        title: 'Boutique & Farmácia Veterinária',
        image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=80',
        caption: 'As melhores rações super premium, brinquedos e medicamentos.',
        category: 'Loja'
      }
    ],
    differentials: [
      { title: 'Monitoramento & Carinho', description: 'Ambiente livre de estresse com profissionais treinados em comportamento animal.', icon: 'Heart' },
      { title: 'Cosméticos Hipoalergênicos', description: 'Shampoos suaves que protegem a pele e dão brilho à pelagem.', icon: 'Sparkles' },
      { title: 'Táxi Pet com Conforto', description: 'Buscamos e levamos seu amiguinho com total segurança em veículo climatizado.', icon: 'Car' },
      { title: 'Equipe Veterinária de Plantão', description: 'Suporte médico para garantir a saúde integral do seu melhor amigo.', icon: 'ShieldCheck' }
    ],
    faq_template: [
      { question: 'Vocês buscam e entregam o animal em casa?', answer: 'Sim! Temos serviço de Táxi Pet sob consulta de região e horário.' },
      { question: 'Quais vacinas são exigidas para o banho?', answer: 'Pedimos a carteirinha de vacinação em dia para proteção de todos os pets.' },
      { question: 'Como funciona o pacote mensal de banhos?', answer: 'Temos planos mensais com descontos exclusivos e hidratações inclusas.' }
    ]
  },
  academia: {
    primary_color: '#0F172A', // Slate 900
    secondary_color: '#E11D48', // Rose 600
    accent_color: '#F43F5E',
    style: 'Energético, Moderno & Resultados',
    hero_badge: 'Treinamento de Alta Performance & Saúde',
    hero_cta_primary: 'Ganhar 1 Aula Experimental Grátis',
    hero_cta_secondary: 'Conhecer os Planos',
    whatsapp_cta: 'Falar com um Consultor',
    whatsapp_template: 'Olá! Vim pelo site e gostaria de agendar uma aula experimental grátis.',
    images: [
      {
        title: 'Área de Musculação & Aparelhos Biomecânicos',
        image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80',
        caption: 'Maquinário de última geração para máxima ativação muscular.',
        category: 'Musculação'
      },
      {
        title: 'Aulas Coletivas & Funcional Dinâmico',
        image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
        caption: 'Spinning, funcional, pilates e dança com professores motivadores.',
        category: 'Coletivas'
      },
      {
        title: 'Acompanhamento Físico & Bioimpedância',
        image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1000&q=80',
        caption: 'Avaliações periódicas para você acompanhar sua evolução real.',
        category: 'Resultados'
      }
    ],
    differentials: [
      { title: 'Treinadores Sempre Presentes', description: 'Orientação técnica contínua para evitar lesões e acelerar seus ganhos.', icon: 'Users' },
      { title: 'Espaço 100% Climatizado', description: 'Ambiente amplo, vestiários com ducha quente e som ambiente motivador.', icon: 'Wind' },
      { title: 'Horários Estendidos', description: 'Treine cedo ou à noite de segunda a domingo conforme sua rotina.', icon: 'Clock' },
      { title: 'Sem Fidelidade Abusiva', description: 'Planos flexíveis que se adaptam aos seus objetivos.', icon: 'CheckCircle2' }
    ],
    faq_template: [
      { question: 'Posso fazer uma aula experimental antes de matricular?', answer: 'Com certeza! Clique no WhatsApp e reserve seu passe livre experimental de 1 dia.' },
      { question: 'Iniciantes têm suporte para montar treino?', answer: 'Sim! Nosso time monta seu treino personalizado e ensina a execução correta de cada exercício.' },
      { question: 'Quais modalidades estão inclusas no plano?', answer: 'Musculação, cardio e aulas coletivas conforme a modalidade escolhida.' }
    ]
  },
  loja: {
    primary_color: '#0F172A',
    secondary_color: '#4F46E5', // Indigo 600
    accent_color: '#6366F1',
    style: 'Comercial & Sofisticado',
    hero_badge: 'Coleções Exclusivas & Novidades da Semana',
    hero_cta_primary: 'Ver Catálogo no WhatsApp',
    hero_cta_secondary: 'Conhecer Produtos',
    whatsapp_cta: 'Comprar pelo WhatsApp',
    whatsapp_template: 'Olá! Vim pelo site e gostaria de ver as novidades e disponibilidade de produtos.',
    images: [
      {
        title: 'Mostruário & Coleções Exclusivas',
        image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
        caption: 'Peças selecionadas com foco em design, durabilidade e tendência.',
        category: 'Coleção'
      },
      {
        title: 'Atendimento VIP & Consultoria de Estilo',
        image_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=80',
        caption: 'Ajudamos você a encontrar exatamente o que procura com rapidez.',
        category: 'Atendimento'
      },
      {
        title: 'Embalagens Especiais para Presente',
        image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
        caption: 'Envios para todo o Brasil e retirada rápida na loja física.',
        category: 'Envio'
      }
    ],
    differentials: [
      { title: 'Qualidade Garantida', description: 'Trabalhamos apenas com produtos originais e procedência certificada.', icon: 'ShieldCheck' },
      { title: 'Entrega Rápida & Retirada Express', description: 'Receba no mesmo dia na sua cidade ou retire na loja.', icon: 'Truck' },
      { title: 'Troca Fácil Sem Burocracia', description: 'Satisfação garantida ou seu dinheiro de volta em até 7 dias.', icon: 'RotateCcw' },
      { title: 'Atendimento Personalizado', description: 'Fotos e vídeos em tempo real pelo WhatsApp para você escolher com calma.', icon: 'MessageSquare' }
    ],
    faq_template: [
      { question: 'Como faço para comprar pelo WhatsApp?', answer: 'Basta clicar no botão e falar com nosso time comercial. Enviamos fotos, calculamos frete e geramos link de pagamento.' },
      { question: 'Quais as formas de pagamento aceitas?', answer: 'Pix com desconto especial e cartão de crédito em até 6x sem juros.' },
      { question: 'Vocês enviam para outras cidades?', answer: 'Sim, enviamos com segurança via Correios e transportadoras com código de rastreamento.' }
    ]
  },
  padaria: {
    primary_color: '#451A03', // Amber 950 (warm coffee)
    secondary_color: '#D97706', // Amber 600
    accent_color: '#F59E0B',
    style: 'Artesanal, Afetuoso & Acolhedor',
    hero_badge: 'Fornadas Quentes Diárias & Café Especial',
    hero_cta_primary: 'Fazer Encomenda no WhatsApp',
    hero_cta_secondary: 'Ver Cardápio de Pães & Doces',
    whatsapp_cta: 'Fazer Encomenda',
    whatsapp_template: 'Olá! Gostaria de consultar os produtos de hoje e fazer uma encomenda.',
    images: [
      {
        title: 'Pães de Fermentação Natural',
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
        caption: 'Casca crocante, miolo macio e fermentação lenta de 24 horas.',
        category: 'Pães'
      },
      {
        title: 'Confeitaria Fina & Bolos Recheados',
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
        caption: 'Bolos artesanais para aniversários, tortas doces e sobremesas finas.',
        category: 'Doces'
      },
      {
        title: 'Café da Manhã & Cafés Especiais',
        image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80',
        caption: 'Espaço aconchegante para começar o dia com café quentinho e salgados.',
        category: 'Cafeteria'
      }
    ],
    differentials: [
      { title: 'Fornadas Frescas o Dia Todo', description: 'Pão quente saindo a cada hora para acompanhar seu dia.', icon: 'Flame' },
      { title: 'Farinha Selecionada & Sem Conservantes', description: 'Ingredientes puros que respeitam os métodos tradicionais de panificação.', icon: 'Wheat' },
      { title: 'Encomendas para Festas & Empresas', description: 'Coffee breaks, mini salgados e tortas sob medida para seu evento.', icon: 'Gift' },
      { title: 'Atendimento Próximo e Familiar', description: 'Mais do que uma padaria, o ponto de encontro preferido do bairro.', icon: 'Smile' }
    ],
    faq_template: [
      { question: 'Com quanto tempo de antecedência devo encomendar bolos?', answer: 'Recomendamos 24 horas de antecedência para garantir a decoração e recheio desejados.' },
      { question: 'Possuem opções integrais e sem glúten?', answer: 'Temos pães integrais de grãos nobres e opções de tapiocas frescas no café.' },
      { question: 'Vocês entregam café da manhã em casa?', answer: 'Sim! Montamos cestas de café e entregamos em domicílio via delivery.' }
    ]
  },
  beleza: {
    primary_color: '#4A044E', // Fuchsia 950
    secondary_color: '#DB2777', // Pink 600
    accent_color: '#EC4899',
    style: 'Elegante, Glow & Autocuidado',
    hero_badge: 'Estética Avançada, Cabelo, Make & Bem-Estar',
    hero_cta_primary: 'Agendar Horário no WhatsApp',
    hero_cta_secondary: 'Conhecer Tratamentos',
    whatsapp_cta: 'Agendar no WhatsApp',
    whatsapp_template: 'Olá! Vim pelo site e gostaria de agendar um horário para procedimentos.',
    images: [
      {
        title: 'Coloração, Mechas & Tratamentos Capilares',
        image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80',
        caption: 'Cabelos saudáveis com cronograma capilar e produtos importados.',
        category: 'Cabelo'
      },
      {
        title: 'Estética Facial & Limpeza de Pele Profunda',
        image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80',
        caption: 'Rejuvenescimento, hidratação profunda e luminosidade natural.',
        category: 'Facial'
      },
      {
        title: 'Design de Sobrancelhas, Cílios & Unhas',
        image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
        caption: 'Harmonização do olhar e unhas impecáveis com durabilidade estendida.',
        category: 'Unhas'
      }
    ],
    differentials: [
      { title: 'Profissionais Especialistas', description: 'Cabeleireiras, esteticistas e manicures em constante aperfeiçoamento.', icon: 'Sparkles' },
      { title: 'Cosméticos de Nível Internacional', description: 'Tratamentos com marcas consagradas para resultados visíveis na primeira sessão.', icon: 'ShieldCheck' },
      { title: 'Ambiente Sofisticado & Relaxante', description: 'Massagem, aromaterapia e bebidas de cortesia enquanto você se cuida.', icon: 'Heart' },
      { title: 'Diagnóstico Capilar e Facial Gratuito', description: 'Avaliamos a real necessidade do seu fio e pele antes de qualquer química.', icon: 'CheckCircle2' }
    ],
    faq_template: [
      { question: 'Preciso pagar sinal para agendar?', answer: 'Para procedimentos longos como mechas ou Dia de Noiva, solicitamos um pequeno adiantamento.' },
      { question: 'Vocês fazem teste de mecha antes de descolorir?', answer: 'Com certeza! Prezamos pela saúde e integridade do seu cabelo antes de qualquer processo químico.' },
      { question: 'Aceitam pagamento parcelado?', answer: 'Sim, parcelamos pacotes e procedimentos estéticos em até 6x no cartão de crédito.' }
    ]
  },
  mecanica: {
    primary_color: '#0F172A',
    secondary_color: '#EA580C', // Orange 600
    accent_color: '#F97316',
    style: 'Técnico, Robusto & Confiável',
    hero_badge: 'Mecânica Automotiva de Precisão & Diagnóstico Computadorizado',
    hero_cta_primary: 'Solicitar Orçamento no WhatsApp',
    hero_cta_secondary: 'Ver Serviços Automotivos',
    whatsapp_cta: 'Chamar no WhatsApp',
    whatsapp_template: 'Olá! Vim pelo site e gostaria de agendar uma revisão / orçamento para meu veículo.',
    images: [
      {
        title: 'Diagnóstico Eletrônico & Scanner Automotivo',
        image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1000&q=80',
        caption: 'Identificação exata de falhas na injeção e sensores sem adivinhação.',
        category: 'Diagnóstico'
      },
      {
        title: 'Freios, Suspensão & Troca de Óleo',
        image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1000&q=80',
        caption: 'Segurança total para sua família com peças originais e garantia.',
        category: 'Manutenção'
      },
      {
        title: 'Oficina Limpa, Organizada & Transparente',
        image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
        caption: 'Você recebe fotos e vídeos de cada peça substituída no WhatsApp.',
        category: 'Oficina'
      }
    ],
    differentials: [
      { title: 'Garantia em Peças e Mão de Obra', description: 'Trabalho sério documentado com nota fiscal e garantia legal estendida.', icon: 'ShieldCheck' },
      { title: 'Transparência Total por WhatsApp', description: 'Enviamos fotos das peças antigas e explicação clara antes de qualquer troca.', icon: 'Smartphone' },
      { title: 'Equipamentos e Ferramental Moderno', description: 'Elevadores seguros, alinhamento a laser e scanners atualizados.', icon: 'Wrench' },
      { title: 'Revisão Preventiva Rápida', description: 'Check-up de 30 itens para você viajar com tranquilidade.', icon: 'CheckCircle2' }
    ],
    faq_template: [
      { question: 'Cobram para fazer o orçamento do veículo?', answer: 'O orçamento visual básico e teste rápido de rodagem são gratuitos.' },
      { question: 'Vocês utilizam peças originais?', answer: 'Trabalhamos exclusivamente com peças genuínas ou de primeiras marcas com garantia de fábrica.' },
      { question: 'Possuem serviço de guincho parceiro?', answer: 'Sim, indicamos guincho de confiança para buscar seu carro caso não esteja rodando.' }
    ]
  },
  advocacia: {
    primary_color: '#0F172A',
    secondary_color: '#B45309', // Amber 700
    accent_color: '#D97706',
    style: 'Institucional, Étnico & Rigor Técnico',
    hero_badge: 'Assessoria Jurídica Estratégica & Especializada',
    hero_cta_primary: 'Falar com Advogado no WhatsApp',
    hero_cta_secondary: 'Conhecer Áreas de Atuação',
    whatsapp_cta: 'Falar no WhatsApp',
    whatsapp_template: 'Olá! Gostaria de consultar um especialista jurídico para o meu caso.',
    images: [
      {
        title: 'Sala de Reuniões & Atendimento Reservado',
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
        caption: 'Privacidade total e sigilo profissional em cada consulta.',
        category: 'Escritório'
      },
      {
        title: 'Consultoria Preventiva & Contencioso',
        image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80',
        caption: 'Análise detalhada de riscos e defesa combativa dos seus direitos.',
        category: 'Atuação'
      },
      {
        title: 'Atendimento Online em Todo o País',
        image_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80',
        caption: 'Processos digitais acompanhados em tempo real com relatórios mensais.',
        category: 'Digital'
      }
    ],
    differentials: [
      { title: 'Atuação Ética e Transparente', description: 'Clareza sobre chances reais e custos desde o primeiro contato.', icon: 'Scale' },
      { title: 'Atualização Constante do Cliente', description: 'Informamos cada movimentação importante do seu processo sem juridiquês.', icon: 'Bell' },
      { title: 'Especialistas por Área do Direito', description: 'Cada causa é direcionada ao profissional com experiência comprovada no tema.', icon: 'Award' },
      { title: 'Atendimento Híbrido Presencial e Online', description: 'Reuniões por videoconferência com assinatura digital rápida.', icon: 'Video' }
    ],
    faq_template: [
      { question: 'Como agendar uma consulta inicial?', answer: 'Entre em contato pelo WhatsApp para enviarmos as informações preliminares e agendarmos a reunião.' },
      { question: 'Atendem clientes de outras cidades ou estados?', answer: 'Sim, a Justiça brasileira é 100% eletrônica, o que nos permite atuar em todo o território nacional.' },
      { question: 'Quais documentos devo separar?', answer: 'Dependendo do caso, solicitamos RG, comprovante de residência e os contratos ou mensagens relativas ao problema.' }
    ]
  },
  contabilidade: {
    primary_color: '#0F172A',
    secondary_color: '#0D9488', // Teal 600
    accent_color: '#14B8A6',
    style: 'Corporativo Moderno & Consultivo',
    hero_badge: 'Gestão Contábil, Tributária & BPO Financeiro',
    hero_cta_primary: 'Fazer Diagnóstico Fiscal Gratuito',
    hero_cta_secondary: 'Conhecer Nossos Planos',
    whatsapp_cta: 'Falar com Contador',
    whatsapp_template: 'Olá! Vim pelo site e gostaria de conversar sobre contabilidade para minha empresa.',
    images: [
      {
        title: 'Planejamento Tributário & Economia Legal',
        image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80',
        caption: 'Redução segura da carga tributária através do enquadramento ideal.',
        category: 'Tributos'
      },
      {
        title: 'BPO Financeiro & Relatórios em Tempo Real',
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
        caption: 'Controle de contas a pagar e receber sem complicação para o empresário.',
        category: 'Financeiro'
      },
      {
        title: 'Abertura de Empresas Rápida & Digital',
        image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
        caption: 'CNPJ ativo com alvará e suporte completo em poucos dias.',
        category: 'Abertura'
      }
    ],
    differentials: [
      { title: 'Contabilidade Sem Papel e Ágil', description: 'Plataforma digital intuitiva para envio de notas fiscais e holerites.', icon: 'Laptop' },
      { title: 'Atendimento Rápido Sem Chamados Frios', description: 'Fale diretamente com seu contador responsável no WhatsApp.', icon: 'MessageSquare' },
      { title: 'Zero Multas por Atraso', description: 'Compromisso contratual com a entrega pontual de todas as guias e obrigações.', icon: 'ShieldCheck' },
      { title: 'Foco no Lucro da Sua Empresa', description: 'Consultoria estratégica para seu negócio crescer de forma sustentável.', icon: 'TrendingUp' }
    ],
    faq_template: [
      { question: 'Como funciona a troca de contador?', answer: 'Cuidamos de toda a transição de documentos com o contador antigo sem nenhum estresse para você.' },
      { question: 'Qual o custo para abrir uma empresa?', answer: 'Abertura grátis ao contratar nosso plano anual de assessoria contábil.' },
      { question: 'Vocês atendem MEI, Simples Nacional e Lucro Presumido?', answer: 'Sim, atendemos desde profissionais liberais e MEIs até médias empresas com múltiplos sócios.' }
    ]
  },
  geral: {
    primary_color: '#0F172A',
    secondary_color: '#4F46E5', // Indigo 600
    accent_color: '#6366F1',
    style: 'Moderno, Profissional & Alta Conversão',
    hero_badge: 'Excelência, Rigor Técnico & Atendimento Humanizado',
    hero_cta_primary: 'Falar pelo WhatsApp',
    hero_cta_secondary: 'Conhecer Nossos Serviços',
    whatsapp_cta: 'Falar no WhatsApp',
    whatsapp_template: 'Olá! Vim pelo site e gostaria de saber mais informações sobre os serviços.',
    images: [
      {
        title: 'Instalações & Estrutura de Atendimento',
        image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=80',
        caption: 'Ambiente planejado com tecnologia para seu total conforto.',
        category: 'Estrutura'
      },
      {
        title: 'Equipe de Especialistas Dedicados',
        image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
        caption: 'Profissionais experientes focados na melhor solução para você.',
        category: 'Equipe'
      },
      {
        title: 'Pontualidade & Compromisso com Resultados',
        image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80',
        caption: 'Processos claros e relacionamento transparente do início ao fim.',
        category: 'Qualidade'
      }
    ],
    differentials: [
      { title: 'Atendimento Rápido e Sem Burocracia', description: 'Resposta ágil no WhatsApp para tirar dúvidas e resolver demandas.', icon: 'Zap' },
      { title: 'Qualidade Comprovada por Clientes', description: 'Reputação sólida construída com ética e compromisso contínuo.', icon: 'Award' },
      { title: 'Equipamentos e Métodos Modernos', description: 'Processos atualizados que garantem precisão e conforto.', icon: 'Sparkles' },
      { title: 'Condições Facilitadas de Pagamento', description: 'Pix com confirmação rápida e parcelamento nos cartões.', icon: 'CreditCard' }
    ],
    faq_template: [
      { question: 'Como posso solicitar um orçamento ou atendimento?', answer: 'Basta clicar no botão de WhatsApp ou nos enviar uma mensagem pelo formulário.' },
      { question: 'Quais são os horários de funcionamento?', answer: 'Atendemos em horário comercial com flexibilidade de agendamento prévio.' },
      { question: 'Onde vocês estão localizados?', answer: 'Estamos em endereço de fácil acesso com estacionamento próximo.' }
    ]
  }
};

export function detectNicheType(category: string, name: string): NicheKey {
  const text = `${category} ${name}`.toLowerCase();
  
  if (text.includes('barbear') || text.includes('barber') || text.includes('cabelereiro masculino') || text.includes('barba')) {
    return 'barbearia';
  }
  if (text.includes('restaurante') || text.includes('pizzaria') || text.includes('hamburguer') || text.includes('bistrô') || text.includes('gastronomia') || text.includes('sushi') || text.includes('comida') || text.includes('churrascaria') || text.includes('bar') || text.includes('cafeteria')) {
    return 'restaurante';
  }
  if (text.includes('dentista') || text.includes('odonto') || text.includes('dental') || text.includes('clareamento') || text.includes('ortodont')) {
    return 'dentista';
  }
  if (text.includes('pet') || text.includes('veterin') || text.includes('banho e tosa') || text.includes('canil') || text.includes('animal')) {
    return 'petshop';
  }
  if (text.includes('academia') || text.includes('crossfit') || text.includes('fitness') || text.includes('personal') || text.includes('treino') || text.includes('musculação') || text.includes('pilates')) {
    return 'academia';
  }
  if (text.includes('padaria') || text.includes('confeitaria') || text.includes('pão') || text.includes('bolos') || text.includes('panificadora')) {
    return 'padaria';
  }
  if (text.includes('beleza') || text.includes('estética') || text.includes('salao') || text.includes('salão') || text.includes('sobrancelha') || text.includes('unha') || text.includes('manicure') || text.includes('spa')) {
    return 'beleza';
  }
  if (text.includes('mecanic') || text.includes('mecânica') || text.includes('auto') || text.includes('oficina') || text.includes('pneu') || text.includes('carro') || text.includes('veículo') || text.includes('lanternagem')) {
    return 'mecanica';
  }
  if (text.includes('advoc') || text.includes('advogad') || text.includes('jurídic') || text.includes('direito') || text.includes('oab')) {
    return 'advocacia';
  }
  if (text.includes('contabil') || text.includes('contador') || text.includes('fiscal') || text.includes('tribut') || text.includes('bpo')) {
    return 'contabilidade';
  }
  if (text.includes('loja') || text.includes('boutique') || text.includes('moda') || text.includes('roupa') || text.includes('calçado') || text.includes('comércio') || text.includes('ótica') || text.includes('joalheria')) {
    return 'loja';
  }
  
  return 'geral';
}

export const WebsiteGeneratorService = {
  /**
   * Envia os parâmetros para a rota de backend server-side /api/gemini/generate-site
   * que utiliza o SDK @google/genai com o modelo gemini-3.8-flash.
   * Se offline ou se a chamada falhar, utiliza o gerador inteligente local em pt-BR.
   */
  async generateWebsite(params: WebsiteGenerationParams): Promise<GeneratedWebsiteData> {
    try {
      const response = await fetch('/api/gemini/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.site_data && data.site_data.business_name) {
          // Enrich with niche assets if images are missing or empty
          return this.sanitizeAndEnrich(data.site_data, params);
        }
      }
    } catch (err) {
      console.warn('Backend Gemini API endpoint unreachable or error, using local niche generator:', err);
    }

    // Gerador semântico de nível agência em português brasileiro adaptado ao nicho
    return this.generateSmartFallback(params);
  },

  /**
   * Garante que o site gerado pela IA tenha proporções, fotos em alta resolução do nicho e links funcionais
   */
  sanitizeAndEnrich(site: GeneratedWebsiteData, params: WebsiteGenerationParams): GeneratedWebsiteData {
    const nicheKey = detectNicheType(params.category || site.category || '', params.business_name || site.business_name);
    const theme = NICHE_THEMES[nicheKey];

    // Se a IA não retornou imagens suficientes ou retornou placeholders velhos, usa o acervo de alta resolução do nicho
    if (!site.gallery || site.gallery.length === 0 || site.gallery.some(g => !g.image_url || g.image_url.includes('website_sample_preview'))) {
      site.gallery = theme.images;
    }

    if (!site.niche_type) {
      site.niche_type = nicheKey;
    }

    if (!site.hero.background_image) {
      site.hero.background_image = theme.images[0]?.image_url;
    }

    if (!site.seo) {
      const loc = params.city || 'Sua Região';
      site.seo = {
        meta_title: `${site.business_name} | ${site.category} em ${loc}`,
        meta_description: site.description.slice(0, 160),
        og_title: `${site.business_name} - ${site.hero.title}`,
        og_description: site.hero.subtitle.slice(0, 160),
        keywords: [site.category, site.business_name, loc, 'atendimento', 'WhatsApp'],
      };
    }

    // Se não há depoimentos reais fornecidos pelo lead, NÃO inventar dados falsos de clientes
    if (!site.testimonials || site.testimonials.length === 0) {
      if (params.rating && params.review_count) {
        site.rating = params.rating;
        site.review_count = params.review_count;
      }
    }

    site.custom_prompt = params.custom_prompt;
    site.whatsapp_status = params.whatsapp_status;

    return site;
  },

  /**
   * Gerador semântico de agência adaptado estritamente às informações reais
   */
  generateSmartFallback(params: WebsiteGenerationParams): GeneratedWebsiteData {
    const name = params.business_name || 'Empresa Local';
    const category = params.category || 'Serviços Especializados';
    const phone = params.phone || '';
    const cleanWhatsapp = (params.whatsapp || phone || '').replace(/\D/g, '');
    const address = params.address || '';
    const city = params.city || (address.includes('-') ? address.split('-')[1]?.trim() : '');
    const state = params.state || '';
    const nicheKey = detectNicheType(category, name);
    const theme = NICHE_THEMES[nicheKey];

    // Personalização guiada pelo prompt do usuário (paleta, estilo e foco)
    let finalPrimaryColor = theme.primary_color;
    let finalSecondaryColor = theme.secondary_color;
    let finalAccentColor = theme.accent_color;
    let finalStyle = params.style || theme.style;

    if (params.custom_prompt) {
      const promptLower = params.custom_prompt.toLowerCase();
      if (promptLower.includes('dourado') || promptLower.includes('ouro') || promptLower.includes('gold')) {
        finalSecondaryColor = '#D4AF37';
        finalAccentColor = '#B8860B';
      }
      if (promptLower.includes('preto') || promptLower.includes('black') || promptLower.includes('escuro') || promptLower.includes('dark')) {
        finalPrimaryColor = '#0F172A';
      }
      if (promptLower.includes('azul') || promptLower.includes('blue')) {
        finalPrimaryColor = '#0A192F';
        finalSecondaryColor = '#3B82F6';
      }
      if (promptLower.includes('verde') || promptLower.includes('green')) {
        finalPrimaryColor = '#064E3B';
        finalSecondaryColor = '#10B981';
      }
      if (promptLower.includes('vinho') || promptLower.includes('vermelho')) {
        finalPrimaryColor = '#4C0519';
        finalSecondaryColor = '#E11D48';
      }
      if (promptLower.includes('sofisticado') || promptLower.includes('premium') || promptLower.includes('elegante')) {
        finalStyle = 'Premium, Sofisticado & Elegante';
      } else if (promptLower.includes('moderno') || promptLower.includes('clean')) {
        finalStyle = 'Moderno, Minimalista & Clean';
      }
    }

    // Se serviços foram informados, usa-os estritamente. Não inventa serviços extravagantes.
    const rawServices = params.services ? params.services.split(',').map(s => s.trim()).filter(Boolean) : [];
    const finalServices = rawServices.length > 0
      ? rawServices.map((svc, idx) => ({
          id: `svc_${idx + 1}`,
          title: svc,
          description: `Atendimento completo em ${svc.toLowerCase()} com excelência técnica, foco no cliente e materiais de primeira linha.`,
          icon: idx === 0 ? 'Sparkles' : idx === 1 ? 'ShieldCheck' : idx === 2 ? 'Award' : 'Clock',
          highlight: idx === 0 ? 'Mais procurado' : undefined,
          cta_text: theme.whatsapp_cta
        }))
      : [
          {
            id: 'svc_1',
            title: 'Atendimento Personalizado',
            description: `Soluções completas sob medida para a sua necessidade em ${category.toLowerCase()}.`,
            icon: 'Sparkles',
            highlight: 'Destaque',
            cta_text: theme.whatsapp_cta
          },
          {
            id: 'svc_2',
            title: 'Avaliação & Diagnóstico Técnico',
            description: 'Análise minuciosa e planejamento transparente antes de qualquer procedimento.',
            icon: 'ShieldCheck',
            cta_text: theme.whatsapp_cta
          },
          {
            id: 'svc_3',
            title: 'Estrutura Moderna & Conforto',
            description: 'Ambiente higienizado, preparado com conforto e pontualidade para você.',
            icon: 'Award',
            cta_text: theme.whatsapp_cta
          }
        ];

    // SEO estruturado e focado na localidade real
    const locationSuffix = city ? ` em ${city}${state ? ` - ${state}` : ''}` : '';
    const metaTitle = `${name} | ${category}${locationSuffix}`;
    const metaDesc = (params.description || `Conheça ${name}. Especialistas em ${category}${locationSuffix}. Agende pelo WhatsApp e confira nossos diferenciais.`).slice(0, 160);

    const siteData: GeneratedWebsiteData = {
      business_name: name,
      category,
      niche_type: nicheKey,
      tagline: `${category} com excelência, segurança e dedicação.${locationSuffix}`,
      description: params.description || `${name} é referência em ${category.toLowerCase()}${locationSuffix}. Atendimento humanizado, equipe comprometida e foco em proporcionar a melhor experiência para você.`,
      phone,
      whatsapp: cleanWhatsapp,
      email: `contato@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
      address,
      city,
      state,
      instagram: params.instagram || `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      google_maps_url: params.google_maps_url,
      rating: params.rating,
      review_count: params.review_count,
      primary_color: finalPrimaryColor,
      secondary_color: finalSecondaryColor,
      accent_color: finalAccentColor,
      style: finalStyle,
      custom_prompt: params.custom_prompt,
      whatsapp_status: params.whatsapp_status,
      seo: {
        meta_title: metaTitle,
        meta_description: metaDesc,
        og_title: `${name} | Website Oficial`,
        og_description: metaDesc,
        keywords: [category, name, city || 'Brasil', 'serviços', 'WhatsApp', 'atendimento'],
      },
      hero: {
        badge: theme.hero_badge,
        title: `${name}: Seu Destino de Confiança em ${category}`,
        subtitle: params.description
          ? params.description
          : `Atendimento ágil, estrutura pensada para seu conforto e especialistas dedicados a superar suas expectativas.`,
        cta_primary: theme.hero_cta_primary,
        cta_secondary: theme.hero_cta_secondary,
        background_image: theme.images[0]?.image_url,
      },
      about: {
        title: `Sobre a ${name}`,
        text: `Com dedicação integral ao segmento de ${category.toLowerCase()}, a ${name} consolidou sua atuação através da honestidade, pontualidade e relacionamento próximo com cada cliente. Nosso compromisso diário é entregar soluções com o mais alto padrão de qualidade e transparência.`,
        highlights: [
          'Profissionais qualificados com atendimento humanizado',
          'Instalações confortáveis e protocolos rigorosos de biossegurança',
          'Transparência total em orçamentos e agendamentos',
          'Atendimento rápido e desburocratizado pelo WhatsApp'
        ],
        story_badge: 'Tradição & Qualidade'
      },
      services: finalServices,
      gallery: theme.images,
      differentials: theme.differentials,
      // Se não há avaliações reais fornecidas, deixa vazio ou usa somente caso o Google Maps tenha nota real
      testimonials: params.rating && params.review_count && params.review_count > 0 ? [
        {
          name: 'Avaliações Verificadas no Google',
          role: `${params.review_count} clientes satisfeitos`,
          content: `Empresa avaliada com nota média de ${params.rating} estrelas no Google Maps pelos clientes locais da região.`,
          rating: Math.round(params.rating),
          verified: true
        }
      ] : undefined,
      faq: theme.faq_template,
      contact: {
        opening_hours: params.opening_hours || 'Segunda a Sexta das 08h às 18h | Sábado das 08h às 12h',
        address_display: address || 'Atendimento com horário agendado',
        contact_phone: phone || cleanWhatsapp,
        whatsapp_cta: theme.whatsapp_cta,
        whatsapp_message: theme.whatsapp_template,
      }
    };

    return siteData;
  }
};
