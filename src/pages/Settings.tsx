
import { useState, useEffect } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Target, Trophy, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/lib/subscription";
import { SubscriptionInfo } from "@/components/subscription/SubscriptionInfo";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";

interface UserSettings {
  data_prova: string;
  vestibular_pretendido: string;
  meta_horas_semanais: number;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscriptionData, loading: subscriptionLoading } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    data_prova: "",
    vestibular_pretendido: "",
    meta_horas_semanais: 40,
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          data_prova: data.data_prova || "",
          vestibular_pretendido: data.vestibular_pretendido || "",
          meta_horas_semanais: data.meta_horas_semanais || 40,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar suas configurações."
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('user_settings')
          .update({
            data_prova: settings.data_prova || null,
            vestibular_pretendido: settings.vestibular_pretendido || null,
            meta_horas_semanais: settings.meta_horas_semanais,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user?.id,
            data_prova: settings.data_prova || null,
            vestibular_pretendido: settings.vestibular_pretendido || null,
            meta_horas_semanais: settings.meta_horas_semanais,
          });

        if (error) throw error;
      }

      toast({
        title: "Configurações salvas!",
        description: "Suas configurações foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar configurações",
        description: "Não foi possível salvar suas configurações."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserSettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateDaysUntilExam = () => {
    if (!settings.data_prova) return null;
    
    const examDate = new Date(settings.data_prova);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const daysUntilExam = calculateDaysUntilExam();

  if (subscriptionLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageTitle 
        title="Configurações" 
        subtitle="Gerencie suas metas e configurações de estudo" 
      />
      
      <Tabs defaultValue="study" className="mt-8">
        <TabsList>
          <TabsTrigger value="study">Configurações de Estudo</TabsTrigger>
          <TabsTrigger value="account">Gerenciamento de Conta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="study" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Data da Prova
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="data_prova">Data da prova</Label>
                  <Input
                    id="data_prova"
                    type="date"
                    value={settings.data_prova}
                    onChange={(e) => handleInputChange('data_prova', e.target.value)}
                  />
                </div>
                {daysUntilExam !== null && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium">
                      Faltam <span className="text-primary font-bold">{daysUntilExam} dias</span> para sua prova
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Vestibular
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="vestibular">Vestibular pretendido</Label>
                  <Input
                    id="vestibular"
                    placeholder="Ex: ENEM, Fuvest, Unicamp..."
                    value={settings.vestibular_pretendido}
                    onChange={(e) => handleInputChange('vestibular_pretendido', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Meta de Estudos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_horas">Meta de horas semanais de estudo</Label>
                  <Input
                    id="meta_horas"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.meta_horas_semanais}
                    onChange={(e) => handleInputChange('meta_horas_semanais', parseInt(e.target.value) || 40)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Aproximadamente {Math.round(settings.meta_horas_semanais / 7)} horas por dia
                  </p>
                </div>
                
                <Button onClick={saveSettings} disabled={saving} className="w-full">
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SubscriptionInfo />
              </CardContent>
            </Card>
            
            {!subscriptionData.is_active && (
              <Card>
                <CardHeader>
                  <CardTitle>Planos Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <SubscriptionPlans />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
