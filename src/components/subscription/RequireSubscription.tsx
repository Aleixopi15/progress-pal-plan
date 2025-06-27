
import { ReactNode, useEffect } from "react";
import { useSubscription } from "@/lib/subscription";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface RequireSubscriptionProps {
  children: ReactNode;
  redirectTo?: string;
}

export function RequireSubscription({ 
  children, 
  redirectTo = "/settings" 
}: RequireSubscriptionProps) {
  const { subscriptionData, loading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('RequireSubscription - Dados da assinatura:', subscriptionData);
    console.log('RequireSubscription - Carregando:', loading);
    
    // Só redirecionar se não estiver carregando e a assinatura não estiver ativa
    if (!loading && subscriptionData.subscription_status !== "error") {
      if (!subscriptionData.is_active) {
        console.log('RequireSubscription - Redirecionando para configurações devido a assinatura inativa');
        toast({
          title: "Assinatura requerida",
          description: "Você precisa ter uma assinatura ativa para acessar esta área",
          variant: "destructive"
        });
        navigate(redirectTo);
      }
    }
  }, [subscriptionData.is_active, subscriptionData.subscription_status, loading, navigate, redirectTo]);

  console.log('RequireSubscription - Estado atual:', { 
    loading, 
    isActive: subscriptionData.is_active,
    status: subscriptionData.subscription_status 
  });

  // Mostrar loading enquanto verifica a assinatura
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se houver erro, mostrar os filhos mesmo assim (para evitar loops)
  if (subscriptionData.subscription_status === "error") {
    console.log('RequireSubscription - Erro na verificação, permitindo acesso');
    return <>{children}</>;
  }

  // Só renderizar filhos se a assinatura estiver ativa
  return subscriptionData.is_active ? <>{children}</> : null;
}
