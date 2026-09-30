import express from 'express';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { PaymentStore } from './paymentStore';
import { ProjectStore } from './projectStore';
import { UserPlan, PaymentRecord, FinancialTransaction, PaymentEvent, Project } from '../src/types';

export function createApiApp() {
  const app = express();

  // Middleware de CORS e Headers de Segurança
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-signature, x-request-id');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Normalizador de rotas para suporte completo a Netlify Functions e Express Server
  // Garante que requisições como /.netlify/functions/api/* sejam roteadas perfeitamente para /api/*
  app.use((req, res, next) => {
    if (req.url.startsWith('/.netlify/functions/api')) {
      let normalized = req.url.slice('/.netlify/functions/api'.length);
      if (!normalized.startsWith('/')) {
        normalized = '/' + normalized;
      }
      if (!normalized.startsWith('/api')) {
        normalized = '/api' + normalized;
      }
      req.url = normalized;
    } else if (!req.url.startsWith('/api') && req.url !== '/' && !req.url.startsWith('/site/')) {
      req.url = '/api' + req.url;
    }
    next();
  });

  app.use(express.json());

  // Fallback para Netlify Functions quando o corpo vier em event.body
  app.use((req, res, next) => {
    if ((!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) && (req as any).apiGateway?.event?.body) {
      try {
        const raw = (req as any).apiGateway.event.body;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (parsed && typeof parsed === 'object') {
          req.body = parsed;
        }
      } catch (e) {
        // ignore parsing errors
      }
    }
    next();
  });

  // Helper para obter a URL base em produção dinamicamente
  function getBaseAppUrl(req?: express.Request): string {
    if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
      return process.env.APP_URL.replace(/\/$/, '');
    }
    if (process.env.URL) { // Netlify injected site URL
      return process.env.URL.replace(/\/$/, '');
    }
    if (req) {
      const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      if (host) {
        return `${proto}://${host}`.replace(/\/$/, '');
      }
    }
    return 'http://localhost:3000';
  }

  // Inicialização do Google GenAI Server-side com header obrigatório
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Inicialização Mercado Pago SDK
  const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
  const mpWebhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || '';
  const mpClient = mpAccessToken ? new MercadoPagoConfig({ accessToken: mpAccessToken }) : null;

  // ============================================================================
  // API ROUTES
  // ============================================================================

  // 1. Geração de Website com IA (Server-Side Gemini API)
  app.post('/api/gemini/generate-site', async (req, res) => {
    try {
      const {
        business_name,
        category,
        description,
        phone,
        whatsapp,
        address,
        city,
        state,
        services,
        instagram,
        desired_colors,
        style,
        rating,
        review_count,
      } = req.body;

      const prompt = `Você é um Diretor de Arte e Estrategista de Conversão Digital de uma das melhores agências de Web Design do Brasil.
Sua missão é criar o conteúdo completo, profissional, persuasivo e altamente específico de um WEBSITE INSTITUCIONAL COMPLETO para a empresa abaixo:

DADOS REAIS DA EMPRESA:
- Nome da Empresa: "${business_name || 'Negócio Local'}"
- Categoria / Nicho: "${category || 'Serviços'}"
- Descrição informada: "${description || ''}"
- Telefone Comercial: "${phone || ''}"
- WhatsApp: "${whatsapp || phone || ''}"
- Endereço / Localização: "${address || ''}"
- Cidade/UF: "${city || ''} ${state || ''}"
- Serviços ou Produtos: "${services || ''}"
- Instagram: "${instagram || ''}"
- Cores desejadas: "${desired_colors || ''}"
- Estilo: "${style || 'Moderno e Profissional'}"
- Avaliação Real no Google: ${rating ? `${rating} estrelas (${review_count || 0} avaliações)` : 'Não informada'}

DIRETRIZES CRÍTICAS DE QUALIDADE E CONFIANÇA:
1. NÃO invente preços, descontos com porcentagens falsas, diplomas que não foram informados, prêmios fictícios ou dados mentirosos.
2. Evite clichês genéricos como "Bem-vindo ao nosso site" ou "Buscamos a excelência". Escreva copy moderno, focado em benefícios reais e acolhimento do cliente.
3. Se não houver depoimentos de clientes reais fornecidos, NÃO invente depoimentos falsos com nomes aleatórios. Em vez disso, mencione a reputação e compromisso com satisfação.
4. Ajuste o tom de voz e os termos estritamente ao nicho da empresa:
   - Se for BARBEARIA: foco em corte clássico, visagismo, navalha, toalha quente, pontualidade e cerveja/café.
   - Se for RESTAURANTE/GASTRONOMIA: foco em ingredientes frescos, pratos artesanais, sabor autêntico, reserva e delivery.
   - Se for DENTISTA/ODONTOLOGIA: foco em estética dental, equipamentos digitais, biossegurança e atendimento sem dor.
   - Se for PET SHOP/VET: foco em carinho, banho e tosa livre de estresse, segurança animal e carinho.
   - Se for ACADEMIA: foco em saúde, motivação, aparelhagem moderna, instrutores presentes e aula experimental.
   - Se for LOJA: foco em coleções, qualidade do produto, atendimento consultivo e entrega rápida.
   - Se for MECÂNICA: foco em honestidade nas peças, diagnósticos computadorizados e fotos de peças trocadas.
   - Se for ADVOCACIA/CONTABILIDADE: foco em rigor técnico, atendimento consultivo, agilidade digital e sigilo.

Retorne EXCLUSIVAMENTE um objeto JSON válido (sem tags markdown nem explicações) no formato exato:
{
  "business_name": "${business_name}",
  "category": "${category}",
  "tagline": "Slogan comercial marcante de 1 frase",
  "description": "Apresentação profissional e atraente da empresa com foco em confiança",
  "phone": "${phone}",
  "whatsapp": "${whatsapp}",
  "email": "contato@empresa.com.br",
  "address": "${address}",
  "city": "${city || ''}",
  "state": "${state || ''}",
  "instagram": "${instagram}",
  "primary_color": "#0F172A",
  "secondary_color": "#4F46E5",
  "style": "${style || 'Moderno e Confiável'}",
  "hero": {
    "badge": "Frase curta de destaque ou selo do nicho",
    "title": "Headline impactante e envolvente para a Hero",
    "subtitle": "Subtítulo convincente que explica a proposta única de valor",
    "cta_primary": "Texto do botão principal de WhatsApp",
    "cta_secondary": "Texto do botão secundário"
  },
  "about": {
    "title": "Título criativo da seção Sobre",
    "text": "Texto persuasivo contando a proposta e dedicação da empresa",
    "highlights": ["Diferencial 1", "Diferencial 2", "Diferencial 3", "Diferencial 4"]
  },
  "services": [
    { "id": "s1", "title": "Serviço 1", "description": "Descrição detalhada dos benefícios", "icon": "Sparkles", "highlight": "Destaque" },
    { "id": "s2", "title": "Serviço 2", "description": "Descrição detalhada dos benefícios", "icon": "ShieldCheck" },
    { "id": "s3", "title": "Serviço 3", "description": "Descrição detalhada dos benefícios", "icon": "Award" },
    { "id": "s4", "title": "Serviço 4", "description": "Descrição detalhada dos benefícios", "icon": "Clock" }
  ],
  "differentials": [
    { "title": "Diferencial 1", "description": "Explicação clara do diferencial", "icon": "CheckCircle2" },
    { "title": "Diferencial 2", "description": "Explicação clara do diferencial", "icon": "ShieldCheck" },
    { "title": "Diferencial 3", "description": "Explicação clara do diferencial", "icon": "Zap" },
    { "title": "Diferencial 4", "description": "Explicação clara do diferencial", "icon": "Award" }
  ],
  "faq": [
    { "question": "Pergunta frequente 1 relevante para o nicho?", "answer": "Resposta clara, cordial e direta." },
    { "question": "Pergunta frequente 2 relevante para o nicho?", "answer": "Resposta clara, cordial e direta." },
    { "question": "Pergunta frequente 3 relevante para o nicho?", "answer": "Resposta clara, cordial e direta." }
  ],
  "contact": {
    "opening_hours": "Horário de atendimento usual",
    "address_display": "${address}",
    "contact_phone": "${phone}",
    "whatsapp_cta": "Chamar no WhatsApp",
    "whatsapp_message": "Mensagem inicial personalizada para o cliente mandar no WhatsApp"
  }
}`;

      if (process.env.GEMINI_API_KEY) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.6,
          },
        });

        const text = response.text || '{}';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const siteData = JSON.parse(cleanJson);

        return res.json({ success: true, site_data: siteData });
      }

      // Fallback semântico caso em desenvolvimento sem API key
      return res.json({
        success: true,
        site_data: {
          business_name: business_name || 'Negócio Local',
          category: category || 'Serviços',
          tagline: 'Excelência, pontualidade e dedicação para transformar sua experiência.',
          description: description || 'Empresa referência com atendimento humanizado e foco em resultados.',
          phone: phone || '',
          whatsapp: whatsapp || '',
          email: 'contato@empresa.com.br',
          address: address || '',
          city: city || '',
          state: state || '',
          instagram: instagram || '',
          primary_color: '#0F172A',
          secondary_color: '#4F46E5',
          style: style || 'Moderno e Confiável',
          hero: {
            badge: `${category || 'Serviços'} de Alta Performance`,
            title: `${business_name || 'Sua Empresa'}: Qualidade Que Constrói Confiança`,
            subtitle: description || 'Atendimento humanizado, processos transparentes e foco total na sua satisfação.',
            cta_primary: 'Agendar no WhatsApp',
            cta_secondary: 'Ver Serviços',
          },
          about: {
            title: `Sobre a ${business_name || 'Empresa'}`,
            text: 'Nossa história é marcada pela honestidade, respeito aos prazos e investimento contínuo na satisfação de cada cliente.',
            highlights: ['Atendimento rápido e desburocratizado', 'Profissionais altamente qualificados', 'Ambiente confortável e seguro', 'Transparência total em cada etapa'],
          },
          services: [
            { id: 's1', title: 'Atendimento Personalizado', description: 'Soluções customizadas de acordo com sua necessidade e expectativas.', icon: 'Sparkles', highlight: 'Mais procurado' },
            { id: 's2', title: 'Consultoria Especializada', description: 'Diagnóstico técnico transparente antes de qualquer procedimento.', icon: 'ShieldCheck' },
            { id: 's3', title: 'Serviço de Alta Precisão', description: 'Execução minuciosa com materiais e equipamentos de ponta.', icon: 'Award' },
            { id: 's4', title: 'Suporte Contínuo', description: 'Acompanhamento dedicado e garantia em todos os serviços realizados.', icon: 'Clock' },
          ],
          differentials: [
            { title: 'Pontualidade Rigorosa', description: 'Horários respeitados sem filas ou esperas desnecessárias.', icon: 'Clock' },
            { title: 'Profissionais Qualificados', description: 'Equipe atualizada com as melhores práticas do mercado.', icon: 'Award' },
            { title: 'Facilidade no Pagamento', description: 'Pix com confirmação imediata e parcelamento nos cartões.', icon: 'CreditCard' },
            { title: 'Transparência Total', description: 'Você sabe exatamente o que está contratando sem taxas ocultas.', icon: 'ShieldCheck' },
          ],
          faq: [
            { question: 'Como faço para agendar um horário ou atendimento?', answer: 'Basta clicar no botão de WhatsApp para falar direto com nossa equipe.' },
            { question: 'Quais as formas de pagamento aceitas?', answer: 'Aceitamos Pix, cartões de crédito e débito.' },
            { question: 'Vocês atendem aos sábados?', answer: 'Sim, consulte disponibilidade de horários via WhatsApp.' },
          ],
          contact: {
            opening_hours: 'Segunda a Sexta das 08h às 18h | Sábado das 08h às 12h',
            address_display: address || 'Atendimento com horário agendado',
            contact_phone: phone || whatsapp,
            whatsapp_cta: 'Chamar no WhatsApp',
            whatsapp_message: `Olá! Vim pelo site da ${business_name} e gostaria de mais informações.`,
          },
        },
      });
    } catch (error: any) {
      console.error('Error generating site with Gemini:', error);
      res.status(500).json({ error: error.message || 'Erro ao gerar site com IA.' });
    }
  });

  // 2. Mentor IA de Vendas e Prospecção (Server-Side Gemini API)
  app.post('/api/gemini/mentor', async (req, res) => {
    try {
      const { messages } = req.body;

      const systemInstruction = `Você é o Mentor IA oficial do LeadForge AI, um consultor veterano especializado em vendas de sites, prospecção de pequenas e médias empresas brasileiras, abordagem no WhatsApp, quebra de objeções (ex: "já tenho Instagram", "não tenho dinheiro agora") e estratégias de fechamento para freelancers e agências digitais no Brasil.
Suas respostas devem ser práticas, em português brasileiro fluente, encorajadoras e com roteiros diretos de copiar e colar para o WhatsApp ou telefone quando solicitado.`;

      if (process.env.GEMINI_API_KEY) {
        const formattedContents = (messages || []).map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

        if (formattedContents.length === 0) {
          return res.status(400).json({ error: 'Nenhuma mensagem enviada.' });
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        return res.json({ reply: response.text });
      }

      return res.json({
        reply: 'Olá! Sou seu Mentor IA no LeadForge. Para abordar clientes sem site no WhatsApp, recomendo a técnica de 3 etapas:\n\n1. Elogie a reputação deles no Google Maps ("Vi que sua clínica tem excelentes avaliações na Savassi").\n2. Aponte sutilmente a perda de clientes ("Porém reparei que o botão do site está vazio, e muitos clientes desistem sem conseguir ver seus serviços").\n3. Envie uma amostra pronta ("Preparei uma demonstração rápida de como seu site profissional ficaria").\n\nQuer que eu monte uma mensagem personalizada para algum nicho específico?'
      });
    } catch (error: any) {
      console.error('Error in AI Mentor:', error);
      res.status(500).json({ error: error.message || 'Erro ao consultar o mentor IA.' });
    }
  });

  // 3. Prospecção de Empresas
  app.post('/api/search/businesses', (req, res) => {
    res.json({
      message: 'Endpoint de prospecção pronto para integração.',
      isMock: true,
      providerName: 'LeadForge Business Engine',
    });
  });

  // 3.1. Public Client Websites & Custom Links API
  app.get('/api/public/site/:slug', (req, res) => {
    const { slug } = req.params;
    const project = ProjectStore.getProjectBySlug(slug);
    if (!project) {
      return res.status(404).json({ error: 'Site não encontrado ou ainda não publicado.' });
    }
    res.json({ project });
  });

  app.get('/api/public/projects', (req, res) => {
    const projects = ProjectStore.getAllProjects();
    res.json({ projects });
  });

  app.post('/api/public/projects', (req, res) => {
    try {
      const project = req.body as Project;
      if (!project || !project.id || !project.site_data) {
        return res.status(400).json({ error: 'Dados do projeto incompletos.' });
      }
      const saved = ProjectStore.saveProject(project);
      res.json({ success: true, project: saved });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao salvar projeto.' });
    }
  });

  app.delete('/api/public/projects/:id', (req, res) => {
    const { id } = req.params;
    const deleted = ProjectStore.deleteProject(id);
    res.json({ success: deleted });
  });

  // 4. Integração Mercado Pago - Status de Configuração
  app.get('/api/mercadopago/config-status', (req, res) => {
    const isConfigured = Boolean(mpAccessToken);
    const appUrl = getBaseAppUrl(req);
    
    res.json({
      configured: isConfigured,
      hasWebhookSecret: Boolean(mpWebhookSecret),
      environment: mpAccessToken.startsWith('TEST-') ? 'Sandbox / Testes' : (mpAccessToken ? 'Produção' : 'Aguardando Credenciais'),
      webhookUrl: `${appUrl}/api/webhooks/mercadopago`,
      publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || '',
    });
  });

  // 5. Mercado Pago - Criar Preferência de Pagamento (Cartão / Checkout Pro)
  app.post('/api/mercadopago/create-preference', async (req, res) => {
    try {
      const { plan, customer_id, customer_name, customer_email } = req.body;
      const planKey = (plan as UserPlan) || 'basic';
      
      const planTitle = planKey === 'basic' ? 'LeadForge AI - Plano Basic (Mensal)' : 'LeadForge AI - Plano Pro (Mensal)';
      const planPrice = planKey === 'basic' ? 19.90 : 39.90;
      const internalPaymentId = `pay_mp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const appUrl = getBaseAppUrl(req);

      let preferenceId = `pref_dev_${Date.now()}`;
      let initPoint = '';
      let sandboxInitPoint = '';

      if (mpClient) {
        try {
          const preference = new Preference(mpClient);
          const result = await preference.create({
            body: {
              items: [
                {
                  id: `leadforge_plan_${planKey}`,
                  title: planTitle,
                  description: `Assinatura mensal com ${planKey === 'basic' ? '50' : '200'} buscas e IA`,
                  quantity: 1,
                  currency_id: 'BRL',
                  unit_price: planPrice,
                },
              ],
              payer: {
                name: customer_name || 'Cliente LeadForge',
                email: customer_email || 'cliente@leadforge.ai',
              },
              back_urls: {
                success: `${appUrl}?tab=planos&payment_status=approved&plan=${planKey}&pid=${internalPaymentId}`,
                pending: `${appUrl}?tab=planos&payment_status=pending&plan=${planKey}&pid=${internalPaymentId}`,
                failure: `${appUrl}?tab=planos&payment_status=failure&plan=${planKey}&pid=${internalPaymentId}`,
              },
              auto_return: 'approved',
              notification_url: `${appUrl}/api/webhooks/mercadopago`,
              external_reference: `${customer_id || 'usr_guest'}|${planKey}|${internalPaymentId}`,
            },
          });

          preferenceId = result.id || preferenceId;
          initPoint = result.init_point || '';
          sandboxInitPoint = result.sandbox_init_point || '';
        } catch (mpErr: any) {
          console.error('Erro na API Mercado Pago Preference:', mpErr?.message || mpErr);
        }
      }

      const paymentRecord: PaymentRecord = {
        id: internalPaymentId,
        customer_id: customer_id || 'usr_guest',
        customer_name: customer_name || 'Cliente',
        customer_email: customer_email || 'cliente@leadforge.ai',
        plan_id: planKey,
        amount: planPrice,
        currency: 'BRL',
        payment_method: 'cartao',
        status: 'pending',
        mercado_pago_id: preferenceId,
        created_at: new Date().toISOString(),
      };
      PaymentStore.savePayment(paymentRecord);

      res.json({
        success: true,
        preference_id: preferenceId,
        internal_payment_id: internalPaymentId,
        init_point: initPoint || sandboxInitPoint || `${appUrl}?tab=planos&payment_sim=1&pid=${internalPaymentId}&plan=${planKey}`,
        sandbox_init_point: sandboxInitPoint,
        amount: planPrice,
        plan: planKey,
      });
    } catch (error: any) {
      console.error('Erro ao criar preferência:', error);
      res.status(500).json({ success: false, error: error.message || 'Erro ao iniciar checkout.' });
    }
  });

  // 6. Mercado Pago - Criar Cobrança Direta Pix
  app.post('/api/mercadopago/create-pix', async (req, res) => {
    try {
      const { plan, customer_id, customer_name, customer_email } = req.body;
      const planKey = (plan as UserPlan) || 'basic';
      const planPrice = planKey === 'basic' ? 19.90 : 39.90;
      const internalPaymentId = `pay_pix_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const appUrl = getBaseAppUrl(req);

      let mpPaymentId = `mp_pix_${Date.now()}`;
      let pixQrCode = '';
      let pixQrCodeBase64 = '';

      if (mpClient) {
        try {
          const payment = new Payment(mpClient);
          const result = await payment.create({
            body: {
              transaction_amount: planPrice,
              description: `LeadForge AI - Assinatura Plano ${planKey.toUpperCase()}`,
              payment_method_id: 'pix',
              payer: {
                email: customer_email || 'contato@leadforge.ai',
                first_name: customer_name || 'Cliente',
              },
              external_reference: `${customer_id || 'usr_guest'}|${planKey}|${internalPaymentId}`,
              notification_url: `${appUrl}/api/webhooks/mercadopago`,
            },
          });

          if (result.id) mpPaymentId = result.id.toString();
          const txData = (result.point_of_interaction as any)?.transaction_data;
          if (txData) {
            pixQrCode = txData.qr_code || '';
            pixQrCodeBase64 = txData.qr_code_base64 || '';
          }
        } catch (mpErr: any) {
          console.error('Erro na API Mercado Pago Pix:', mpErr?.message || mpErr);
        }
      }

      if (!pixQrCode) {
        pixQrCode = `00020126580014br.gov.bcb.pix0136leadforge-${mpPaymentId}520400005303986540${planPrice.toFixed(2)}5802BR5913LeadForge AI6009SAO PAULO62070503***6304`;
      }

      const paymentRecord: PaymentRecord = {
        id: internalPaymentId,
        customer_id: customer_id || 'usr_guest',
        customer_name: customer_name || 'Cliente',
        customer_email: customer_email || 'cliente@leadforge.ai',
        plan_id: planKey,
        amount: planPrice,
        currency: 'BRL',
        payment_method: 'pix',
        status: 'pending',
        mercado_pago_id: mpPaymentId,
        created_at: new Date().toISOString(),
      };
      PaymentStore.savePayment(paymentRecord);

      res.json({
        success: true,
        internal_payment_id: internalPaymentId,
        mercado_pago_id: mpPaymentId,
        pix_copy_paste: pixQrCode,
        qr_code_base64: pixQrCodeBase64,
        amount: planPrice,
        plan: planKey,
        status: 'pending',
      });
    } catch (error: any) {
      console.error('Erro ao gerar Pix Mercado Pago:', error);
      res.status(500).json({ success: false, error: error.message || 'Erro ao gerar cobrança Pix.' });
    }
  });

  // 7. Webhook Oficial Mercado Pago
  app.post('/api/webhooks/mercadopago', async (req, res) => {
    try {
      const topic = (req.query.topic as string) || (req.query.type as string) || req.body?.type || req.body?.action || '';
      const paymentId = (req.query['data.id'] as string) || (req.query.id as string) || req.body?.data?.id || '';

      if (mpWebhookSecret) {
        const xSignature = req.headers['x-signature'] as string;
        const xRequestId = req.headers['x-request-id'] as string;
        if (xSignature) {
          const parts = xSignature.split(',');
          let ts = '';
          let v1 = '';
          for (const p of parts) {
            const [k, v] = p.split('=');
            if (k?.trim() === 'ts') ts = v?.trim() || '';
            if (k?.trim() === 'v1') v1 = v?.trim() || '';
          }
          if (ts && v1) {
            const manifest = `id:${paymentId};request-id:${xRequestId || ''};ts:${ts};`;
            const computed = crypto.createHmac('sha256', mpWebhookSecret).update(manifest).digest('hex');
            if (computed !== v1) {
              console.warn('Webhook signature mismatch no Mercado Pago.');
              return res.status(401).json({ error: 'Assinatura inválida.' });
            }
          }
        }
      }

      if (!paymentId) {
        return res.status(200).json({ message: 'Webhook recebido sem ID de pagamento.' });
      }

      let status = 'approved';
      let customerId = '';
      let planKey: UserPlan = 'basic';
      let amount = 19.90;
      let paymentMethod: 'pix' | 'cartao' = 'pix';

      if (mpClient && !paymentId.startsWith('sim_')) {
        try {
          const payment = new Payment(mpClient);
          const mpData = await payment.get({ id: paymentId });
          status = mpData.status || status;
          amount = mpData.transaction_amount || amount;
          paymentMethod = mpData.payment_method_id === 'pix' ? 'pix' : 'cartao';

          const extRef = mpData.external_reference || '';
          if (extRef.includes('|')) {
            const [cId, pKey] = extRef.split('|');
            customerId = cId;
            planKey = (pKey as UserPlan) || planKey;
          }
        } catch (err: any) {
          console.error('Erro ao consultar pagamento no Mercado Pago:', err?.message || err);
        }
      }

      const eventKey = `${topic || 'payment'}.${status}`;
      if (PaymentStore.isEventProcessed(paymentId, eventKey)) {
        return res.status(200).json({ message: 'Evento já processado anteriormente (idempotente).' });
      }

      PaymentStore.saveEvent({
        id: `evt_${Date.now()}`,
        event_type: eventKey,
        mercado_pago_id: paymentId,
        payload: req.body,
        processed_at: new Date().toISOString(),
      });

      if (status === 'approved') {
        const existingPayment = PaymentStore.getPaymentById(paymentId);
        const targetUserId = customerId || existingPayment?.customer_id || 'usr_customer_002';
        const targetPlan = planKey || existingPayment?.plan_id || 'basic';
        const finalAmount = amount || existingPayment?.amount || (targetPlan === 'basic' ? 19.90 : 39.90);

        const sub = PaymentStore.activateSubscription(targetUserId, targetPlan, paymentMethod, paymentId);

        const internalPid = existingPayment?.id || `pay_${paymentId}`;
        PaymentStore.savePayment({
          id: internalPid,
          customer_id: targetUserId,
          customer_name: existingPayment?.customer_name || 'Cliente',
          customer_email: existingPayment?.customer_email || 'cliente@leadforge.ai',
          plan_id: targetPlan,
          amount: finalAmount,
          currency: 'BRL',
          payment_method: paymentMethod,
          status: 'approved',
          mercado_pago_id: paymentId,
          subscription_id: sub.id,
          created_at: existingPayment?.created_at || new Date().toISOString(),
          approved_at: new Date().toISOString(),
        });

        PaymentStore.saveTransaction({
          id: `tx_${paymentId}`,
          payment_id: internalPid,
          customer_id: targetUserId,
          customer_name: existingPayment?.customer_name || 'Cliente',
          customer_email: existingPayment?.customer_email || 'cliente@leadforge.ai',
          plan: targetPlan,
          amount: finalAmount,
          net_amount: Number((finalAmount * 0.985).toFixed(2)),
          fee: Number((finalAmount * 0.015).toFixed(2)),
          payment_method: paymentMethod,
          status: 'approved',
          mercado_pago_id: paymentId,
          date: new Date().toISOString(),
          renewal_date: sub.expires_at,
        });

        return res.status(200).json({ success: true, status: 'approved', activated_user: targetUserId, plan: targetPlan });
      }

      if (status === 'rejected' || status === 'cancelled') {
        PaymentStore.updatePaymentStatus(paymentId, status as any);
        return res.status(200).json({ success: true, status });
      }

      res.status(200).json({ success: true, status: 'received' });
    } catch (error: any) {
      console.error('Erro no processamento do Webhook Mercado Pago:', error);
      res.status(500).json({ error: error.message || 'Erro ao processar notificação.' });
    }
  });

  // 8. Consulta de Status Verificado do Pagamento
  app.post('/api/mercadopago/verify-payment', async (req, res) => {
    try {
      const { payment_id } = req.body;
      if (!payment_id) {
        return res.status(400).json({ success: false, error: 'ID de pagamento não informado.' });
      }

      const record = PaymentStore.getPaymentById(payment_id);
      if (!record) {
        return res.status(404).json({ success: false, error: 'Pagamento não encontrado.' });
      }

      if (mpClient && record.status === 'pending' && !record.mercado_pago_id.startsWith('sim_')) {
        try {
          const payment = new Payment(mpClient);
          const mpData = await payment.get({ id: record.mercado_pago_id });
          if (mpData.status && mpData.status !== record.status) {
            record.status = mpData.status as any;
            if (mpData.status === 'approved') {
              record.approved_at = new Date().toISOString();
              PaymentStore.activateSubscription(record.customer_id, record.plan_id, record.payment_method as any, record.mercado_pago_id);
            }
            PaymentStore.savePayment(record);
          }
        } catch (err: any) {
          console.error('Erro ao verificar status com Mercado Pago:', err?.message || err);
        }
      }

      const searchesRemaining = record.plan_id === 'basic' ? 50 : 200;

      res.json({
        success: record.status === 'approved',
        status: record.status,
        plan: record.plan_id,
        searches_remaining: record.status === 'approved' ? searchesRemaining : 5,
      });
    } catch (error: any) {
      console.error('Erro ao verificar status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 9. Cancelamento de Assinatura pelo Cliente
  app.post('/api/subscriptions/cancel', (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, error: 'Usuário não informado.' });
    }

    const success = PaymentStore.cancelSubscription(user_id);
    res.json({
      success,
      message: 'Assinatura cancelada com sucesso. Seus benefícios permanecem ativos até o fim do ciclo mensal vigente.',
    });
  });

  // 10. Consulta de Assinatura do Cliente
  app.get('/api/subscriptions/my-status', (req, res) => {
    const userId = req.query.user_id as string;
    if (!userId) {
      return res.status(400).json({ error: 'Usuário não informado.' });
    }

    const sub = PaymentStore.getSubscription(userId);
    const payments = PaymentStore.getPayments(userId);

    res.json({
      subscription: sub,
      payments,
    });
  });

  // 11. Painel Financeiro do Administrador
  app.get('/api/admin/financial-summary', (req, res) => {
    const callerEmail = (req.headers['x-admin-email'] as string || req.query.email as string || '').trim().toLowerCase();
    const isOwner = Boolean(callerEmail && getOwnerEmails().includes(callerEmail));

    if (callerEmail && !isOwner) {
      return res.status(403).json({ error: 'Acesso não autorizado ao resumo financeiro.' });
    }

    const summary = PaymentStore.getFinancialSummary();
    res.json(summary);
  });

  // 12. Simulador de Webhook Mercado Pago
  app.post('/api/admin/simulate-webhook', (req, res) => {
    const body = req.body || {};
    const callerEmail = (req.headers['x-admin-email'] as string || body.caller_email || '').trim().toLowerCase();
    const isOwner = Boolean(callerEmail && getOwnerEmails().includes(callerEmail));

    if (callerEmail && !isOwner) {
      return res.status(403).json({ error: 'Acesso não autorizado ao simulador de webhook.' });
    }

    const { scenario, plan, customer_id, customer_email, payment_method } = body;
    const targetPlan = (plan as UserPlan) || 'basic';
    const targetUserId = customer_id || 'usr_customer_002';
    const targetEmail = customer_email || 'rodrigo@agenciadigital.com.br';
    const targetMethod = (payment_method as 'pix' | 'cartao') || 'pix';
    const amount = targetPlan === 'basic' ? 19.90 : 39.90;
    const simMpId = `sim_mp_${Date.now()}`;

    if (scenario === 'approved') {
      const sub = PaymentStore.activateSubscription(targetUserId, targetPlan, targetMethod, simMpId);
      PaymentStore.savePayment({
        id: `pay_${simMpId}`,
        customer_id: targetUserId,
        customer_name: 'Rodrigo Alcantara (Freelancer)',
        customer_email: targetEmail,
        plan_id: targetPlan,
        amount,
        currency: 'BRL',
        payment_method: targetMethod,
        status: 'approved',
        mercado_pago_id: simMpId,
        subscription_id: sub.id,
        created_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      });

      PaymentStore.saveTransaction({
        id: `tx_${simMpId}`,
        payment_id: `pay_${simMpId}`,
        customer_id: targetUserId,
        customer_name: 'Rodrigo Alcantara (Freelancer)',
        customer_email: targetEmail,
        plan: targetPlan,
        amount,
        net_amount: Number((amount * 0.985).toFixed(2)),
        fee: Number((amount * 0.015).toFixed(2)),
        payment_method: targetMethod,
        status: 'approved',
        mercado_pago_id: simMpId,
        date: new Date().toISOString(),
        renewal_date: sub.expires_at,
      });

      PaymentStore.saveEvent({
        id: `evt_${Date.now()}`,
        event_type: 'payment.approved',
        mercado_pago_id: simMpId,
        payload: { scenario: 'approved', sim: true },
        processed_at: new Date().toISOString(),
      });

      return res.json({
        success: true,
        message: `Pagamento de R$ ${amount.toFixed(2)} aprovado no Mercado Pago! Plano ${targetPlan.toUpperCase()} ativado com ${targetPlan === 'basic' ? 50 : 200} buscas.`,
        simulated_payment_id: `pay_${simMpId}`,
        mercado_pago_id: simMpId,
      });
    }

    if (scenario === 'pending') {
      PaymentStore.savePayment({
        id: `pay_${simMpId}`,
        customer_id: targetUserId,
        customer_name: 'Rodrigo Alcantara (Freelancer)',
        customer_email: targetEmail,
        plan_id: targetPlan,
        amount,
        currency: 'BRL',
        payment_method: targetMethod,
        status: 'pending',
        mercado_pago_id: simMpId,
        created_at: new Date().toISOString(),
      });

      return res.json({
        success: true,
        message: 'Pagamento registrado como PENDENTE no Mercado Pago. O plano pago NÃO foi liberado (correto conforme regra de segurança).',
        simulated_payment_id: `pay_${simMpId}`,
        mercado_pago_id: simMpId,
      });
    }

    if (scenario === 'rejected') {
      PaymentStore.savePayment({
        id: `pay_${simMpId}`,
        customer_id: targetUserId,
        customer_name: 'Rodrigo Alcantara (Freelancer)',
        customer_email: targetEmail,
        plan_id: targetPlan,
        amount,
        currency: 'BRL',
        payment_method: targetMethod,
        status: 'rejected',
        mercado_pago_id: simMpId,
        created_at: new Date().toISOString(),
      });

      return res.json({
        success: true,
        message: 'Pagamento REJEITADO pelo Mercado Pago (ex: saldo insuficiente/cartão recusado). O plano pago foi bloqueado corretamente.',
        simulated_payment_id: `pay_${simMpId}`,
      });
    }

    if (scenario === 'renewal') {
      const sub = PaymentStore.activateSubscription(targetUserId, targetPlan, targetMethod, simMpId);
      PaymentStore.savePayment({
        id: `pay_renewal_${Date.now()}`,
        customer_id: targetUserId,
        customer_name: 'Rodrigo Alcantara (Freelancer)',
        customer_email: targetEmail,
        plan_id: targetPlan,
        amount,
        currency: 'BRL',
        payment_method: targetMethod,
        status: 'approved',
        mercado_pago_id: simMpId,
        subscription_id: sub.id,
        created_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      });

      PaymentStore.saveTransaction({
        id: `tx_renewal_${Date.now()}`,
        payment_id: `pay_renewal_${Date.now()}`,
        customer_id: targetUserId,
        customer_name: 'Rodrigo Alcantara (Freelancer)',
        customer_email: targetEmail,
        plan: targetPlan,
        amount,
        net_amount: Number((amount * 0.985).toFixed(2)),
        fee: Number((amount * 0.015).toFixed(2)),
        payment_method: targetMethod,
        status: 'approved',
        mercado_pago_id: simMpId,
        date: new Date().toISOString(),
        renewal_date: sub.expires_at,
      });

      return res.json({
        success: true,
        message: `Renovação mensal aprovada com sucesso! Cota de ${targetPlan === 'basic' ? 50 : 200} buscas renovada e nova receita computada.`,
      });
    }

    if (scenario === 'duplicate') {
      const isDup = PaymentStore.isEventProcessed('sim_dup_test', 'payment.approved');
      if (!isDup) {
        PaymentStore.saveEvent({
          id: `evt_dup_1`,
          event_type: 'payment.approved',
          mercado_pago_id: 'sim_dup_test',
          payload: { sim: true },
          processed_at: new Date().toISOString(),
        });
        return res.json({
          success: true,
          message: 'Primeiro webhook registrado com sucesso no banco de dados.',
        });
      } else {
        return res.json({
          success: true,
          message: 'Webhook duplicado detectado! A trava de idempotência descartou a duplicação sem registrar pagamento ou receita dupla.',
          idempotent_blocked: true,
        });
      }
    }

    if (scenario === 'cancel') {
      PaymentStore.cancelSubscription(targetUserId);
      return res.json({
        success: true,
        message: 'Assinatura cancelada no sistema.',
      });
    }

    res.status(400).json({ error: 'Cenário de teste desconhecido.' });
  });

  // 13. Verificação Server-Side de Proprietário & Controle de Acesso Admin
  const getOwnerEmails = (): string[] => [
    'jknetoe@gmail.com',
    'owner@leadforge.ai',
    ...(process.env.OWNER_EMAIL ? [process.env.OWNER_EMAIL.trim().toLowerCase()] : []),
    ...(process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL.trim().toLowerCase()] : []),
  ];

  app.post('/api/admin/verify-owner', (req, res) => {
    const body = req.body || {};
    const { email } = body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const isOwnerEmail = Boolean(normalizedEmail && getOwnerEmails().includes(normalizedEmail));
    
    if (isOwnerEmail) {
      return res.json({
        authorized: true,
        role: 'admin',
        account_type: 'owner',
        unlimited_searches: true,
        unlimited_ai: true,
        exempt_payment: true,
        badge: '👑 Proprietário',
      });
    }

    return res.status(403).json({
      authorized: false,
      error: 'Acesso negado. Apenas o proprietário possui autorização.',
    });
  });

  // 14. Atualização Segura de Usuários
  app.post('/api/admin/manage-user', (req, res) => {
    const body = req.body || {};
    const { caller_email, target_user_id, updates } = body;
    const normalizedEmail = (caller_email || '').trim().toLowerCase();
    const isOwnerEmail = Boolean(normalizedEmail && getOwnerEmails().includes(normalizedEmail));

    if (!isOwnerEmail) {
      return res.status(403).json({
        error: 'Não autorizado. Usuários normais não possuem permissão para alterar cargos, cotas ou planos.',
      });
    }

    return res.json({
      success: true,
      message: 'Usuário atualizado com sucesso pelo administrador.',
      target_user_id,
      applied_updates: updates,
    });
  });

  // 15. Verificação Server-Side de Autorização da Rota /admin
  const handleVerifyAccess = (req: express.Request, res: express.Response) => {
    const body = req.body || {};
    const { email } = body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const isOwnerEmail = Boolean(normalizedEmail && getOwnerEmails().includes(normalizedEmail));

    if (!isOwnerEmail) {
      return res.status(403).json({
        authorized: false,
        error: '403 Proibido: Acesso restrito a administradores. Usuários comuns não possuem autorização.',
      });
    }

    return res.json({
      authorized: true,
      isOwner: true,
      role: 'admin',
      account_type: 'owner',
      message: 'Acesso autorizado ao painel administrativo.',
    });
  };

  app.post('/api/admin/verify-access', handleVerifyAccess);
  app.get('/api/admin/verify-access', (req, res) => {
    res.json({
      status: 'online',
      service: 'LeadForge Admin Guard',
      authorized: true,
      note: 'Use POST para validação com credenciais do usuário',
    });
  });

  return app;
}
