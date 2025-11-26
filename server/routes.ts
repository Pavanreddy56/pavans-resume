import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
import multer from "multer";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.SESSION_SECRET || "portfolio-secret-key";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: uploadStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

interface AuthRequest extends Request {
  admin?: { id: number; username: string };
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.get("/api/hero", async (req, res) => {
    try {
      const hero = await storage.getHero();
      if (!hero) {
        return res.json({
          id: 0,
          name: "Pavan Reddy Cheedeti",
          title: "DevOps Engineer",
          intro:
            "Cloud enthusiast with 2+ years of experience in DevOps, specializing in AWS, Docker, Kubernetes, and CI/CD pipelines. Passionate about automating infrastructure and streamlining deployment processes.",
          profileImage: null,
        });
      }
      res.json(hero);
    } catch (error) {
      console.error("Get hero error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/hero", async (req, res) => {
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

  app.post("/api/skills", async (req, res) => {
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

  app.put("/api/skills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsed = insertSkillSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const skill = await storage.updateSkill(id, parsed.data);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      res.json(skill);
    } catch (error) {
      console.error("Update skill error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/skills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSkill(id);
      if (!deleted) {
        return res.status(404).json({ message: "Skill not found" });
      }
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

  app.post("/api/projects", async (req, res) => {
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

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsed = insertProjectSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const project = await storage.updateProject(id, parsed.data);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
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
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Get blog post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/blog", async (req, res) => {
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

  app.put("/api/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsed = insertBlogPostSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const post = await storage.updateBlogPost(id, parsed.data);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Update blog post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBlogPost(id);
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }
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

  app.post("/api/social-links", async (req, res) => {
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

  app.put("/api/social-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsed = insertSocialLinkSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const link = await storage.updateSocialLink(id, parsed.data);
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }
      res.json(link);
    } catch (error) {
      console.error("Update social link error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/social-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSocialLink(id);
      if (!deleted) {
        return res.status(404).json({ message: "Link not found" });
      }
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

  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/messages/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markMessageRead(id);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Mark message read error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContactMessage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete message error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/resume", async (req, res) => {
    try {
      const resumeData = await storage.getResume();
      if (!resumeData) {
        return res.status(404).json({ message: "No resume uploaded" });
      }
      res.json(resumeData);
    } catch (error) {
      console.error("Get resume error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/resume/upload", upload.single("resume"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const existingResume = await storage.getResume();
      if (existingResume) {
        const oldPath = path.join(uploadDir, path.basename(existingResume.filePath));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const resumeData = await storage.upsertResume({
        filePath: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
      });

      res.json(resumeData);
    } catch (error) {
      console.error("Upload resume error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/resume/download", async (req, res) => {
    try {
      const resumeData = await storage.getResume();
      if (!resumeData) {
        return res.status(404).json({ message: "No resume uploaded" });
      }

      const filePath = path.join(uploadDir, path.basename(resumeData.filePath));
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Resume file not found" });
      }

      res.download(filePath, resumeData.fileName);
    } catch (error) {
      console.error("Download resume error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/resume", async (req, res) => {
    try {
      const existingResume = await storage.getResume();
      if (existingResume) {
        const oldPath = path.join(uploadDir, path.basename(existingResume.filePath));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const deleted = await storage.deleteResume();
      if (!deleted) {
        return res.status(404).json({ message: "No resume to delete" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete resume error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.use("/uploads", (req, res, next) => {
    res.sendFile(path.join(uploadDir, req.path));
  });

  const httpServer = createServer(app);

  return httpServer;
}
