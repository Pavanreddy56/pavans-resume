import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

export const heroSection = pgTable("hero_section", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  intro: text("intro").notNull(),
  profileImage: text("profile_image"),
});

export const insertHeroSchema = createInsertSchema(heroSection).omit({ id: true });
export type InsertHero = z.infer<typeof insertHeroSchema>;
export type Hero = typeof heroSection.$inferSelect;

export const skills = pgTable("skills", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  category: text("category"),
  icon: text("icon"),
});

export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  techStack: text("tech_stack").array().notNull(),
  githubUrl: text("github_url"),
  liveUrl: text("live_url"),
  image: text("image"),
  featured: boolean("featured").default(false),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const blogPosts = pgTable("blog_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  publishedAt: timestamp("published_at").defaultNow(),
  published: boolean("published").default(true),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, publishedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export const contactMessages = pgTable("contact_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  read: boolean("read").default(false),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true, read: true });
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export const socialLinks = pgTable("social_links", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  platform: text("platform").notNull().unique(),
  url: text("url").notNull(),
  icon: text("icon"),
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({ id: true });
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;

export const resume = pgTable("resume", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resume).omit({ id: true, uploadedAt: true });
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resume.$inferSelect;
