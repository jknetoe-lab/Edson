import { UserPlan, PaymentRecord, Subscription } from '../types';

export interface PlanDetails {
  id: UserPlan;
  name: string;
  priceMonthly: number;
  searchesLimit: number | 'Ilimitado';
  description: string;
  badge?: string;
  features: string[];
  ctaLabel: string;
}

export const SAAS_PLANS: Record<UserPlan, PlanDetails> = {
  gratis: {
    id: 'gratis',
    name: 'Grátis',
    priceMonthly: 0,
    searchesLimit: 5,
    description: 'Ideal para experimentar e começar a encontrar seus primeiros clientes.',
    features: [
      '5 buscas de empresas com filtros',
      'Filtro exclusivo de empresas sem site',
      'Gestão essencial de leads e contatos',
      'Dashboard com métricas básicas',
    ],
    ctaLabel: 'Plano Grátis',
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    priceMonthly: 19.90,
    searchesLimit: 50,
    description: 'Ideal para freelancers fecharem sites com constância toda semana.',
    badge: 'Econômico',
    features: [
      '50 buscas de empresas por mês',
      'Criação de sites profissionais com IA',
      'Mensagens e abordagens comerciais com IA',
      'Gestão completa de leads',
      'Projetos e exportação',
      'Pagamento seguro via Mercado Pago (Pix e Cartão)',
    ],
    ctaLabel: 'Assinar Basic',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 39.90,
    searchesLimit: 200,
    description: 'Para agências e profissionais que prospectam ativamente com escala.',
    badge: 'Mais Popular',
    features: [
      '200 buscas de empresas por mês',
      'Criação de sites com IA ilimitada',
      'Mensagens de vendas e quebra de objeções IA',
      'Gestão avançada de projetos e clientes',
      'Gerador automático de contratos com exportação PDF',
      'Todos os recursos normais do SaaS',
      'Pagamento seguro via Mercado Pago (Pix e Cartão)',
    ],
    ctaLabel: 'Assinar Pro',
  },
  premium: {
    id: 'premium',
    name: 'Pro (Legado)',
    priceMonthly: 39.90,
    searchesLimit: 200,
    description: 'Plano Pro completo com todos os recursos e contratos.',
    badge: 'Completo',
    features: [
      '200 buscas de empresas por mês',
      'Criação de sites com IA',
      'Mensagens de prospecção com IA',
      'Projetos e Contratos',
      'Todos os recursos normais do SaaS',
    ],
    ctaLabel: 'Assinar Pro',
  },
};

export interface MercadoPagoPreferenceResponse {
  success: boolean;
  preference_id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  internal_payment_id?: string;
  error?: string;
}

export interface MercadoPagoPixResponse {
  success: boolean;
  internal_payment_id?: string;
  mercado_pago_id?: string;
  pix_copy_paste?: string;
  qr_code_base64?: string;
  amount?: number;
  status?: string;
  error?: string;
}

export const PaymentService = {
  /**
   * Cria preferência de checkout no Mercado Pago (Checkout Pro / Cartão)
   */
  async createCheckoutPreference(
    plan: UserPlan,
    customer: { id: string; name: string; email: string }
  ): Promise<MercadoPagoPreferenceResponse> {
    try {
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          customer_id: customer.id,
          customer_name: customer.name,
          customer_email: customer.email,
        }),
      });

      return await response.json();
    } catch (err: any) {
      console.error('Erro ao criar preferência Mercado Pago:', err);
      return { success: false, error: err.message || 'Erro de conexão com o servidor de pagamento.' };
    }
  },

  /**
   * Cria cobrança direta Pix via Mercado Pago
   */
  async createPixPayment(
    plan: UserPlan,
    customer: { id: string; name: string; email: string }
  ): Promise<MercadoPagoPixResponse> {
    try {
      const response = await fetch('/api/mercadopago/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          customer_id: customer.id,
          customer_name: customer.name,
          customer_email: customer.email,
        }),
      });

      return await response.json();
    } catch (err: any) {
      console.error('Erro ao gerar Pix Mercado Pago:', err);
      return { success: false, error: err.message || 'Erro ao gerar Pix no Mercado Pago.' };
    }
  },

  /**
   * Consulta status verificado do pagamento no backend/Mercado Pago
   */
  async verifyPaymentStatus(paymentId: string): Promise<{
    success: boolean;
    status: string;
    plan?: UserPlan;
    searches_remaining?: number;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/mercadopago/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId }),
      });

      return await response.json();
    } catch (err: any) {
      console.error('Erro ao verificar status:', err);
      return { success: false, status: 'error', error: err.message };
    }
  },

  /**
   * Cancela assinatura do cliente
   */
  async cancelSubscription(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      return await response.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao cancelar assinatura.' };
    }
  }
};
