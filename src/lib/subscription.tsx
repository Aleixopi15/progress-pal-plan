
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Tipos para dados de assinatura
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "inactive" | "error";

export interface SubscriptionData {
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  is_active: boolean;
}

// Estado inicial da assinatura
const initialSubscriptionData: SubscriptionData = {
  subscription_status: "inactive",
  stripe_customer_id: null,
  current_period_start: null,
  current_period_end: null,
  is_active: false,
};

// Contexto para gerenciamento de assinaturas
type SubscriptionContextType = {
  subscriptionData: SubscriptionData;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckoutSession: (priceId: string) => Promise<string | null>;
  createCustomerPortalSession: () => Promise<string | null>;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>(initialSubscriptionData);
  const [loading, setLoading] = useState<boolean>(true);

  // Verificar status da assinatura
  const checkSubscription = async () => {
    if (!user || !session) {
      console.log('checkSubscription - Sem usuário ou sessão, resetando para estado inicial');
      setSubscriptionData(initialSubscriptionData);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('checkSubscription - Chamando função check-subscription para usuário:', user.id);
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Erro ao verificar assinatura:", error);
        // Em caso de erro, assumir que não tem assinatura ativa para não bloquear o usuário
        setSubscriptionData({ ...initialSubscriptionData, subscription_status: "inactive" });
        return;
      }

      console.log('checkSubscription - Resposta da função:', data);

      if (data && typeof data === 'object') {
        const subscriptionInfo = data as SubscriptionData;
        
        // Validar e garantir tipos corretos
        const validatedData: SubscriptionData = {
          subscription_status: subscriptionInfo.subscription_status || "inactive",
          stripe_customer_id: subscriptionInfo.stripe_customer_id || null,
          current_period_start: subscriptionInfo.current_period_start || null,
          current_period_end: subscriptionInfo.current_period_end || null,
          is_active: Boolean(subscriptionInfo.is_active)
        };
        
        console.log('checkSubscription - Definindo dados validados da assinatura:', validatedData);
        setSubscriptionData(validatedData);
      } else {
        console.log('checkSubscription - Dados inválidos retornados, usando estado inicial');
        setSubscriptionData(initialSubscriptionData);
      }
    } catch (error) {
      console.error("Erro ao verificar assinatura:", error);
      // Em caso de erro, não bloquear o usuário
      setSubscriptionData({ ...initialSubscriptionData, subscription_status: "inactive" });
    } finally {
      setLoading(false);
    }
  };

  // Criar sessão de checkout do Stripe
  const createCheckoutSession = async (priceId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId }
      });

      if (error) {
        throw error;
      }

      return data?.url || null;
    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível iniciar o processo de pagamento. Tente novamente mais tarde."
      });
      return null;
    }
  };

  // Criar sessão do portal do cliente do Stripe
  const createCustomerPortalSession = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) {
        throw error;
      }

      return data?.url || null;
    } catch (error) {
      console.error("Erro ao criar sessão do portal:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível acessar o portal de gerenciamento. Tente novamente mais tarde."
      });
      return null;
    }
  };

  // Verificar assinatura ao carregar o componente e quando o usuário mudar
  useEffect(() => {
    console.log('SubscriptionProvider useEffect - Usuario mudou:', user?.id);
    if (user && session) {
      checkSubscription();
    } else {
      console.log('SubscriptionProvider - Sem usuário/sessão, resetando dados');
      setSubscriptionData(initialSubscriptionData);
      setLoading(false);
    }
  }, [user, session]);

  console.log('SubscriptionProvider - Estado atual:', { 
    subscriptionData, 
    loading, 
    userExists: !!user,
    sessionExists: !!session 
  });

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionData,
        loading,
        checkSubscription,
        createCheckoutSession,
        createCustomerPortalSession,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription deve ser usado dentro de um SubscriptionProvider");
  }
  return context;
}
