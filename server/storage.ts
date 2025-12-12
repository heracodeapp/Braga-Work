import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  users, quotes, projects, reviews, payments, paymentCodes, subscriptions, monthlyReports, chatMessages,
  type User, type InsertUser,
  type Quote, type InsertQuote,
  type Project, type InsertProject,
  type Review, type InsertReview,
  type Payment, type InsertPayment,
  type PaymentCode, type InsertPaymentCode,
  type Subscription, type InsertSubscription,
  type MonthlyReport, type InsertMonthlyReport,
  type ChatMessage, type InsertChatMessage,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Quotes
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuote(id: number): Promise<Quote | undefined>;
  getAllQuotes(): Promise<Quote[]>;
  getQuotesByUser(userId: number): Promise<Quote[]>;
  updateQuoteStatus(id: number, status: string): Promise<Quote | undefined>;

  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  getActiveProjects(): Promise<Project[]>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReview(id: number): Promise<Review | undefined>;
  getAllReviews(): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  getApprovedReviews(): Promise<(Review & { user?: User })[]>;
  approveReview(id: number): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;

  // Payment Codes
  createPaymentCode(code: InsertPaymentCode): Promise<PaymentCode>;
  getPaymentCodeByCode(code: string): Promise<PaymentCode | undefined>;
  getAllPaymentCodes(): Promise<PaymentCode[]>;
  getUsedPaymentCodes(): Promise<PaymentCode[]>;
  markPaymentCodeAsUsed(code: string, email: string, name: string, stripePaymentId: string): Promise<PaymentCode | undefined>;
  deletePaymentCode(id: number): Promise<boolean>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByUser(userId: number): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;

  // Subscriptions
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionsByUser(userId: number): Promise<Subscription[]>;
  getAllSubscriptions(): Promise<Subscription[]>;
  getAllSubscriptionsWithUsers(): Promise<(Subscription & { user?: User })[]>;
  updateSubscriptionStatus(id: number, status: string): Promise<Subscription | undefined>;

  // Monthly Reports
  createMonthlyReport(report: InsertMonthlyReport): Promise<MonthlyReport>;
  getMonthlyReport(month: number, year: number): Promise<MonthlyReport | undefined>;
  getAllMonthlyReports(): Promise<MonthlyReport[]>;

  // Chat Messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Quotes
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db.insert(quotes).values(quote).returning();
    return newQuote;
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async getAllQuotes(): Promise<Quote[]> {
    return db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }

  async getQuotesByUser(userId: number): Promise<Quote[]> {
    return db.select().from(quotes).where(eq(quotes.userId, userId)).orderBy(desc(quotes.createdAt));
  }

  async updateQuoteStatus(id: number, status: string): Promise<Quote | undefined> {
    const [updated] = await db.update(quotes).set({ status }).where(eq(quotes.id, id)).returning();
    return updated;
  }

  // Projects
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getAllProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(projects.displayOrder);
  }

  async getActiveProjects(): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.isActive, true)).orderBy(projects.displayOrder);
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db.update(projects).set(project).where(eq(projects.id, id)).returning();
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async getAllReviews(): Promise<Review[]> {
    return db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
  }

  async getApprovedReviews(): Promise<(Review & { user?: User })[]> {
    const reviewsList = await db.select().from(reviews).where(eq(reviews.isApproved, true)).orderBy(desc(reviews.createdAt));
    const result = await Promise.all(
      reviewsList.map(async (review) => {
        const user = await this.getUser(review.userId);
        return { ...review, user };
      })
    );
    return result;
  }

  async approveReview(id: number): Promise<Review | undefined> {
    const [updated] = await db.update(reviews).set({ isApproved: true }).where(eq(reviews.id, id)).returning();
    return updated;
  }

  async deleteReview(id: number): Promise<boolean> {
    await db.delete(reviews).where(eq(reviews.id, id));
    return true;
  }

  // Payment Codes
  async createPaymentCode(code: InsertPaymentCode): Promise<PaymentCode> {
    const [newCode] = await db.insert(paymentCodes).values(code).returning();
    return newCode;
  }

  async getPaymentCodeByCode(code: string): Promise<PaymentCode | undefined> {
    const [paymentCode] = await db.select().from(paymentCodes).where(eq(paymentCodes.code, code));
    return paymentCode;
  }

  async getAllPaymentCodes(): Promise<PaymentCode[]> {
    return db.select().from(paymentCodes).orderBy(desc(paymentCodes.createdAt));
  }

  async getUsedPaymentCodes(): Promise<PaymentCode[]> {
    return db.select().from(paymentCodes).where(eq(paymentCodes.isUsed, true)).orderBy(desc(paymentCodes.usedAt));
  }

  async markPaymentCodeAsUsed(code: string, email: string, name: string, stripePaymentId: string): Promise<PaymentCode | undefined> {
    const [updated] = await db.update(paymentCodes)
      .set({ isUsed: true, usedByEmail: email, usedByName: name, stripePaymentId, usedAt: new Date() })
      .where(eq(paymentCodes.code, code))
      .returning();
    return updated;
  }

  async deletePaymentCode(id: number): Promise<boolean> {
    const result = await db.delete(paymentCodes).where(eq(paymentCodes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Payments
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByUser(userId: number): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  }

  async getAllPayments(): Promise<Payment[]> {
    return db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const [updated] = await db.update(payments).set({ status }).where(eq(payments.id, id)).returning();
    return updated;
  }

  // Subscriptions
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription;
  }

  async getSubscriptionsByUser(userId: number): Promise<Subscription[]> {
    return db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt));
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }

  async getAllSubscriptionsWithUsers(): Promise<(Subscription & { user?: User })[]> {
    const results = await db
      .select()
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .orderBy(desc(subscriptions.createdAt));
    
    return results.map(row => ({
      ...row.subscriptions,
      user: row.users || undefined,
    }));
  }

  async updateSubscriptionStatus(id: number, status: string): Promise<Subscription | undefined> {
    const [updated] = await db.update(subscriptions).set({ status }).where(eq(subscriptions.id, id)).returning();
    return updated;
  }

  // Monthly Reports
  async createMonthlyReport(report: InsertMonthlyReport): Promise<MonthlyReport> {
    const [newReport] = await db.insert(monthlyReports).values(report).returning();
    return newReport;
  }

  async getMonthlyReport(month: number, year: number): Promise<MonthlyReport | undefined> {
    const [report] = await db.select().from(monthlyReports)
      .where(and(eq(monthlyReports.month, month), eq(monthlyReports.year, year)));
    return report;
  }

  async getAllMonthlyReports(): Promise<MonthlyReport[]> {
    return db.select().from(monthlyReports).orderBy(desc(monthlyReports.year), desc(monthlyReports.month));
  }

  // Chat Messages
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.createdAt);
  }
}

export const storage = new DatabaseStorage();
