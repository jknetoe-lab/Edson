import React from 'react';
import { useAuth } from '../../services/authContext';
import { 
  Settings, 
  Database, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  ExternalLink,
  ShieldCheck,
  Code2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isOwner, isSupabaseConnected } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          Configurações & Integrações
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Gerencie seu perfil, conexão com o banco de dados Supabase e provedores de serviço.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Dados da Conta
          </h2>
          {isOwner && (
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>👑</span>
              <span>Proprietário</span>
            </span>
          )}
        </div>

        {isOwner ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Tipo de Conta</span>
              <strong className="text-slate-900 font-bold flex items-center gap-1 mt-0.5">
                <span>👑</span>
                <span>Proprietário</span>
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Plano</span>
              <span className="font-semibold text-indigo-700 block mt-0.5">
                Acesso do proprietário
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Status</span>
              <span className="font-semibold text-emerald-600 block mt-0.5">
                Ativo
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Buscas</span>
              <span className="font-mono font-bold text-slate-900 text-xs block mt-0.5">
                Ilimitadas
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Nome do Usuário</span>
              <strong className="text-slate-900 font-semibold">{user?.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">E-mail</span>
              <span className="text-slate-800 font-mono">{user?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Plano Atual</span>
              <span className="capitalize font-semibold text-indigo-600 font-mono">
                Plano {user?.plan}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Buscas Restantes</span>
              <span className="font-mono font-bold text-slate-900">
                {user?.searches_remaining ?? 0} buscas
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Supabase Status & Architecture Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Conexão com Banco de Dados Supabase</h2>
              <p className="text-xs text-slate-500">PostgreSQL com Row Level Security (RLS)</p>
            </div>
          </div>

          <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
            isSupabaseConnected
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{isSupabaseConnected ? 'Conectado ao Supabase Cloud' : 'Camada de Persistência Ativa'}</span>
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          O aplicativo foi construído com suporte nativo ao <strong>Supabase</strong> e <strong>PostgreSQL</strong>.
          O arquivo de migração completo com todas as tabelas (<code>profiles</code>, <code>leads</code>, <code>projects</code>, <code>subscriptions</code>, <code>searches</code>), políticas de segurança RLS e triggers de novo usuário está disponível em:
          <code className="block mt-1 p-2 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">
            /supabase/schema.sql
          </code>
        </p>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700">
          <strong className="block text-slate-900">Como conectar seu projeto Supabase no Vercel ou Localmente:</strong>
          <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
            <li>Crie um projeto gratuito no <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-medium">Supabase</a>.</li>
            <li>Abra o <strong>SQL Editor</strong> do Supabase e cole o conteúdo do arquivo <code>/supabase/schema.sql</code>.</li>
            <li>Copie as credenciais da API em <strong>Project Settings &gt; API</strong> e adicione ao seu arquivo <code>.env</code> ou variáveis do Vercel:
              <div className="mt-1 p-2 bg-slate-900 text-slate-200 font-mono rounded text-[11px] overflow-x-auto">
                VITE_SUPABASE_URL=https://seu-projeto.supabase.co<br />
                VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* External Business API & Payments Configuration Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Business search provider */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">Provedor de Empresas (BusinessSearchService)</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Em desenvolvimento, utiliza o simulador interno de nichos brasileiros. Para conectar à Google Places API ou BrasilAPI em produção, configure a variável:
          </p>
          <code className="text-[11px] bg-slate-100 p-1.5 rounded font-mono text-slate-800 block">
            GOOGLE_PLACES_API_KEY="sua_chave"
          </code>
        </div>

        {/* Payments provider */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">Gateway de Pagamentos (PaymentService)</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Preparado para receber pagamentos via Pix instantâneo e cartões brasileiros. Conecte com Asaas ou Mercado Pago adicionando:
          </p>
          <code className="text-[11px] bg-slate-100 p-1.5 rounded font-mono text-slate-800 block">
            ASAAS_API_KEY="sua_chave_pix"
          </code>
        </div>

      </div>

    </div>
  );
};
