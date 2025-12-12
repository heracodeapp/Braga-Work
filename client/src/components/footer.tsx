import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";
import { SiWhatsapp, SiInstagram, SiTiktok } from "react-icons/si";
import logoImage from "@assets/logo-braga-work_1765492800121.jpg";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-primary/20" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src={logoImage} 
                alt="BragaWork Logo" 
                className="h-10 w-auto rounded-lg"
              />
            </div>
            <p className="text-muted-foreground text-sm">
              Desenvolvendo o futuro digital do seu negócio com tecnologia e criatividade.
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/351927512038"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                data-testid="link-whatsapp"
              >
                <SiWhatsapp className="w-4 h-4 text-primary" />
              </a>
              <a
                href="https://instagram.com/braga.work"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                data-testid="link-instagram"
              >
                <SiInstagram className="w-4 h-4 text-primary" />
              </a>
              <a
                href="https://www.tiktok.com/@braga.work_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                data-testid="link-tiktok"
              >
                <SiTiktok className="w-4 h-4 text-primary" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-serif font-semibold text-lg">Serviços</h4>
            <ul className="space-y-2">
              <li>
                <a href="/#services" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Desenvolvimento Web
                </a>
              </li>
              <li>
                <a href="/#services" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Aplicativos Mobile
                </a>
              </li>
              <li>
                <a href="/#services" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Design Responsivo
                </a>
              </li>
              <li>
                <Link href="/maintenance" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Manutenção
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-serif font-semibold text-lg">Links Úteis</h4>
            <ul className="space-y-2">
              <li>
                <a href="/#projects" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Portfólio
                </a>
              </li>
              <li>
                <Link href="/quote" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Solicitar Orçamento
                </Link>
              </li>
              <li>
                <Link href="/payment-code" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Pagamento por Código
                </Link>
              </li>
              <li>
                <a href="/#reviews" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Avaliações
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-serif font-semibold text-lg">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:bragawork01@gmail.com" className="hover:text-primary transition-colors">
                  bragawork01@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+351927512038" className="hover:text-primary transition-colors">
                  +351 927 512 038
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Portugal</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {currentYear} BragaWork. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Política de Privacidade
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
