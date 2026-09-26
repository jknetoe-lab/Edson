import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  Sparkles, 
  Building, 
  UserCheck 
} from 'lucide-react';
import { ContractInputs } from '../../types';

export const ContractsPage: React.FC = () => {
  const [clientName, setClientName] = useState('Dra. Camila Soares Odontologia');
  const [clientDocument, setClientDocument] = useState('12.345.678/0001-90');
  const [clientEmail, setClientEmail] = useState('contato@camilasoaresodonto.com.br');
  const [contractorName, setContractorName] = useState('Rodrigo Alcantara Soluções Digitais');
  const [contractorDocument, setContractorDocument] = useState('45.678.901/0001-23');
  const [serviceTitle, setServiceTitle] = useState('Desenvolvimento de Website Institucional Responsivo');
  const [serviceDescription, setServiceDescription] = useState('Criação de website profissional institucional com seções de apresentação, serviços odontológicos, galeria de fotos, botão de WhatsApp integrado, formulário de contato e otimização para celular.');
  const [totalValue, setTotalValue] = useState(2200);
  const [deadlineDays, setDeadlineDays] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('Pix ou Transferência Bancária');
  const [paymentTerms, setPaymentTerms] = useState('50% no início do projeto e 50% na entrega e publicação final.');
  const [city, setCity] = useState('Belo Horizonte');
  const [state, setState] = useState('MG');

  const [generatedContractText, setGeneratedContractText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerateContract = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const contractBody = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO WEB

Pelo presente instrumento particular, de um lado:

CONTRATANTE:
Nome/Razão Social: ${clientName}
CNPJ/CPF: ${clientDocument}
E-mail: ${clientEmail}

E de outro lado:

CONTRATADO:
Nome/Razão Social: ${contractorName}
CNPJ/CPF: ${contractorDocument}

As partes acima qualificadas têm, entre si, justo e acordado o presente Contrato de Prestação de Serviços, regido pelas cláusulas seguintes:

CLÁUSULA PRIMEIRA - DO OBJETO
O presente instrumento tem por objeto a prestação de serviços especializados de ${serviceTitle}, contemplando o seguinte escopo técnico:
${serviceDescription}

CLÁUSULA SEGUNDA - DO VALOR E FORMA DE PAGAMENTO
Pela prestação dos serviços contratados, o CONTRATANTE pagará ao CONTRATADO o valor total de R$ ${totalValue.toLocaleString('pt-BR')},00 (${valorPorExtenso(totalValue)}).
Parágrafo Único: O pagamento será efetuado via ${paymentMethod}, observando as seguintes condições: ${paymentTerms}.

CLÁUSULA TERCEIRA - DOS PRAZOS DE ENTREGA
O prazo estimado para desenvolvimento, testes e entrega da versão homologada é de ${deadlineDays} (${prazoPorExtenso(deadlineDays)}) dias úteis, contados a partir da entrega de todos os materiais (textos, imagens e dados cadastrais) por parte do CONTRATANTE.

CLÁUSULA QUARTA - DAS OBRIGAÇÕES DAS PARTES
I - O CONTRATADO obriga-se a executar os serviços com qualidade técnica profissional, respeitando os prazos acordados e garantindo a responsividade e o perfeito funcionamento do site nos principais navegadores modernos.
II - O CONTRATANTE obriga-se a fornecer tempestivamente as informações, fotos institucionais e aprovações necessárias para o andamento regular do cronograma.

CLÁUSULA QUINTA - DA PROPRIEDADE INTELECTUAL
Após a quitação integral dos valores descritos na Cláusula Segunda, a titularidade dos direitos autorais patrimoniais do código-fonte e conteúdo final do website será transmitida integralmente ao CONTRATANTE.

CLÁUSULA SEXTA - DO FORO
Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da Comarca de ${city} - ${state}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

E por estarem justos e acordados, firmam o presente contrato em 2 (duas) vias de igual teor e forma.

${city} - ${state}, ${formattedDate}.


_________________________________________
CONTRATANTE: ${clientName}


_________________________________________
CONTRATADO: ${contractorName}`;

    setGeneratedContractText(contractBody);
  };

  const valorPorExtenso = (val: number) => {
    return `${val} reais`;
  };

  const prazoPorExtenso = (dias: number) => {
    return `${dias} dias`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Contrato de Prestação de Serviços</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; font-size: 13px; }
              pre { white-space: pre-wrap; font-family: inherit; }
            </style>
          </head>
          <body>
            <pre>${generatedContractText}</pre>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContractText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          Gerador de Contratos
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Gere contratos profissionais de prestação de serviços com cláusulas de entrega, pagamento e foro brasileiro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Inputs */}
        <form onSubmit={handleGenerateContract} className="lg:col-span-6 bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Dados para o Contrato
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Cliente *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Dra. Camila Soares Odonto"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CPF ou CNPJ do Cliente *</label>
              <input
                type="text"
                required
                value={clientDocument}
                onChange={(e) => setClientDocument(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Seu Nome / Prestador *</label>
              <input
                type="text"
                required
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder="Ex: Rodrigo Agência Digital ME"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Seu CPF ou CNPJ *</label>
              <input
                type="text"
                required
                value={contractorDocument}
                onChange={(e) => setContractorDocument(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Serviço *</label>
            <input
              type="text"
              required
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              placeholder="Ex: Criação de Website Institucional"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição do Escopo Técnico *</label>
            <textarea
              rows={3}
              required
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Total (R$) *</label>
              <input
                type="number"
                required
                value={totalValue}
                onChange={(e) => setTotalValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prazo de Entrega (Dias) *</label>
              <input
                type="number"
                required
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Forma de Pagamento</label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Pix ou Transferência Bancária"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade e UF do Foro</label>
              <input
                type="text"
                value={`${city} - ${state}`}
                onChange={(e) => {
                  const parts = e.target.value.split('-');
                  setCity(parts[0]?.trim() || city);
                  if (parts[1]) setState(parts[1]?.trim());
                }}
                placeholder="Belo Horizonte - MG"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar contrato</span>
          </button>
        </form>

        {/* Contract Preview / Download Box */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-full min-h-[500px]">
          
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Visualização do Contrato
            </span>
            {generatedContractText && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2.5 py-1 text-xs font-bold bg-slate-900 text-white rounded-md hover:bg-slate-800 flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar PDF</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-5 flex-1 overflow-y-auto max-h-[600px] bg-slate-50/50">
            {generatedContractText ? (
              <textarea
                value={generatedContractText}
                onChange={(e) => setGeneratedContractText(e.target.value)}
                className="w-full h-full min-h-[500px] p-4 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400">
                <FileText className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs">Preencha os dados e clique em "Gerar contrato" para visualizar o documento editável.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
