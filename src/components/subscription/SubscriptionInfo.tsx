
import { useSubscription } from "@/lib/subscription";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshCw } from "lucide-react";

export function SubscriptionInfo() {
  const { subscriptionData, loading, checkSubscription, createCustomerPortalSession } = useSubscription();

  const handleRefresh = () => {
    checkSubscription();
  };

  const handleManageSubscription = async () => {
    const url = await createCustomerPortalSession();
    if (url) {
      window.open(url, "_blank");
    }
  };

  // Formatar datas
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não disponível";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Status da Assinatura</CardTitle>
            <CardDescription>Informações sobre sua assinatura atual</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <StatusBadge status={subscriptionData.subscription_status} />
        </div>
        
        {subscriptionData.current_period_start && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Início do período atual:</span>
            <span className="text-sm">{formatDate(subscriptionData.current_period_start)}</span>
          </div>
        )}
        
        {subscriptionData.current_period_end && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Fim do período atual:</span>
            <span className="text-sm">{formatDate(subscriptionData.current_period_end)}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {subscriptionData.stripe_customer_id ? (
          <Button className="w-full" onClick={handleManageSubscription}>
            Gerenciar Assinatura
          </Button>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            Nenhuma assinatura ativa
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
