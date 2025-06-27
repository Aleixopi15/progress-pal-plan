
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
    
    // Só redirecionar se não estiver carregando e explicitamente inativo
    if (!loading) {
      // Só bloquear se status for explicitamente "inactive" e is_active for false
      // Em caso de erro ou dados indefinidos, permitir acesso
      if (subscriptionData.subscription_status === "inactive" && subscriptionData.is_active === false) {
        console.log('RequireSubscription - Redirecionando para configurações devido a assinatura inativa');
        toast({
          title: "Assinatura requerida",
          description: "Você precisa ter uma assinatura ativa para acessar esta área",
          variant: "destructive"
        });
        navigate(redirectTo);
      }
    }
  }, [subscriptionData, loading, navigate, redirectTo]);

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

  // Permitir acesso se:
  // 1. Status é "active" ou "error" 
  // 2. is_active é true
  // 3. Em caso de dúvida, permitir acesso (ser permissivo)
  const shouldAllowAccess = 
    subscriptionData.subscription_status === "active" ||
    subscriptionData.subscription_status === "error" ||
    subscriptionData.is_active === true ||
    // Se não temos dados definidos, permitir acesso
    !subscriptionData.subscription_status;

  if (shouldAllowAccess) {
    console.log('RequireSubscription - Permitindo acesso');
    return <>{children}</>;
  }

  // Só bloquear se definitivamente inativo
  console.log('RequireSubscription - Bloqueando acesso');
  return null;
}
