
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper para logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Usar service role key para atualizações no banco
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Função iniciada");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não configurada");
    logStep("Chave Stripe verificada");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Cabeçalho de autorização não fornecido");
    logStep("Cabeçalho de autorização encontrado");

    const token = authHeader.replace("Bearer ", "");
    logStep("Autenticando usuário com token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Erro de autenticação: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("Usuário não autenticado ou email não disponível");
    logStep("Usuário autenticado", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("Nenhum cliente encontrado, atualizando estado não assinado");
      
      // Atualizar ou criar registro na tabela user_subscriptions
      await supabaseClient.from("user_subscriptions").upsert({
        user_id: user.id,
        subscription_status: "inactive",
        is_active: false,
        stripe_customer_id: null,
        current_period_start: null,
        current_period_end: null,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
      
      return new Response(JSON.stringify({ 
        subscription_status: "inactive",
        stripe_customer_id: null,
        current_period_start: null,
        current_period_end: null,
        is_active: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Cliente Stripe encontrado", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    // Verificar se há assinatura ativa
    const hasActiveSub = subscriptions.data.length > 0;
    let subscription = null;
    let subscriptionStatus = "inactive";
    let currentPeriodStart = null;
    let currentPeriodEnd = null;
    
    if (hasActiveSub) {
      subscription = subscriptions.data[0];
      subscriptionStatus = "active";
      currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
      currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      logStep("Assinatura ativa encontrada", { 
        subscriptionId: subscription.id, 
        endDate: currentPeriodEnd
      });
    } else {
      // Verificar se existe uma assinatura cancelada
      const canceledSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "canceled",
        limit: 1,
      });
      
      if (canceledSubscriptions.data.length > 0) {
        subscriptionStatus = "canceled";
        logStep("Assinatura cancelada encontrada");
      }
    }
    
    // Atualizar registro na tabela user_subscriptions - GARANTINDO que is_active seja definido corretamente
    const updateData = {
      user_id: user.id,
      stripe_customer_id: customerId,
      subscription_status: subscriptionStatus,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      is_active: hasActiveSub, // IMPORTANTE: Definir explicitamente is_active
      updated_at: new Date().toISOString()
    };

    logStep("Dados para atualização", updateData);

    const { error: upsertError } = await supabaseClient
      .from("user_subscriptions")
      .upsert(updateData, { onConflict: "user_id" });

    if (upsertError) {
      logStep("Erro ao atualizar banco de dados", { error: upsertError });
      throw new Error(`Erro ao atualizar banco: ${upsertError.message}`);
    }

    logStep("Banco de dados atualizado com informações da assinatura", { 
      subscribed: hasActiveSub, 
      status: subscriptionStatus
    });
    
    const responseData = {
      subscription_status: subscriptionStatus,
      stripe_customer_id: customerId,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      is_active: hasActiveSub
    };

    logStep("Resposta final", responseData);
    
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO em check-subscription", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      subscription_status: "error",
      is_active: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
