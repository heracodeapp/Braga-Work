import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ParticlesBackground } from "@/components/particles-background";
import { CheckCircle, Home, ArrowRight } from "lucide-react";

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocation("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-background to-background" />
        <ParticlesBackground particleCount={40} />

        <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Card className="p-8 bg-card/80 backdrop-blur border-primary/20 text-center" data-testid="card-success">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>

            <h1 className="font-serif text-3xl font-bold mb-4">
              <span className="text-gradient-primary">Pagamento Confirmado!</span>
            </h1>

            <p className="text-muted-foreground text-lg mb-6">
              Seu pagamento foi processado com sucesso. Obrigado por escolher a BragaWork!
            </p>

            <div className="bg-primary/5 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Você receberá um email de confirmação com todos os detalhes do seu pagamento.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-primary to-secondary"
                onClick={() => setLocation("/")}
                data-testid="button-home"
              >
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>

              <p className="text-xs text-muted-foreground">
                Redirecionando automaticamente em {countdown} segundos...
              </p>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
