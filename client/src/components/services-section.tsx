import { Card } from "@/components/ui/card";
import {
  Smartphone,
  Monitor,
  Palette,
  Search,
  Headphones,
  Rocket,
  FileCode2,
  CheckCircle2,
  Clock,
  Users,
  Shield,
  Zap,
} from "lucide-react";

const services = [
  {
    icon: Monitor,
    title: "Desenvolvimento Web",
    description: "Sites modernos e responsivos que funcionam perfeitamente em todos os dispositivos.",
  },
  {
    icon: Smartphone,
    title: "Aplicativos Mobile",
    description: "Apps nativos e híbridos para iOS e Android com design intuitivo.",
  },
  {
    icon: Palette,
    title: "Design UI/UX",
    description: "Interfaces elegantes e experiências de usuário que convertem visitantes em clientes.",
  },
  {
    icon: Search,
    title: "SEO Otimizado",
    description: "Melhor posicionamento nos resultados de busca para aumentar sua visibilidade.",
  },
  {
    icon: Rocket,
    title: "Performance",
    description: "Carregamento rápido e otimizado para melhor experiência do usuário.",
  },
  {
    icon: Headphones,
    title: "Suporte Contínuo",
    description: "Manutenção e suporte técnico para manter seu projeto sempre atualizado.",
  },
];

const processSteps = [
  {
    number: "01",
    icon: Users,
    title: "Planejamento",
    description: "Reunião para entender suas necessidades e definir escopo do projeto.",
    duration: "1-2 dias",
  },
  {
    number: "02",
    icon: FileCode2,
    title: "Desenvolvimento",
    description: "Criação do design e programação com as melhores tecnologias.",
    duration: "2-4 semanas",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Entrega",
    description: "Testes finais, revisões e lançamento do seu projeto.",
    duration: "1-3 dias",
  },
  {
    number: "04",
    icon: Shield,
    title: "Suporte",
    description: "Manutenção contínua e suporte técnico para seu projeto.",
    duration: "Contínuo",
  },
];

const differentials = [
  {
    icon: Zap,
    title: "Entrega Rápida",
    description: "Projetos entregues no prazo sem comprometer a qualidade.",
  },
  {
    icon: Shield,
    title: "Código Limpo",
    description: "Código organizado e documentado para fácil manutenção.",
  },
  {
    icon: Headphones,
    title: "Suporte 24/7",
    description: "Equipe disponível para ajudar quando você precisar.",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 relative" data-testid="section-services">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-foreground">O Que </span>
            <span className="text-gradient-primary">Fazemos</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Especializados em criar experiências digitais únicas que transformam negócios.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className="group p-6 bg-card/80 backdrop-blur border-primary/10 hover:border-primary/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid={`card-service-${index}`}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif font-semibold text-xl mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm">{service.description}</p>
            </Card>
          ))}
        </div>

        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-foreground">Nosso </span>
              <span className="text-gradient-primary">Processo</span>
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Um processo transparente e eficiente do início ao fim.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="relative"
                  data-testid={`step-${index}`}
                >
                  <Card className="p-6 bg-card/80 backdrop-blur border-primary/10 hover:border-primary/30 transition-all h-full">
                    <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {step.number}
                    </div>
                    <div className="mt-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-serif font-semibold text-lg mb-2">{step.title}</h4>
                      <p className="text-muted-foreground text-sm mb-3">{step.description}</p>
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <Clock className="w-3 h-3" />
                        <span>{step.duration}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h3 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-foreground">Por Que </span>
            <span className="text-gradient-primary">Escolher-nos</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {differentials.map((diff, index) => (
            <Card
              key={diff.title}
              className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10 hover:border-primary/30 transition-all text-center"
              data-testid={`diff-${index}`}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 glow-primary">
                <diff.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h4 className="font-serif font-semibold text-xl mb-2">{diff.title}</h4>
              <p className="text-muted-foreground text-sm">{diff.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
