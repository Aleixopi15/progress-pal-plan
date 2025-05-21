
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
    if (!loading && !subscriptionData.is_active) {
      toast({
        title: "Assinatura requerida",
        description: "Você precisa ter uma assinatura ativa para acessar esta área",
        variant: "destructive"
      });
      navigate(redirectTo);
    }
  }, [subscriptionData.is_active, loading, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return subscriptionData.is_active ? <>{children}</> : null;
}
