
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  BarChart2, 
  Calendar, 
  Target, 
  CheckCircle,
  LogIn
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/lib/subscription";

const HomePage = () => {
  const { user } = useAuth();
  const { subscriptionData } = useSubscription();
  const navigate = useNavigate();
  
  // Redirecionar para o dashboard se o usuário já estiver logado e tiver assinatura ativa
  React.useEffect(() => {
    if (user && subscriptionData.is_active) {
      navigate("/dashboard");
    }
  }, [user, subscriptionData.is_active, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center">
          <span className="font-bold text-primary text-xl">StudyPlan</span>
        </div>
        <div className="ml-auto flex gap-4">
          <Link to="/auth">
            <Button variant="outline">
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Button>
          </Link>
          <Link to="/auth?tab=register">
            <Button>Começar agora</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Organize seus estudos com eficiência
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Uma plataforma completa para planejar, monitorar e otimizar 
                seu tempo de estudo, alcançando melhores resultados.
              </p>
              <div className="flex gap-4">
                <Link to="/auth?tab=register">
                  <Button size="lg">Começar agora</Button>
                </Link>
                <Button size="lg" variant="outline">
                  Saiba mais
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=600" 
                alt="Estudante usando computador" 
                className="rounded-lg shadow-lg max-w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Funcionalidades principais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cronograma flexível</h3>
              <p className="text-muted-foreground">
                Organize suas sessões de estudo com um calendário personalizável 
                que se adapta à sua rotina.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Definição de metas</h3>
              <p className="text-muted-foreground">
                Estabeleça objetivos claros e acompanhe seu progresso com 
                métricas personalizadas.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Análise de progresso</h3>
              <p className="text-muted-foreground">
                Visualize seu desempenho com gráficos e estatísticas detalhadas 
                sobre seu tempo de estudo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 md:px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Plano de Assinatura
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Escolha o plano que melhor se adapta às suas necessidades e comece a melhorar seus estudos hoje mesmo.
          </p>
          
          <div className="max-w-md mx-auto bg-card border border-primary rounded-lg overflow-hidden shadow-lg">
            <div className="bg-primary p-4">
              <h3 className="text-xl font-bold text-primary-foreground text-center">Plano Premium</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-center items-baseline mb-4">
                <span className="text-3xl font-bold">R$ 49,90</span>
                <span className="text-muted-foreground ml-1">/mês</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Acesso completo a recursos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Acesso ilimitado a conteúdos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Suporte prioritário</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Recursos exclusivos</span>
                </li>
              </ul>
              
              <Link to="/auth?tab=register">
                <Button className="w-full" size="lg">
                  Assinar Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Por que escolher StudyPlan?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-secondary/10 rounded-full">
                <CheckCircle className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Aumente seu foco</h3>
                <p className="text-muted-foreground">
                  Com sessões de estudo organizadas, elimine distrações e 
                  mantenha-se concentrado nos seus objetivos.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-secondary/10 rounded-full">
                <CheckCircle className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Melhore sua retenção</h3>
                <p className="text-muted-foreground">
                  Técnicas de estudo eficientes que ajudam a memorizar 
                  e compreender melhor o conteúdo.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-secondary/10 rounded-full">
                <CheckCircle className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Reduza a procrastinação</h3>
                <p className="text-muted-foreground">
                  Com metas claras e acompanhamento de progresso, 
                  mantenha-se motivado e evite adiar seus estudos.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-secondary/10 rounded-full">
                <CheckCircle className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Equilibre sua vida</h3>
                <p className="text-muted-foreground">
                  Encontre o equilíbrio perfeito entre estudos, lazer e 
                  descanso para maximizar seus resultados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6 bg-primary text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6">
            Pronto para transformar seus estudos?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Comece agora mesmo a organizar seu tempo de estudo e alcance 
            resultados extraordinários com o StudyPlan.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary">
              Criar uma conta gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="font-bold text-primary text-lg">StudyPlan</span>
              <p className="text-sm text-muted-foreground mt-1">
                © {new Date().getFullYear()} StudyPlan. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Termos de Uso
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Política de Privacidade
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
