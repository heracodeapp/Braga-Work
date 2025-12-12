import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, ExternalLink, Play } from "lucide-react";
import type { Project } from "@shared/schema";

const defaultProjects: Project[] = [];

export function PortfolioSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects/active"],
  });

  const activeProjects = projects;

  useEffect(() => {
    if (!isAutoPlaying || activeProjects.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeProjects.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, activeProjects.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % activeProjects.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + activeProjects.length) % activeProjects.length);
  };

  return (
    <section id="projects" className="py-24 relative" data-testid="section-projects">
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-background to-card/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-foreground">Nossos </span>
            <span className="text-gradient-primary">Projetos</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Conheça alguns dos sites e aplicativos que desenvolvemos para nossos clientes.
          </p>
        </div>

        {isLoading ? (
          <div className="max-w-5xl mx-auto">
            <Skeleton className="w-full aspect-[16/9] rounded-xl" />
          </div>
        ) : activeProjects.length === 0 ? (
          <Card className="max-w-2xl mx-auto p-12 text-center bg-card/80 backdrop-blur">
            <p className="text-muted-foreground text-lg">
              Em breve novos projetos aqui.
            </p>
          </Card>
        ) : (
          <div
            className="relative max-w-6xl mx-auto"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div className="mx-12 sm:mx-16 overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {activeProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="min-w-full"
                    data-testid={`slide-${index}`}
                  >
                    <Card className="overflow-hidden bg-card/80 backdrop-blur border-primary/20">
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                          {project.mediaType === "video" ? (
                            <div className="relative w-full h-full">
                              <video
                                src={project.imageUrl || ""}
                                className="w-full h-full object-cover"
                                muted
                                loop
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="w-16 h-16 text-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={project.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop"}
                              alt={project.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          )}
                        </div>

                        <div className="p-8 flex flex-col justify-center">
                          <Badge variant="outline" className="w-fit mb-4 border-primary/30 text-primary">
                            Projeto #{index + 1}
                          </Badge>
                          <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
                            {project.title}
                          </h3>
                          <p className="text-muted-foreground mb-6 line-clamp-3">
                            {project.description || "Projeto desenvolvido com tecnologias modernas e design responsivo."}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            <Badge variant="secondary" className="text-xs">
                              Responsivo
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Moderno
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Otimizado
                            </Badge>
                          </div>
                          {project.projectUrl && (
                            <Button
                              variant="outline"
                              className="w-fit border-primary/30 hover:bg-primary/10"
                              asChild
                              data-testid={`button-view-project-${project.id}`}
                            >
                              <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver Projeto
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {activeProjects.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="default"
                  className="bg-primary shadow-xl z-20"
                  style={{ position: 'absolute', left: '0px', right: 'auto', top: '50%', transform: 'translateY(-50%)' }}
                  onClick={prevSlide}
                  data-testid="button-prev-slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>

                <Button
                  size="icon"
                  variant="default"
                  className="bg-primary shadow-xl z-20"
                  style={{ position: 'absolute', right: '0px', left: 'auto', top: '50%', transform: 'translateY(-50%)' }}
                  onClick={nextSlide}
                  data-testid="button-next-slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>

                <div className="flex justify-center gap-2 mt-6 mx-12 sm:mx-16">
                  {activeProjects.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentSlide === index
                          ? "bg-primary w-8"
                          : "bg-primary/30 hover:bg-primary/50"
                      }`}
                      data-testid={`indicator-${index}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
