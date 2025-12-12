import type { Express } from "express";
import type { Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertQuoteSchema, insertProjectSchema, insertReviewSchema, insertPaymentCodeSchema } from "@shared/schema";
import { z } from "zod";

// WhatsApp notification via CallMeBot
async function sendWhatsAppNotification(message: string): Promise<void> {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  const phoneNumber = process.env.WHATSAPP_NUMBER;

  if (!apiKey || !phoneNumber) {
    console.log("WhatsApp notification skipped: missing credentials");
    return;
  }

  try {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodedMessage}&apikey=${apiKey}`;
    
    const response = await fetch(url);
    if (response.ok) {
      console.log("WhatsApp notification sent successfully");
    } else {
      console.error("WhatsApp notification failed:", await response.text());
    }
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
  }
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-01-27.acacia" })
  : null;

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      displayName: string;
      avatarUrl?: string | null;
      isAdmin?: boolean | null;
    }
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<void> {
  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "bragawork-secret-key-2024",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 * 7, // 7 days
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Google OAuth if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await storage.getUserByGoogleId(profile.id);

            if (!user) {
              const email = profile.emails?.[0]?.value || "";
              user = await storage.getUserByEmail(email);

              if (user) {
                user = await storage.updateUser(user.id, { googleId: profile.id });
              } else {
                user = await storage.createUser({
                  googleId: profile.id,
                  email,
                  username: email.split("@")[0] + "_" + Date.now(),
                  displayName: profile.displayName || "Usuário",
                  avatarUrl: profile.photos?.[0]?.value,
                  isAdmin: email === "bragawork01@gmail.com",
                });
              }
            }

            return done(null, user!);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (error) {
      done(error);
    }
  });

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Não autorizado" });
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && (req.user?.email === "bragawork01@gmail.com" || req.user?.isAdmin)) {
      return next();
    }
    res.status(403).json({ error: "Acesso negado" });
  };

  // Auth routes
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/?auth=failed" }),
      (req, res) => {
        res.redirect("/?auth=success");
      }
    );
  } else {
    app.get("/api/auth/google", (req, res) => {
      res.redirect("/?auth=unavailable");
    });
    
    app.get("/api/auth/google/callback", (req, res) => {
      res.redirect("/?auth=unavailable");
    });
  }

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: "Não autenticado" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // Profile routes (user's own data)
  app.get("/api/profile/quotes", requireAuth, async (req, res) => {
    try {
      const quotes = await storage.getQuotesByUser(req.user!.id);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar orçamentos" });
    }
  });

  app.get("/api/profile/subscriptions", requireAuth, async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptionsByUser(req.user!.id);
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar assinaturas" });
    }
  });

  app.get("/api/profile/reviews", requireAuth, async (req, res) => {
    try {
      const reviews = await storage.getReviewsByUser(req.user!.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar avaliações" });
    }
  });

  app.get("/api/profile/payments", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getPaymentsByUser(req.user!.id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar pagamentos" });
    }
  });

  // Quotes routes
  app.post("/api/quotes", async (req, res) => {
    try {
      const data = insertQuoteSchema.parse({
        ...req.body,
        userId: req.user?.id || null,
        status: "pending",
      });
      const quote = await storage.createQuote(data);

      // Send WhatsApp notification
      const serviceTypeLabel = req.body.serviceType === "website" ? "Website" : "Aplicativo";
      const additionalsLabel = req.body.additionals?.length > 0 
        ? req.body.additionals.join(", ") 
        : "Nenhuma";
      
      const message = `*Novo Orcamento Recebido!*

*Nome:* ${req.body.firstName} ${req.body.lastName}
*Email:* ${req.body.email}
*Telefone:* ${req.body.countryCode} ${req.body.phone}
*Tipo:* ${serviceTypeLabel}
*Segmento:* ${req.body.businessSegment}
*Extras:* ${additionalsLabel}
*Descricao:* ${req.body.projectDescription || "Nao informada"}`;

      sendWhatsAppNotification(message);

      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Erro ao criar orçamento" });
      }
    }
  });

  app.get("/api/quotes", requireAdmin, async (req, res) => {
    try {
      const quotes = await storage.getAllQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar orçamentos" });
    }
  });

  app.patch("/api/quotes/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const quote = await storage.updateQuoteStatus(parseInt(req.params.id), status);
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar orçamento" });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar projetos" });
    }
  });

  app.get("/api/projects/active", async (req, res) => {
    try {
      const projects = await storage.getActiveProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar projetos" });
    }
  });

  app.post("/api/projects", requireAdmin, async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Erro ao criar projeto" });
      }
    }
  });

  app.patch("/api/projects/:id", requireAdmin, async (req, res) => {
    try {
      const project = await storage.updateProject(parseInt(req.params.id), req.body);
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar projeto" });
    }
  });

  app.delete("/api/projects/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProject(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar projeto" });
    }
  });

  // Reviews routes
  app.get("/api/reviews/approved", async (req, res) => {
    try {
      const reviews = await storage.getApprovedReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar avaliações" });
    }
  });

  app.get("/api/reviews", requireAdmin, async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar avaliações" });
    }
  });

  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const data = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const review = await storage.createReview(data);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Erro ao criar avaliação" });
      }
    }
  });

  app.patch("/api/reviews/:id/approve", requireAdmin, async (req, res) => {
    try {
      const review = await storage.approveReview(parseInt(req.params.id));
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: "Erro ao aprovar avaliação" });
    }
  });

  app.delete("/api/reviews/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteReview(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar avaliação" });
    }
  });

  // Payment Codes routes
  app.post("/api/payment-codes/verify", async (req, res) => {
    try {
      const { code } = req.body;
      const paymentCode = await storage.getPaymentCodeByCode(code);

      if (!paymentCode) {
        return res.status(404).json({ error: "Código não encontrado" });
      }

      if (paymentCode.isUsed) {
        return res.status(400).json({ error: "Código já utilizado" });
      }

      res.json({
        id: paymentCode.id,
        code: paymentCode.code,
        amount: paymentCode.amount,
        description: paymentCode.description,
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao verificar código" });
    }
  });

  app.post("/api/payment-codes/process", async (req, res) => {
    try {
      const { code, name, email } = req.body;
      const paymentCode = await storage.getPaymentCodeByCode(code);

      if (!paymentCode || paymentCode.isUsed) {
        return res.status(400).json({ error: "Código inválido ou já utilizado" });
      }

      if (!stripe) {
        return res.status(500).json({ error: "Stripe não configurado" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: paymentCode.description || `Pagamento BragaWork - Código ${code}`,
              },
              unit_amount: Math.round(parseFloat(paymentCode.amount) * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000"}/payment/success?code=${code}`,
        cancel_url: `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000"}/payment/code`,
        customer_email: email,
        metadata: {
          code,
          name,
          email,
        },
      });

      res.json({ success: true, checkoutUrl: session.url });
    } catch (error) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: "Erro ao processar pagamento" });
    }
  });

  // Stripe webhook for payment confirmation
  app.post("/api/stripe/webhook", async (req, res) => {
    try {
      const event = req.body;

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { code, name, email } = session.metadata || {};

        if (code) {
          await storage.markPaymentCodeAsUsed(code, email, name, session.payment_intent);
        }
      }

      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ error: "Webhook error" });
    }
  });

  // Create subscription checkout session
  app.post("/api/subscriptions/create-checkout", requireAuth, async (req, res) => {
    try {
      const { planType } = req.body;
      
      if (!stripe) {
        return res.status(500).json({ error: "Stripe não configurado" });
      }

      const prices: Record<string, { amount: number; name: string }> = {
        site: { amount: 1500, name: "Manutenção de Site - Mensal" },
        app: { amount: 2000, name: "Manutenção de Aplicativo - Mensal" },
      };

      const plan = prices[planType];
      if (!plan) {
        return res.status(400).json({ error: "Plano inválido" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: plan.name,
              },
              unit_amount: plan.amount,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000"}/maintenance?success=true`,
        cancel_url: `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000"}/maintenance`,
        customer_email: req.user?.email,
        metadata: {
          userId: req.user?.id.toString(),
          planType,
        },
      });

      res.json({ checkoutUrl: session.url });
    } catch (error) {
      console.error("Stripe subscription error:", error);
      res.status(500).json({ error: "Erro ao criar assinatura" });
    }
  });

  app.get("/api/payment-codes", requireAdmin, async (req, res) => {
    try {
      const codes = await storage.getAllPaymentCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar códigos" });
    }
  });

  app.post("/api/payment-codes", requireAdmin, async (req, res) => {
    try {
      const generateCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };

      let code = generateCode();
      let existing = await storage.getPaymentCodeByCode(code);
      while (existing) {
        code = generateCode();
        existing = await storage.getPaymentCodeByCode(code);
      }

      const data = insertPaymentCodeSchema.parse({
        code,
        amount: req.body.amount,
        description: req.body.description,
      });

      const paymentCode = await storage.createPaymentCode(data);
      res.status(201).json(paymentCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Erro ao criar código de pagamento" });
      }
    }
  });

  app.delete("/api/payment-codes/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePaymentCode(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Código não encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar código" });
    }
  });

  // Admin Dashboard Stats
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const [users, quotes, payments, subscriptions, reviews] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllQuotes(),
        storage.getAllPayments(),
        storage.getAllSubscriptions(),
        storage.getAllReviews(),
      ]);

      const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
      const pastDueSubscriptions = subscriptions.filter((s) => s.status === "past_due");
      const pendingQuotes = quotes.filter((q) => q.status === "pending");
      const completedQuotes = quotes.filter((q) => q.status === "completed");
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthPayments = payments.filter((p) => {
        const date = new Date(p.createdAt!);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear && p.status === "succeeded";
      });

      const lastMonthPayments = payments.filter((p) => {
        const date = new Date(p.createdAt!);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear && p.status === "succeeded";
      });

      const totalRevenue = payments
        .filter((p) => p.status === "succeeded")
        .reduce((acc, p) => acc + parseFloat(p.amount), 0);

      const currentMonthRevenue = currentMonthPayments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
      const lastMonthRevenue = lastMonthPayments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
      const revenueChange = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      const revenueByService = {
        site: payments.filter((p) => p.paymentType === "maintenance_site" && p.status === "succeeded").reduce((acc, p) => acc + parseFloat(p.amount), 0),
        app: payments.filter((p) => p.paymentType === "maintenance_app" && p.status === "succeeded").reduce((acc, p) => acc + parseFloat(p.amount), 0),
        code: payments.filter((p) => p.paymentType === "code_payment" && p.status === "succeeded").reduce((acc, p) => acc + parseFloat(p.amount), 0),
        custom: payments.filter((p) => p.paymentType === "custom" && p.status === "succeeded").reduce((acc, p) => acc + parseFloat(p.amount), 0),
      };

      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentYear, currentMonth - i, 1);
        const monthPayments = payments.filter((p) => {
          const date = new Date(p.createdAt!);
          return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear() && p.status === "succeeded";
        });
        monthlyData.push({
          month: month.toLocaleDateString("pt-BR", { month: "short" }),
          revenue: monthPayments.reduce((acc, p) => acc + parseFloat(p.amount), 0),
          clients: new Set(monthPayments.map((p) => p.userId)).size,
        });
      }

      const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

      res.json({
        totalUsers: users.length,
        totalQuotes: quotes.length,
        pendingQuotes: pendingQuotes.length,
        completedQuotes: completedQuotes.length,
        activeSubscriptions: activeSubscriptions.length,
        pastDueSubscriptions: pastDueSubscriptions.length,
        totalRevenue,
        currentMonthRevenue,
        lastMonthRevenue,
        revenueChange,
        revenueByService,
        monthlyData,
        averageRating,
        totalReviews: reviews.length,
        approvedReviews: reviews.filter((r) => r.isApproved).length,
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  // Extended review stats
  app.get("/api/admin/review-trends", requireAdmin, async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      
      const ratingDistribution = [0, 0, 0, 0, 0];
      reviews.forEach((r) => {
        if (r.rating >= 1 && r.rating <= 5) {
          ratingDistribution[r.rating - 1]++;
        }
      });

      const recentReviews = reviews.slice(0, 10);

      res.json({
        ratingDistribution,
        recentReviews,
        averageRating: reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0,
        totalReviews: reviews.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar tendências" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });

  app.get("/api/admin/subscriptions", requireAdmin, async (req, res) => {
    try {
      const subscriptions = await storage.getAllSubscriptionsWithUsers();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar assinaturas" });
    }
  });

  app.get("/api/admin/payment-codes/used", requireAdmin, async (req, res) => {
    try {
      const codes = await storage.getUsedPaymentCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar pagamentos por código" });
    }
  });

  app.get("/api/admin/payments", requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar pagamentos" });
    }
  });
}
