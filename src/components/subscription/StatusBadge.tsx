
import { SubscriptionStatus } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

interface StatusBadgeProps {
  status: SubscriptionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "active":
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-1 h-3 w-3" />
          Ativa
        </Badge>
      );
    case "past_due":
      return (
        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Pagamento Pendente
        </Badge>
      );
    case "canceled":
      return (
        <Badge variant="default" className="bg-red-600 hover:bg-red-700">
          <XCircle className="mr-1 h-3 w-3" />
          Cancelada
        </Badge>
      );
    case "inactive":
      return (
        <Badge variant="default" className="bg-gray-500 hover:bg-gray-600">
          <Clock className="mr-1 h-3 w-3" />
          Inativa
        </Badge>
      );
    case "error":
    default:
      return (
        <Badge variant="default" className="bg-red-600 hover:bg-red-700">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Erro
        </Badge>
      );
  }
}
