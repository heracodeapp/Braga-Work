import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Chatbot } from "@/components/chatbot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ParticlesBackground } from "@/components/particles-background";
import { CreditCard, Lock, ShieldCheck, Check } from "lucide-react";

interface PaymentCodeInfo {
  id: number;
  code: string;
  amount: string;
  description: string | null;
}

export default function PaymentCodePage() {
  const [step, setStep] = useState<"code" | "details" | "success">("code");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [codeInfo, setCodeInfo] = useState<PaymentCodeInfo | null>(null);
  const { toast } = useToast();

  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/payment-codes/verify", {
        code,
      });
      return response.json();
    },
    onSuccess: (data: PaymentCodeInfo) => {
      setCodeInfo(data);
      setStep("details");
    },
    onError: () => {
      toast({
        title: "Código inválido",
        description: "Verifique o código e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: async (data: { code: string; name: string; email: string }) => {
      const response = await apiRequest(
        "POST",
        "/api/payment-codes/process",
        data,
      );
      return response.json();
    },
    onSuccess: (data: { checkoutUrl?: string }) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setStep("success");
      }
    },
    onError: () => {
      toast({
        title: "Erro ao processar pagamento",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      toast({
        title: "Código inválido",
        description: "O código deve ter 6 dígitos.",
        variant: "destructive",
      });
      return;
    }
    verifyCodeMutation.mutate(code);
  };

  const handleProcessPayment = () => {
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Email inválido",
        description: "Verifique o email e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    processPaymentMutation.mutate({ code, name, email });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-background to-background" />
        <ParticlesBackground particleCount={30} />

        <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {step === "code" && (
            <Card
              className="p-8 bg-card/80 backdrop-blur border-primary/20"
              data-testid="card-code"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 glow-primary">
                  <CreditCard className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="font-serif text-2xl font-bold mb-2">
                  Pagamento por Código
                </h1>
                <p className="text-muted-foreground">
                  Insira o código de 6 dígitos fornecido pela BragaWork.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de Pagamento</Label>
                  <Input
                    id="code"
                    placeholder="000000"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    maxLength={6}
                    data-testid="input-code"
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  onClick={handleVerifyCode}
                  disabled={verifyCodeMutation.isPending || code.length !== 6}
                  data-testid="button-verify"
                >
                  {verifyCodeMutation.isPending
                    ? "Verificando..."
                    : "Verificar Código"}
                </Button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Pagamento seguro via Stripe</span>
              </div>
            </Card>
          )}

          {step === "details" && codeInfo && (
            <Card
              className="p-8 bg-card/80 backdrop-blur border-primary/20"
              data-testid="card-details"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 glow-primary">
                  <ShieldCheck className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="font-serif text-2xl font-bold mb-2">
                  Código Válido
                </h2>
                <p className="text-muted-foreground">
                  Preencha seus dados para continuar.
                </p>
              </div>

              <Card className="p-4 bg-primary/5 border-primary/20 mb-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Valor a pagar
                  </p>
                  <p className="text-3xl font-bold text-gradient-primary">
                    €{codeInfo.amount}
                  </p>
                  {codeInfo.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {codeInfo.description}
                    </p>
                  )}
                </div>
              </Card>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  onClick={handleProcessPayment}
                  disabled={processPaymentMutation.isPending}
                  data-testid="button-pay"
                >
                  {processPaymentMutation.isPending
                    ? "Processando..."
                    : `Pagar €${codeInfo.amount}`}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep("code");
                    setCode("");
                    setCodeInfo(null);
                  }}
                >
                  Usar outro código
                </Button>
              </div>
            </Card>
          )}

          {step === "success" && (
            <Card
              className="p-8 bg-card/80 backdrop-blur border-primary/20 text-center"
              data-testid="card-success"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-6 glow-primary">
                <Check className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-4">
                <span className="text-gradient-primary">
                  Pagamento Realizado!
                </span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Seu pagamento foi processado com sucesso. Você receberá um email
                de confirmação em breve.
              </p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Voltar ao Início
              </Button>
            </Card>
          )}
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
}
