import React, { useState } from 'react';
import { useAuth } from '../../services/authContext';
import { BusinessSearchService, BusinessSearchParams } from '../../services/businessSearchService';
import { LocalDbService } from '../../services/supabaseClient';
import { BusinessSearchResult, Lead } from '../../types';
import { 
  Search, 
  MapPin, 
  Globe, 
  Phone, 
  MessageSquare, 
  Bookmark, 
  Wand2, 
  ExternalLink, 
  Star, 
  AlertTriangle, 
  AlertCircle,
  Check, 
  Info,
  Filter,
  Eye,
  X
} from 'lucide-react';
import { DashboardTab } from './DashboardLayout';

interface ProspectingPageProps {
  onNavigateTab: (tab: DashboardTab) => void;
  onSelectLeadForSiteCreation: (lead: Lead | BusinessSearchResult) => void;
}

const BRAZILIAN_STATES = [
  'Minas Gerais',
  'São Paulo',
  'Rio de Janeiro',
  'Paraná',
  'Santa Catarina',
  'Rio Grande do Sul',
  'Bahia',
  'Distrito Federal',
  'Goiás',
  'Pernambuco',
  'Ceará',
  'Espírito Santo',
];

const POPULAR_NICHES = [
  'Dentistas',
  'Clínicas Médicas',
  'Advogados',
  'Restaurantes',
  'Academias',
  'Pet Shops',
  'Contabilidade',
  'Imobiliárias',
  'Oficinas Mecânicas',
  'Salões de Beleza',
];

export const ProspectingPage: React.FC<ProspectingPageProps> = ({
  onNavigateTab,
  onSelectLeadForSiteCreation,
}) => {
  const { user, isOwner, consumeSearch } = useAuth();

  const [country, setCountry] = useState('Brasil');
  const [state, setState] = useState('Minas Gerais');
  const [city, setCity] = useState('Belo Horizonte');
  const [category, setCategory] = useState('Dentistas');
  const [filter, setFilter] = useState<'Sem site' | 'Com site' | 'Todos'>('Sem site');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BusinessSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [savedLeadIds, setSavedLeadIds] = useState<Set<string>>(new Set());
  const [detailModalLead, setDetailModalLead] = useState<BusinessSearchResult | null>(null);
  const [showLimitReachedNotice, setShowLimitReachedNotice] = useState(false);

  // Check existing saved leads
  React.useEffect(() => {
    const existing = LocalDbService.getLeads(user?.user_id);
    const set = new Set<string>();
    existing.forEach(l => {
      if (l.place_id) set.add(l.place_id);
      set.add(l.business_name);
    });
    setSavedLeadIds(set);
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowLimitReachedNotice(false);
    setSearchError(null);

    // Validação do limite de buscas (Proprietário NUNCA é bloqueado)
    if (!isOwner && user?.plan !== 'premium' && (user?.searches_remaining ?? 0) <= 0) {
      setShowLimitReachedNotice(true);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const searchParams: BusinessSearchParams = {
        country,
        state,
        city,
        category,
        filter,
      };

      const searchOutput = await BusinessSearchService.search(searchParams);
      if (searchOutput.error) {
        setSearchError(searchOutput.error);
        setResults([]);
      } else {
        setSearchError(null);
        setResults(searchOutput.results);
      }

      // Consome 1 busca e grava no log apenas se a busca teve sucesso
      if (searchOutput.results.length > 0) {
        consumeSearch();
        LocalDbService.logSearch({
          user_id: user?.user_id || 'anonymous',
          country,
          state,
          city,
          category,
          filter,
          results_count: searchOutput.results.length,
        });
      }

    } catch (err) {
      console.error('Erro ao executar busca:', err);
      setSearchError('Não foi possível consultar o Google Maps. Tente novamente.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = (item: BusinessSearchResult) => {
    if (!user) return;
    
    // Proteção contra duplicatas por Google Place ID ou nome
    const existingLeads = LocalDbService.getLeads(user.user_id || user.id);
    const alreadySaved = existingLeads.some(l => 
      (l.place_id && l.place_id === item.place_id) || 
      (l.business_name.toLowerCase().trim() === item.name.toLowerCase().trim() && l.city.toLowerCase() === item.city.toLowerCase())
    );

    if (alreadySaved) {
      setSavedLeadIds(prev => new Set(prev).add(item.place_id).add(item.name));
      return;
    }

    const newLead: Lead = {
      id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: user.user_id || user.id,
      place_id: item.place_id,
      business_name: item.name,
      category: item.category,
      city: item.city,
      state: item.state,
      country: country || 'Brasil',
      phone: item.phone,
      whatsapp: item.whatsapp,
      whatsapp_status: item.whatsapp_status,
      address: item.address,
      website: item.website,
      google_maps_url: item.google_maps_url,
      rating: item.rating,
      review_count: item.review_count,
      has_website: item.has_website,
      status: 'Novo',
      notes: `Lead prospectado via Google Maps em ${new Date().toLocaleDateString('pt-BR')}.`,
      created_at: new Date().toISOString(),
    };

    LocalDbService.saveLead(newLead);
    setSavedLeadIds(prev => new Set(prev).add(item.place_id).add(item.name));
  };

  const isLimitZero = !isOwner && user?.plan !== 'premium' && (user?.searches_remaining ?? 0) <= 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Encontrar Empresas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pesquise comércios e profissionais locais no Brasil e filtre quem precisa de um site novo.
          </p>
        </div>

        {/* Counter Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Buscas disponíveis:</span>
            <span className="font-mono font-bold text-indigo-600">
              {isOwner ? 'Ilimitadas' : (user?.plan === 'premium' ? 'Ilimitado' : user?.searches_remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Limit Reached Warning Banner */}
      {(showLimitReachedNotice || isLimitZero) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Você atingiu o limite do plano gratuito.</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Faça upgrade para o plano Pro ou Premium e tenha mais buscas para prospectar sem interrupção.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('planos')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            Ver planos
          </button>
        </div>
      )}

      {/* Search Filter Box */}
      <form onSubmit={handleSearch} className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* País */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              País
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              placeholder="Brasil"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Estado
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              {BRAZILIAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cidade
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Belo Horizonte"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Categoria/Nicho */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Categoria / Nicho
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Dentistas, Clínicas"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

        </div>

        {/* Nichos Rápidos */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Sugestões de nicho:</span>
          {POPULAR_NICHES.slice(0, 6).map((nicho) => (
            <button
              type="button"
              key={nicho}
              onClick={() => setCategory(nicho)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                category === nicho
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {nicho}
            </button>
          ))}
        </div>

        {/* Filter State Tabs & Submit Button */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtro de Site:</span>
            </span>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              {(['Sem site', 'Com site', 'Todos'] as const).map((filterOpt) => (
                <button
                  type="button"
                  key={filterOpt}
                  onClick={() => setFilter(filterOpt)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filter === filterOpt
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filterOpt}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isLimitZero}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Buscando empresas...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Encontrar empresas</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Search Error Notice */}
      {searchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-xs font-semibold">{searchError}</span>
        </div>
      )}

      {/* Google Maps / Places Verified Indicator */}
      <div className="px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-lg flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>
            <strong>Fonte de Dados:</strong> Google Maps / Google Places oficial com Place ID autêntico. Sem leads inventados.
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          Google Place ID Verified
        </span>
      </div>

      {/* Search Results Area */}
      {hasSearched && !searchError && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Resultados encontrados ({results.length})
            </h2>
            <span className="text-xs text-slate-500">
              Filtrado por: <strong>{filter}</strong>
            </span>
          </div>

          {results.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">Nenhuma empresa encontrada com este filtro</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Tente alternar o filtro para "Todos" ou pesquisar por outra cidade ou categoria próxima.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((biz) => {
                const isAlreadySaved = savedLeadIds.has(biz.place_id) || savedLeadIds.has(biz.name);
                return (
                  <div
                    key={biz.place_id || biz.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="text-[11px] font-semibold text-indigo-600 block mb-0.5">
                            {biz.category}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {biz.name}
                          </h3>
                        </div>

                        {/* Status do site */}
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1 ${
                          biz.has_website
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          <span>🌐</span>
                          <span>{biz.has_website ? 'Com site' : 'Sem site'}</span>
                        </span>
                      </div>

                      {/* Details & Location */}
                      <div className="space-y-2 text-xs text-slate-700 my-3">
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span className="font-medium text-slate-800">{biz.address}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span>📞</span>
                          <span className="font-mono text-slate-800">
                            {biz.phone || 'Sem telefone informado'}
                          </span>
                        </div>

                        {/* WhatsApp Status Indicator */}
                        <div className="pt-0.5">
                          {biz.whatsapp_status === 'confirmed' ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                              <span>🟢</span>
                              <span>WhatsApp confirmado</span>
                            </span>
                          ) : biz.phone ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                              <span>📞</span>
                              <span>Telefone não confirmado como WhatsApp</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                              <span>❌</span>
                              <span>Sem telefone</span>
                            </span>
                          )}
                        </div>

                        {/* Rating and Reviews */}
                        <div className="flex items-center gap-2 pt-1 text-slate-600">
                          <div className="flex items-center text-amber-500 font-bold">
                            <span>⭐</span>
                            <span className="ml-1 text-slate-900 font-mono">
                              {biz.rating.toFixed(1)}
                            </span>
                          </div>
                          <span>·</span>
                          <span className="text-[11px]">
                            {biz.review_count} avaliações no Google
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Ver no Google Maps, Ligar / WhatsApp, Salvar lead, Criar site */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 mt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Botão Ver no Google Maps */}
                        <a
                          href={biz.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>📍</span>
                          <span>Ver no Google Maps</span>
                        </a>

                        {/* Botão WhatsApp ou Ligar */}
                        {biz.whatsapp_status === 'confirmed' && biz.whatsapp ? (
                          <a
                            href={`https://wa.me/${biz.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>💬</span>
                            <span>WhatsApp</span>
                          </a>
                        ) : biz.phone ? (
                          <a
                            href={`tel:${biz.phone.replace(/\D/g, '')}`}
                            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
                          >
                            <span>📞</span>
                            <span>Ligar</span>
                          </a>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveLead(biz)}
                          disabled={isAlreadySaved}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                            isAlreadySaved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          {isAlreadySaved ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Salvo</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>Salvar lead</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            onSelectLeadForSiteCreation(biz);
                            onNavigateTab('criar-site');
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Criar site</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in">
            <button
              onClick={() => setDetailModalLead(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <span>{detailModalLead.category}</span>
              <span>·</span>
              <span>{detailModalLead.city}, {detailModalLead.state}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {detailModalLead.name}
            </h3>

            <div className="space-y-3 py-3 border-y border-slate-100 text-xs text-slate-700">
              <p><strong>Endereço:</strong> {detailModalLead.address}</p>
              <p><strong>Telefone:</strong> {detailModalLead.phone}</p>
              {detailModalLead.whatsapp && (
                <p className="flex items-center gap-2">
                  <strong>WhatsApp:</strong> 
                  <a 
                    href={`https://wa.me/${detailModalLead.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Iniciar conversa com {detailModalLead.name}</span>
                  </a>
                </p>
              )}
              <p>
                <strong>Status do Site:</strong>{' '}
                <span className={`font-semibold ${detailModalLead.has_website ? 'text-slate-800' : 'text-red-600'}`}>
                  {detailModalLead.has_website ? `Possui site (${detailModalLead.website})` : 'Não possui site registrado (Potencial Alto)'}
                </span>
              </p>
              <p>
                <strong>Google Avaliações:</strong> {detailModalLead.rating} estrelas ({detailModalLead.review_count} avaliações de clientes locais)
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <a
                href={detailModalLead.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                <span>Abrir no Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleSaveLead(detailModalLead);
                    setDetailModalLead(null);
                  }}
                  className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
                >
                  Salvar nos Leads
                </button>
                <button
                  onClick={() => {
                    onSelectLeadForSiteCreation(detailModalLead);
                    setDetailModalLead(null);
                    onNavigateTab('criar-site');
                  }}
                  className="px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  Gerar Site com IA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
