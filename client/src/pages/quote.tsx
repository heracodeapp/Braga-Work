import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { QuoteForm } from "@/components/quote-form";
import { Chatbot } from "@/components/chatbot";
import { ParticlesBackground } from "@/components/particles-background";

export default function QuotePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-12 relative">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-background to-background" />
        <ParticlesBackground particleCount={30} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-foreground">Solicite um </span>
              <span className="text-gradient-primary">Orçamento</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Preencha o formulário abaixo e receba uma proposta personalizada em até 24 horas.
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
