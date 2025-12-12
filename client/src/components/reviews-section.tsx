import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Star, Quote, PenLine } from "lucide-react";
import type { Review, User } from "@shared/schema";

interface ReviewWithUser extends Review {
  user?: User;
}

const defaultReviews: ReviewWithUser[] = [
  {
    id: 1,
    userId: 1,
    rating: 5,
    comment: "Excelente trabalho! A equipe da BragaWork superou todas as expectativas. O site ficou incrível e moderno.",
    isApproved: true,
    createdAt: new Date(),
    user: { id: 1, googleId: null, email: "cliente@email.com", username: "joao", displayName: "João Silva", avatarUrl: null, isAdmin: false, createdAt: new Date() },
  },
  {
    id: 2,
    userId: 2,
    rating: 5,
    comment: "Profissionais competentes e atenciosos. Entregaram o projeto no prazo e com qualidade impecável.",
    isApproved: true,
    createdAt: new Date(),
    user: { id: 2, googleId: null, email: "maria@email.com", username: "maria", displayName: "Maria Santos", avatarUrl: null, isAdmin: false, createdAt: new Date() },
  },
  {
    id: 3,
    userId: 3,
    rating: 4,
    comment: "Muito satisfeito com o resultado. O suporte pós-entrega foi muito bom e ajudou a resolver todas as dúvidas.",
    isApproved: true,
    createdAt: new Date(),
    user: { id: 3, googleId: null, email: "pedro@email.com", username: "pedro", displayName: "Pedro Costa", avatarUrl: null, isAdmin: false, createdAt: new Date() },
  },
];

export function ReviewsSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const { user, isAuthenticated, login } = useAuth();
  const { toast } = useToast();

  const { data: reviews = defaultReviews, isLoading } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/reviews/approved"],
  });

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;

  const createReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      return apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/approved"] });
      setIsDialogOpen(false);
      setRating(0);
      setComment("");
      toast({
        title: "Avaliação enviada!",
        description: "Sua avaliação será analisada e publicada em breve.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao enviar avaliação",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast({
        title: "Selecione uma nota",
        description: "Clique nas estrelas para avaliar.",
        variant: "destructive",
      });
      return;
    }
    if (comment.length < 10) {
      toast({
        title: "Comentário muito curto",
        description: "Escreva pelo menos 10 caracteres.",
        variant: "destructive",
      });
      return;
    }
    createReviewMutation.mutate({ rating, comment });
  };

  const averageRating = displayReviews.length > 0
    ? displayReviews.reduce((acc, r) => acc + r.rating, 0) / displayReviews.length
    : 5;

  return (
    <section id="reviews" className="py-24 relative" data-testid="section-reviews">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-foreground">O Que Dizem </span>
            <span className="text-gradient-primary">Nossos Clientes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A satisfação dos nossos clientes é nossa maior recompensa.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 text-center">
            <div className="text-5xl font-bold text-gradient-primary font-serif mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? "text-accent fill-accent"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              Baseado em {displayReviews.length} avaliações
            </p>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-primary-hover"
                onClick={() => {
                  if (!isAuthenticated) {
                    login();
                    return;
                  }
                  setIsDialogOpen(true);
                }}
                data-testid="button-write-review"
              >
                <PenLine className="w-5 h-5 mr-2" />
                Escrever Avaliação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">Deixe sua avaliação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique nas estrelas para avaliar
                  </p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                        data-testid={`star-${star}`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating)
                              ? "text-accent fill-accent"
                              : "text-muted"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  placeholder="Conte-nos sobre sua experiência..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                  data-testid="textarea-review"
                />

                <div className="text-right text-xs text-muted-foreground">
                  {comment.length}/500 caracteres
                </div>

                <Button
                  onClick={handleSubmitReview}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  disabled={createReviewMutation.isPending}
                  data-testid="button-submit-review"
                >
                  {createReviewMutation.isPending ? "Enviando..." : "Enviar Avaliação"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayReviews.map((review, index) => (
              <Card
                key={review.id}
                className="p-6 bg-card/80 backdrop-blur border-primary/10 hover:border-primary/30 transition-all"
                data-testid={`review-${index}`}
              >
                <Quote className="w-8 h-8 text-primary/20 mb-4" />

                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "text-accent fill-accent"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-muted-foreground mb-4 line-clamp-4 italic">
                  "{review.comment}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-primary/10">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={review.user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {review.user?.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {review.user?.displayName || "Cliente"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cliente verificado
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
