import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import QuotePage from "@/pages/quote";
import MaintenancePage from "@/pages/maintenance";
import PaymentCodePage from "@/pages/payment-code";
import PaymentSuccessPage from "@/pages/payment-success";
import AdminDashboard from "@/pages/admin/index";
import AdminQuotes from "@/pages/admin/quotes";
import AdminProjects from "@/pages/admin/projects";
import AdminReviews from "@/pages/admin/reviews";
import AdminPaymentCodes from "@/pages/admin/payment-codes";
import AdminUsers from "@/pages/admin/users";
import AdminSubscriptions from "@/pages/admin/subscriptions";
import AdminCodePayments from "@/pages/admin/code-payments";
import ProfilePage from "@/pages/profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/quote" component={QuotePage} />
      <Route path="/maintenance" component={MaintenancePage} />
      <Route path="/payment-code" component={PaymentCodePage} />
      <Route path="/payment/code" component={PaymentCodePage} />
      <Route path="/payment/success" component={PaymentSuccessPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/quotes" component={AdminQuotes} />
      <Route path="/admin/projects" component={AdminProjects} />
      <Route path="/admin/reviews" component={AdminReviews} />
      <Route path="/admin/payment-codes" component={AdminPaymentCodes} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/subscriptions" component={AdminSubscriptions} />
      <Route path="/admin/code-payments" component={AdminCodePayments} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
