import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Smartphone,
  Calendar,
  AlertCircle,
} from "lucide-react";
import type { Quote } from "@shared/schema";

const statusOptions = [
  { value: "pending", label: "Pendente", color: "bg-yellow-500" },
  { value: "in_progress", label: "Em Andamento", color: "bg-blue-500" },
  { value: "completed", label: "Concluído", color: "bg-green-500" },
  { value: "rejected", label: "Rejeitado", color: "bg-red-500" },
];

export default function AdminQuotes() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
    enabled: isAdmin,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/quotes/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Status atualizado",
        description: "O status do orçamento foi atualizado com sucesso.",
      });
    },
  });

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
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta área.
          </p>
          <Link href="/">
            <Button>Voltar ao Início</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/admin">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-serif text-xl font-bold">Orçamentos</h1>
          <Badge variant="secondary">{quotes.length} total</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum orçamento encontrado.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => {
              const statusInfo = statusOptions.find((s) => s.value === quote.status);
              return (
                <Card
                  key={quote.id}
                  className="p-6 bg-card/80 backdrop-blur border-primary/10"
                  data-testid={`quote-${quote.id}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {quote.firstName} {quote.lastName}
                        </h3>
                        <Badge className={statusInfo?.color}>
                          {statusInfo?.label}
                        </Badge>
                        <Badge variant="outline">
                          {quote.serviceType === "website" ? (
                            <>
                              <Globe className="w-3 h-3 mr-1" />
                              Website
                            </>
                          ) : (
                            <>
                              <Smartphone className="w-3 h-3 mr-1" />
                              Aplicativo
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <a
                          href={`mailto:${quote.email}`}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <Mail className="w-4 h-4" />
                          {quote.email}
                        </a>
                        <a
                          href={`tel:${quote.countryCode}${quote.phone}`}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <Phone className="w-4 h-4" />
                          {quote.countryCode} {quote.phone}
                        </a>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(quote.createdAt!).toLocaleDateString("pt-BR")}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Segmento:</span>{" "}
                          {quote.businessSegment}
                        </p>
                        {quote.additionals && quote.additionals.length > 0 && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Extras:</span>{" "}
                            {quote.additionals.join(", ")}
                          </p>
                        )}
                        {quote.projectDescription && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Descrição:</span>{" "}
                            {quote.projectDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2">
                      <Select
                        value={quote.status}
                        onValueChange={(value) =>
                          updateStatusMutation.mutate({ id: quote.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`https://wa.me/${quote.countryCode.replace("+", "")}${quote.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
