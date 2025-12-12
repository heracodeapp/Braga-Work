import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  Star,
  CreditCard,
  Receipt,
  Menu,
  X,
  LogOut,
  Code2,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalQuotes: number;
  pendingQuotes: number;
  completedQuotes: number;
  activeSubscriptions: number;
  pastDueSubscriptions: number;
  totalRevenue: number;
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  revenueChange: number;
  revenueByService: {
    site: number;
    app: number;
    code: number;
    custom: number;
  };
  monthlyData: Array<{ month: string; revenue: number; clients: number }>;
  averageRating: number;
  totalReviews: number;
  approvedReviews: number;
}

const menuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/quotes", icon: FileText, label: "Orçamentos" },
  { href: "/admin/projects", icon: FolderOpen, label: "Portfólio" },
  { href: "/admin/reviews", icon: Star, label: "Avaliações" },
  { href: "/admin/users", icon: Users, label: "Clientes" },
  { href: "/admin/payment-codes", icon: CreditCard, label: "Códigos" },
  { href: "/admin/code-payments", icon: Receipt, label: "Pagamentos Código" },
  { href: "/admin/subscriptions", icon: TrendingUp, label: "Assinaturas" },
];

const COLORS = ["#00BFFF", "#7C3AED", "#10B981", "#F59E0B"];

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout, isAdmin, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta área.
          </p>
          <Link href="/">
            <Button>Voltar ao Início</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const pieData = stats?.revenueByService
    ? [
        { name: "Sites", value: stats.revenueByService.site },
        { name: "Apps", value: stats.revenueByService.app },
        { name: "Códigos", value: stats.revenueByService.code },
        { name: "Outros", value: stats.revenueByService.custom },
      ].filter((d) => d.value > 0)
    : [];

  const statCards = [
    {
      title: "Total de Clientes",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Orçamentos Pendentes",
      value: stats?.pendingQuotes || 0,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Assinaturas Ativas",
      value: stats?.activeSubscriptions || 0,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Receita Total",
      value: `€${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Code2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-serif font-bold text-xl text-sidebar-foreground">
                BragaWork
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                data-testid="button-mobile-menu"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <h1 className="font-serif text-xl font-bold">Dashboard</h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.displayName}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {isLoading
              ? [1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))
              : statCards.map((stat, index) => (
                  <Card
                    key={stat.title}
                    className="p-6 bg-card/80 backdrop-blur border-primary/10"
                    data-testid={`stat-${index}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                      >
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </Card>
                ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-card/80 backdrop-blur border-primary/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Receita Mensal</h3>
                {stats && (
                  <div className={`flex items-center gap-1 text-sm ${stats.revenueChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {stats.revenueChange >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>{Math.abs(stats.revenueChange).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              {isLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats?.monthlyData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`€${value.toFixed(2)}`, "Receita"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur border-primary/10">
              <h3 className="font-semibold mb-4">Receita por Serviço</h3>
              {isLoading ? (
                <Skeleton className="h-64" />
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`€${value.toFixed(2)}`]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Sem dados de receita
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-card/80 backdrop-blur border-primary/10">
              <h3 className="font-semibold mb-4">Resumo do Mês</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Receita Atual</span>
                  <span className="font-semibold text-primary">
                    €{(stats?.currentMonthRevenue || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mês Anterior</span>
                  <span className="font-semibold">
                    €{(stats?.lastMonthRevenue || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Variação</span>
                  <span className={`font-semibold ${(stats?.revenueChange || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {(stats?.revenueChange || 0) >= 0 ? "+" : ""}
                    {(stats?.revenueChange || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur border-primary/10">
              <h3 className="font-semibold mb-4">Assinaturas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ativas</span>
                  <span className="font-semibold text-green-500">
                    {stats?.activeSubscriptions || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Atrasadas</span>
                  <span className="font-semibold text-yellow-500">
                    {stats?.pastDueSubscriptions || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Orçamentos Pendentes</span>
                  <span className="font-semibold">
                    {stats?.pendingQuotes || 0}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur border-primary/10">
              <h3 className="font-semibold mb-4">Avaliações</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Média</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="font-semibold">
                      {(stats?.averageRating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{stats?.totalReviews || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Aprovadas</span>
                  <span className="font-semibold text-green-500">
                    {stats?.approvedReviews || 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/80 backdrop-blur border-primary/10">
              <h3 className="font-semibold mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/quotes">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Orçamentos
                  </Button>
                </Link>
                <Link href="/admin/projects">
                  <Button variant="outline" className="w-full justify-start">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Gerenciar Portfólio
                  </Button>
                </Link>
                <Link href="/admin/payment-codes">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Criar Código
                  </Button>
                </Link>
                <Link href="/admin/reviews">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    Moderar Avaliações
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur border-primary/10">
              <h3 className="font-semibold mb-4">Clientes por Mês</h3>
              {isLoading ? (
                <Skeleton className="h-48" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={stats?.monthlyData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="clients"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--secondary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
