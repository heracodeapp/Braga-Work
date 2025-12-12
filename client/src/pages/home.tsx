import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { PortfolioSection } from "@/components/portfolio-section";
import { ReviewsSection } from "@/components/reviews-section";
import { Chatbot } from "@/components/chatbot";
import { QuoteForm } from "@/components/quote-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <PortfolioSection />
      <ReviewsSection />
      
      <section id="quote-section" className="py-24 relative" data-testid="section-quote">
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-background to-card/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-foreground">Solicite um </span>
              <span className="text-gradient-primary">Orçamento</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Preencha o formulário abaixo e receba uma proposta personalizada para seu projeto.
            </p>
          </div>
          <QuoteForm />
        </div>
      </section>
      
      <Footer />
      <Chatbot />
    </div>
  );
}
