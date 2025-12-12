import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ParticlesBackground } from "./particles-background";
import { Rocket, Eye, ChevronDown, Code2, Zap, Sparkles } from "lucide-react";

export function HeroSection() {
  const scrollToProjects = () => {
    const element = document.getElementById("projects");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToQuote = () => {
    const element = document.getElementById("quote-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      data-testid="section-hero"
    >
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-background to-background" />
      <div className="absolute inset-0 bg-tech-grid bg-grid opacity-20" />
      
      <ParticlesBackground particleCount={60} interactive />

      <div className="hidden sm:block absolute top-20 left-10 opacity-20 animate-float" style={{ animationDelay: "0s" }}>
        <Code2 className="w-12 md:w-16 h-12 md:h-16 text-primary" />
      </div>
      <div className="hidden sm:block absolute top-40 right-20 opacity-20 animate-float" style={{ animationDelay: "2s" }}>
        <Zap className="w-10 md:w-12 h-10 md:h-12 text-secondary" />
      </div>
      <div className="hidden sm:block absolute bottom-40 left-20 opacity-20 animate-float" style={{ animationDelay: "4s" }}>
        <Sparkles className="w-12 md:w-14 h-12 md:h-14 text-primary" />
      </div>

      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-primary/10 font-mono text-sm animate-slide-up" style={{ animationDelay: "0.5s" }}>
          console.log('Hello World');
        </div>
        <div className="absolute top-1/3 right-1/4 text-secondary/10 font-mono text-sm animate-slide-up" style={{ animationDelay: "1s" }}>
          function createWebsite() {'{'}
        </div>
        <div className="absolute top-1/2 left-1/3 text-primary/10 font-mono text-sm animate-slide-up" style={{ animationDelay: "1.5s" }}>
          return 'Amazing Site';
        </div>
        <div className="absolute bottom-1/3 right-1/3 text-secondary/10 font-mono text-sm animate-slide-up" style={{ animationDelay: "2s" }}>
          {'}'}
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Transformamos ideias em realidade digital
            </span>
          </div>
        </div>

        <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <span className="text-foreground">Desenvolvemos </span>
          <span className="text-gradient-primary">Sites</span>
          <br />
          <span className="text-foreground">Para o Seu </span>
          <span className="text-gradient-primary">Negócio</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Transformamos suas ideias em soluções digitais modernas e funcionais
          que impulsionam o crescimento do seu negócio.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Link href="/quote">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-primary-hover text-lg px-8"
              data-testid="button-hero-quote"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Solicitar Orçamento
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToProjects}
            className="border-primary/30 hover:bg-primary/10 text-lg px-8"
            data-testid="button-hero-projects"
          >
            <Eye className="w-5 h-5 mr-2" />
            Ver Projetos
          </Button>
        </div>

        <div className="mt-10 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
          {[
            { number: "50+", label: "Projetos Entregues" },
            { number: "100%", label: "Clientes Satisfeitos" },
            { number: "24/7", label: "Suporte Disponível" },
            { number: "5", label: "Anos de Experiência" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="p-3 sm:p-4 rounded-lg bg-card/50 backdrop-blur border border-primary/10 hover:border-primary/30 transition-all"
            >
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary font-serif">
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <button
          onClick={() => {
            const element = document.getElementById("services");
            if (element) element.scrollIntoView({ behavior: "smooth" });
          }}
          className="p-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
          data-testid="button-scroll-down"
        >
          <ChevronDown className="w-6 h-6 text-primary" />
        </button>
      </div>
    </section>
  );
}
