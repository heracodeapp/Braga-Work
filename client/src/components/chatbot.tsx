import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  options?: ChatOption[];
}

interface ChatOption {
  id: string;
  label: string;
  action: string;
}

const menuOptions: ChatOption[] = [
  { id: "services", label: "Nossos Serviços", action: "services" },
  { id: "quote", label: "Solicitar Orçamento", action: "quote" },
  { id: "maintenance", label: "Manutenção", action: "maintenance" },
  { id: "payment", label: "Pagamentos", action: "payment" },
  { id: "contact", label: "Contacto", action: "contact" },
  { id: "portfolio", label: "Ver Portfólio", action: "portfolio" },
];

const responses: Record<string, { text: string; options?: ChatOption[] }> = {
  welcome: {
    text: "Olá! Sou o BW, assistente virtual da BragaWork. Como posso ajudá-lo hoje?",
    options: menuOptions,
  },
  services: {
    text: "Oferecemos os seguintes serviços:\n\n• Desenvolvimento de Sites - Sites modernos e responsivos\n• Aplicativos Mobile - Apps para iOS e Android\n• Design UI/UX - Interfaces elegantes\n• SEO - Otimização para buscadores\n• Manutenção - Suporte contínuo\n\nQuer saber mais sobre algum serviço específico?",
    options: [
      { id: "quote", label: "Solicitar Orçamento", action: "quote" },
      { id: "back", label: "Voltar ao Menu", action: "menu" },
    ],
  },
  quote: {
    text: "Para solicitar um orçamento, você pode:\n\n1. Preencher nosso formulário de orçamento online\n2. Entrar em contacto pelo WhatsApp: +351 927 512 038\n3. Enviar email para: bragawork01@gmail.com\n\nO formulário online é a forma mais rápida e permite detalhar seu projeto.",
    options: [
      { id: "form", label: "Ir para o Formulário", action: "form" },
      { id: "back", label: "Voltar ao Menu", action: "menu" },
    ],
  },
  maintenance: {
    text: "Oferecemos planos de manutenção mensal:\n\n• Manutenção de Site: €50/mês\n• Manutenção de App: €100/mês\n\nInclui atualizações, correções de bugs, backups e suporte técnico.\n\nDeseja saber mais sobre os planos?",
    options: [
      { id: "plans", label: "Ver Planos", action: "plans" },
      { id: "back", label: "Voltar ao Menu", action: "menu" },
    ],
  },
  payment: {
    text: "Aceitamos os seguintes métodos de pagamento:\n\n• Cartão de crédito/débito\n• Transferência bancária\n• Pagamento por código (para projetos específicos)\n\nSe você recebeu um código de pagamento, pode usá-lo na página de Pagamento por Código.",
    options: [
      { id: "code", label: "Pagar com Código", action: "code" },
      { id: "back", label: "Voltar ao Menu", action: "menu" },
    ],
  },
  contact: {
    text: "Você pode entrar em contacto conosco por:\n\n📧 Email: bragawork01@gmail.com\n📱 WhatsApp: +351 927 512 038\n📸 Instagram: @braga.work\n\nEstamos disponíveis 24/7 para atendê-lo!",
    options: [
      { id: "whatsapp", label: "Abrir WhatsApp", action: "whatsapp" },
      { id: "back", label: "Voltar ao Menu", action: "menu" },
    ],
  },
  portfolio: {
    text: "Temos diversos projetos realizados!\n\nVocê pode ver nosso portfólio completo na seção Projetos do site. Lá você encontrará exemplos de sites e aplicativos que desenvolvemos.\n\nDeseja ver agora?",
    options: [
      { id: "see", label: "Ver Portfólio", action: "scrollProjects" },
      { id: "back", label: "Voltar ao Menu", action: "menu" },
    ],
  },
  menu: {
    text: "Como mais posso ajudá-lo?",
    options: menuOptions,
  },
  plans: {
    text: "Detalhes dos planos de manutenção:\n\n🌐 SITE (€50/mês):\n• Atualizações de segurança\n• Correções de bugs\n• Backup semanal\n• Suporte por email/WhatsApp\n\n📱 APP (€100/mês):\n• Tudo do plano Site\n• Atualizações nas lojas\n• Monitoramento de performance\n• Suporte prioritário",
    options: [
      { id: "sub", label: "Assinar Plano", action: "subscribe" },
      { id: "back", label: "Voltar ao Menu", action: "menu" },
    ],
  },
  default: {
    text: "Desculpe, não entendi sua pergunta. Posso ajudá-lo com informações sobre nossos serviços, orçamentos, manutenção ou pagamentos.",
    options: menuOptions,
  },
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage("welcome");
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addBotMessage = (responseKey: string) => {
    const response = responses[responseKey] || responses.default;
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content: response.text,
      timestamp: new Date(),
      options: response.options,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleOptionClick = (action: string) => {
    switch (action) {
      case "form":
        window.location.href = "/quote";
        break;
      case "whatsapp":
        window.open("https://wa.me/351927512038", "_blank");
        break;
      case "code":
        window.location.href = "/payment-code";
        break;
      case "subscribe":
        window.location.href = "/maintenance";
        break;
      case "scrollProjects":
        setIsOpen(false);
        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
        break;
      default:
        const userMessage: Message = {
          id: Date.now().toString(),
          type: "user",
          content: menuOptions.find((o) => o.action === action)?.label || action,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setTimeout(() => addBotMessage(action), 500);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    const lowerInput = inputValue.toLowerCase();
    let responseKey = "default";

    if (lowerInput.includes("serviço") || lowerInput.includes("servico")) {
      responseKey = "services";
    } else if (lowerInput.includes("orçamento") || lowerInput.includes("orcamento") || lowerInput.includes("preço") || lowerInput.includes("preco")) {
      responseKey = "quote";
    } else if (lowerInput.includes("manutenção") || lowerInput.includes("manutencao") || lowerInput.includes("suporte")) {
      responseKey = "maintenance";
    } else if (lowerInput.includes("pagar") || lowerInput.includes("pagamento") || lowerInput.includes("código") || lowerInput.includes("codigo")) {
      responseKey = "payment";
    } else if (lowerInput.includes("contato") || lowerInput.includes("contacto") || lowerInput.includes("whatsapp") || lowerInput.includes("email")) {
      responseKey = "contact";
    } else if (lowerInput.includes("projeto") || lowerInput.includes("portfólio") || lowerInput.includes("portfolio")) {
      responseKey = "portfolio";
    } else if (lowerInput.includes("olá") || lowerInput.includes("ola") || lowerInput.includes("oi") || lowerInput.includes("bom dia") || lowerInput.includes("boa tarde")) {
      responseKey = "welcome";
    }

    setTimeout(() => addBotMessage(responseKey), 500);
  };

  return (
    <>
      <Button
        size="icon"
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg transition-all duration-300 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        } pulse-glow`}
        style={{ position: 'fixed', bottom: '16px', right: '16px', left: 'auto', zIndex: 9999 }}
        onClick={() => setIsOpen(true)}
        data-testid="button-open-chat"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>

      <div
        className={`w-[380px] max-w-[calc(100vw-16px)] sm:max-w-[calc(100vw-32px)] transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
        style={{ position: 'fixed', bottom: '16px', right: '8px', left: 'auto', zIndex: 9999 }}
      >
        <Card className="overflow-hidden bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl">
          <div className="bg-gradient-to-r from-primary to-secondary p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">BW Assistente</h3>
                  <p className="text-xs text-white/70 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Online 24/7
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
                data-testid="button-close-chat"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[350px] sm:h-[400px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.options && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {message.options.map((option) => (
                          <Button
                            key={option.id}
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 border-primary/30 hover:bg-primary/10"
                            onClick={() => handleOptionClick(option.action)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-secondary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-primary/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Digite sua mensagem..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
                data-testid="input-chat"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-gradient-to-r from-primary to-secondary"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
