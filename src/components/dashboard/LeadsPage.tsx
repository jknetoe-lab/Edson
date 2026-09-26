import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { LocalDbService } from '../../services/supabaseClient';
import { Lead, LeadStatus } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  Wand2, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  FileText,
  Star,
  ChevronRight
} from 'lucide-react';
import { DashboardTab } from './DashboardLayout';

interface LeadsPageProps {
  onNavigateTab: (tab: DashboardTab) => void;
  onSelectLeadForSiteCreation: (lead: Lead) => void;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  Novo: { label: 'Novo', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  Contatado: { label: 'Contatado', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Em negociação': { label: 'Em negociação', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  Cliente: { label: 'Cliente', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Perdido: { label: 'Perdido', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const LeadsPage: React.FC<LeadsPageProps> = ({
  onNavigateTab,
  onSelectLeadForSiteCreation,
}) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filterType, setFilterType] = useState<'Todos' | 'Sem site' | 'Com site' | 'Contatados' | 'Não contatados'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<LeadStatus>('Novo');
  const [saveFeedback, setSaveFeedback] = useState(false);

  const loadLeads = () => {
    if (!user) return;
    const items = LocalDbService.getLeads(user.user_id);
    setLeads(items);
  };

  useEffect(() => {
    loadLeads();
  }, [user]);

  const filteredLeads = leads.filter((lead) => {
    // Search query filter
    const matchesQuery = 
      lead.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    // Category / Status filter
    if (filterType === 'Sem site') return !lead.has_website;
    if (filterType === 'Com site') return lead.has_website;
    if (filterType === 'Contatados') return lead.status !== 'Novo';
    if (filterType === 'Não contatados') return lead.status === 'Novo';
    return true;
  });

  const handleOpenDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || '');
    setEditStatus(lead.status);
    setSaveFeedback(false);
  };

  const handleSaveLeadChanges = () => {
    if (!selectedLead) return;
    const updated: Lead = {
      ...selectedLead,
      notes: editNotes,
      status: editStatus,
    };
    LocalDbService.saveLead(updated);
    setSelectedLead(updated);
    loadLeads();
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleDeleteLead = (id: string) => {
    LocalDbService.deleteLead(id);
    setSelectedLead(null);
    loadLeads();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Meus Leads
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize e acompanhe as abordagens de clientes locais para vender websites.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('prospeccao')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Search className="w-4 h-4" />
          <span>Prospectar novos leads</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, cidade ou nicho..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['Todos', 'Sem site', 'Com site', 'Contatados', 'Não contatados'] as const).map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                filterType === ft
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ft}
            </button>
          ))}
        </div>

      </div>

      {/* Leads List / Table */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">Nenhum lead encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            {leads.length === 0
              ? 'Você ainda não salvou nenhuma empresa. Use a ferramenta de busca para encontrar empresas na sua região.'
              : 'Nenhum lead corresponde aos filtros selecionados acima.'}
          </p>
          <button
            onClick={() => onNavigateTab('prospeccao')}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
          >
            Buscar empresas agora
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => {
              const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.Novo;
              return (
                <div
                  key={lead.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer" onClick={() => handleOpenDetail(lead)}>
                        {lead.business_name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        lead.has_website ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-700'
                      }`}>
                        {lead.has_website ? 'Com site' : 'Sem site'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>{lead.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{lead.city}, {lead.state}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-amber-600 font-mono font-semibold">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{lead.rating}</span>
                      </span>
                      <span>·</span>
                      <span>{lead.phone}</span>
                    </div>

                    {lead.notes && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                        "{lead.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {lead.whatsapp && (
                      <a
                        href={`https://wa.me/${lead.whatsapp}?text=${encodeURIComponent(`Olá! Vi o perfil da ${lead.business_name} e preparei uma proposta de site profissional para vocês.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1"
                        title="Abrir WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}

                    <button
                      onClick={() => {
                        onSelectLeadForSiteCreation(lead);
                        onNavigateTab('criar-site');
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Criar Site</span>
                    </button>

                    <button
                      onClick={() => handleOpenDetail(lead)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lead Detail & Notes Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 block mb-0.5">
                  {selectedLead.category} · {selectedLead.city}, {selectedLead.state}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedLead.business_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="py-4 space-y-3 text-xs text-slate-700 border-b border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Endereço</span>
                  <span className="font-medium">{selectedLead.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Telefone Principal</span>
                  <span className="font-medium font-mono">{selectedLead.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Avaliação Google</span>
                  <span className="font-medium font-mono">
                    ★ {selectedLead.rating} ({selectedLead.review_count} avaliações)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Situação Web</span>
                  <span className={`font-semibold ${selectedLead.has_website ? 'text-slate-800' : 'text-red-600'}`}>
                    {selectedLead.has_website ? `Possui site (${selectedLead.website})` : 'Sem site cadastrado (Grande Potencial)'}
                  </span>
                </div>
              </div>

              {selectedLead.whatsapp && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold font-mono">WhatsApp: {selectedLead.whatsapp}</span>
                  </div>
                  <a
                    href={`https://wa.me/${selectedLead.whatsapp}?text=${encodeURIComponent(`Olá! Gostaria de falar com o responsável pela ${selectedLead.business_name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                  >
                    Abrir conversa
                  </a>
                </div>
              )}
            </div>

            {/* Status & Notes Editing */}
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status no Funil de Vendas
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['Novo', 'Contatado', 'Em negociação', 'Cliente', 'Perdido'] as LeadStatus[]).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setEditStatus(st)}
                      className={`px-2 py-1.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                        editStatus === st
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Anotações sobre a Negociação</span>
                  <span className="text-[10px] text-slate-400 font-normal">Salvo automaticamente</span>
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ex: Falei com o proprietário no WhatsApp. Ele pediu proposta de site com agendamento online..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              {saveFeedback && (
                <div className="p-2 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-md flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Alterações salvas com sucesso!</span>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDeleteLead(selectedLead.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir lead</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveLeadChanges}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Salvar anotações
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectLeadForSiteCreation(selectedLead);
                    setSelectedLead(null);
                    onNavigateTab('criar-site');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Gerar site com IA</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
