import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-md text-center bg-card/80 backdrop-blur border-primary/20">
        <div className="text-8xl font-bold text-gradient-primary font-serif mb-4">
          404
        </div>
        <h1 className="font-serif text-2xl font-bold mb-2">
          Página Não Encontrada
        </h1>
        <p className="text-muted-foreground mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Link href="/">
            <Button className="bg-gradient-to-r from-primary to-secondary">
              <Home className="w-4 h-4 mr-2" />
              Ir para o Início
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
