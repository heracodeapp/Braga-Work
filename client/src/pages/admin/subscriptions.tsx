import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Calendar, AlertCircle, CreditCard, Download, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Subscription, User } from "@shared/schema";

type SubscriptionWithUser = Subscription & { user?: User };

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  past_due: "bg-yellow-500",
  canceled: "bg-red-500",
  unpaid: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  active: "Ativa",
  past_due: "Atrasada",
  canceled: "Cancelada",
  unpaid: "Não Paga",
};

const planLabels: Record<string, string> = {
  site_maintenance: "Manutenção Site",
  app_maintenance: "Manutenção App",
  site: "Manutenção Site",
  app: "Manutenção App",
};

export default function AdminSubscriptions() {
  const { isAdmin, isLoading: authLoading } = useAuth();

  const { data: subscriptions = [], isLoading } = useQuery<SubscriptionWithUser[]>({
    queryKey: ["/api/admin/subscriptions"],
    enabled: isAdmin,
  });

  const exportToPDF = (subscription: SubscriptionWithUser) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Relatório de Assinatura", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 35);
    
    const data = [
      ["Cliente", subscription.user?.displayName || "N/A"],
      ["Email", subscription.user?.email || "N/A"],
      ["Plano", planLabels[subscription.planType] || subscription.planType],
      ["Valor Mensal", `€${subscription.amount}`],
      ["Status", statusLabels[subscription.status] || subscription.status],
      ["Início do Período", subscription.currentPeriodStart 
        ? new Date(subscription.currentPeriodStart).toLocaleDateString("pt-BR") 
        : "N/A"],
      ["Fim do Período", subscription.currentPeriodEnd 
        ? new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR") 
        : "N/A"],
      ["ID Stripe", subscription.stripeSubscriptionId || "N/A"],
      ["Data de Criação", subscription.createdAt 
        ? new Date(subscription.createdAt).toLocaleDateString("pt-BR") 
        : "N/A"],
    ];

    autoTable(doc, {
      startY: 45,
      head: [["Campo", "Valor"]],
      body: data,
      theme: "striped",
    });

    doc.save(`assinatura-${subscription.id}-${subscription.user?.email || "cliente"}.pdf`);
  };

  const exportAllToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Relatório de Assinaturas", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 35);
    doc.text(`Total de Assinaturas: ${subscriptions.length}`, 20, 45);

    const data = subscriptions.map((sub) => [
      sub.user?.displayName || "N/A",
      sub.user?.email || "N/A",
      planLabels[sub.planType] || sub.planType,
      `€${sub.amount}`,
      statusLabels[sub.status] || sub.status,
      sub.createdAt ? new Date(sub.createdAt).toLocaleDateString("pt-BR") : "N/A",
    ]);

    autoTable(doc, {
      startY: 55,
      head: [["Cliente", "Email", "Plano", "Valor", "Status", "Criação"]],
      body: data,
      theme: "striped",
    });

    doc.save(`assinaturas-${new Date().toISOString().split("T")[0]}.pdf`);
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

  const activeCount = subscriptions.filter((s) => s.status === "active").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/admin">
              <Button size="icon" variant="ghost">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-serif text-xl font-bold">Assinaturas</h1>
            <Badge variant="secondary">{subscriptions.length} total</Badge>
            <Badge className="bg-green-500">{activeCount} ativas</Badge>
          </div>
          {subscriptions.length > 0 && (
            <Button onClick={exportAllToPDF} variant="outline" data-testid="button-export-all">
              <Download className="w-4 h-4 mr-2" />
              Exportar Todos
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <Card className="p-8 text-center">
            <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma assinatura encontrada.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <Card
                key={subscription.id}
                className="p-6 bg-card/80 backdrop-blur border-primary/10 relative"
                data-testid={`subscription-${subscription.id}`}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => exportToPDF(subscription)}
                  data-testid={`button-export-${subscription.id}`}
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pr-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold">
                        {planLabels[subscription.planType] || subscription.planType}
                      </h3>
                      <Badge className={statusColors[subscription.status]}>
                        {statusLabels[subscription.status]}
                      </Badge>
                    </div>
                    <p className="text-xl font-bold text-gradient-primary mb-2">
                      €{subscription.amount}/mês
                    </p>
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <p><strong>Cliente:</strong> {subscription.user?.displayName || "N/A"}</p>
                      <p><strong>Email:</strong> {subscription.user?.email || "N/A"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Início: {subscription.currentPeriodStart
                          ? new Date(subscription.currentPeriodStart).toLocaleDateString("pt-BR")
                          : "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Próximo: {subscription.currentPeriodEnd
                          ? new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>ID: {subscription.stripeSubscriptionId?.slice(0, 20)}...</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
