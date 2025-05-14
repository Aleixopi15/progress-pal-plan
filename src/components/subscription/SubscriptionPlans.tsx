
import { useState } from "react";
import { useSubscription } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

// Definição dos planos disponíveis - substitua com seus próprios planos e preços
const plans = [
  {
    id: "basic",
    name: "Básico",
    priceId: "price_1OtwDgGZm0nDPQVgqTNS3Xsd", // Substitua pelo seu priceId do Stripe
    price: "R$ 29,90",
    period: "mês",
    features: [
      "Acesso a recursos básicos",
      "Acesso limitado a conteúdos",
      "Suporte por email"
    ],
  },
  {
    id: "premium",
    name: "Premium",
    priceId: "price_1OtwDgGZm0nDPQVgUfeuWgG3", // Substitua pelo seu priceId do Stripe
    price: "R$ 49,90",
    period: "mês",
    popular: true,
    features: [
      "Acesso completo a recursos",
      "Acesso ilimitado a conteúdos",
      "Suporte prioritário",
      "Recursos exclusivos"
    ],
  }
];

export function SubscriptionPlans() {
  const { createCheckoutSession, subscriptionData, loading } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planId: string) => {
    setProcessingPlan(planId);
    try {
      const url = await createCheckoutSession(priceId);
      if (url) {
        window.location.href = url;
      }
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Planos de Assinatura</h2>
        <p className="text-muted-foreground mt-2">
          Escolha o plano que melhor atende às suas necessidades
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrentPlan = subscriptionData.is_active && plan.id === "premium"; // Lógica simplificada - ajuste conforme necessário
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? "border-primary" : ""}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Mais Popular
                </span>
              )}
              
              {isCurrentPlan && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                  Seu Plano Atual
                </span>
              )}
              
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">/{plan.period}</span>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={isCurrentPlan || loading || processingPlan === plan.id}
                  onClick={() => handleSubscribe(plan.priceId, plan.id)}
                >
                  {processingPlan === plan.id ? (
                    <span className="flex items-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></span>
                      Processando...
                    </span>
                  ) : isCurrentPlan ? (
                    "Plano Atual"
                  ) : (
                    "Assinar Agora"
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
