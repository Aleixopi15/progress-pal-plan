
import { PageTitle } from "@/components/layout/PageTitle";
import { SubscriptionInfo } from "@/components/subscription/SubscriptionInfo";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubscription } from "@/lib/subscription";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { subscriptionData, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const SettingsContent = () => (
    <div className="animate-fade-in">
      <PageTitle title="Configurações" subtitle="Gerencie sua conta e assinatura" />
      
      <Tabs defaultValue="subscription" className="mt-8">
        <TabsList>
          <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="col-span-1">
              <SubscriptionInfo />
            </div>
            <div className="col-span-2">
              <SubscriptionPlans />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="account">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-center text-xl font-semibold">
              Configurações da Conta em Construção
            </h2>
            <p className="mt-2 text-center text-muted-foreground">
              Esta funcionalidade estará disponível em breve.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Se o usuário tem assinatura ativa, usar o DashboardLayout
  if (subscriptionData.is_active) {
    return (
      <DashboardLayout>
        <SettingsContent />
      </DashboardLayout>
    );
  }

  // Se não tem assinatura ativa, mostrar sem o layout do dashboard
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col">
        <main className="flex-1 px-4 py-6 md:px-6">
          <SettingsContent />
        </main>
      </div>
    </div>
  );
}
