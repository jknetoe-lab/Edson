import React, { useState } from 'react';
import { 
  Calculator, 
  Check, 
  Copy, 
  HelpCircle, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { PricingInputs, PricingOutput } from '../../types';

export const CalculatorPage: React.FC = () => {
  const [businessType, setBusinessType] = useState('Clínica / Saúde');
  const [pagesCount, setPagesCount] = useState(3);
  const [hasGallery, setHasGallery] = useState(true);
  const [hasContactForm, setHasContactForm] = useState(true);
  const [hasWhatsappButton, setHasWhatsappButton] = useState(true);
  const [hasSeoOptimization, setHasSeoOptimization] = useState(true);
  const [hasScheduling, setHasScheduling] = useState(false);
  const [hasMonthlyMaintenance, setHasMonthlyMaintenance] = useState(true);
  const [copiedProposal, setCopiedProposal] = useState(false);

  // Calculation formula based on current Brazilian freelance & agency market rates (2025/2026)
  const calculateEstimate = (): PricingOutput => {
    let base = 800; // Base para landing page simples
    const breakdown: Array<{ item: string; value: number }> = [];

    // Tipo de negócio
    if (businessType === 'Clínica / Saúde' || businessType === 'Escritório de Advocacia') {
      base += 300;
      breakdown.push({ item: `Nicho Especializado (${businessType})`, value: 300 });
    } else if (businessType === 'E-commerce / Catálogo') {
      base += 600;
      breakdown.push({ item: 'Estrutura para Produtos e Catálogo', value: 600 });
    } else {
      breakdown.push({ item: `Base Institucional (${businessType})`, value: 0 });
    }

    // Quantidade de páginas extras (além da página inicial)
    const extraPages = Math.max(0, pagesCount - 1);
    if (extraPages > 0) {
      const extraPagesVal = extraPages * 150;
      base += extraPagesVal;
      breakdown.push({ item: `${extraPages} página(s) adicional(is)`, value: extraPagesVal });
    }

    if (hasGallery) {
      base += 150;
      breakdown.push({ item: 'Galeria de Fotos com Otimização Visual', value: 150 });
    }

    if (hasContactForm) {
      base += 100;
      breakdown.push({ item: 'Formulário de Contato com Envio Direto', value: 100 });
    }

    if (hasWhatsappButton) {
      base += 80;
      breakdown.push({ item: 'Integração de WhatsApp com Mensagem Personalizada', value: 80 });
    }

    if (hasSeoOptimization) {
      base += 250;
      breakdown.push({ item: 'Otimização SEO Local (Google Meu Negócio & Meta tags)', value: 250 });
    }

    if (hasScheduling) {
      base += 350;
      breakdown.push({ item: 'Módulo de Agendamento Online Integrado', value: 350 });
    }

    const suggested = base;
    const min = Math.round(suggested * 0.85);
    const max = Math.round(suggested * 1.3);

    const monthlyMaintenance = hasMonthlyMaintenance ? (businessType === 'E-commerce / Catálogo' ? 250 : 150) : 0;
    const estimatedDays = Math.min(15, 3 + pagesCount + (hasScheduling ? 2 : 0));

    return {
      creation_price_min: min,
      creation_price_suggested: suggested,
      creation_price_max: max,
      monthly_maintenance_suggested: monthlyMaintenance,
      estimated_delivery_days: estimatedDays,
      breakdown,
    };
  };

  const output = calculateEstimate();

  const handleCopyProposal = () => {
    const text = `PROPOSTA COMERCIAL ESTIMADA - CRIAÇÃO DE SITE PROFISSIONAL
--------------------------------------------------
Segmento: ${businessType}
Quantidade de Páginas: ${pagesCount}
Escopo Técnico Incluído:
- Design responsivo para celulares e computadores
${hasGallery ? '- Galeria visual estruturada\n' : ''}${hasContactForm ? '- Formulário de contato direto\n' : ''}${hasWhatsappButton ? '- Integração com botão de WhatsApp\n' : ''}${hasSeoOptimization ? '- Otimização SEO para busca no Google\n' : ''}${hasScheduling ? '- Módulo de agendamento online\n' : ''}
VALOR DO PROJETO DE CRIAÇÃO:
Investimento sugerido: R$ ${output.creation_price_suggested.toLocaleString('pt-BR')},00
(Faixa recomendada: R$ ${output.creation_price_min.toLocaleString('pt-BR')},00 a R$ ${output.creation_price_max.toLocaleString('pt-BR')},00)

${hasMonthlyMaintenance ? `SUPORTE & HOSPEDAGEM MENSAL: R$ ${output.monthly_maintenance_suggested.toLocaleString('pt-BR')},00 / mês\n` : ''}Prazo de Entrega Estimado: ${output.estimated_delivery_days} dias úteis.
--------------------------------------------------
Proposta formulada com auxílio da calculadora LeadForge AI.`;

    navigator.clipboard.writeText(text);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          Calculadora de Preço de Sites
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Estime com precisão quanto cobrar pelo desenvolvimento e manutenção mensal de sites para clientes locais.
        </p>
      </div>

      {/* Mandatory Regulatory & Professional Disclosure */}
      <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-start gap-3 text-amber-900 text-xs shadow-2xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-semibold mb-0.5">Aviso Importante de Precificação:</strong>
          <span>
            Esta é apenas uma ferramenta de sugestão de preços com base nas médias de mercado brasileiras e complexidade técnica. O valor final cobrado deve ser determinado exclusivamente por você com base nas necessidades reais do cliente.
          </span>
        </div>
      </div>

      {/* Main Grid: Inputs vs Calculated Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Configurator Fields */}
        <div className="lg:col-span-7 bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Escopo e Requisitos do Projeto
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tipo de Negócio / Nicho
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="Clínica / Saúde">Clínica / Saúde / Odontologia</option>
                <option value="Escritório de Advocacia">Escritório de Advocacia</option>
                <option value="Comércio Local / Restaurante">Comércio Local / Restaurante</option>
                <option value="Prestador de Serviços">Prestador de Serviços Gerais</option>
                <option value="E-commerce / Catálogo">E-commerce / Catálogo de Produtos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quantidade de Páginas: <strong className="font-mono text-indigo-600">{pagesCount}</strong>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={pagesCount}
                onChange={(e) => setPagesCount(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>1 (Landing Page)</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Feature toggles */}
          <div className="space-y-3 pt-2">
            <span className="block text-xs font-semibold text-slate-700 mb-2">
              Recursos e Módulos Técnicos:
            </span>

            {[
              { id: 'gallery', label: 'Galeria de fotos / Trabalhos realizados', checked: hasGallery, onChange: setHasGallery },
              { id: 'form', label: 'Formulário de contato e orçamento direto', checked: hasContactForm, onChange: setHasContactForm },
              { id: 'whatsapp', label: 'Botão flutuante de WhatsApp oficial', checked: hasWhatsappButton, onChange: setHasWhatsappButton },
              { id: 'seo', label: 'Otimização SEO para busca local no Google', checked: hasSeoOptimization, onChange: setHasSeoOptimization },
              { id: 'scheduling', label: 'Sistema de Agendamento online de horários', checked: hasScheduling, onChange: setHasScheduling },
              { id: 'maintenance', label: 'Incluir proposta de suporte e manutenção mensal', checked: hasMonthlyMaintenance, onChange: setHasMonthlyMaintenance },
            ].map((feature) => (
              <label
                key={feature.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200/80 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={feature.checked}
                  onChange={(e) => feature.onChange(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs text-slate-700 font-medium select-none">
                  {feature.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Right Column: Dynamic Price Summary Box */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-2xl shadow-xl space-y-6">
          
          <div>
            <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block mb-1">
              Preço Sugerido de Criação
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums">
                R$ {output.creation_price_suggested.toLocaleString('pt-BR')},00
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Faixa de mercado recomendada: <strong>R$ {output.creation_price_min.toLocaleString('pt-BR')}</strong> a <strong>R$ {output.creation_price_max.toLocaleString('pt-BR')}</strong>
            </p>
          </div>

          {hasMonthlyMaintenance && (
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-xs">
              <span className="text-[11px] font-medium text-indigo-200 block mb-0.5">
                Mensalidade de Suporte & Hospedagem
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                R$ {output.monthly_maintenance_suggested.toLocaleString('pt-BR')},00 / mês
              </span>
              <p className="text-[11px] text-slate-300 mt-1">
                Garante receita recorrente com pequenas atualizações e hospedagem.
              </p>
            </div>
          )}

          <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-700/80">
            <div className="flex justify-between">
              <span>Prazo de entrega sugerido:</span>
              <strong className="text-white font-mono">{output.estimated_delivery_days} dias úteis</strong>
            </div>
            <div className="flex justify-between">
              <span>Condição de pagamento comum:</span>
              <strong className="text-white">50% entrada + 50% entrega</strong>
            </div>
          </div>

          <button
            onClick={handleCopyProposal}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {copiedProposal ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Proposta copiada para o WhatsApp!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar resumo da proposta</span>
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
};
