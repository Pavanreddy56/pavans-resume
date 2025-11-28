import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
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
  async getAdmin(id: number): Promise<Admin | undefined> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: "portfolio-admins",
        Key: { id: id.toString() }
      }));
      return result.Item as Admin | undefined;
    } catch (error) {
      console.error("DynamoDB getAdmin error:", error);
      return undefined;
    }
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: "portfolio-admins",
        IndexName: "username-index",
        KeyConditionExpression: "username = :username",
        ExpressionAttributeValues: { ":username": username }
      }));
      return result.Items?.[0] as Admin | undefined;
    } catch (error) {
      console.error("DynamoDB getAdminByUsername error:", error);
      return undefined;
    }
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const id = Date.now().toString();
    const newAdmin = { id, ...admin } as Admin;
    await docClient.send(new PutCommand({
      TableName: "portfolio-admins",
      Item: newAdmin
    }));
    return newAdmin;
  }

  async getHero(): Promise<Hero | undefined> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: "portfolio-hero",
        Key: { id: "hero-1" }
      }));
      return result.Item as Hero | undefined;
    } catch (error) {
      console.error("DynamoDB getHero error:", error);
      return undefined;
    }
  }

  async upsertHero(hero: InsertHero): Promise<Hero> {
    const heroData = { id: "hero-1", ...hero } as Hero;
    await docClient.send(new PutCommand({
      TableName: "portfolio-hero",
      Item: heroData
    }));
    return heroData;
  }

  async getSkills(): Promise<Skill[]> {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: "portfolio-skills"
      }));
      return (result.Items as Skill[]) || [];
    } catch (error) {
      console.error("DynamoDB getSkills error:", error);
      return [];
    }
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: "portfolio-skills",
        Key: { id: id.toString() }
      }));
      return result.Item as Skill | undefined;
    } catch (error) {
      console.error("DynamoDB getSkill error:", error);
      return undefined;
    }
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const id = Date.now().toString();
    const newSkill = { id, ...skill } as Skill;
    await docClient.send(new PutCommand({
      TableName: "portfolio-skills",
      Item: newSkill
    }));
    return newSkill;
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined> {
    const existing = await this.getSkill(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...skill } as Skill;
    await docClient.send(new PutCommand({
      TableName: "portfolio-skills",
      Item: updated
    }));
    return updated;
  }

  async deleteSkill(id: number): Promise<boolean> {
    try {
      const existing = await this.getSkill(id);
      if (!existing) return false;
      await docClient.send(new DeleteCommand({
        TableName: "portfolio-skills",
        Key: { id: id.toString() }
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB deleteSkill error:", error);
      return false;
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: "portfolio-projects"
      }));
      return (result.Items as Project[]) || [];
    } catch (error) {
      console.error("DynamoDB getProjects error:", error);
      return [];
    }
  }

  async getProject(id: number): Promise<Project | undefined> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: "portfolio-projects",
        Key: { id: id.toString() }
      }));
      return result.Item as Project | undefined;
    } catch (error) {
      console.error("DynamoDB getProject error:", error);
      return undefined;
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = Date.now().toString();
    const newProject = { id, ...project } as Project;
    await docClient.send(new PutCommand({
      TableName: "portfolio-projects",
      Item: newProject
    }));
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existing = await this.getProject(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...project } as Project;
    await docClient.send(new PutCommand({
      TableName: "portfolio-projects",
      Item: updated
    }));
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      const existing = await this.getProject(id);
      if (!existing) return false;
      await docClient.send(new DeleteCommand({
        TableName: "portfolio-projects",
        Key: { id: id.toString() }
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB deleteProject error:", error);
      return false;
    }
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: "portfolio-blog"
      }));
      return (result.Items as BlogPost[]) || [];
    } catch (error) {
      console.error("DynamoDB getBlogPosts error:", error);
      return [];
    }
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: "portfolio-blog",
        Key: { id: id.toString() }
      }));
      return result.Item as BlogPost | undefined;
    } catch (error) {
      console.error("DynamoDB getBlogPost error:", error);
      return undefined;
    }
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = Date.now().toString();
    const newPost = {
      id,
      ...post,
      publishedAt: new Date().toISOString()
    } as BlogPost;
    await docClient.send(new PutCommand({
      TableName: "portfolio-blog",
      Item: newPost
    }));
    return newPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const existing = await this.getBlogPost(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...post } as BlogPost;
    await docClient.send(new PutCommand({
      TableName: "portfolio-blog",
      Item: updated
    }));
    return updated;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    try {
      const existing = await this.getBlogPost(id);
      if (!existing) return false;
      await docClient.send(new DeleteCommand({
        TableName: "portfolio-blog",
        Key: { id: id.toString() }
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB deleteBlogPost error:", error);
      return false;
    }
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: "portfolio-messages"
      }));
      return (result.Items as ContactMessage[]) || [];
    } catch (error) {
      console.error("DynamoDB getContactMessages error:", error);
      return [];
    }
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: "portfolio-messages",
        Key: { id: id.toString() }
      }));
      return result.Item as ContactMessage | undefined;
    } catch (error) {
      console.error("DynamoDB getContactMessage error:", error);
      return undefined;
    }
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = Date.now().toString();
    const newMessage = {
      id,
      ...message,
      createdAt: new Date(),
      read: false
    } as ContactMessage;
    await docClient.send(new PutCommand({
      TableName: "portfolio-messages",
      Item: newMessage
    }));
    return newMessage;
  }

  async markMessageRead(id: number): Promise<boolean> {
    try {
      const existing = await this.getContactMessage(id);
      if (!existing) return false;
      const updated = { ...existing, read: true } as ContactMessage;
      await docClient.send(new PutCommand({
        TableName: "portfolio-messages",
        Item: updated
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB markMessageRead error:", error);
      return false;
    }
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    try {
      const existing = await this.getContactMessage(id);
      if (!existing) return false;
      await docClient.send(new DeleteCommand({
        TableName: "portfolio-messages",
        Key: { id: id.toString() }
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB deleteContactMessage error:", error);
      return false;
    }
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: "portfolio-social"
      }));
      return (result.Items as SocialLink[]) || [];
    } catch (error) {
      console.error("DynamoDB getSocialLinks error:", error);
      return [];
    }
  }

  async getSocialLink(id: number): Promise<SocialLink | undefined> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: "portfolio-social",
        Key: { id: id.toString() }
      }));
      return result.Item as SocialLink | undefined;
    } catch (error) {
      console.error("DynamoDB getSocialLink error:", error);
      return undefined;
    }
  }

  async createSocialLink(link: InsertSocialLink): Promise<SocialLink> {
    const id = Date.now().toString();
    const newLink = { id, ...link } as SocialLink;
    await docClient.send(new PutCommand({
      TableName: "portfolio-social",
      Item: newLink
    }));
    return newLink;
  }

  async updateSocialLink(id: number, link: Partial<InsertSocialLink>): Promise<SocialLink | undefined> {
    const existing = await this.getSocialLink(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...link } as SocialLink;
    await docClient.send(new PutCommand({
      TableName: "portfolio-social",
      Item: updated
    }));
    return updated;
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    try {
      const existing = await this.getSocialLink(id);
      if (!existing) return false;
      await docClient.send(new DeleteCommand({
        TableName: "portfolio-social",
        Key: { id: id.toString() }
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB deleteSocialLink error:", error);
      return false;
    }
  }

  async getResume(): Promise<Resume | undefined> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: "portfolio-resume",
        Key: { id: "resume-1" }
      }));
      return result.Item as Resume | undefined;
    } catch (error) {
      console.error("DynamoDB getResume error:", error);
      return undefined;
    }
  }

  async upsertResume(data: InsertResume): Promise<Resume> {
    const resumeData = {
      id: "resume-1",
      ...data,
      uploadedAt: new Date().toISOString()
    } as Resume;
    await docClient.send(new PutCommand({
      TableName: "portfolio-resume",
      Item: resumeData
    }));
    return resumeData;
  }

  async deleteResume(): Promise<boolean> {
    try {
      const existing = await this.getResume();
      if (!existing) return false;
      await docClient.send(new DeleteCommand({
        TableName: "portfolio-resume",
        Key: { id: "resume-1" }
      }));
      return true;
    } catch (error) {
      console.error("DynamoDB deleteResume error:", error);
      return false;
    }
  }
}
