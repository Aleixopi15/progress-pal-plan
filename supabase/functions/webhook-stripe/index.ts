
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  try {
    // Verificar se a solicitação é HTTP POST
    if (req.method !== "POST") {
      return new Response("Método não permitido", { status: 405 });
    }

    // Obter o corpo da requisição e a assinatura do Stripe
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Assinatura do Stripe não encontrada", { status: 400 });
    }

    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Verificar evento do Stripe usando a assinatura
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
    } catch (err) {
      console.error(`Erro na assinatura do webhook: ${err.message}`);
      return new Response(`Erro na assinatura do webhook: ${err.message}`, { status: 400 });
    }

    // Inicializar cliente Supabase com service role key para bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Processar eventos diferentes
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer;
        
        if (!customerId) {
          throw new Error("ID do cliente não encontrado na sessão");
        }

        // Buscar cliente do Stripe para obter metadados
        const customer = await stripe.customers.retrieve(customerId as string);
        
        if (!customer || customer.deleted) {
          throw new Error("Cliente não encontrado ou excluído");
        }

        // Tentar obter o supabase_user_id dos metadados
        let userId = customer.metadata?.supabase_user_id;
        
        // Se não encontrado nos metadados, buscar por email
        if (!userId && customer.email) {
          const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
          const matchingUser = userData.users.find(u => u.email === customer.email);
          
          if (matchingUser) {
            userId = matchingUser.id;
          } else {
            // Criar novo usuário se não existir
            const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
              email: customer.email,
              email_confirm: true,
              user_metadata: { from_stripe: true }
            });
            
            if (createUserError) {
              throw new Error(`Erro ao criar usuário: ${createUserError.message}`);
            }
            
            userId = newUser.user.id;
          }
        }

        if (!userId) {
          throw new Error("Não foi possível identificar ou criar o usuário");
        }

        // Atualizar ou criar registro na tabela user_subscriptions
        await supabaseAdmin.from("user_subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          subscription_status: "active",
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });

        console.log(`Assinatura criada/atualizada para o usuário ${userId}`);
        
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status;
        
        // Buscar usuário associado ao cliente Stripe
        const { data: userSub, error: userSubError } = await supabaseAdmin
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userSubError || !userSub) {
          throw new Error(`Usuário não encontrado para o cliente Stripe ${customerId}`);
        }

        // Mapear status do Stripe para status da aplicação
        let subscriptionStatus = "inactive";
        if (status === "active" || status === "trialing") {
          subscriptionStatus = "active";
        } else if (status === "past_due" || status === "unpaid") {
          subscriptionStatus = "past_due";
        } else if (status === "canceled") {
          subscriptionStatus = "canceled";
        }

        // Atualizar status da assinatura
        await supabaseAdmin
          .from("user_subscriptions")
          .update({ 
            subscription_status: subscriptionStatus,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userSub.user_id);

        // Registrar no histórico de assinaturas
        await supabaseAdmin.from("subscription_history").insert({
          user_id: userSub.user_id,
          stripe_subscription_id: subscription.id,
          price_id: subscription.items?.data[0]?.price?.id,
          status: subscriptionStatus,
          current_period_start: subscription.current_period_start ? 
            new Date(subscription.current_period_start * 1000).toISOString() : null,
          current_period_end: subscription.current_period_end ? 
            new Date(subscription.current_period_end * 1000).toISOString() : null
        });

        console.log(`Assinatura ${subscription.id} atualizada para o status ${subscriptionStatus}`);
        
        break;
      }

      default:
        console.log(`Evento não processado: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Erro no webhook: ${error.message}`);
    return new Response(`Erro no webhook: ${error.message}`, { status: 500 });
  }
});
