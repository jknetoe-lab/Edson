import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  QrCode, 
  TrendingUp, 
  ShieldCheck, 
  ExternalLink, 
  Filter, 
  Calendar, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle, 
  Search, 
  Zap, 
  Play, 
  Key, 
  Lock, 
  Layers, 
  ArrowUpRight 
} from 'lucide-react';
import { FinancialTransaction, PaymentRecord, UserPlan } from '../../types';
import { useAuth } from '../../services/authContext';

export const AdminFinancialSection: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<any>(null);
  const [mpConfig, setMpConfig] = useState<any>(null);

  // Filters for transactions table
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | '7days' | 'month' | 'year'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'pix' | 'cartao'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulator state
  const [simScenario, setSimScenario] = useState<'approved' | 'pending' | 'rejected' | 'renewal' | 'duplicate' | 'cancel'>('approved');
  const [simPlan, setSimPlan] = useState<'basic' | 'pro'>('basic');
  const [simMethod, setSimMethod] = useState<'pix' | 'cartao'>('pix');
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/admin/financial-summary', {
        headers: {
          'x-admin-email': user?.email || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setFinancialData(data);
      }
    } catch (err) {
      console.error('Error fetching financial summary:', err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/mercadopago/config-status');
      if (res.ok) {
        const data = await res.json();
        setMpConfig(data);
      }
    } catch (err) {
      console.error('Error fetching MP config:', err);
    }
  };

  useEffect(() => {
    Promise.all([fetchSummary(), fetchConfig()]).finally(() => setLoading(false));
  }, [user]);

  const handleRunSimulation = async () => {
    setSimulating(true);
    setSimMessage('');
    try {
      const res = await fetch('/api/admin/simulate-webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-email': user?.email || '',
        },
        body: JSON.stringify({
          scenario: simScenario,
          plan: simPlan,
          payment_method: simMethod,
          customer_id: 'usr_customer_002',
          customer_email: 'rodrigo@agenciadigital.com.br',
          caller_email: user?.email || '',
        }),
      });
      const data = await res.json();
      setSimMessage(data.message || 'Simulação concluída com sucesso.');
      await fetchSummary();
    } catch (err: any) {
      setSimMessage('Erro ao executar simulação: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Carregando painel financeiro do Mercado Pago...</p>
      </div>
    );
  }

  // Transactions list and filtering
  const allTransactions: FinancialTransaction[] = financialData?.transactions || [];

  const filteredTransactions = allTransactions.filter((tx) => {
    // Filter by period
    const txTime = new Date(tx.date).getTime();
    const now = Date.now();
    if (periodFilter === 'today') {
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      if (txTime < startOfToday) return false;
    } else if (periodFilter === '7days') {
      if (now - txTime > 7 * 86400000) return false;
    } else if (periodFilter === 'month') {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      if (txTime < startOfMonth) return false;
    } else if (periodFilter === 'year') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
      if (txTime < startOfYear) return false;
    }

    // Filter by method
    if (methodFilter !== 'all' && tx.payment_method !== methodFilter) return false;

    // Filter by status
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCustomer = tx.customer_name?.toLowerCase().includes(q);
      const matchEmail = tx.customer_email?.toLowerCase().includes(q);
      const matchId = tx.mercado_pago_id?.toLowerCase().includes(q) || tx.id.toLowerCase();
      if (!matchCustomer && !matchEmail && !matchId) return false;
    }

    return true;
  });

  const chartData: { month: string; amount: number }[] = financialData?.monthlyRevenueChart || [];
  const maxChartAmount = Math.max(...chartData.map(c => c.amount), 50);

  return (
    <div className="space-y-6">

      {/* Mercado Pago Account & Balance Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Custódia Oficial Mercado Pago</span>
            </span>
            <span className="text-xs text-slate-400">
              Ambiente: <strong className="text-white">{mpConfig?.environment || 'Sandbox'}</strong>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Gestão Financeira & Saldo Mercado Pago
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            O valor das vendas é processado e liquidado <strong>diretamente na sua conta do Mercado Pago</strong>. O LeadForge AI registra os eventos em tempo real com conciliação automática.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
          <a
            href="https://www.mercadopago.com.br/balance"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Ver saldo no Mercado Pago</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => { setLoading(true); fetchSummary(); fetchConfig().finally(() => setLoading(false)); }}
            className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition-colors flex items-center justify-center gap-1.5"
            title="Sincronizar"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sincronizar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Financial Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">Total Recebido</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-mono text-emerald-600 tabular-nums">
              R$ {(financialData?.totalReceived || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {financialData?.countApproved || 0} pagamentos aprovados
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">Receita Este Mês</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              R$ {(financialData?.revenueThisMonth || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
            Hoje: R$ {(financialData?.revenueToday || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">Assinaturas Ativas</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-indigo-600 tabular-nums">
              {(financialData?.activeBasicSubs || 0) + (financialData?.activeProSubs || 0)}
            </span>
            <span className="text-[10px] text-slate-500">
              ({financialData?.activeBasicSubs || 0} Basic · {financialData?.activeProSubs || 0} Pro)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {financialData?.cancelledSubs || 0} cancelada(s)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-1">Status de Pagamentos</span>
          <div className="space-y-1 text-[11px] mt-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Aprovados:
              </span>
              <strong className="text-slate-900 font-mono">{financialData?.countApproved || 0}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" /> Pendentes:
              </span>
              <strong className="text-slate-900 font-mono">{financialData?.countPending || 0}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Payment Method Breakdown & Monthly Revenue Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Payment Methods Breakdown Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Divisão por Meio de Pagamento</span>
            </h3>
          </div>

          <div className="space-y-4">
            {/* Pix */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>Pix Instantâneo</span>
                </span>
                <span className="font-mono font-bold text-emerald-800">
                  R$ {(financialData?.pixRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-700">
                <span>{financialData?.pixCount || 0} transação(ões)</span>
                <span>
                  {financialData?.totalReceived > 0 
                    ? Math.round(((financialData?.pixRevenue || 0) / financialData.totalReceived) * 100) 
                    : 0}% da receita
                </span>
              </div>
            </div>

            {/* Cartão de Crédito */}
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Cartão de Crédito</span>
                </span>
                <span className="font-mono font-bold text-indigo-800">
                  R$ {(financialData?.cardRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-indigo-700">
                <span>{financialData?.cardCount || 0} transação(ões)</span>
                <span>
                  {financialData?.totalReceived > 0 
                    ? Math.round(((financialData?.cardRevenue || 0) / financialData.totalReceived) * 100) 
                    : 0}% da receita
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed border border-slate-100">
              Taxas do Mercado Pago são deduzidas automaticamente na liquidação bancária.
            </div>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs md:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Evolução do Faturamento Mensal (BRL)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Receitas confirmadas nos últimos 6 meses</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600">
              Total Ano: R$ {(financialData?.revenueThisYear || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 h-48 flex items-end justify-between gap-3 sm:gap-6 px-2">
            {chartData.map((item, idx) => {
              const heightPercent = maxChartAmount > 0 ? Math.max(8, Math.round((item.amount / maxChartAmount) * 100)) : 8;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-mono font-semibold text-slate-700 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    R${item.amount > 0 ? item.amount.toFixed(0) : '0'}
                  </span>
                  <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-32">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        item.amount > 0
                          ? 'bg-gradient-to-t from-indigo-600 to-indigo-500 group-hover:from-indigo-500 group-hover:to-indigo-400'
                          : 'bg-slate-200'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 mt-2">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Transactions Table with Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-3">
        
        {/* Table Header & Controls */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Histórico Completo de Transações Mercado Pago
              </h3>
              <p className="text-xs text-slate-500">
                Lista de faturas, métodos, status de conciliação e datas de renovação.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente, email ou ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1 text-[11px]">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros:</span>
            </span>

            {/* Period filter */}
            <select
              value={periodFilter}
              onChange={(e: any) => setPeriodFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Todo o período</option>
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="month">Este mês</option>
              <option value="year">Este ano</option>
            </select>

            {/* Method filter */}
            <select
              value={methodFilter}
              onChange={(e: any) => setMethodFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Todos os meios</option>
              <option value="pix">Pix</option>
              <option value="cartao">Cartão de Crédito</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="approved">Aprovados</option>
              <option value="pending">Pendentes</option>
              <option value="rejected">Rejeitados</option>
              <option value="cancelled">Cancelados</option>
            </select>

            <span className="text-[11px] text-slate-400 ml-auto">
              Exibindo <strong>{filteredTransactions.length}</strong> de {allTransactions.length}
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Plano</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">ID Mercado Pago</th>
                <th className="py-3 px-4">Data Pagamento</th>
                <th className="py-3 px-4">Renovação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Nenhuma transação encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {tx.customer_name}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {tx.customer_email}
                    </td>
                    <td className="py-3 px-4 uppercase font-bold text-indigo-600">
                      {tx.plan}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      R$ {tx.amount.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-4 uppercase text-slate-600 font-medium">
                      {tx.payment_method === 'pix' ? 'Pix' : 'Cartão'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : tx.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {tx.status === 'approved' ? 'Aprovado' : tx.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {tx.mercado_pago_id}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(tx.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {tx.renewal_date ? new Date(tx.renewal_date).toLocaleDateString('pt-BR') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Webhook Test Lab & Mercado Pago Config Guide (Owner/Admin) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Laboratório de Testes de Webhook Mercado Pago
              </h3>
              <p className="text-xs text-slate-500">
                Execute os cenários de teste exigidos (Aprovação, Pendência, Rejeição, Renovação, Idempotência).
              </p>
            </div>
          </div>

          <span className="text-xs bg-slate-100 text-slate-700 font-mono font-medium px-2.5 py-1 rounded-md">
            Idempotência Ativa
          </span>
        </div>

        {/* Simulation Controls */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cenário de Teste:</label>
              <select
                value={simScenario}
                onChange={(e: any) => setSimScenario(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium focus:outline-none"
              >
                <option value="approved">1 & 2. Pagamento Aprovado (Ativa Plano)</option>
                <option value="pending">3. Pagamento Pendente (NÃO ativa plano)</option>
                <option value="rejected">4. Pagamento Rejeitado (Bloqueia plano)</option>
                <option value="renewal">5. Renovação Mensal Aprovada</option>
                <option value="duplicate">9. Webhook Duplicado (Trava Idempotência)</option>
                <option value="cancel">6. Cancelamento de Assinatura</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Plano:</label>
              <select
                value={simPlan}
                onChange={(e: any) => setSimPlan(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium focus:outline-none"
              >
                <option value="basic">Basic (R$ 19,90 - 50 buscas)</option>
                <option value="pro">Pro (R$ 39,90 - 200 buscas)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Meio de Pagamento:</label>
              <select
                value={simMethod}
                onChange={(e: any) => setSimMethod(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium focus:outline-none"
              >
                <option value="pix">Pix Instantâneo</option>
                <option value="cartao">Cartão de Crédito</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                disabled={simulating}
                onClick={handleRunSimulation}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {simulating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Disparar Evento</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {simMessage && (
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 flex items-start gap-2 shadow-2xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{simMessage}</span>
            </div>
          )}
        </div>

        {/* Configuration Instructions for the Owner */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <strong className="text-slate-900 text-xs">Instruções para o Proprietário - Chaves do Mercado Pago em Produção:</strong>
          </div>
          
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 leading-relaxed">
            <li>Acesse o portal <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-medium">Mercado Pago Developers</a> com sua conta comercial.</li>
            <li>Em <strong>Suas integrações</strong>, selecione ou crie sua aplicação e copie as credenciais (Access Token e Public Key).</li>
            <li>Configure no painel de segredos/ambiente do Cloud Run / Vercel:
              <code className="block mt-1 p-2 bg-slate-900 text-slate-200 font-mono rounded text-[11px] overflow-x-auto">
                MERCADO_PAGO_ACCESS_TOKEN="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"<br />
                MERCADO_PAGO_PUBLIC_KEY="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"<br />
                MERCADO_PAGO_WEBHOOK_SECRET="seu_segredo_webhook"
              </code>
            </li>
            <li>Na aba <strong>Webhooks (Notificações IPN)</strong> do Mercado Pago, cadastre a URL oficial:
              <code className="block mt-1 p-2 bg-slate-200 text-slate-800 font-mono rounded text-[11px]">
                {mpConfig?.webhookUrl || `${window.location.origin}/api/webhooks/mercadopago`}
              </code>
              Selecione o evento: <strong>Pagamentos (payments)</strong>.
            </li>
          </ol>
        </div>

      </div>

    </div>
  );
};
