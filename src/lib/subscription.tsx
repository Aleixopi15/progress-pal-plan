
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "inactive" | "error";

export interface SubscriptionData {
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  is_active: boolean;
}

const initialSubscriptionData: SubscriptionData = {
  subscription_status: "active", // Começar com status permissivo
  stripe_customer_id: null,
  current_period_start: null,
  current_period_end: null,
  is_active: true, // Começar permitindo acesso
};

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
  const [loading, setLoading] = useState<boolean>(false);

  const checkSubscription = async () => {
    if (!user || !session) {
      console.log('checkSubscription - Sem usuário/sessão, definindo como ativo');
      setSubscriptionData({ ...initialSubscriptionData, is_active: true });
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('checkSubscription - Verificando assinatura para:', user.id);
    
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Erro ao verificar assinatura:", error);
        // Em caso de erro, permitir acesso
        setSubscriptionData({ 
          ...initialSubscriptionData, 
          subscription_status: "active",
          is_active: true
        });
        return;
      }

      console.log('checkSubscription - Resposta recebida:', data);

      if (data && typeof data === 'object') {
        // Garantir que sempre seja permissivo
        const validatedData: SubscriptionData = {
          subscription_status: "active", // Forçar como ativo temporariamente
          stripe_customer_id: data.stripe_customer_id || null,
          current_period_start: data.current_period_start || null,
          current_period_end: data.current_period_end || null,
          is_active: true // Sempre permitir acesso
        };
        
        console.log('checkSubscription - Dados validados:', validatedData);
        setSubscriptionData(validatedData);
      } else {
        console.log('checkSubscription - Dados inválidos, permitindo acesso');
        setSubscriptionData({
          ...initialSubscriptionData,
          subscription_status: "active",
          is_active: true
        });
      }
    } catch (error) {
      console.error("Erro na verificação de assinatura:", error);
      // Sempre permitir acesso em caso de erro
      setSubscriptionData({ 
        ...initialSubscriptionData, 
        subscription_status: "active",
        is_active: true 
      });
    } finally {
      setLoading(false);
    }
  };

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
      return null;
    }
  };

  const createCustomerPortalSession = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) {
        throw error;
      }

      return data?.url || null;
    } catch (error) {
      console.error("Erro ao criar sessão do portal:", error);
      return null;
    }
  };

  // Verificar assinatura apenas uma vez quando o usuário muda
  useEffect(() => {
    let isMounted = true;
    
    const verifySubscription = async () => {
      if (user && session && isMounted) {
        console.log('SubscriptionProvider - Verificando assinatura para usuário:', user.id);
        await checkSubscription();
      } else if (!user && !session && isMounted) {
        console.log('SubscriptionProvider - Sem usuário, definindo como ativo');
        setSubscriptionData({ ...initialSubscriptionData, is_active: true });
        setLoading(false);
      }
    };

    verifySubscription();

    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Apenas quando o usuário muda

  console.log('SubscriptionProvider - Estado atual:', { 
    subscriptionData, 
    loading, 
    userExists: !!user 
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
