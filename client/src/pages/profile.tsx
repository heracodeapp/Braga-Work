import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Quote, Subscription, Review, Payment } from "@shared/schema";
import {
  User,
  FileText,
  CreditCard,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Receipt,
  Calendar,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading: authLoading, isAuthenticated, login } = useAuth();

  const { data: quotes, isLoading: quotesLoading } = useQuery<Quote[]>({
    queryKey: ["/api/profile/quotes"],
    enabled: isAuthenticated,
  });

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/profile/subscriptions"],
    enabled: isAuthenticated,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/profile/reviews"],
    enabled: isAuthenticated,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/profile/payments"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold mb-2">Faça Login</h1>
          <p className="text-muted-foreground mb-6">
            Entre com sua conta Google para ver seu perfil.
          </p>
          <Button onClick={login} data-testid="button-login">
            Entrar com Google
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Clock className="w-3 h-3 mr-1" />Em Andamento</Badge>;
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Concluído</Badge>;
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Ativa</Badge>;
      case "past_due":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><AlertCircle className="w-3 h-3 mr-1" />Atrasada</Badge>;
      case "canceled":
        return <Badge variant="destructive">Cancelada</Badge>;
      case "succeeded":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanName = (planType: string) => {
    switch (planType) {
      case "site_maintenance":
        return "Manutenção de Site";
      case "app_maintenance":
        return "Manutenção de App";
      default:
        return planType;
    }
  };

  const getServiceName = (serviceType: string) => {
    return serviceType === "website" ? "Website" : "Aplicativo";
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="font-serif text-xl font-bold">Meu Perfil</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName} />
              <AvatarFallback className="text-2xl">
                {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-2xl font-bold truncate" data-testid="text-username">
                {user?.displayName}
              </h2>
              <p className="text-muted-foreground truncate" data-testid="text-email">
                {user?.email}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Membro desde {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-xl font-semibold">Minhas Assinaturas</h3>
            </div>
            {subscriptionsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : subscriptions && subscriptions.length > 0 ? (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <Card key={sub.id} className="p-4" data-testid={`card-subscription-${sub.id}`}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-medium">{getPlanName(sub.planType)}</p>
                        <p className="text-sm text-muted-foreground">
                          Próximo pagamento: {formatDate(sub.currentPeriodEnd)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-primary">
                          {Number(sub.amount).toFixed(2)}
                        </span>
                        {getStatusBadge(sub.status)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Você ainda não tem assinaturas.</p>
                <Link href="/maintenance">
                  <Button variant="outline" data-testid="link-maintenance">
                    Ver Planos de Manutenção
                  </Button>
                </Link>
              </Card>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-xl font-semibold">Meus Orçamentos</h3>
            </div>
            {quotesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : quotes && quotes.length > 0 ? (
              <div className="space-y-3">
                {quotes.map((quote) => (
                  <Card key={quote.id} className="p-4" data-testid={`card-quote-${quote.id}`}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-medium">{getServiceName(quote.serviceType)} - {quote.businessSegment}</p>
                        <p className="text-sm text-muted-foreground">
                          Solicitado em {formatDate(quote.createdAt)}
                        </p>
                      </div>
                      {getStatusBadge(quote.status)}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Você ainda não pediu orçamentos.</p>
                <Link href="/quote">
                  <Button variant="outline" data-testid="link-quote">
                    Solicitar Orçamento
                  </Button>
                </Link>
              </Card>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-xl font-semibold">Meus Pagamentos</h3>
            </div>
            {paymentsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : payments && payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <Card key={payment.id} className="p-4" data-testid={`card-payment-${payment.id}`}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-medium">{payment.paymentType}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {payment.currency} {Number(payment.amount).toFixed(2)}
                        </span>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum pagamento registrado.</p>
              </Card>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-xl font-semibold">Minhas Avaliações</h3>
            </div>
            {reviewsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4" data-testid={`card-review-${review.id}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-accent fill-accent"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-muted-foreground ml-2">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                      <Badge variant={review.isApproved ? "default" : "secondary"}>
                        {review.isApproved ? "Aprovada" : "Pendente"}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Você ainda não deixou avaliações.</p>
              </Card>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
