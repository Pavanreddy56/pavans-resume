import type { Request, Response, NextFunction } from "express";
import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { DynamoDBStorage } from "./dynamodb-storage";
import {
  insertSkillSchema,
  insertProjectSchema,
  insertBlogPostSchema,
  insertContactMessageSchema,
  insertSocialLinkSchema,
  insertHeroSchema,
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const storage = new DynamoDBStorage();
const JWT_SECRET = process.env.SESSION_SECRET || "portfolio-secret-key-dev";

app.use(express.json());

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

interface AuthRequest extends Request {
  admin?: { id: string; username: string };
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string };
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Public routes
app.get("/api/hero", async (req, res) => {
  try {
    const hero = await storage.getHero();
    if (!hero) {
      return res.json({
        id: "0",
        name: "Pavan Reddy Cheedeti",
        title: "DevOps Engineer",
        intro: "Cloud enthusiast with 2+ years of experience in DevOps...",
        profileImage: null,
      });
    }
    res.json(hero);
  } catch (error) {
    console.error("Get hero error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/hero", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const parsed = insertHeroSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const hero = await storage.upsertHero(parsed.data);
    res.json(hero);
  } catch (error) {
    console.error("Update hero error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/skills", async (req, res) => {
  try {
    const skills = await storage.getSkills();
    res.json(skills);
  } catch (error) {
    console.error("Get skills error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/skills", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const parsed = insertSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const skill = await storage.createSkill(parsed.data);
    res.status(201).json(skill);
  } catch (error) {
    console.error("Create skill error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/skills/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertSkillSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const skill = await storage.updateSkill(id, parsed.data);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json(skill);
  } catch (error) {
    console.error("Update skill error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/skills/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteSkill(id);
    if (!deleted) return res.status(404).json({ message: "Skill not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete skill error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const projects = await storage.getProjects();
    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/projects", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const parsed = insertProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const project = await storage.createProject(parsed.data);
    res.status(201).json(project);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/projects/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertProjectSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const project = await storage.updateProject(id, parsed.data);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/projects/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteProject(id);
    if (!deleted) return res.status(404).json({ message: "Project not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/blog", async (req, res) => {
  try {
    const posts = await storage.getBlogPosts();
    res.json(posts);
  } catch (error) {
    console.error("Get blog posts error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/blog/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await storage.getBlogPost(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    console.error("Get blog post error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/blog", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const parsed = insertBlogPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const post = await storage.createBlogPost(parsed.data);
    res.status(201).json(post);
  } catch (error) {
    console.error("Create blog post error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/blog/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertBlogPostSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const post = await storage.updateBlogPost(id, parsed.data);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    console.error("Update blog post error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/blog/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteBlogPost(id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete blog post error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/social-links", async (req, res) => {
  try {
    const links = await storage.getSocialLinks();
    res.json(links);
  } catch (error) {
    console.error("Get social links error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/social-links", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const parsed = insertSocialLinkSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const link = await storage.createSocialLink(parsed.data);
    res.status(201).json(link);
  } catch (error) {
    console.error("Create social link error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/social-links/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertSocialLinkSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const link = await storage.updateSocialLink(id, parsed.data);
    if (!link) return res.status(404).json({ message: "Link not found" });
    res.json(link);
  } catch (error) {
    console.error("Update social link error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/social-links/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteSocialLink(id);
    if (!deleted) return res.status(404).json({ message: "Link not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete social link error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const parsed = insertContactMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const message = await storage.createContactMessage(parsed.data);
    res.status(201).json(message);
  } catch (error) {
    console.error("Create contact message error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const messages = await storage.getContactMessages();
    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/messages/:id/read", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const marked = await storage.markMessageRead(id);
    if (!marked) return res.status(404).json({ message: "Message not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Mark message read error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/messages/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteContactMessage(id);
    if (!deleted) return res.status(404).json({ message: "Message not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/resume", async (req, res) => {
  try {
    const resume = await storage.getResume();
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json(resume);
  } catch (error) {
    console.error("Get resume error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/resume", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const resume = await storage.upsertResume(req.body);
    res.json(resume);
  } catch (error) {
    console.error("Update resume error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/resume", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const deleted = await storage.deleteResume();
    if (!deleted) return res.status(404).json({ message: "Resume not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    let admin = await storage.getAdminByUsername(username);

    if (!admin) {
      if (username === "Pavan56" && password === "Pavanreddy56@") {
        const hashedPassword = await bcrypt.hash(password, 10);
        admin = await storage.createAdmin({
          username: "Pavan56",
          password: hashedPassword,
        });
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Serve static frontend files
const clientDir = join(__dirname, "../dist/public");
app.use(express.static(clientDir));

// Fallback to index.html for React Router client-side routing
app.get("*", (req: Request, res: Response) => {
  res.sendFile(join(clientDir, "index.html"));
});

const server = createServer(app);
const PORT = parseInt(process.env.PORT || "5000", 10);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[express] serving on port ${PORT}`);
});

export default server;
