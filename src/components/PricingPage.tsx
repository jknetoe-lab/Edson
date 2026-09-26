import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { SAAS_PLANS, PaymentService } from '../services/paymentService';
import { LocalDbService } from '../services/supabaseClient';
import { UserPlan, PaymentRecord, Subscription } from '../types';
import { 
  Check, 
  Sparkles, 
  QrCode, 
  Copy, 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  X,
  Zap,
  HelpCircle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  RefreshCw,
  ExternalLink,
  Lock
} from 'lucide-react';

interface PricingPageProps {
  onBackToApp?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onBackToApp }) => {
  const { user, isOwner, updatePlan, refreshProfile } = useAuth();
  
  // Checkout modal states
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<UserPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  
  // Pix state
  const [pixData, setPixData] = useState<{
    internal_payment_id: string;
    mercado_pago_id: string;
    pix_copy_paste: string;
    qr_code_base64?: string;
    amount: number;
  } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Preference / Card state
  const [cardInitPoint, setCardInitPoint] = useState<string | null>(null);

  // Customer subscription & history
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [userPayments, setUserPayments] = useState<PaymentRecord[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState('');

  // Load customer subscription and payment history
  const loadCustomerBillingData = () => {
    if (!user) return;
    const sub = LocalDbService.getUserSubscription(user.user_id || user.id);
    setUserSubscription(sub);
    const payments = LocalDbService.getPayments(user.user_id || user.id);
    setUserPayments(payments);
  };

  useEffect(() => {
    loadCustomerBillingData();
  }, [user]);

  // Check URL params for Mercado Pago return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('pid');
    const paymentStatus = params.get('payment_status');

    if (pid && paymentStatus === 'approved') {
      verifyAndUnlock(pid);
    }
  }, []);

  const verifyAndUnlock = async (paymentId: string) => {
    setVerifyingPayment(true);
    try {
      const res = await PaymentService.verifyPaymentStatus(paymentId);
      if (res.success && res.status === 'approved') {
        setPaymentSuccess(true);
        if (res.plan) {
          updatePlan(res.plan);
          refreshProfile();
        }
        loadCustomerBillingData();
        setTimeout(() => {
          setSelectedPlanForCheckout(null);
          setPixData(null);
          setPaymentSuccess(false);
        }, 2500);
      } else {
        setCheckoutError('O Mercado Pago ainda está processando seu pagamento. Assim que for confirmado, seu plano será ativado automaticamente.');
      }
    } catch (err: any) {
      setCheckoutError('Erro ao validar pagamento com Mercado Pago.');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleStartCheckout = async (plan: UserPlan) => {
    if (isOwner) return; // Owner never pays
    if (plan === 'gratis') return;

    setSelectedPlanForCheckout(plan);
    setCheckoutError('');
    setPixData(null);
    setCardInitPoint(null);
    setPaymentSuccess(false);
    setLoadingCheckout(true);

    const customerInfo = {
      id: user?.user_id || user?.id || 'usr_guest',
      name: user?.name || 'Cliente LeadForge',
      email: user?.email || 'cliente@leadforge.ai',
    };

    if (paymentMethod === 'pix') {
      const res = await PaymentService.createPixPayment(plan, customerInfo);
      setLoadingCheckout(false);
      if (res.success && res.pix_copy_paste) {
        setPixData({
          internal_payment_id: res.internal_payment_id || '',
          mercado_pago_id: res.mercado_pago_id || '',
          pix_copy_paste: res.pix_copy_paste,
          qr_code_base64: res.qr_code_base64,
          amount: res.amount || (plan === 'basic' ? 19.90 : 39.90),
        });
        loadCustomerBillingData();
      } else {
        setCheckoutError(res.error || 'Não foi possível gerar a cobrança Pix no Mercado Pago.');
      }
    } else {
      const res = await PaymentService.createCheckoutPreference(plan, customerInfo);
      setLoadingCheckout(false);
      if (res.success && (res.init_point || res.sandbox_init_point)) {
        setCardInitPoint(res.init_point || res.sandbox_init_point || null);
        loadCustomerBillingData();
      } else {
        setCheckoutError(res.error || 'Não foi possível criar preferência de checkout no Mercado Pago.');
      }
    }
  };

  const handleCopyPix = () => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.pix_copy_paste);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleCheckPixStatus = async () => {
    if (!pixData?.internal_payment_id) return;
    verifyAndUnlock(pixData.internal_payment_id);
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    setCancelling(true);
    try {
      await PaymentService.cancelSubscription(user.user_id || user.id);
      LocalDbService.cancelUserSubscription(user.user_id || user.id);
      loadCustomerBillingData();
      setCancelFeedback('Assinatura cancelada com sucesso. Seus benefícios continuam válidos até o final do ciclo mensal.');
      setTimeout(() => {
        setShowCancelModal(false);
        setCancelFeedback('');
      }, 2500);
    } catch (err: any) {
      setCancelFeedback('Erro ao cancelar assinatura.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Planos Oficiais & Gestão de Assinatura</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Planos e Pagamento
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Encontre clientes locais e crie sites profissionais com IA. Pague com segurança via Mercado Pago em Reais (Pix ou Cartão).
        </p>

        {isOwner && (
          <div className="mt-5 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-left flex items-start gap-3 shadow-2xs">
            <span className="text-2xl mt-0.5">👑</span>
            <div>
              <strong className="block text-xs font-bold text-amber-950">
                Acesso do Proprietário (Owner) Ativo
              </strong>
              <span className="text-xs text-amber-800 leading-relaxed block mt-0.5">
                Sua conta de proprietário possui <strong>acesso irrestrito e vitalício</strong> a todas as funcionalidades atuais e futuras da LeadForge AI. Você nunca será cobrado ou precisará contratar um plano.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Customer Current Subscription Summary Card */}
      {!isOwner && user && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Sua Assinatura Atual</span>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Plano {user.plan === 'basic' ? 'Basic' : user.plan === 'pro' || user.plan === 'premium' ? 'Pro' : 'Grátis'}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  userSubscription?.status === 'active' || user.plan !== 'gratis'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {userSubscription?.status === 'canceled' ? 'Cancelamento Agendado' : (user.plan === 'gratis' ? 'Ativo (Free)' : 'Ativo')}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Mercado Pago</span>
              </span>
              {user.plan !== 'gratis' && userSubscription?.status !== 'canceled' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors font-semibold"
                >
                  Cancelar assinatura
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block text-[11px] mb-1">Cota Mensal de Buscas</span>
              <span className="text-base font-bold font-mono text-slate-900">
                {user.searches_remaining} restantes
              </span>
              <span className="text-slate-500 block text-[11px] mt-0.5">
                {user.plan === 'basic' ? 'de 50 buscas mensais' : user.plan === 'pro' || user.plan === 'premium' ? 'de 200 buscas mensais' : 'de 5 buscas gratuitas'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block text-[11px] mb-1">Próxima Renovação</span>
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-indigo-500" />
                {userSubscription?.expires_at
                  ? new Date(userSubscription.expires_at).toLocaleDateString('pt-BR')
                  : 'Cobrança mensal'}
              </span>
              <span className="text-slate-500 block text-[11px] mt-0.5">
                {userSubscription?.status === 'canceled' ? 'Acesso até o fim do ciclo' : 'Renovação automática via MP'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block text-[11px] mb-1">Forma de Pagamento</span>
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5 capitalize">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                {userSubscription?.payment_method === 'pix' ? 'Pix Instantâneo' : userSubscription?.payment_method === 'cartao' ? 'Cartão de Crédito' : 'Sem cobrança (Grátis)'}
              </span>
              <span className="text-slate-500 block text-[11px] mt-0.5">
                Processado com segurança pelo Mercado Pago
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Plans Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {(['gratis', 'basic', 'pro'] as UserPlan[]).map((planKey) => {
          const plan = SAAS_PLANS[planKey];
          const isCurrent = user?.plan === planKey || (planKey === 'pro' && user?.plan === 'premium');
          const isPro = planKey === 'pro';

          return (
            <div
              key={planKey}
              className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                isPro
                  ? 'bg-slate-900 text-white shadow-xl ring-2 ring-indigo-500'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {isCurrent && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                      isPro ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' : 'bg-slate-100 text-slate-700'
                    }`}>
                      Seu Plano
                    </span>
                  )}
                </div>

                <p className={`text-xs mb-6 ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>
                  {plan.description}
                </p>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-slate-400">R$</span>
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight">
                    {plan.priceMonthly === 0 ? '0' : plan.priceMonthly.toFixed(2).replace('.', ',')}
                  </span>
                  <span className={`text-xs ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>
                    /mês
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200/50">
                  <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                    isPro ? 'text-indigo-400' : 'text-slate-700'
                  }`}>
                    Recursos incluídos:
                  </span>
                  <ul className="space-y-2.5 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isPro ? 'text-indigo-400' : 'text-indigo-600'
                        }`} />
                        <span className={isPro ? 'text-slate-300' : 'text-slate-600'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <button
                  type="button"
                  disabled={isOwner || isCurrent}
                  onClick={() => handleStartCheckout(planKey)}
                  className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 ${
                    isOwner
                      ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-default'
                      : isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : isPro
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isOwner ? (
                    'Incluso no Acesso do Proprietário'
                  ) : isCurrent ? (
                    'Seu Plano Atual'
                  ) : planKey === 'gratis' ? (
                    'Plano Grátis'
                  ) : (
                    <>
                      <span>Assinar {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Trust & Mercado Pago Info Banner */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-indigo-600 shrink-0" />
          <div>
            <strong className="block text-slate-900 text-sm">Pagamento Seguro via Mercado Pago</strong>
            <span>Cobranças processadas com criptografia de ponta e liberação oficial imediata via Pix ou Cartão.</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0 font-medium">
          <span>⚡ Ativação Imediata</span>
          <span>•</span>
          <span>Sem fidelidade</span>
        </div>
      </div>

      {/* Customer Payment History Table */}
      {!isOwner && user && userPayments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Histórico de Pagamentos</h3>
              <p className="text-xs text-slate-500">Comprovantes e faturas registradas pelo Mercado Pago.</p>
            </div>
            <span className="text-xs text-slate-500 font-mono font-medium">
              {userPayments.length} transação(ões)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Plano</th>
                  <th className="py-2.5 px-3">Valor</th>
                  <th className="py-2.5 px-3">Método</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">ID Mercado Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {userPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold uppercase text-slate-900">
                      Plano {p.plan_id}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      R$ {p.amount.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-slate-600">
                      {p.payment_method === 'pix' ? 'Pix' : 'Cartão'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {p.status === 'approved' ? 'Aprovado' : p.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {p.mercado_pago_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checkout Modal (Mercado Pago Pix / Cartão) */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
            
            <button
              onClick={() => {
                setSelectedPlanForCheckout(null);
                setPixData(null);
                setCardInitPoint(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <span className="text-xs font-semibold text-indigo-600 block mb-1">
                Checkout Seguro Mercado Pago
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Assinar Plano {SAAS_PLANS[selectedPlanForCheckout].name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Valor mensal: <strong className="text-slate-900 font-mono">R$ {SAAS_PLANS[selectedPlanForCheckout].priceMonthly.toFixed(2).replace('.', ',')}/mês</strong>
              </p>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('pix');
                  handleStartCheckout(selectedPlanForCheckout);
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'pix'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Pix Instantâneo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cartao');
                  handleStartCheckout(selectedPlanForCheckout);
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'cartao'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Cartão de Crédito</span>
              </button>
            </div>

            {loadingCheckout && (
              <div className="py-10 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Conectando ao Mercado Pago...</p>
              </div>
            )}

            {checkoutError && (
              <div className="p-3 mb-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {paymentSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <strong className="block text-sm">Pagamento Confirmado pelo Mercado Pago!</strong>
                <p>Seu plano {selectedPlanForCheckout.toUpperCase()} foi ativado com sucesso.</p>
              </div>
            )}

            {/* PIX FLOW */}
            {!loadingCheckout && !paymentSuccess && paymentMethod === 'pix' && pixData && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="w-36 h-36 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 mb-2 shadow-2xs">
                    {pixData.qr_code_base64 ? (
                      <img
                        src={`data:image/png;base64,${pixData.qr_code_base64}`}
                        alt="QR Code Pix Mercado Pago"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="w-28 h-28 text-slate-800" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Abra o app do seu banco e escaneie o QR Code Pix
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código Pix Copia e Cola:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixData.pix_copy_paste}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-600 truncate focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shrink-0"
                    >
                      {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={verifyingPayment}
                    onClick={handleCheckPixStatus}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {verifyingPayment ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verificando com Mercado Pago...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Já realizei o pagamento Pix</span>
                      </>
                    )}
                  </button>
                  <span className="block text-center text-[10px] text-slate-400 mt-2">
                    🔒 O plano é liberado exclusivamente após a confirmação recebida do Mercado Pago.
                  </span>
                </div>
              </div>
            )}

            {/* CARD / CHECKOUT PRO FLOW */}
            {!loadingCheckout && !paymentSuccess && paymentMethod === 'cartao' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <strong className="block text-xs font-bold text-slate-900">
                    Ambiente Oficial Seguro Mercado Pago
                  </strong>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Você será direcionado para a página protegida do Mercado Pago para inserir os dados do cartão de crédito com segurança total.
                  </p>
                </div>

                {cardInitPoint && (
                  <a
                    href={cardInitPoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Abrir Checkout Seguro no Mercado Pago</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Após concluir o pagamento na janela do Mercado Pago, seu plano será ativado imediatamente através da notificação automática de webhook.
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Cancel Subscription Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Cancelar Assinatura?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ao cancelar, você continuará com acesso aos benefícios e buscas restantes até o final do período mensal atual. Após isso, você retornará ao plano gratuito.
              </p>
            </div>

            {cancelFeedback && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium">
                {cancelFeedback}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelSubscription}
                className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
