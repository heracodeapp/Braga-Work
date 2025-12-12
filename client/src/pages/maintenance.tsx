import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Chatbot } from "@/components/chatbot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { ParticlesBackground } from "@/components/particles-background";
import {
  Check,
  Globe,
  Smartphone,
  Shield,
  Zap,
  Headphones,
  RefreshCw,
  Star,
  Loader2,
} from "lucide-react";

const plans = [
  {
    id: "site",
    title: "Manutenção Site",
    price: "15",
    period: "/mês",
    icon: Globe,
    popular: false,
    features: [
      "Atualizações de segurança",
      "Correção de bugs",
      "Backup semanal",
      "Suporte por email e WhatsApp",
      "Pequenas alterações de conteúdo",
      "Monitoramento de uptime",
    ],
  },
  {
    id: "app",
    title: "Manutenção App",
    price: "20",
    period: "/mês",
    icon: Smartphone,
    popular: true,
    features: [
      "Tudo do plano Site",
      "Atualizações nas lojas (App Store / Play Store)",
      "Monitoramento de performance",
      "Suporte prioritário",
      "Correções urgentes em 24h",
      "Relatórios mensais de uso",
    ],
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Segurança",
    description: "Atualizações regulares para proteger seu projeto.",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Otimização contínua para máxima velocidade.",
  },
  {
    icon: Headphones,
    title: "Suporte 24/7",
    description: "Equipe disponível para resolver qualquer problema.",
  },
  {
    icon: RefreshCw,
    title: "Atualizações",
    description: "Seu projeto sempre atualizado com as últimas tecnologias.",
  },
];

export default function MaintenancePage() {
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para assinar um plano.",
      });
      login();
      return;
    }
    
    setLoadingPlan(planId);
    
    try {
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planType: planId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar assinatura");
      }
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("URL de checkout não recebida");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar assinatura. Tente novamente.",
        variant: "destructive",
      });
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 relative">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-background to-background" />
        <ParticlesBackground particleCount={30} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Star className="w-3 h-3 mr-1" /> Planos Mensais
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-foreground">Planos de </span>
              <span className="text-gradient-primary">Manutenção</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Mantenha seu site ou aplicativo sempre atualizado, seguro e funcionando perfeitamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-8 bg-card/80 backdrop-blur border-primary/20 ${
                  plan.popular ? "ring-2 ring-primary" : ""
                }`}
                data-testid={`plan-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <plan.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2">{plan.title}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gradient-primary">€{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-primary to-secondary"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loadingPlan !== null}
                  data-testid={`button-subscribe-${plan.id}`}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Assinar Plano"
                  )}
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">
              <span className="text-foreground">Por Que Ter </span>
              <span className="text-gradient-primary">Manutenção?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card
                key={benefit.title}
                className="p-6 bg-card/80 backdrop-blur border-primary/10 text-center"
                data-testid={`benefit-${index}`}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
}
