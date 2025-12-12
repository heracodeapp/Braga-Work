import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - Google OAuth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").unique(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  quotes: many(quotes),
  reviews: many(reviews),
  payments: many(payments),
  subscriptions: many(subscriptions),
}));

// Quote requests - Multi-step form
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  countryCode: text("country_code").notNull().default("+351"),
  serviceType: text("service_type").notNull(), // 'website' | 'app'
  businessSegment: text("business_segment").notNull(),
  additionals: text("additionals").array(), // ['payment_online', 'scheduling', 'admin_panel', 'chat']
  projectDescription: text("project_description"),
  status: text("status").notNull().default("pending"), // 'pending' | 'in_progress' | 'completed' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const quotesRelations = relations(quotes, ({ one }) => ({
  user: one(users, {
    fields: [quotes.userId],
    references: [users.id],
  }),
}));

// Portfolio projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  projectUrl: text("project_url"),
  mediaType: text("media_type").default("image"), // 'image' | 'video'
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews / Ratings
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

// Payment codes (6-digit codes)
export const paymentCodes = pgTable("payment_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 6 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isUsed: boolean("is_used").default(false),
  usedByEmail: text("used_by_email"),
  usedByName: text("used_by_name"),
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

// Payments (one-time)
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  stripePaymentId: text("stripe_payment_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("EUR"),
  status: text("status").notNull(), // 'pending' | 'succeeded' | 'failed'
  paymentType: text("payment_type").notNull(), // 'maintenance_site' | 'maintenance_app' | 'code_payment' | 'custom'
  paymentCodeId: integer("payment_code_id").references(() => paymentCodes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  paymentCode: one(paymentCodes, {
    fields: [payments.paymentCodeId],
    references: [paymentCodes.id],
  }),
}));

// Subscriptions (recurring)
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  planType: text("plan_type").notNull(), // 'site_maintenance' | 'app_maintenance'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // 'active' | 'past_due' | 'canceled' | 'unpaid'
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// Monthly reports
export const monthlyReports = pgTable("monthly_reports", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  totalClients: integer("total_clients").default(0),
  activeSubscriptions: integer("active_subscriptions").default(0),
  pastDueSubscriptions: integer("past_due_subscriptions").default(0),
  newQuotes: integer("new_quotes").default(0),
  completedProjects: integer("completed_projects").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chatbot conversations (for analytics)
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userMessage: text("user_message"),
  botResponse: text("bot_response"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, isApproved: true });
export const insertPaymentCodeSchema = createInsertSchema(paymentCodes).omit({ id: true, createdAt: true, isUsed: true, usedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true });
export const insertMonthlyReportSchema = createInsertSchema(monthlyReports).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type PaymentCode = typeof paymentCodes.$inferSelect;
export type InsertPaymentCode = z.infer<typeof insertPaymentCodeSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type MonthlyReport = typeof monthlyReports.$inferSelect;
export type InsertMonthlyReport = z.infer<typeof insertMonthlyReportSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Form validation schemas
export const quoteFormStep1Schema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres").max(50),
  email: z.string().email("Email inválido"),
  phone: z.string().min(9, "Telefone inválido"),
  countryCode: z.string().default("+351"),
});

export const quoteFormStep2Schema = z.object({
  serviceType: z.enum(["website", "app"], { required_error: "Selecione um tipo de serviço" }),
});

export const quoteFormStep3Schema = z.object({
  businessSegment: z.string().min(1, "Selecione um segmento"),
});

export const quoteFormStep4Schema = z.object({
  additionals: z.array(z.string()).optional(),
});

export const quoteFormStep5Schema = z.object({
  projectDescription: z.string().optional(),
});

export const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comentário deve ter pelo menos 10 caracteres").max(500),
});

export const paymentCodeFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  code: z.string().length(6, "Código deve ter 6 dígitos"),
});
