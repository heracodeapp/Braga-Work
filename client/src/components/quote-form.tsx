import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Globe,
  Smartphone,
  Briefcase,
  Layers,
  FileText,
  Rocket,
  Sparkles,
} from "lucide-react";

const countryCodes = [
  { code: "+351", flag: "🇵🇹", country: "Portugal" },
  { code: "+55", flag: "🇧🇷", country: "Brasil" },
  { code: "+34", flag: "🇪🇸", country: "Espanha" },
  { code: "+33", flag: "🇫🇷", country: "França" },
  { code: "+44", flag: "🇬🇧", country: "Reino Unido" },
  { code: "+1", flag: "🇺🇸", country: "EUA" },
];

const businessSegments = [
  "Restaurante / Alimentação",
  "Loja / E-commerce",
  "Saúde / Medicina",
  "Educação / Cursos",
  "Advocacia / Jurídico",
  "Imobiliária / Construção",
  "Beleza / Estética",
  "Academia / Fitness",
  "Tecnologia / Startup",
  "Consultoria / Serviços",
  "Arte / Entretenimento",
  "Outro",
];

const additionalFeatures = [
  { id: "payment_online", label: "Pagamento Online", description: "Integração com métodos de pagamento" },
  { id: "scheduling", label: "Agendamento", description: "Sistema de reservas e marcações" },
  { id: "admin_panel", label: "Painel Administrativo", description: "Gestão de conteúdo e dados" },
  { id: "chat", label: "Chat / Atendimento", description: "Comunicação em tempo real" },
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  serviceType: "website" | "app" | "";
  businessSegment: string;
  additionals: string[];
  projectDescription: string;
}

const steps = [
  { id: 1, title: "Dados Pessoais", icon: User },
  { id: 2, title: "Tipo de Projeto", icon: Globe },
  { id: 3, title: "Segmento", icon: Briefcase },
  { id: 4, title: "Funcionalidades", icon: Layers },
  { id: 5, title: "Descrição", icon: FileText },
];

export function QuoteForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+351",
    serviceType: "",
    businessSegment: "",
    additionals: [],
    projectDescription: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/quotes", data);
    },
    onSuccess: () => {
      toast({
        title: "Orçamento enviado com sucesso!",
        description: "Em breve entraremos em contacto consigo.",
      });
      setCurrentStep(6);
    },
    onError: () => {
      toast({
        title: "Erro ao enviar orçamento",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = "Nome é obrigatório";
        if (!formData.lastName.trim()) newErrors.lastName = "Sobrenome é obrigatório";
        if (!formData.email.trim()) {
          newErrors.email = "Email é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Email inválido";
        }
        if (!formData.phone.trim()) {
          newErrors.phone = "Telefone é obrigatório";
        } else if (formData.phone.length < 9) {
          newErrors.phone = "Telefone inválido";
        }
        break;
      case 2:
        if (!formData.serviceType) newErrors.serviceType = "Selecione um tipo de projeto";
        break;
      case 3:
        if (!formData.businessSegment) newErrors.businessSegment = "Selecione um segmento";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        submitMutation.mutate(formData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAdditionalToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      additionals: prev.additionals.includes(id)
        ? prev.additionals.filter((a) => a !== id)
        : [...prev.additionals, id],
    }));
  };

  const progress = (currentStep / 5) * 100;

  if (currentStep === 6) {
    return (
      <Card className="max-w-2xl mx-auto p-8 bg-card/80 backdrop-blur border-primary/20 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-6 glow-primary">
          <Check className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="font-serif text-3xl font-bold mb-4">
          <span className="text-gradient-primary">Orçamento Enviado!</span>
        </h2>
        <p className="text-muted-foreground mb-6">
          Obrigado por solicitar um orçamento! Analisaremos seu projeto e entraremos em contacto em até 24 horas pelo email ou WhatsApp fornecido.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentStep(1);
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                countryCode: "+351",
                serviceType: "",
                businessSegment: "",
                additionals: [],
                projectDescription: "",
              });
            }}
            className="border-primary/30"
          >
            Enviar Novo Orçamento
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            Voltar ao Início
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.id
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                } ${currentStep === step.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`hidden sm:block w-12 h-0.5 ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground mt-2">
          Etapa {currentStep} de 5 - {steps[currentStep - 1]?.title}
        </p>
      </div>

      <Card className="p-6 sm:p-8 bg-card/80 backdrop-blur border-primary/20">
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Seus Dados</h2>
              <p className="text-muted-foreground">Informe seus dados de contacto</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  placeholder="Seu nome"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={errors.firstName ? "border-destructive" : ""}
                  data-testid="input-firstName"
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input
                  id="lastName"
                  placeholder="Seu sobrenome"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={errors.lastName ? "border-destructive" : ""}
                  data-testid="input-lastName"
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? "border-destructive" : ""}
                data-testid="input-email"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.countryCode}
                  onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                >
                  <SelectTrigger className="w-[120px]" data-testid="select-countryCode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  placeholder="912 345 678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                  className={`flex-1 ${errors.phone ? "border-destructive" : ""}`}
                  data-testid="input-phone"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Tipo de Projeto</h2>
              <p className="text-muted-foreground">O que você precisa?</p>
            </div>

            <RadioGroup
              value={formData.serviceType}
              onValueChange={(value) => setFormData({ ...formData, serviceType: value as "website" | "app" })}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Label
                htmlFor="website"
                className={`flex flex-col items-center gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.serviceType === "website"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="website" id="website" className="sr-only" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Website</h3>
                  <p className="text-sm text-muted-foreground">Site ou página web</p>
                </div>
              </Label>

              <Label
                htmlFor="app"
                className={`flex flex-col items-center gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.serviceType === "app"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="app" id="app" className="sr-only" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Aplicativo</h3>
                  <p className="text-sm text-muted-foreground">App mobile iOS/Android</p>
                </div>
              </Label>
            </RadioGroup>

            {errors.serviceType && (
              <p className="text-xs text-destructive text-center">{errors.serviceType}</p>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Segmento do Negócio</h2>
              <p className="text-muted-foreground">Qual a área de atuação?</p>
            </div>

            <Select
              value={formData.businessSegment}
              onValueChange={(value) => setFormData({ ...formData, businessSegment: value })}
            >
              <SelectTrigger className={errors.businessSegment ? "border-destructive" : ""} data-testid="select-segment">
                <SelectValue placeholder="Selecione um segmento" />
              </SelectTrigger>
              <SelectContent>
                {businessSegments.map((segment) => (
                  <SelectItem key={segment} value={segment}>
                    {segment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.businessSegment && (
              <p className="text-xs text-destructive">{errors.businessSegment}</p>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Funcionalidades Extras</h2>
              <p className="text-muted-foreground">Selecione o que precisa (opcional)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {additionalFeatures.map((feature) => (
                <Label
                  key={feature.id}
                  htmlFor={feature.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.additionals.includes(feature.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    id={feature.id}
                    checked={formData.additionals.includes(feature.id)}
                    onCheckedChange={() => handleAdditionalToggle(feature.id)}
                    className="mt-1"
                    data-testid={`checkbox-${feature.id}`}
                  />
                  <div>
                    <h4 className="font-medium">{feature.label}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </Label>
              ))}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Descrição do Projeto</h2>
              <p className="text-muted-foreground">Conte-nos mais sobre sua ideia (opcional)</p>
            </div>

            <Textarea
              placeholder="Descreva seu projeto, objetivos, funcionalidades desejadas, referências..."
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              className="min-h-[150px]"
              data-testid="textarea-description"
            />

            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm mb-1">Resumo do seu pedido</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Tipo: {formData.serviceType === "website" ? "Website" : "Aplicativo"}</li>
                    <li>Segmento: {formData.businessSegment}</li>
                    {formData.additionals.length > 0 && (
                      <li>
                        Extras:{" "}
                        {formData.additionals
                          .map((a) => additionalFeatures.find((f) => f.id === a)?.label)
                          .join(", ")}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="flex justify-between mt-8 gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="border-primary/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={submitMutation.isPending}
            className="bg-gradient-to-r from-primary to-secondary"
            data-testid="button-next"
          >
            {submitMutation.isPending ? (
              "Enviando..."
            ) : currentStep === 5 ? (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Enviar Orçamento
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
