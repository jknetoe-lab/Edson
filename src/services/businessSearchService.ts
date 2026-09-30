import { BusinessSearchResult, PlacesDiagnostic } from '../types';

export interface BusinessSearchParams {
  country: string;
  state: string;
  city: string;
  category: string;
  filter: 'Sem site' | 'Com site' | 'Todos';
}

export interface BusinessSearchResultOutput {
  results: BusinessSearchResult[];
  source: string;
  diagnostic?: PlacesDiagnostic;
  error?: string;
}

/**
 * Validação rigorosa dos leads:
 * Descarta qualquer item que não possua Place ID, Nome, Endereço ou URL autêntica do Google Maps.
 * A IA NUNCA inventa dados.
 */
export function validateLeadItem(lead: any): boolean {
  if (!lead) return false;
  if (!lead.place_id || typeof lead.place_id !== 'string' || lead.place_id.trim().length === 0) return false;
  if (!lead.name || typeof lead.name !== 'string' || lead.name.trim().length === 0) return false;
  if (!lead.address || typeof lead.address !== 'string' || lead.address.trim().length === 0) return false;
  if (!lead.google_maps_url || typeof lead.google_maps_url !== 'string') return false;
  const isMapsUrl = lead.google_maps_url.includes('google.com/maps') || 
                    lead.google_maps_url.includes('maps.google.com') ||
                    lead.google_maps_url.includes('goo.gl/maps');
  if (!isMapsUrl) return false;
  return true;
}

export const BusinessSearchService = {
  /**
   * Executa busca de estabelecimentos reais no Google Maps / Places API.
   * Não gera dados fictícios.
   */
  async search(params: BusinessSearchParams): Promise<BusinessSearchResultOutput> {
    try {
      const response = await fetch('/api/search/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && Array.isArray(data.results)) {
          // 1. Validação estrita: cada lead deve ter Place ID, Nome, Endereço e Google Maps link
          const validLeads = data.results.filter(validateLeadItem);

          // 2. Deduplicação estrita por Google Place ID
          const seen = new Set<string>();
          const deduplicated: BusinessSearchResult[] = [];

          for (const item of validLeads) {
            if (!seen.has(item.place_id)) {
              seen.add(item.place_id);
              deduplicated.push(item);
            }
          }

          return {
            results: deduplicated,
            source: data.source || 'google_places_api_new',
            diagnostic: data.diagnostic,
            error: deduplicated.length === 0 ? 'Nenhum estabelecimento encontrado para estes critérios.' : undefined
          };
        }

        // Se a resposta retornou erro
        return {
          results: [],
          source: data.source || 'google_places',
          diagnostic: data.diagnostic,
          error: data.error || 'Não foi possível consultar o Google Maps. Tente novamente.'
        };
      } else {
        const errData = await response.json().catch(() => ({}));
        return {
          results: [],
          source: 'error',
          diagnostic: errData.diagnostic,
          error: errData.error || 'Não foi possível consultar o Google Maps. Tente novamente.'
        };
      }
    } catch (err: any) {
      console.error('Falha na requisição de busca do Google Maps:', err);
      return {
        results: [],
        source: 'network_error',
        error: 'Não foi possível consultar o Google Maps. Tente novamente.'
      };
    }
  }
};
