
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    // Criar cliente Supabase para leitura de dados
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verificar autenticação do usuário
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Erro de autenticação: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("Usuário não autenticado");

    // Criar cliente admin para leitura segura bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Buscar informações de assinatura
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("subscription_status, stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (subError && subError.code !== "PGRST116") {
      throw new Error(`Erro ao buscar assinatura: ${subError.message}`);
    }

    // Buscar informações do histórico de assinatura mais recente
    const { data: history } = await supabaseAdmin
      .from("subscription_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Preparar resposta
    const response = {
      subscription_status: subscription?.subscription_status || "inactive",
      stripe_customer_id: subscription?.stripe_customer_id || null,
      current_period_start: history?.current_period_start || null,
      current_period_end: history?.current_period_end || null,
      is_active: subscription?.subscription_status === "active"
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      subscription_status: "error",
      is_active: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
