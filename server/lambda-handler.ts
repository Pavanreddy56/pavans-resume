import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
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

const storage = new DynamoDBStorage();
const JWT_SECRET = process.env.SESSION_SECRET || "portfolio-secret-key";

// CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

interface AuthRequest extends APIGatewayProxyEvent {
  admin?: { id: string; username: string };
}

function parseJWT(token: string): { id: string; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string };
  } catch {
    return null;
  }
}

function unauthorized(): APIGatewayProxyResult {
  return {
    statusCode: 401,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: "Unauthorized" }),
  };
}

function notFound(): APIGatewayProxyResult {
  return {
    statusCode: 404,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: "Not found" }),
  };
}

function serverError(error: unknown): APIGatewayProxyResult {
  console.error("Error:", error);
  return {
    statusCode: 500,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: "Internal server error" }),
  };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  try {
    const path = event.path.replace(/^\/api/, "");
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : null;

    // Check auth for protected routes
    let admin = null;
    if (path.startsWith("/admin") && !path.includes("login")) {
      const authHeader = event.headers.authorization || event.headers.Authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return unauthorized();
      }
      const token = authHeader.split(" ")[1];
      admin = parseJWT(token);
      if (!admin) {
        return unauthorized();
      }
    }

    // Routes
    // POST /admin/login
    if (path === "/admin/login" && method === "POST") {
      const { username, password } = body;
      if (!username || !password) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Username and password required" }),
        };
      }

      let user = await storage.getAdminByUsername(username);
      if (!user) {
        if (username === "Pavan56" && password === "Pavanreddy56@") {
          const hashedPassword = await bcrypt.hash(password, 10);
          user = await storage.createAdmin({ username, password: hashedPassword });
        } else {
          return {
            statusCode: 401,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: "Invalid credentials" }),
          };
        }
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Invalid credentials" }),
        };
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: "24h",
      });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ token }),
      };
    }

    // GET /hero
    if (path === "/hero" && method === "GET") {
      const hero = await storage.getHero();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(
          hero || {
            id: 0,
            name: "Pavan Reddy Cheedeti",
            title: "DevOps Engineer",
            intro: "Cloud enthusiast...",
            profileImage: null,
          }
        ),
      };
    }

    // PUT /hero (admin)
    if (path === "/hero" && method === "PUT") {
      if (!admin) return unauthorized();
      const parsed = insertHeroSchema.safeParse(body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Invalid data", errors: parsed.error.errors }),
        };
      }
      const hero = await storage.upsertHero(parsed.data);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(hero),
      };
    }

    // GET /skills
    if (path === "/skills" && method === "GET") {
      const skills = await storage.getSkills();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(skills),
      };
    }

    // POST /skills (admin)
    if (path === "/skills" && method === "POST") {
      if (!admin) return unauthorized();
      const parsed = insertSkillSchema.safeParse(body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Invalid data", errors: parsed.error.errors }),
        };
      }
      const skill = await storage.createSkill(parsed.data);
      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify(skill),
      };
    }

    // PUT /skills/:id (admin)
    if (path.match(/^\/skills\/\d+$/) && method === "PUT") {
      if (!admin) return unauthorized();
      const id = parseInt(path.split("/")[2]);
      const parsed = insertSkillSchema.partial().safeParse(body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Invalid data", errors: parsed.error.errors }),
        };
      }
      const skill = await storage.updateSkill(id, parsed.data);
      if (!skill) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(skill),
      };
    }

    // DELETE /skills/:id (admin)
    if (path.match(/^\/skills\/\d+$/) && method === "DELETE") {
      if (!admin) return unauthorized();
      const id = parseInt(path.split("/")[2]);
      const deleted = await storage.deleteSkill(id);
      if (!deleted) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    // GET /projects
    if (path === "/projects" && method === "GET") {
      const projects = await storage.getProjects();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(projects),
      };
    }

    // POST /projects (admin)
    if (path === "/projects" && method === "POST") {
      if (!admin) return unauthorized();
      const parsed = insertProjectSchema.safeParse(body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Invalid data", errors: parsed.error.errors }),
        };
      }
      const project = await storage.createProject(parsed.data);
      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify(project),
      };
    }

    // PUT /projects/:id (admin)
    if (path.match(/^\/projects\/\d+$/) && method === "PUT") {
      if (!admin) return unauthorized();
      const id = parseInt(path.split("/")[2]);
      const parsed = insertProjectSchema.partial().safeParse(body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Invalid data", errors: parsed.error.errors }),
        };
      }
      const project = await storage.updateProject(id, parsed.data);
      if (!project) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(project),
      };
    }

    // DELETE /projects/:id (admin)
    if (path.match(/^\/projects\/\d+$/) && method === "DELETE") {
      if (!admin) return unauthorized();
      const id = parseInt(path.split("/")[2]);
      const deleted = await storage.deleteProject(id);
      if (!deleted) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    // GET /blog
    if (path === "/blog" && method === "GET") {
      const posts = await storage.getBlogPosts();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(posts),
      };
    }

    // GET /blog/:id
    if (path.match(/^\/blog\/\d+$/) && method === "GET") {
      const id = parseInt(path.split("/")[2]);
      const post = await storage.getBlogPost(id);
      if (!post) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(post),
      };
    }

    // POST /blog (admin)
    if (path === "/blog" && method === "POST") {
      if (!admin) return unauthorized();
      const parsed = insertBlogPostSchema.safeParse(body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Invalid data", errors: parsed.error.errors }),
        };
      }
      const post = await storage.createBlogPost(parsed.data);
      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify(post),
      };
    }

    // PUT /blog/:id (admin)
    if (path.match(/^\/blog\/\d+$/) && method === "PUT") {
      if (!admin) return unauthorized();
      const id = parseInt(path.split("/")[2]);
      const parsed = insertBlogPostSchema.partial().safeParse(body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Invalid data", errors: parsed.error.errors }),
        };
      }
      const post = await storage.updateBlogPost(id, parsed.data);
      if (!post) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(post),
      };
    }

    // DELETE /blog/:id (admin)
    if (path.match(/^\/blog\/\d+$/) && method === "DELETE") {
      if (!admin) return unauthorized();
      const id = parseInt(path.split("/")[2]);
      const deleted = await storage.deleteBlogPost(id);
      if (!deleted) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    // GET /social-links
    if (path === "/social-links" && method === "GET") {
      const links = await storage.getSocialLinks();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(links),
      };
    }

    // POST /social-links (admin)
    if (path === "/social-links" && method === "POST") {
      if (!admin) return unauthorized();
      const parsed = insertSocialLinkSchema.safeParse(body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Invalid data", errors: parsed.error.errors }),
        };
      }
      const link = await storage.createSocialLink(parsed.data);
      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify(link),
      };
    }

    // PUT /social-links/:id (admin)
    if (path.match(/^\/social-links\/\d+$/) && method === "PUT") {
      if (!admin) return unauthorized();
      const id = parseInt(path.split("/")[2]);
      const parsed = insertSocialLinkSchema.partial().safeParse(body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Invalid data", errors: parsed.error.errors }),
        };
      }
      const link = await storage.updateSocialLink(id, parsed.data);
      if (!link) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(link),
      };
    }

    // DELETE /social-links/:id (admin)
    if (path.match(/^\/social-links\/\d+$/) && method === "DELETE") {
      if (!admin) return unauthorized();
      const id = parseInt(path.split("/")[2]);
      const deleted = await storage.deleteSocialLink(id);
      if (!deleted) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    // POST /contact
    if (path === "/contact" && method === "POST") {
      const parsed = insertContactMessageSchema.safeParse(body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Invalid data", errors: parsed.error.errors }),
        };
      }
      const message = await storage.createContactMessage(parsed.data);
      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify(message),
      };
    }

    // GET /messages (admin)
    if (path === "/messages" && method === "GET") {
      if (!admin) return unauthorized();
      const messages = await storage.getContactMessages();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(messages),
      };
    }

    // PUT /messages/:id/read (admin)
    if (path.match(/^\/messages\/\d+\/read$/) && method === "PUT") {
      if (!admin) return unauthorized();
      const id = parseInt(path.split("/")[2]);
      const marked = await storage.markMessageRead(id);
      if (!marked) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    // DELETE /messages/:id (admin)
    if (path.match(/^\/messages\/\d+$/) && method === "DELETE") {
      if (!admin) return unauthorized();
      const id = parseInt(path.split("/")[2]);
      const deleted = await storage.deleteContactMessage(id);
      if (!deleted) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    // GET /resume
    if (path === "/resume" && method === "GET") {
      const resume = await storage.getResume();
      if (!resume) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(resume),
      };
    }

    // PUT /resume (admin)
    if (path === "/resume" && method === "PUT") {
      if (!admin) return unauthorized();
      const resume = await storage.upsertResume(body);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(resume),
      };
    }

    // DELETE /resume (admin)
    if (path === "/resume" && method === "DELETE") {
      if (!admin) return unauthorized();
      const deleted = await storage.deleteResume();
      if (!deleted) return notFound();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    return notFound();
  } catch (error) {
    return serverError(error);
  }
}
