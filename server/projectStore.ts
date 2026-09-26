import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Project } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const PROJECTS_FILE = path.resolve(DATA_DIR, 'projects.json');

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_sample_01',
    user_id: 'usr_customer_002',
    name: 'Dra. Camila Soares Odontologia - Site Oficial',
    slug: 'dra-camila-odontologia',
    description: 'Site institucional de alta conversão para clínica odontológica em Belo Horizonte.',
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
    name: 'Barbearia Don Corleone - Site Oficial',
    slug: 'barbearia-don-corleone',
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

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

export const ProjectStore = {
  slugify,

  getAllProjects(): Project[] {
    ensureDataDir();
    try {
      if (!fs.existsSync(PROJECTS_FILE)) {
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(INITIAL_PROJECTS, null, 2), 'utf-8');
        return INITIAL_PROJECTS;
      }
      const raw = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      // Se estava vazio, popula com os iniciais
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(INITIAL_PROJECTS, null, 2), 'utf-8');
      return INITIAL_PROJECTS;
    } catch (err) {
      console.error('Error reading projects file:', err);
      return INITIAL_PROJECTS;
    }
  },

  getProjectBySlug(slug: string): Project | null {
    const projects = this.getAllProjects();
    const cleanSlug = slugify(slug);
    
    // Procura por slug exato, por id, ou por slug gerado a partir do nome
    const found = projects.find(p => {
      const pSlug = p.slug ? slugify(p.slug) : '';
      const bSlug = p.site_data?.business_name ? slugify(p.site_data.business_name) : '';
      const nSlug = p.name ? slugify(p.name) : '';
      return pSlug === cleanSlug || bSlug === cleanSlug || nSlug === cleanSlug || p.id === slug;
    });

    return found || null;
  },

  getProjectById(id: string): Project | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id) || null;
  },

  saveProject(project: Project): Project {
    ensureDataDir();
    const projects = this.getAllProjects();
    
    // Garante que tenha slug definido
    let safeSlug = project.slug ? slugify(project.slug) : '';
    if (!safeSlug && project.site_data?.business_name) {
      safeSlug = slugify(project.site_data.business_name);
    }
    if (!safeSlug) {
      safeSlug = 'site-' + Date.now().toString().slice(-6);
    }

    const updatedProject: Project = {
      ...project,
      slug: safeSlug,
      website_url: `/site/${safeSlug}`,
      updated_at: new Date().toISOString(),
    };

    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = updatedProject;
    } else {
      projects.unshift(updatedProject);
    }

    try {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving project to file:', err);
    }

    return updatedProject;
  },

  deleteProject(id: string): boolean {
    ensureDataDir();
    const projects = this.getAllProjects();
    const filtered = projects.filter(p => p.id !== id);
    if (filtered.length !== projects.length) {
      try {
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
        return true;
      } catch (err) {
        console.error('Error deleting project from file:', err);
      }
    }
    return false;
  },
};
