import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  PaymentRecord, 
  FinancialTransaction, 
  PaymentEvent, 
  Subscription, 
  UserPlan,
  PaymentStatus,
  SubscriptionStatus 
} from '../src/types';

// In serverless environments (e.g. Netlify Functions), the root is read-only so use /tmp
const isServerless = Boolean(
  process.env.NETLIFY || 
  process.env.AWS_LAMBDA_FUNCTION_NAME || 
  process.env.LAMBDA_TASK_ROOT
);

const DATA_DIR = isServerless
  ? path.resolve(process.env.TMPDIR || '/tmp', 'leadforge-data')
  : path.resolve(process.cwd(), 'data');

const DATA_FILE = path.resolve(DATA_DIR, 'financial_data.json');

interface FinancialStoreData {
  payments: PaymentRecord[];
  transactions: FinancialTransaction[];
  events: PaymentEvent[];
  subscriptions: Subscription[];
}

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

const DEFAULT_DATA: FinancialStoreData = {
  payments: [
    {
      id: 'pay_init_01',
      customer_id: 'usr_customer_002',
      customer_name: 'Rodrigo Alcantara (Freelancer)',
      customer_email: 'rodrigo@agenciadigital.com.br',
      plan_id: 'basic',
      amount: 19.90,
      currency: 'BRL',
      payment_method: 'pix',
      status: 'approved',
      mercado_pago_id: 'mp_pay_98234123',
      subscription_id: 'sub_002',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      approved_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    }
  ],
  transactions: [
    {
      id: 'tx_init_01',
      payment_id: 'pay_init_01',
      customer_id: 'usr_customer_002',
      customer_name: 'Rodrigo Alcantara (Freelancer)',
      customer_email: 'rodrigo@agenciadigital.com.br',
      plan: 'basic',
      amount: 19.90,
      net_amount: 19.70,
      fee: 0.20,
      payment_method: 'pix',
      status: 'approved',
      mercado_pago_id: 'mp_pay_98234123',
      date: new Date(Date.now() - 15 * 86400000).toISOString(),
      renewal_date: new Date(Date.now() + 15 * 86400000).toISOString(),
    }
  ],
  events: [
    {
      id: 'evt_init_01',
      event_type: 'payment.approved',
      mercado_pago_id: 'mp_pay_98234123',
      payload: { action: 'payment.updated', status: 'approved' },
      processed_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    }
  ],
  subscriptions: [
    {
      id: 'sub_001',
      user_id: 'usr_owner_001',
      plan: 'pro',
      status: 'active',
      payment_method: 'gratis',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    {
      id: 'sub_002',
      user_id: 'usr_customer_002',
      plan: 'basic',
      status: 'active',
      payment_method: 'pix',
      mercado_pago_subscription_id: 'mp_pay_98234123',
      expires_at: new Date(Date.now() + 15 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    }
  ],
};

function readData(): FinancialStoreData {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading financial data file:', err);
  }
  return DEFAULT_DATA;
}

function writeData(data: FinancialStoreData): void {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing financial data file:', err);
  }
}

export const PaymentStore = {
  // Payments
  getPayments(customerId?: string): PaymentRecord[] {
    const data = readData();
    if (customerId) {
      return data.payments.filter(p => p.customer_id === customerId);
    }
    return data.payments;
  },

  getPaymentById(id: string): PaymentRecord | null {
    const data = readData();
    return data.payments.find(p => p.id === id || p.mercado_pago_id === id) || null;
  },

  savePayment(payment: PaymentRecord): void {
    const data = readData();
    const idx = data.payments.findIndex(p => p.id === payment.id || (p.mercado_pago_id && p.mercado_pago_id === payment.mercado_pago_id));
    if (idx >= 0) {
      data.payments[idx] = { ...data.payments[idx], ...payment };
    } else {
      data.payments.unshift(payment);
    }
    writeData(data);
  },

  updatePaymentStatus(id: string, status: PaymentStatus, approved_at?: string): PaymentRecord | null {
    const data = readData();
    const idx = data.payments.findIndex(p => p.id === id || p.mercado_pago_id === id);
    if (idx >= 0) {
      data.payments[idx].status = status;
      if (approved_at) {
        data.payments[idx].approved_at = approved_at;
      }
      writeData(data);
      return data.payments[idx];
    }
    return null;
  },

  // Transactions
  getTransactions(): FinancialTransaction[] {
    const data = readData();
    return data.transactions;
  },

  saveTransaction(tx: FinancialTransaction): void {
    const data = readData();
    const idx = data.transactions.findIndex(t => t.id === tx.id || t.payment_id === tx.payment_id || (t.mercado_pago_id && t.mercado_pago_id === tx.mercado_pago_id));
    if (idx >= 0) {
      data.transactions[idx] = tx;
    } else {
      data.transactions.unshift(tx);
    }
    writeData(data);
  },

  // Events (Idempotency)
  isEventProcessed(mercadoPagoId: string, eventType: string): boolean {
    const data = readData();
    return data.events.some(e => e.mercado_pago_id === mercadoPagoId && e.event_type === eventType);
  },

  saveEvent(event: PaymentEvent): void {
    const data = readData();
    data.events.unshift(event);
    writeData(data);
  },

  // Subscriptions
  getSubscription(userId: string): Subscription | null {
    const data = readData();
    return data.subscriptions.find(s => s.user_id === userId) || null;
  },

  getAllSubscriptions(): Subscription[] {
    const data = readData();
    return data.subscriptions;
  },

  activateSubscription(
    userId: string,
    plan: UserPlan,
    paymentMethod: 'pix' | 'cartao',
    mercadoPagoId?: string
  ): Subscription {
    const data = readData();
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
    const idx = data.subscriptions.findIndex(s => s.user_id === userId);
    
    let sub: Subscription;
    if (idx >= 0) {
      sub = {
        ...data.subscriptions[idx],
        plan,
        status: 'active',
        payment_method: paymentMethod,
        mercado_pago_subscription_id: mercadoPagoId || data.subscriptions[idx].mercado_pago_subscription_id,
        expires_at: expiresAt,
      };
      data.subscriptions[idx] = sub;
    } else {
      sub = {
        id: 'sub_' + Date.now(),
        user_id: userId,
        plan,
        status: 'active',
        payment_method: paymentMethod,
        mercado_pago_subscription_id: mercadoPagoId,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      };
      data.subscriptions.push(sub);
    }
    writeData(data);
    return sub;
  },

  cancelSubscription(userId: string): boolean {
    const data = readData();
    const idx = data.subscriptions.findIndex(s => s.user_id === userId);
    if (idx >= 0) {
      data.subscriptions[idx].status = 'canceled';
      writeData(data);
      return true;
    }
    return false;
  },

  downgradeSubscription(userId: string): void {
    const data = readData();
    const idx = data.subscriptions.findIndex(s => s.user_id === userId);
    if (idx >= 0) {
      data.subscriptions[idx].status = 'expired';
      data.subscriptions[idx].plan = 'gratis';
      writeData(data);
    }
  },

  // Summary calculation for Admin Financial Dashboard
  getFinancialSummary() {
    const data = readData();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    const approvedPayments = data.payments.filter(p => p.status === 'approved');
    const pendingPayments = data.payments.filter(p => p.status === 'pending');
    const rejectedPayments = data.payments.filter(p => p.status === 'rejected');
    const cancelledPayments = data.payments.filter(p => p.status === 'cancelled');

    const totalReceived = approvedPayments.reduce((acc, p) => acc + p.amount, 0);

    const revenueToday = approvedPayments
      .filter(p => new Date(p.approved_at || p.created_at).getTime() >= startOfToday)
      .reduce((acc, p) => acc + p.amount, 0);

    const revenueThisMonth = approvedPayments
      .filter(p => new Date(p.approved_at || p.created_at).getTime() >= startOfMonth)
      .reduce((acc, p) => acc + p.amount, 0);

    const revenueThisYear = approvedPayments
      .filter(p => new Date(p.approved_at || p.created_at).getTime() >= startOfYear)
      .reduce((acc, p) => acc + p.amount, 0);

    const pixPayments = approvedPayments.filter(p => p.payment_method === 'pix');
    const cardPayments = approvedPayments.filter(p => p.payment_method === 'cartao');

    const pixRevenue = pixPayments.reduce((acc, p) => acc + p.amount, 0);
    const cardRevenue = cardPayments.reduce((acc, p) => acc + p.amount, 0);

    const activeBasicSubs = data.subscriptions.filter(s => s.status === 'active' && s.plan === 'basic').length;
    const activeProSubs = data.subscriptions.filter(s => s.status === 'active' && (s.plan === 'pro' || s.plan === 'premium')).length;
    const cancelledSubs = data.subscriptions.filter(s => s.status === 'canceled').length;

    // Monthly revenue by month for the chart (last 6 months)
    const monthlyRevenueChart: { month: string; amount: number }[] = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const monthStart = new Date(yr, mIdx, 1).getTime();
      const nextMonthStart = new Date(yr, mIdx + 1, 1).getTime();

      const mRevenue = approvedPayments
        .filter(p => {
          const pTime = new Date(p.approved_at || p.created_at).getTime();
          return pTime >= monthStart && pTime < nextMonthStart;
        })
        .reduce((acc, p) => acc + p.amount, 0);

      monthlyRevenueChart.push({
        month: `${monthNames[mIdx]}/${yr.toString().slice(-2)}`,
        amount: Number(mRevenue.toFixed(2)),
      });
    }

    return {
      totalReceived: Number(totalReceived.toFixed(2)),
      revenueToday: Number(revenueToday.toFixed(2)),
      revenueThisMonth: Number(revenueThisMonth.toFixed(2)),
      revenueThisYear: Number(revenueThisYear.toFixed(2)),
      totalRevenue: Number(totalReceived.toFixed(2)),
      countApproved: approvedPayments.length,
      countPending: pendingPayments.length,
      countRejected: rejectedPayments.length,
      countCancelled: cancelledPayments.length,
      pixRevenue: Number(pixRevenue.toFixed(2)),
      cardRevenue: Number(cardRevenue.toFixed(2)),
      pixCount: pixPayments.length,
      cardCount: cardPayments.length,
      activeBasicSubs,
      activeProSubs,
      cancelledSubs,
      freeUsersCount: 1, // baseline free user count
      monthlyRevenueChart,
      transactions: data.transactions,
      payments: data.payments,
    };
  }
};
