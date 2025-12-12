import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  Plus,
  Copy,
  Check,
  AlertCircle,
  Calendar,
  Trash2,
} from "lucide-react";
import type { PaymentCode } from "@shared/schema";

export default function AdminPaymentCodes() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: codes = [], isLoading } = useQuery<PaymentCode[]>({
    queryKey: ["/api/payment-codes"],
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { amount: string; description: string }) => {
      return apiRequest("POST", "/api/payment-codes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-codes"] });
      setIsDialogOpen(false);
      setAmount("");
      setDescription("");
      toast({ title: "Código criado com sucesso!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/payment-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-codes"] });
      toast({ title: "Código apagado com sucesso!" });
    },
  });

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: "Código copiado!" });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold mb-2">Acesso Negado</h1>
          <Link href="/">
            <Button>Voltar ao Início</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const unusedCodes = codes.filter((c) => !c.isUsed);
  const usedCodes = codes.filter((c) => c.isUsed);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button size="icon" variant="ghost">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-serif text-xl font-bold">Códigos de Pagamento</h1>
            <Badge variant="secondary">{codes.length} total</Badge>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Novo Código
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Código de Pagamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (EUR) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Pagamento final website"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate({ amount, description })}
                  disabled={createMutation.isPending || !amount}
                >
                  {createMutation.isPending ? "Criando..." : "Criar Código"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div>
              <h2 className="font-semibold text-lg mb-4">Códigos Disponíveis</h2>
              {unusedCodes.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum código disponível.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unusedCodes.map((code) => (
                    <Card
                      key={code.id}
                      className="p-6 bg-card/80 backdrop-blur border-primary/10 relative"
                      data-testid={`code-${code.id}`}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMutation.mutate(code.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-code-${code.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="flex items-start justify-between gap-4 pr-8">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-mono font-bold text-primary">
                              {code.code}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => copyCode(code.code)}
                            >
                              {copiedCode === code.code ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xl font-semibold text-gradient-primary">
                            €{code.amount}
                          </p>
                          {code.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {code.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-green-500 border-green-500">
                          Disponível
                        </Badge>
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Criado em {new Date(code.createdAt!).toLocaleDateString("pt-BR")}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {usedCodes.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-4">Códigos Utilizados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usedCodes.map((code) => (
                    <Card
                      key={code.id}
                      className="p-6 bg-muted/50 border-border"
                      data-testid={`code-used-${code.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-2xl font-mono font-bold text-muted-foreground">
                            {code.code}
                          </span>
                          <p className="text-xl font-semibold text-muted-foreground">
                            €{code.amount}
                          </p>
                          {code.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {code.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">Utilizado</Badge>
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground space-y-1">
                        <p>Por: {code.usedByName}</p>
                        <p>{code.usedByEmail}</p>
                        {code.usedAt && (
                          <p>Em: {new Date(code.usedAt).toLocaleDateString("pt-BR")}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
