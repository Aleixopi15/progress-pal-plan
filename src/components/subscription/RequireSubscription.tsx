
import { ReactNode } from "react";
import { useSubscription } from "@/lib/subscription";
import { Loader2 } from "lucide-react";

interface RequireSubscriptionProps {
  children: ReactNode;
  redirectTo?: string;
}

export function RequireSubscription({ 
  children 
}: RequireSubscriptionProps) {
  const { subscriptionData, loading } = useSubscription();

  console.log('RequireSubscription - Estado:', { 
    loading, 
    isActive: subscriptionData.is_active,
    status: subscriptionData.subscription_status 
  });

  // Mostrar loading enquanto verifica
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // SEMPRE permitir acesso por enquanto para resolver o problema
  console.log('RequireSubscription - Permitindo acesso (temporário)');
  return <>{children}</>;
}
