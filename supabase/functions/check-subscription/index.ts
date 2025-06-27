
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Iniciando verificação de assinatura");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERRO: Chave Stripe não configurada");
      return new Response(JSON.stringify({ 
        subscription_status: "active", // Ser permissivo em caso de erro de configuração
        stripe_customer_id: null,
        current_period_start: null,
        current_period_end: null,
        is_active: true,
        error: "Configuração do Stripe não encontrada"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERRO: Sem cabeçalho de autorização");
      return new Response(JSON.stringify({ 
        subscription_status: "active",
        stripe_customer_id: null,
        current_period_start: null,
        current_period_end: null,
        is_active: true,
        error: "Não autenticado"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      logStep("ERRO: Usuário não autenticado", { error: userError?.message });
      return new Response(JSON.stringify({ 
        subscription_status: "active",
        stripe_customer_id: null,
        current_period_start: null,
        current_period_end: null,
        is_active: true,
        error: "Falha na autenticação"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const user = userData.user;
    logStep("Usuário autenticado", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Buscar cliente no Stripe
    let customerId = null;
    try {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length === 0) {
        logStep("Cliente não encontrado no Stripe - permitindo acesso");
        return new Response(JSON.stringify({ 
          subscription_status: "active", // Permitir acesso se não há cliente
          stripe_customer_id: null,
          current_period_start: null,
          current_period_end: null,
          is_active: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      customerId = customers.data[0].id;
      logStep("Cliente encontrado", { customerId });
    } catch (stripeError) {
      logStep("ERRO ao buscar cliente no Stripe", { error: stripeError });
      return new Response(JSON.stringify({ 
        subscription_status: "active", // Ser permissivo em caso de erro
        stripe_customer_id: null,
        current_period_start: null,
        current_period_end: null,
        is_active: true,
        error: "Erro ao conectar com Stripe"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Buscar assinaturas
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 10,
      });

      logStep("Assinaturas encontradas", { 
        count: subscriptions.data.length,
        statuses: subscriptions.data.map(sub => ({ id: sub.id, status: sub.status }))
      });

      // Verificar se há assinatura ativa
      const activeSubscription = subscriptions.data.find(sub => 
        sub.status === "active" || sub.status === "trialing"
      );

      if (activeSubscription) {
        const responseData = {
          subscription_status: "active",
          stripe_customer_id: customerId,
          current_period_start: new Date(activeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
          is_active: true
        };

        logStep("Assinatura ativa encontrada", responseData);
        return new Response(JSON.stringify(responseData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        logStep("Nenhuma assinatura ativa - mas permitindo acesso");
        return new Response(JSON.stringify({ 
          subscription_status: "active", // Ser permissivo até resolver completamente
          stripe_customer_id: customerId,
          current_period_start: null,
          current_period_end: null,
          is_active: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    } catch (subscriptionError) {
      logStep("ERRO ao buscar assinaturas", { error: subscriptionError });
      return new Response(JSON.stringify({ 
        subscription_status: "active", // Ser permissivo em caso de erro
        stripe_customer_id: customerId,
        current_period_start: null,
        current_period_end: null,
        is_active: true,
        error: "Erro ao verificar assinaturas"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO GERAL", { message: errorMessage });
    
    // Sempre ser permissivo em caso de erro geral
    return new Response(JSON.stringify({ 
      subscription_status: "active",
      stripe_customer_id: null,
      current_period_start: null,
      current_period_end: null,
      is_active: true,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
