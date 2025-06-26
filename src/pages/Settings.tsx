
import { useState, useEffect } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Target, Trophy, CreditCard, Clock, HelpCircle } from "lucide-react";
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
  meta_horas_diarias: number;
  meta_questoes_diarias: number;
  meta_questoes_semanais: number;
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
    meta_horas_diarias: 6,
    meta_questoes_diarias: 50,
    meta_questoes_semanais: 350,
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
          meta_horas_diarias: data.meta_horas_diarias || 6,
          meta_questoes_diarias: data.meta_questoes_diarias || 50,
          meta_questoes_semanais: data.meta_questoes_semanais || 350,
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
        const { error } = await supabase
          .from('user_settings')
          .update({
            data_prova: settings.data_prova || null,
            vestibular_pretendido: settings.vestibular_pretendido || null,
            meta_horas_semanais: settings.meta_horas_semanais,
            meta_horas_diarias: settings.meta_horas_diarias,
            meta_questoes_diarias: settings.meta_questoes_diarias,
            meta_questoes_semanais: settings.meta_questoes_semanais,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user?.id,
            data_prova: settings.data_prova || null,
            vestibular_pretendido: settings.vestibular_pretendido || null,
            meta_horas_semanais: settings.meta_horas_semanais,
            meta_horas_diarias: settings.meta_horas_diarias,
            meta_questoes_diarias: settings.meta_questoes_diarias,
            meta_questoes_semanais: settings.meta_questoes_semanais,
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
      <div className="animate-fade-in p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-4 md:p-6 max-w-4xl mx-auto">
      <PageTitle 
        title="Configurações" 
        subtitle="Gerencie suas metas e configurações de estudo" 
      />
      
      <Tabs defaultValue="study" className="mt-8 w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="study">Configurações de Estudo</TabsTrigger>
          <TabsTrigger value="account">Gerenciamento de Conta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="study" className="space-y-6 mt-6">
          <div className="grid gap-6">
            {/* Informações do Exame */}
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
            </div>

            {/* Metas de Estudo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Metas de Estudo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horas de Estudo
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="meta_horas_diarias">Meta diária (horas)</Label>
                        <Input
                          id="meta_horas_diarias"
                          type="number"
                          min="1"
                          max="24"
                          value={settings.meta_horas_diarias}
                          onChange={(e) => handleInputChange('meta_horas_diarias', parseInt(e.target.value) || 6)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="meta_horas_semanais">Meta semanal (horas)</Label>
                        <Input
                          id="meta_horas_semanais"
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
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Questões
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="meta_questoes_diarias">Meta diária (questões)</Label>
                        <Input
                          id="meta_questoes_diarias"
                          type="number"
                          min="1"
                          max="200"
                          value={settings.meta_questoes_diarias}
                          onChange={(e) => handleInputChange('meta_questoes_diarias', parseInt(e.target.value) || 50)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="meta_questoes_semanais">Meta semanal (questões)</Label>
                        <Input
                          id="meta_questoes_semanais"
                          type="number"
                          min="1"
                          max="1000"
                          value={settings.meta_questoes_semanais}
                          onChange={(e) => handleInputChange('meta_questoes_semanais', parseInt(e.target.value) || 350)}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Aproximadamente {Math.round(settings.meta_questoes_semanais / 7)} questões por dia
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button onClick={saveSettings} disabled={saving} className="w-full">
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6 mt-6">
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
