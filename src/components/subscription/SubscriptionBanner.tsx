
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/lib/subscription";
import { Button } from "../ui/button";
import { Check, ChevronRight } from "lucide-react";

export function SubscriptionBanner() {
  const navigate = useNavigate();
  const { subscriptionData, loading } = useSubscription();

  // Don't show banner for users with active subscription
  if (loading || subscriptionData.is_active) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Desbloqueie todos os recursos</h3>
          <p className="text-muted-foreground">
            Assine o plano premium para ter acesso completo às funcionalidades exclusivas.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Cronograma personalizado</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Acesso ilimitado</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Suporte prioritário</span>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate("/settings")} className="whitespace-nowrap">
          Assinar agora <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
