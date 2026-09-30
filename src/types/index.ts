export type UserRole = 'user' | 'admin';
export type AccountType = 'customer' | 'owner';
export type UserPlan = 'gratis' | 'basic' | 'pro' | 'premium';

export type PaymentStatus = 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled' | 'refunded';
export type SubscriptionStatus = 'active' | 'pending' | 'canceled' | 'paused' | 'past_due' | 'expired';

export interface PaymentRecord {
  id: string; // ID interno: pay_xxx
  customer_id: string; // ID do usuário
  customer_name?: string;
  customer_email?: string;
  plan_id: UserPlan;
  amount: number;
  currency: string; // 'BRL'
  payment_method: 'pix' | 'cartao' | 'gratis';
  status: PaymentStatus;
  mercado_pago_id: string; // ID do pagamento ou preference no Mercado Pago
  subscription_id?: string;
  created_at: string;
  approved_at?: string;
}

export interface PaymentEvent {
  id: string;
  event_type: string; // 'payment.created', 'payment.updated', 'subscription.renewed', etc.
  mercado_pago_id: string;
  payload: any;
  processed_at: string;
}

export interface FinancialTransaction {
  id: string;
  payment_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  plan: UserPlan;
  amount: number;
  net_amount?: number;
  fee?: number;
  payment_method: 'pix' | 'cartao';
  status: PaymentStatus;
  mercado_pago_id: string;
  date: string;
  renewal_date?: string;
}

export interface CustomerRecord {
  id: string;
  user_id: string;
  name: string;
  email: string;
  mercado_pago_customer_id?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  account_type: AccountType;
  plan: UserPlan;
  searches_remaining: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'Novo' | 'Contatado' | 'Em negociação' | 'Cliente' | 'Perdido';
export type WhatsAppStatus = 'confirmed' | 'unconfirmed' | 'none';

export interface Lead {
  id: string;
  user_id: string;
  place_id?: string; // Real Google Place ID
  business_name: string;
  category: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
  whatsapp?: string;
  whatsapp_status?: WhatsAppStatus;
  address: string;
  website?: string;
  google_maps_url?: string;
  rating: number;
  review_count: number;
  has_website: boolean;
  status: LeadStatus;
  notes?: string;
  created_at: string;
}

export type ProjectStatus = 'Rascunho' | 'Em edição' | 'Publicado';

export interface GeneratedWebsiteData {
  business_name: string;
  category: string;
  place_id?: string;
  whatsapp_status?: WhatsAppStatus;
  custom_prompt?: string;
  niche_type?: 'barbearia' | 'restaurante' | 'dentista' | 'petshop' | 'academia' | 'loja' | 'padaria' | 'beleza' | 'mecanica' | 'advocacia' | 'contabilidade' | 'geral';
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  city?: string;
  state?: string;
  instagram?: string;
  google_maps_url?: string;
  rating?: number;
  review_count?: number;
  primary_color: string;
  secondary_color: string;
  accent_color?: string;
  style: string;
  seo?: {
    meta_title: string;
    meta_description: string;
    og_title: string;
    og_description: string;
    keywords: string[];
  };
  hero: {
    badge?: string;
    title: string;
    subtitle: string;
    cta_primary: string;
    cta_secondary: string;
    background_image?: string;
  };
  about: {
    title: string;
    text: string;
    highlights: string[];
    years_experience?: string;
    story_badge?: string;
  };
  services: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    highlight?: string;
    price?: string;
    cta_text?: string;
  }>;
  gallery: Array<{
    title: string;
    image_url: string;
    caption: string;
    category?: string;
  }>;
  differentials: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  testimonials?: Array<{
    name: string;
    role: string;
    content: string;
    rating: number;
    verified?: boolean;
    date?: string;
  }>;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  contact: {
    opening_hours: string;
    address_display: string;
    contact_phone: string;
    whatsapp_cta?: string;
    whatsapp_message?: string;
  };
}

export interface Project {
  id: string;
  user_id: string;
  lead_id?: string;
  place_id?: string;
  name: string;
  slug?: string;
  custom_slug?: string;
  description: string;
  status: ProjectStatus;
  website_url?: string;
  site_data: GeneratedWebsiteData;
  custom_prompt?: string; // Personalização utilizada salva no projeto
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: UserPlan;
  status: SubscriptionStatus;
  payment_method: 'pix' | 'cartao' | 'gratis';
  mercado_pago_subscription_id?: string;
  expires_at?: string;
  created_at: string;
}

export interface SearchLog {
  id: string;
  user_id: string;
  country: string;
  state: string;
  city: string;
  category: string;
  filter: 'Sem site' | 'Com site' | 'Todos';
  results_count: number;
  created_at: string;
}

export interface BusinessSearchResult {
  id: string;
  place_id: string; // Real Google Place ID
  name: string;
  category: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
  whatsapp?: string;
  whatsapp_status: WhatsAppStatus;
  address: string;
  rating: number;
  review_count: number;
  website?: string;
  google_maps_url: string;
  has_website: boolean;
  is_mock_data?: boolean;
}

export interface PricingInputs {
  business_type: string;
  pages_count: number;
  has_gallery: boolean;
  has_contact_form: boolean;
  has_whatsapp_button: boolean;
  has_seo_optimization: boolean;
  has_scheduling: boolean;
  has_monthly_maintenance: boolean;
}

export interface PricingOutput {
  creation_price_min: number;
  creation_price_suggested: number;
  creation_price_max: number;
  monthly_maintenance_suggested: number;
  estimated_delivery_days: number;
  breakdown: Array<{ item: string; value: number }>;
}

export interface ContractInputs {
  client_name: string;
  client_document: string; // CPF ou CNPJ
  client_email: string;
  contractor_name: string;
  contractor_document: string;
  service_title: string;
  service_description: string;
  total_value: number;
  deadline_days: number;
  payment_method: string;
  payment_terms: string;
  city: string;
  state: string;
}
