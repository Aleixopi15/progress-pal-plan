
import { useState, useEffect } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/subscription/StatusBadge";
import { useSubscription } from "@/lib/subscription";
import { RequireSubscription } from "@/components/subscription/RequireSubscription";

interface SubscriptionHistoryItem {
  id: string;
  status: "active" | "past_due" | "canceled" | "inactive" | "error";
  stripe_subscription_id: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}

export default function History() {
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { subscriptionData } = useSubscription();

  // Carregar o histórico de assinaturas
  useEffect(() => {
    const fetchSubscriptionHistory = async () => {
      try {
        const { data, error } = await supabase
          .from("subscription_history")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setHistory(data || []);
      } catch (error) {
        console.error("Erro ao carregar histórico de assinaturas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionHistory();
  }, []);

  // Formatar data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não disponível";
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <RequireSubscription>
      <div className="animate-fade-in">
        <PageTitle 
          title="Histórico de Assinatura" 
          subtitle="Acompanhe o histórico da sua assinatura"
        />
        
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Status atual da assinatura</h2>
          <div className="flex items-center space-x-2 mb-6">
            <StatusBadge status={subscriptionData.subscription_status} />
            {subscriptionData.current_period_end && (
              <span className="text-sm text-muted-foreground">
                Válida até: {formatDate(subscriptionData.current_period_end)}
              </span>
            )}
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Histórico de transações</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>ID da assinatura</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Período de validade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.created_at)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.stripe_subscription_id}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        {item.current_period_start && item.current_period_end
                          ? `${formatDate(item.current_period_start)} até ${formatDate(item.current_period_end)}`
                          : "Não disponível"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum histórico de assinatura encontrado
            </div>
          )}
        </Card>
      </div>
    </RequireSubscription>
  );
}
