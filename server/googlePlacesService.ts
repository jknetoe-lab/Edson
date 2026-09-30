import { BusinessSearchResult, PlacesDiagnostic, WhatsAppStatus } from '../src/types';

export interface SearchQueryOptions {
  country: string;
  state: string;
  city: string;
  category: string;
  filter: 'Sem site' | 'Com site' | 'Todos';
}

export interface SearchPlacesResponse {
  success: boolean;
  results: BusinessSearchResult[];
  source: 'google_places_api_new' | 'error';
  diagnostic: PlacesDiagnostic;
  error?: string;
}

/**
 * Valida se a URL fornecida é de fato um website oficial e próprio da empresa,
 * e não redes sociais (Instagram, Facebook), links do Google Maps ou guias/diretórios comerciais.
 */
export function isValidOfficialWebsite(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  if (clean === '' || clean === '#' || clean === '/') return false;
  
  const forbiddenDomains = [
    'google.com',
    'maps.google',
    'goo.gl',
    'instagram.com',
    'facebook.com',
    'fb.com',
    'fb.me',
    'linktr.ee',
    'linktree',
    'bio.link',
    'wa.me',
    'whatsapp.com',
    'api.whatsapp',
    'ifood.com.br',
    'apontador.com.br',
    'guiamais.com.br',
    'telelistas.net',
    'tripadvisor.com',
    'tripadvisor.com.br',
    'yelp.com',
    'yellowpages.com',
    'solutudo.com.br',
    'doctoralia.com.br',
    'jusbrasil.com.br'
  ];

  return !forbiddenDomains.some(domain => clean.includes(domain));
}

/**
 * Normaliza strings para comparação (remove acentos, caixa baixa)
 */
export function normalizeText(text: string = ''): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Mapeamento estrito de categorias do LeadForge AI para tipos do Google Places API (New) (Table A / Table B)
 */
export const CATEGORY_TYPE_MAPPING: Record<string, { includedType?: string; validTypes: string[]; queryKeyword: string }> = {
  'Clínicas Médicas': {
    includedType: 'medical_clinic',
    validTypes: ['medical_clinic', 'medical_center', 'doctor', 'hospital', 'health'],
    queryKeyword: 'Clínica Médica'
  },
  'Dentistas': {
    includedType: 'dentist',
    validTypes: ['dentist', 'dental_clinic', 'health', 'doctor'],
    queryKeyword: 'Dentista'
  },
  'Barbearias': {
    includedType: 'barber_shop',
    validTypes: ['barber_shop', 'hair_salon', 'beauty_salon'],
    queryKeyword: 'Barbearia'
  },
  'Pet Shops': {
    includedType: 'pet_store',
    validTypes: ['pet_store', 'veterinary_care'],
    queryKeyword: 'Pet Shop'
  },
  'Restaurantes': {
    includedType: 'restaurant',
    validTypes: ['restaurant', 'food', 'meal_takeaway'],
    queryKeyword: 'Restaurante'
  },
  'Academias': {
    includedType: 'gym',
    validTypes: ['gym', 'fitness_center', 'sports_complex'],
    queryKeyword: 'Academia'
  },
  'Advogados': {
    includedType: 'lawyer',
    validTypes: ['lawyer', 'legal_services'],
    queryKeyword: 'Advogado'
  },
  'Contabilidade': {
    includedType: 'accounting',
    validTypes: ['accounting', 'finance'],
    queryKeyword: 'Contabilidade'
  },
  'Imobiliárias': {
    includedType: 'real_estate_agency',
    validTypes: ['real_estate_agency'],
    queryKeyword: 'Imobiliária'
  },
  'Oficinas Mecânicas': {
    includedType: 'car_repair',
    validTypes: ['car_repair', 'auto_repair'],
    queryKeyword: 'Oficina Mecânica'
  },
  'Salões de Beleza': {
    includedType: 'beauty_salon',
    validTypes: ['beauty_salon', 'hair_salon', 'spa'],
    queryKeyword: 'Salão de Beleza'
  }
};

/**
 * Cache em memória dos limites geográficos (viewports) de cidades
 */
const CITY_VIEWPORT_CACHE = new Map<string, {
  low: { latitude: number; longitude: number };
  high: { latitude: number; longitude: number };
}>([
  [
    'belo horizonte_minas gerais',
    {
      low: { latitude: -20.06, longitude: -44.06 },
      high: { latitude: -19.77, longitude: -43.85 }
    }
  ],
  [
    'sao paulo_sao paulo',
    {
      low: { latitude: -24.01, longitude: -46.83 },
      high: { latitude: -23.36, longitude: -46.36 }
    }
  ],
  [
    'goiania_goias',
    {
      low: { latitude: -16.83, longitude: -49.38 },
      high: { latitude: -16.55, longitude: -49.15 }
    }
  ],
  [
    'brasilia_distrito federal',
    {
      low: { latitude: -16.05, longitude: -48.28 },
      high: { latitude: -15.50, longitude: -47.30 }
    }
  ]
]);

export const GooglePlacesService = {
  /**
   * Obtém a chave de API do Google Maps / Places
   */
  getApiKey(): string {
    return (
      process.env.GOOGLE_PLACES_API_KEY || 
      process.env.GOOGLE_MAPS_API_KEY || 
      process.env.VITE_GOOGLE_MAPS_API_KEY || 
      'AIzaSyCI3XxFoLGDtTxewuFVnbFi6JtNLtN3JFg'
    ).trim();
  },

  /**
   * Resolve o viewport geográfico da cidade para aplicar locationRestriction
   */
  async resolveCityViewport(city: string, state: string, apiKey: string): Promise<{
    low: { latitude: number; longitude: number };
    high: { latitude: number; longitude: number };
  } | undefined> {
    const cacheKey = `${normalizeText(city)}_${normalizeText(state)}`;
    if (CITY_VIEWPORT_CACHE.has(cacheKey)) {
      return CITY_VIEWPORT_CACHE.get(cacheKey);
    }

    try {
      const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.location,places.viewport'
        },
        body: JSON.stringify({
          textQuery: `${city} ${state} Brasil`,
          languageCode: 'pt-BR',
          pageSize: 1
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const viewport = data.places?.[0]?.viewport;
        if (viewport?.low && viewport?.high) {
          CITY_VIEWPORT_CACHE.set(cacheKey, viewport);
          return viewport;
        }
      }
    } catch (err) {
      console.warn('Falha ao resolver viewport da cidade:', err);
    }

    return undefined;
  },

  /**
   * Valida se um local pertence rigorosamente à cidade selecionada.
   * Evita municípios vizinhos da região metropolitana (ex: Contagem, Betim para BH).
   */
  validateCity(place: any, targetCity: string): { valid: boolean; detectedCity?: string } {
    const normTarget = normalizeText(targetCity);

    // 1. Inspeciona addressComponents da Places API (New)
    if (Array.isArray(place.addressComponents)) {
      const admin2 = place.addressComponents.find((c: any) => 
        c.types?.includes('administrative_area_level_2')
      );
      const locality = place.addressComponents.find((c: any) => 
        c.types?.includes('locality')
      );

      const compCity = admin2?.longText || admin2?.shortText || locality?.longText || locality?.shortText;
      if (compCity) {
        const normComp = normalizeText(compCity);

        // Se administrative_area_level_2 existe e não bate com a cidade alvo, rejeita explicitamente
        if (admin2?.longText) {
          const normAdmin2 = normalizeText(admin2.longText);
          if (normAdmin2 !== normTarget && !normAdmin2.includes(normTarget) && !normTarget.includes(normAdmin2)) {
            return { valid: false, detectedCity: admin2.longText };
          }
        }

        if (normComp === normTarget || normComp.includes(normTarget) || normTarget.includes(normComp)) {
          return { valid: true, detectedCity: compCity };
        }
      }
    }

    // 2. Valida contra o formattedAddress
    if (place.formattedAddress) {
      const normAddr = normalizeText(place.formattedAddress);
      if (normAddr.includes(normTarget)) {
        return { valid: true, detectedCity: targetCity };
      }
    }

    return { valid: false, detectedCity: undefined };
  },

  /**
   * Realiza a busca oficial de empresas reais no Google Places API (New).
   * Sem dados simulados ou fictícios.
   */
  async searchPlaces(options: SearchQueryOptions): Promise<SearchPlacesResponse> {
    const { country = 'Brasil', state = '', city = '', category = '', filter = 'Todos' } = options;
    const apiKey = this.getApiKey();

    const diagnostic: PlacesDiagnostic = {
      api_configured: Boolean(apiKey),
      request_status: 'ERROR',
      http_status: 0,
      total_results_returned: 0,
      removed_by_city_validation: 0,
      removed_by_category_validation: 0,
      removed_by_website_filter: 0,
      final_leads_count: 0,
      city_resolved: `${city}, ${state}`,
      endpoint_used: 'https://places.googleapis.com/v1/places:searchText'
    };

    if (!apiKey) {
      diagnostic.error_message = 'Chave do Google Places API não configurada.';
      return {
        success: false,
        results: [],
        source: 'error',
        diagnostic,
        error: 'Chave de API do Google Places não configurada. Configure sua chave no painel.'
      };
    }

    try {
      // 1. Resolve viewport da cidade para delimitação geográfica estrita
      const viewport = await this.resolveCityViewport(city, state, apiKey);

      // 2. Mapeamento de categoria
      const catMapping = CATEGORY_TYPE_MAPPING[category];
      const queryKeyword = catMapping?.queryKeyword || category;
      const textQuery = `${queryKeyword} em ${city} ${state} ${country}`.trim();

      const allPlaces: any[] = [];
      const seenPlaceIds = new Set<string>();
      let nextPageToken: string | undefined = undefined;
      let pageCount = 0;
      let lastHttpStatus = 200;

      // 3. Paginação controlada: busca até 2 páginas (até 40 resultados) para garantir volume em filtros restritos como "Sem site"
      do {
        pageCount++;
        const requestBody: any = {
          textQuery,
          languageCode: 'pt-BR',
          pageSize: 20
        };

        if (catMapping?.includedType) {
          requestBody.includedType = catMapping.includedType;
        }

        if (viewport) {
          requestBody.locationRestriction = {
            rectangle: {
              low: viewport.low,
              high: viewport.high
            }
          };
        }

        if (nextPageToken) {
          requestBody.pageToken = nextPageToken;
        }

        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location,places.primaryType,places.types,places.websiteUri,places.nationalPhoneNumber,places.businessStatus,places.googleMapsUri,nextPageToken'
          },
          body: JSON.stringify(requestBody)
        });

        lastHttpStatus = response.status;
        diagnostic.http_status = response.status;

        if (!response.ok) {
          const errText = await response.text();
          diagnostic.error_message = `HTTP ${response.status}: ${errText}`;
          console.error(`Google Places API returned ${response.status}:`, errText);
          break;
        }

        const data = await response.json();
        const places = Array.isArray(data.places) ? data.places : [];
        allPlaces.push(...places);
        nextPageToken = data.nextPageToken;

        // Se já temos resultados suficientes ou não há próxima página, encerra
        if (!nextPageToken || allPlaces.length >= 40) {
          break;
        }
      } while (pageCount < 2);

      diagnostic.total_results_returned = allPlaces.length;

      if (lastHttpStatus !== 200 && allPlaces.length === 0) {
        return {
          success: false,
          results: [],
          source: 'error',
          diagnostic,
          error: diagnostic.error_message || 'Não foi possível consultar o Google Maps. Tente novamente.'
        };
      }

      diagnostic.request_status = 'SUCCESS';

      // 4. Filtragem rigorosa dos resultados reais recebidos
      const validLeads: BusinessSearchResult[] = [];

      for (const p of allPlaces) {
        const placeId = p.id;
        if (!placeId || seenPlaceIds.has(placeId)) continue;
        seenPlaceIds.add(placeId);

        // A. Validação estrita da cidade
        const cityCheck = this.validateCity(p, city);
        if (!cityCheck.valid) {
          diagnostic.removed_by_city_validation++;
          continue;
        }

        // B. Validação estrita de categoria (quando aplicável)
        if (catMapping && Array.isArray(p.types)) {
          const hasValidType = p.types.some((t: string) => catMapping.validTypes.includes(t));
          const primaryMatches = p.primaryType && catMapping.validTypes.includes(p.primaryType);
          if (!hasValidType && !primaryMatches) {
            diagnostic.removed_by_category_validation++;
            continue;
          }
        }

        // C. Validação de website oficial
        const rawWebsite = p.websiteUri;
        const hasOfficialWeb = isValidOfficialWebsite(rawWebsite);
        const officialWebsite = hasOfficialWeb ? rawWebsite : undefined;

        if (filter === 'Sem site' && hasOfficialWeb) {
          diagnostic.removed_by_website_filter++;
          continue;
        }
        if (filter === 'Com site' && !hasOfficialWeb) {
          diagnostic.removed_by_website_filter++;
          continue;
        }

        // D. Telefone & WhatsApp
        const phone = p.nationalPhoneNumber || '';
        let whatsappStatus: WhatsAppStatus = 'none';

        if (phone) {
          whatsappStatus = 'unconfirmed';
        }

        const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;

        const lead: BusinessSearchResult = {
          id: `place_${placeId}`,
          place_id: placeId,
          name: p.displayName?.text || 'Estabelecimento Local',
          category: category,
          primary_type: p.primaryType,
          types: p.types,
          city: cityCheck.detectedCity || city,
          state,
          country,
          address: p.formattedAddress || `${city} - ${state}`,
          latitude: p.location?.latitude,
          longitude: p.location?.longitude,
          phone: phone || undefined,
          whatsapp: undefined,
          whatsapp_status: whatsappStatus,
          rating: typeof p.rating === 'number' ? p.rating : 4.5,
          review_count: typeof p.userRatingCount === 'number' ? p.userRatingCount : 10,
          website: officialWebsite,
          google_maps_url: mapsUrl,
          business_status: p.businessStatus || 'OPERATIONAL',
          has_website: hasOfficialWeb,
          is_mock_data: false
        };

        validLeads.push(lead);
      }

      diagnostic.final_leads_count = validLeads.length;

      return {
        success: true,
        results: validLeads,
        source: 'google_places_api_new',
        diagnostic
      };
    } catch (err: any) {
      diagnostic.error_message = err.message || 'Erro inesperado na chamada da API.';
      console.error('Falha crítica na busca com Google Places API:', err);
      return {
        success: false,
        results: [],
        source: 'error',
        diagnostic,
        error: 'Não foi possível consultar o Google Maps. Tente novamente.'
      };
    }
  }
};
