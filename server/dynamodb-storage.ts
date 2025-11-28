import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, get, put, update, delete as deleteItem, scan, query } from "@aws-sdk/lib-dynamodb";
import type {
  Admin, InsertAdmin, Hero, InsertHero, Skill, InsertSkill,
  Project, InsertProject, BlogPost, InsertBlogPost,
  ContactMessage, InsertContactMessage, SocialLink, InsertSocialLink,
  Resume, InsertResume
} from "@shared/schema";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

export interface IStorage {
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getHero(): Promise<Hero | undefined>;
  upsertHero(hero: InsertHero): Promise<Hero>;
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  markMessageRead(id: number): Promise<boolean>;
  deleteContactMessage(id: number): Promise<boolean>;
  getSocialLinks(): Promise<SocialLink[]>;
  getSocialLink(id: number): Promise<SocialLink | undefined>;
  createSocialLink(link: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: number, link: Partial<InsertSocialLink>): Promise<SocialLink | undefined>;
  deleteSocialLink(id: number): Promise<boolean>;
  getResume(): Promise<Resume | undefined>;
  upsertResume(data: InsertResume): Promise<Resume>;
  deleteResume(): Promise<boolean>;
}

export class DynamoDBStorage implements IStorage {
  // Admin operations
  async getAdmin(id: number): Promise<Admin | undefined> {
    try {
      const result = await docClient.send(new get({
        TableName: "portfolio-admins",
        Key: { id: id.toString() }
      }));
      return result.Item as Admin | undefined;
    } catch (error) {
      console.error("DynamoDB getAdmin error:", error);
      throw error;
    }
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    try {
      const result = await docClient.send(new query({
        TableName: "portfolio-admins",
        IndexName: "username-index",
        KeyConditionExpression: "username = :username",
        ExpressionAttributeValues: { ":username": username }
      }));
      return result.Items?.[0] as Admin | undefined;
    } catch (error) {
      console.error("DynamoDB getAdminByUsername error:", error);
      throw error;
    }
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    try {
      const id = uuidv4();
      const newAdmin = { id, ...admin } as Admin;
      await docClient.send(new put({
        TableName: "portfolio-admins",
        Item: newAdmin
      }));
      return newAdmin;
    } catch (error) {
      console.error("DynamoDB createAdmin error:", error);
      throw error;
    }
  }

  // Hero section operations
  async getHero(): Promise<Hero | undefined> {
    try {
      const result = await docClient.send(new get({
        TableName: "portfolio-hero",
        Key: { id: "hero-1" }
      }));
      return result.Item as Hero | undefined;
    } catch (error) {
      console.error("DynamoDB getHero error:", error);
      throw error;
    }
  }

  async upsertHero(hero: InsertHero): Promise<Hero> {
    try {
      const existing = await this.getHero();
      const heroData = { id: "hero-1", ...hero } as Hero;
      await docClient.send(new put({
        TableName: "portfolio-hero",
        Item: heroData
      }));
      return heroData;
    } catch (error) {
      console.error("DynamoDB upsertHero error:", error);
      throw error;
    }
  }

  // Skills operations
  async getSkills(): Promise<Skill[]> {
    try {
      const result = await docClient.send(new scan({
        TableName: "portfolio-skills"
      }));
      return (result.Items as Skill[]) || [];
    } catch (error) {
      console.error("DynamoDB getSkills error:", error);
      throw error;
    }
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    try {
      const result = await docClient.send(new get({
        TableName: "portfolio-skills",
        Key: { id: id.toString() }
      }));
      return result.Item as Skill | undefined;
    } catch (error) {
      console.error("DynamoDB getSkill error:", error);
      throw error;
    }
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    try {
      const id = Date.now().toString();
      const newSkill = { id, ...skill } as Skill;
      await docClient.send(new put({
        TableName: "portfolio-skills",
        Item: newSkill
      }));
      return newSkill;
    } catch (error) {
      console.error("DynamoDB createSkill error:", error);
      throw error;
    }
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined> {
    try {
      const existing = await this.getSkill(id);
      if (!existing) return undefined;
      
      const updated = { ...existing, ...skill } as Skill;
      await docClient.send(new put({
        TableName: "portfolio-skills",
        Item: updated
      }));
      return updated;
    } catch (error) {
      console.error("DynamoDB updateSkill error:", error);
      throw error;
    }
  }

  async deleteSkill(id: number): Promise<boolean> {
    try {
      const existing = await this.getSkill(id);
      if (!existing) return false;
      
      await docClient.send(new deleteItem({
        TableName: "portfolio-skills",
        Key: { id: id.toString() }
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB deleteSkill error:", error);
      throw error;
    }
  }

  // Projects operations
  async getProjects(): Promise<Project[]> {
    try {
      const result = await docClient.send(new scan({
        TableName: "portfolio-projects"
      }));
      return (result.Items as Project[]) || [];
    } catch (error) {
      console.error("DynamoDB getProjects error:", error);
      throw error;
    }
  }

  async getProject(id: number): Promise<Project | undefined> {
    try {
      const result = await docClient.send(new get({
        TableName: "portfolio-projects",
        Key: { id: id.toString() }
      }));
      return result.Item as Project | undefined;
    } catch (error) {
      console.error("DynamoDB getProject error:", error);
      throw error;
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      const id = Date.now().toString();
      const newProject = { id, ...project } as Project;
      await docClient.send(new put({
        TableName: "portfolio-projects",
        Item: newProject
      }));
      return newProject;
    } catch (error) {
      console.error("DynamoDB createProject error:", error);
      throw error;
    }
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    try {
      const existing = await this.getProject(id);
      if (!existing) return undefined;
      
      const updated = { ...existing, ...project } as Project;
      await docClient.send(new put({
        TableName: "portfolio-projects",
        Item: updated
      }));
      return updated;
    } catch (error) {
      console.error("DynamoDB updateProject error:", error);
      throw error;
    }
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      const existing = await this.getProject(id);
      if (!existing) return false;
      
      await docClient.send(new deleteItem({
        TableName: "portfolio-projects",
        Key: { id: id.toString() }
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB deleteProject error:", error);
      throw error;
    }
  }

  // Blog posts operations
  async getBlogPosts(): Promise<BlogPost[]> {
    try {
      const result = await docClient.send(new scan({
        TableName: "portfolio-blog"
      }));
      return (result.Items as BlogPost[]) || [];
    } catch (error) {
      console.error("DynamoDB getBlogPosts error:", error);
      throw error;
    }
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    try {
      const result = await docClient.send(new get({
        TableName: "portfolio-blog",
        Key: { id: id.toString() }
      }));
      return result.Item as BlogPost | undefined;
    } catch (error) {
      console.error("DynamoDB getBlogPost error:", error);
      throw error;
    }
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    try {
      const id = Date.now().toString();
      const newPost = {
        id,
        ...post,
        publishedAt: new Date().toISOString()
      } as BlogPost;
      await docClient.send(new put({
        TableName: "portfolio-blog",
        Item: newPost
      }));
      return newPost;
    } catch (error) {
      console.error("DynamoDB createBlogPost error:", error);
      throw error;
    }
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    try {
      const existing = await this.getBlogPost(id);
      if (!existing) return undefined;
      
      const updated = { ...existing, ...post } as BlogPost;
      await docClient.send(new put({
        TableName: "portfolio-blog",
        Item: updated
      }));
      return updated;
    } catch (error) {
      console.error("DynamoDB updateBlogPost error:", error);
      throw error;
    }
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    try {
      const existing = await this.getBlogPost(id);
      if (!existing) return false;
      
      await docClient.send(new deleteItem({
        TableName: "portfolio-blog",
        Key: { id: id.toString() }
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB deleteBlogPost error:", error);
      throw error;
    }
  }

  // Contact messages operations
  async getContactMessages(): Promise<ContactMessage[]> {
    try {
      const result = await docClient.send(new scan({
        TableName: "portfolio-messages"
      }));
      return (result.Items as ContactMessage[]) || [];
    } catch (error) {
      console.error("DynamoDB getContactMessages error:", error);
      throw error;
    }
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    try {
      const result = await docClient.send(new get({
        TableName: "portfolio-messages",
        Key: { id: id.toString() }
      }));
      return result.Item as ContactMessage | undefined;
    } catch (error) {
      console.error("DynamoDB getContactMessage error:", error);
      throw error;
    }
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    try {
      const id = Date.now().toString();
      const newMessage = {
        id,
        ...message,
        createdAt: new Date(),
        read: false
      } as ContactMessage;
      await docClient.send(new put({
        TableName: "portfolio-messages",
        Item: newMessage
      }));
      return newMessage;
    } catch (error) {
      console.error("DynamoDB createContactMessage error:", error);
      throw error;
    }
  }

  async markMessageRead(id: number): Promise<boolean> {
    try {
      const existing = await this.getContactMessage(id);
      if (!existing) return false;
      
      const updated = { ...existing, read: true } as ContactMessage;
      await docClient.send(new put({
        TableName: "portfolio-messages",
        Item: updated
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB markMessageRead error:", error);
      throw error;
    }
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    try {
      const existing = await this.getContactMessage(id);
      if (!existing) return false;
      
      await docClient.send(new deleteItem({
        TableName: "portfolio-messages",
        Key: { id: id.toString() }
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB deleteContactMessage error:", error);
      throw error;
    }
  }

  // Social links operations
  async getSocialLinks(): Promise<SocialLink[]> {
    try {
      const result = await docClient.send(new scan({
        TableName: "portfolio-social"
      }));
      return (result.Items as SocialLink[]) || [];
    } catch (error) {
      console.error("DynamoDB getSocialLinks error:", error);
      throw error;
    }
  }

  async getSocialLink(id: number): Promise<SocialLink | undefined> {
    try {
      const result = await docClient.send(new get({
        TableName: "portfolio-social",
        Key: { id: id.toString() }
      }));
      return result.Item as SocialLink | undefined;
    } catch (error) {
      console.error("DynamoDB getSocialLink error:", error);
      throw error;
    }
  }

  async createSocialLink(link: InsertSocialLink): Promise<SocialLink> {
    try {
      const id = Date.now().toString();
      const newLink = { id, ...link } as SocialLink;
      await docClient.send(new put({
        TableName: "portfolio-social",
        Item: newLink
      }));
      return newLink;
    } catch (error) {
      console.error("DynamoDB createSocialLink error:", error);
      throw error;
    }
  }

  async updateSocialLink(id: number, link: Partial<InsertSocialLink>): Promise<SocialLink | undefined> {
    try {
      const existing = await this.getSocialLink(id);
      if (!existing) return undefined;
      
      const updated = { ...existing, ...link } as SocialLink;
      await docClient.send(new put({
        TableName: "portfolio-social",
        Item: updated
      }));
      return updated;
    } catch (error) {
      console.error("DynamoDB updateSocialLink error:", error);
      throw error;
    }
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    try {
      const existing = await this.getSocialLink(id);
      if (!existing) return false;
      
      await docClient.send(new deleteItem({
        TableName: "portfolio-social",
        Key: { id: id.toString() }
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB deleteSocialLink error:", error);
      throw error;
    }
  }

  // Resume operations
  async getResume(): Promise<Resume | undefined> {
    try {
      const result = await docClient.send(new get({
        TableName: "portfolio-resume",
        Key: { id: "resume-1" }
      }));
      return result.Item as Resume | undefined;
    } catch (error) {
      console.error("DynamoDB getResume error:", error);
      throw error;
    }
  }

  async upsertResume(data: InsertResume): Promise<Resume> {
    try {
      const resumeData = {
        id: "resume-1",
        ...data,
        uploadedAt: new Date().toISOString()
      } as Resume;
      await docClient.send(new put({
        TableName: "portfolio-resume",
        Item: resumeData
      }));
      return resumeData;
    } catch (error) {
      console.error("DynamoDB upsertResume error:", error);
      throw error;
    }
  }

  async deleteResume(): Promise<boolean> {
    try {
      const existing = await this.getResume();
      if (!existing) return false;
      
      await docClient.send(new deleteItem({
        TableName: "portfolio-resume",
        Key: { id: "resume-1" }
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB deleteResume error:", error);
      throw error;
    }
  }
}
