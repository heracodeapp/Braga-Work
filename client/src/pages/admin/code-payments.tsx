import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, AlertCircle, Receipt, Download, FileText, Calendar, User, Mail } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PaymentCode } from "@shared/schema";

export default function AdminCodePayments() {
  const { isAdmin, isLoading: authLoading } = useAuth();

  const { data: payments = [], isLoading } = useQuery<PaymentCode[]>({
    queryKey: ["/api/admin/payment-codes/used"],
    enabled: isAdmin,
  });

  const exportToPDF = (payment: PaymentCode) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Comprovante de Pagamento", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`, 20, 35);
    
    const data = [
      ["Código", payment.code],
      ["Nome do Cliente", payment.usedByName || "N/A"],
      ["Email", payment.usedByEmail || "N/A"],
      ["Valor Pago", `€${payment.amount}`],
      ["Descrição", payment.description || "Pagamento BragaWork"],
      ["Data do Pagamento", payment.usedAt 
        ? new Date(payment.usedAt).toLocaleDateString("pt-BR") 
        : "N/A"],
      ["ID Stripe", payment.stripePaymentId || "N/A"],
    ];

    autoTable(doc, {
      startY: 45,
      head: [["Campo", "Valor"]],
      body: data,
      theme: "striped",
    });

    doc.setFontSize(10);
    doc.text("Este documento é um comprovante de pagamento válido.", 20, doc.internal.pageSize.height - 20);

    doc.save(`pagamento-${payment.code}-${payment.usedByName || "cliente"}.pdf`);
  };

  const exportAllToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Relatório de Pagamentos por Código", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 35);
    doc.text(`Total de Pagamentos: ${payments.length}`, 20, 45);
    
    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    doc.text(`Valor Total: €${totalAmount.toFixed(2)}`, 20, 55);

    const data = payments.map((p) => [
      p.code,
      p.usedByName || "N/A",
      p.usedByEmail || "N/A",
      `€${p.amount}`,
      p.usedAt ? new Date(p.usedAt).toLocaleDateString("pt-BR") : "N/A",
    ]);

    autoTable(doc, {
      startY: 65,
      head: [["Código", "Cliente", "Email", "Valor", "Data"]],
      body: data,
      theme: "striped",
    });

    doc.save(`pagamentos-codigo-${new Date().toISOString().split("T")[0]}.pdf`);
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

  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

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
            <h1 className="font-serif text-xl font-bold">Pagamentos por Código</h1>
            <Badge variant="secondary">{payments.length} pagamentos</Badge>
            <Badge className="bg-green-500">€{totalAmount.toFixed(2)} total</Badge>
          </div>
          {payments.length > 0 && (
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
        ) : payments.length === 0 ? (
          <Card className="p-8 text-center">
            <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum pagamento por código encontrado.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payments.map((payment) => (
              <Card
                key={payment.id}
                className="p-6 bg-card/80 backdrop-blur border-primary/10 relative"
                data-testid={`payment-${payment.id}`}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => exportToPDF(payment)}
                  data-testid={`button-export-${payment.id}`}
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <div className="pr-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-mono font-bold text-primary">
                      {payment.code}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gradient-primary mb-3">
                    €{payment.amount}
                  </p>
                  {payment.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {payment.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-foreground">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{payment.usedByName || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{payment.usedByEmail || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {payment.usedAt 
                          ? new Date(payment.usedAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </span>
                    </div>
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
