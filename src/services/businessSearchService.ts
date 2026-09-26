import { BusinessSearchResult } from '../types';

export interface BusinessSearchParams {
  country: string;
  state: string;
  city: string;
  category: string;
  filter: 'Sem site' | 'Com site' | 'Todos';
}

/**
 * BusinessSearchService
 * 
 * Camada de abstração para prospecção de empresas locais.
 * Projetada para conectar facilmente a provedores reais em produção
 * (ex: Google Places API, SerpApi, ReceitaWS / BrasilAPI de CNPJs)
 * através de variáveis de ambiente.
 * 
 * Em ambiente de desenvolvimento, utiliza dados simulados devidamente
 * rotulados como [AMBIENTE DE DESENVOLVIMENTO].
 */
export const BusinessSearchService = {
  /**
   * Verifica se há uma chave de API real configurada no backend
   */
  hasRealProviderConfigured(): boolean {
    // Definida no servidor via GOOGLE_PLACES_API_KEY ou SERPAPI_KEY
    return false;
  },

  /**
   * Executa busca de empresas por localização e nicho
   */
  async search(params: BusinessSearchParams): Promise<{
    results: BusinessSearchResult[];
    isMock: boolean;
    providerName: string;
  }> {
    // Simula pequena latência de requisição de rede para realismo visual (400ms)
    await new Promise(resolve => setTimeout(resolve, 450));

    // Se no futuro houver chamada para /api/search/businesses no backend com chave real:
    try {
      const response = await fetch('/api/search/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return {
            results: data.results,
            isMock: data.isMock ?? true,
            providerName: data.providerName ?? 'LeadForge Business Provider',
          };
        }
      }
    } catch {
      // Fallback gracioso para a base de desenvolvimento se o servidor backend não estiver ativo
    }

    // Gerador de dados de desenvolvimento calibrados para cidades brasileiras
    const mockResults = this.generateDevMockData(params);
    return {
      results: mockResults,
      isMock: true,
      providerName: 'Simulador de Desenvolvimento (Google Places / CNPJ Provider Ready)',
    };
  },

  /**
   * Gera dados mock realistas para cidades e nichos brasileiros
   * Todos claramente demarcados com flag is_mock_data = true
   */
  generateDevMockData(params: BusinessSearchParams): BusinessSearchResult[] {
    const { city, state, category, filter } = params;
    const cleanCity = city.trim() || 'Belo Horizonte';
    const cleanState = state.trim() || 'MG';
    const cleanCategory = category.trim() || 'Dentistas';

    // Banco de templates brasileiros por nicho
    const templates = [
      {
        suffix: 'Excelência & Cuidado',
        hasWebsite: false,
        rating: 4.9,
        reviews: 62,
        address: `Av. Principal, 1020 - Centro, ${cleanCity} - ${cleanState}`,
        phone: '(31) 3221-4455',
        whatsapp: '5531991234567',
      },
      {
        suffix: 'Integrada Especialistas',
        hasWebsite: false,
        rating: 4.8,
        reviews: 45,
        address: `Rua das Flores, 450 - Bairro Jardim, ${cleanCity} - ${cleanState}`,
        phone: '(31) 3342-9988',
        whatsapp: '5531988776655',
      },
      {
        suffix: 'Centro Avançado',
        hasWebsite: true,
        website: `https://${cleanCategory.toLowerCase().replace(/[^a-z0-9]/g, '')}-avancado.com.br`,
        rating: 4.6,
        reviews: 89,
        address: `Praça da Matriz, 88 - Centro, ${cleanCity} - ${cleanState}`,
        phone: '(31) 3456-7890',
        whatsapp: '5531976543210',
      },
      {
        suffix: 'Popular & Família',
        hasWebsite: false,
        rating: 4.7,
        reviews: 38,
        address: `Av. dos Bandeirantes, 310 - Vila Nova, ${cleanCity} - ${cleanState}`,
        phone: '(31) 3567-1122',
        whatsapp: '5531992348877',
      },
      {
        suffix: 'Master Prime',
        hasWebsite: true,
        website: `http://${cleanCategory.toLowerCase().replace(/[^a-z0-9]/g, '')}master.com.br`,
        rating: 4.9,
        reviews: 140,
        address: `Alameda Oscar, 500 - Sala 402, ${cleanCity} - ${cleanState}`,
        phone: '(31) 3678-3344',
        whatsapp: '5531981122334',
      },
      {
        suffix: 'Express Soluções Rápidas',
        hasWebsite: false,
        rating: 4.5,
        reviews: 29,
        address: `Rua Minas Gerais, 780, ${cleanCity} - ${cleanState}`,
        phone: '(31) 3789-5566',
        whatsapp: '5531994455667',
      },
      {
        suffix: 'Doutores & Associados',
        hasWebsite: false,
        rating: 4.8,
        reviews: 73,
        address: `Rua Bahia, 1150 - 8º Andar, ${cleanCity} - ${cleanState}`,
        phone: '(31) 3890-7788',
        whatsapp: '5531995566778',
      },
      {
        suffix: 'Inovação & Saúde',
        hasWebsite: true,
        website: `https://${cleanCategory.toLowerCase().replace(/[^a-z0-9]/g, '')}inovacao.com.br`,
        rating: 4.6,
        reviews: 51,
        address: `Av. Afonso Pena, 2300, ${cleanCity} - ${cleanState}`,
        phone: '(31) 3901-8899',
        whatsapp: '5531996677889',
      },
    ];

    let items: BusinessSearchResult[] = templates.map((tmpl, idx) => {
      const businessName = `${cleanCategory} ${tmpl.suffix}`;
      const encodedQuery = encodeURIComponent(`${businessName} ${cleanCity} ${cleanState}`);
      return {
        id: `mock_biz_${Date.now()}_${idx}`,
        name: businessName,
        category: cleanCategory,
        city: cleanCity,
        state: cleanState,
        phone: tmpl.phone,
        whatsapp: tmpl.whatsapp,
        address: tmpl.address,
        rating: tmpl.rating,
        review_count: tmpl.reviews,
        website: tmpl.hasWebsite ? tmpl.website : undefined,
        google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
        has_website: tmpl.hasWebsite,
        is_mock_data: true,
      };
    });

    // Aplica o filtro selecionado pelo usuário
    if (filter === 'Sem site') {
      items = items.filter(item => !item.has_website);
    } else if (filter === 'Com site') {
      items = items.filter(item => item.has_website);
    }

    return items;
  }
};
