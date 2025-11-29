import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamodb);

const JWT_SECRET = process.env.SESSION_SECRET || "portfolio-secret-key";

// Hardcoded admin credentials
const ADMIN_USERNAME = "Pavan56";
const ADMIN_PASSWORD = "Pavanreddy56@";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

function parseJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// DynamoDB Operations for Hero
async function getHero() {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: "portfolio-hero",
      Limit: 1
    }));
    return result.Items?.[0] || null;
  } catch (error) {
    console.error("Error getting hero:", error);
    return null;
  }
}

async function upsertHero(data) {
  try {
    const existing = await getHero();
    const item = { id: existing?.id || uuid(), ...data };
    await docClient.send(new PutCommand({
      TableName: "portfolio-hero",
      Item: item
    }));
    return item;
  } catch (error) {
    console.error("Error upserting hero:", error);
    return null;
  }
}

// DynamoDB Operations for Skills
async function getSkills() {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: "portfolio-skills"
    }));
    return result.Items || [];
  } catch (error) {
    console.error("Error getting skills:", error);
    return [];
  }
}

async function createSkill(data) {
  try {
    const item = { id: uuid(), ...data };
    await docClient.send(new PutCommand({
      TableName: "portfolio-skills",
      Item: item
    }));
    return item;
  } catch (error) {
    console.error("Error creating skill:", error);
    return null;
  }
}

async function updateSkill(id, data) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: "portfolio-skills",
      Key: { id }
    }));
    if (!result.Item) return null;
    const updated = { ...result.Item, ...data };
    await docClient.send(new PutCommand({
      TableName: "portfolio-skills",
      Item: updated
    }));
    return updated;
  } catch (error) {
    console.error("Error updating skill:", error);
    return null;
  }
}

async function deleteSkill(id) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: "portfolio-skills",
      Key: { id }
    }));
    if (!result.Item) return false;
    await docClient.send(new DeleteCommand({
      TableName: "portfolio-skills",
      Key: { id }
    }));
    return true;
  } catch (error) {
    console.error("Error deleting skill:", error);
    return false;
  }
}

// DynamoDB Operations for Projects
async function getProjects() {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: "portfolio-projects"
    }));
    return result.Items || [];
  } catch (error) {
    console.error("Error getting projects:", error);
    return [];
  }
}

async function createProject(data) {
  try {
    const item = { id: uuid(), ...data };
    await docClient.send(new PutCommand({
      TableName: "portfolio-projects",
      Item: item
    }));
    return item;
  } catch (error) {
    console.error("Error creating project:", error);
    return null;
  }
}

async function updateProject(id, data) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: "portfolio-projects",
      Key: { id }
    }));
    if (!result.Item) return null;
    const updated = { ...result.Item, ...data };
    await docClient.send(new PutCommand({
      TableName: "portfolio-projects",
      Item: updated
    }));
    return updated;
  } catch (error) {
    console.error("Error updating project:", error);
    return null;
  }
}

async function deleteProject(id) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: "portfolio-projects",
      Key: { id }
    }));
    if (!result.Item) return false;
    await docClient.send(new DeleteCommand({
      TableName: "portfolio-projects",
      Key: { id }
    }));
    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    return false;
  }
}

// DynamoDB Operations for Blog
async function getBlogPosts() {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: "portfolio-blog"
    }));
    return result.Items || [];
  } catch (error) {
    console.error("Error getting blog posts:", error);
    return [];
  }
}

async function createBlogPost(data) {
  try {
    const item = { id: uuid(), publishedAt: new Date().toISOString(), ...data };
    await docClient.send(new PutCommand({
      TableName: "portfolio-blog",
      Item: item
    }));
    return item;
  } catch (error) {
    console.error("Error creating blog post:", error);
    return null;
  }
}

async function updateBlogPost(id, data) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: "portfolio-blog",
      Key: { id }
    }));
    if (!result.Item) return null;
    const updated = { ...result.Item, ...data };
    await docClient.send(new PutCommand({
      TableName: "portfolio-blog",
      Item: updated
    }));
    return updated;
  } catch (error) {
    console.error("Error updating blog post:", error);
    return null;
  }
}

async function deleteBlogPost(id) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: "portfolio-blog",
      Key: { id }
    }));
    if (!result.Item) return false;
    await docClient.send(new DeleteCommand({
      TableName: "portfolio-blog",
      Key: { id }
    }));
    return true;
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return false;
  }
}

// DynamoDB Operations for Social Links
async function getSocialLinks() {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: "portfolio-social"
    }));
    return result.Items || [];
  } catch (error) {
    console.error("Error getting social links:", error);
    return [];
  }
}

async function createSocialLink(data) {
  try {
    const item = { id: uuid(), ...data };
    await docClient.send(new PutCommand({
      TableName: "portfolio-social",
      Item: item
    }));
    return item;
  } catch (error) {
    console.error("Error creating social link:", error);
    return null;
  }
}

async function updateSocialLink(id, data) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: "portfolio-social",
      Key: { id }
    }));
    if (!result.Item) return null;
    const updated = { ...result.Item, ...data };
    await docClient.send(new PutCommand({
      TableName: "portfolio-social",
      Item: updated
    }));
    return updated;
  } catch (error) {
    console.error("Error updating social link:", error);
    return null;
  }
}

async function deleteSocialLink(id) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: "portfolio-social",
      Key: { id }
    }));
    if (!result.Item) return false;
    await docClient.send(new DeleteCommand({
      TableName: "portfolio-social",
      Key: { id }
    }));
    return true;
  } catch (error) {
    console.error("Error deleting social link:", error);
    return false;
  }
}

// DynamoDB Operations for Contact Messages
async function getContactMessages() {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: "portfolio-messages"
    }));
    return result.Items || [];
  } catch (error) {
    console.error("Error getting contact messages:", error);
    return [];
  }
}

async function createContactMessage(data) {
  try {
    const item = { id: uuid(), createdAt: new Date().toISOString(), read: false, ...data };
    await docClient.send(new PutCommand({
      TableName: "portfolio-messages",
      Item: item
    }));
    return item;
  } catch (error) {
    console.error("Error creating contact message:", error);
    return null;
  }
}

async function markMessageRead(id) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: "portfolio-messages",
      Key: { id }
    }));
    if (!result.Item) return false;
    const updated = { ...result.Item, read: true };
    await docClient.send(new PutCommand({
      TableName: "portfolio-messages",
      Item: updated
    }));
    return true;
  } catch (error) {
    console.error("Error marking message read:", error);
    return false;
  }
}

async function deleteContactMessage(id) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: "portfolio-messages",
      Key: { id }
    }));
    if (!result.Item) return false;
    await docClient.send(new DeleteCommand({
      TableName: "portfolio-messages",
      Key: { id }
    }));
    return true;
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return false;
  }
}

// DynamoDB Operations for Resume
async function getResume() {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: "portfolio-resume",
      Limit: 1
    }));
    return result.Items?.[0] || null;
  } catch (error) {
    console.error("Error getting resume:", error);
    return null;
  }
}

async function upsertResume(data) {
  try {
    const existing = await getResume();
    const item = { id: existing?.id || uuid(), uploadedAt: new Date().toISOString(), ...data };
    await docClient.send(new PutCommand({
      TableName: "portfolio-resume",
      Item: item
    }));
    return item;
  } catch (error) {
    console.error("Error upserting resume:", error);
    return null;
  }
}

async function deleteResume() {
  try {
    const existing = await getResume();
    if (!existing) return false;
    await docClient.send(new DeleteCommand({
      TableName: "portfolio-resume",
      Key: { id: existing.id }
    }));
    return true;
  } catch (error) {
    console.error("Error deleting resume:", error);
    return false;
  }
}

// Lambda Handler
export async function handler(event) {
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
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Unauthorized" }),
        };
      }
      const token = authHeader.split(" ")[1];
      admin = parseJWT(token);
      if (!admin) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: "Unauthorized" }),
        };
      }
    }

    // POST /admin/login - Simple hardcoded login
    if (path === "/admin/login" && method === "POST") {
      const { username, password } = body;
      
      // Check hardcoded credentials
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ id: "admin-1", username }, JWT_SECRET, {
          expiresIn: "24h",
        });
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ token }),
        };
      }
      
      // Invalid credentials
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Invalid credentials" }),
      };
    }

    // GET /hero
    if (path === "/hero" && method === "GET") {
      const hero = await getHero();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(
          hero || {
            id: "default",
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
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const hero = await upsertHero(body);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(hero),
      };
    }

    // GET /skills
    if (path === "/skills" && method === "GET") {
      const skills = await getSkills();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(skills),
      };
    }

    // POST /skills (admin)
    if (path === "/skills" && method === "POST") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const skill = await createSkill(body);
      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify(skill),
      };
    }

    // PUT /skills/:id (admin)
    if (path.match(/^\/skills\/[^/]+$/) && method === "PUT") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const id = path.split("/")[2];
      const skill = await updateSkill(id, body);
      if (!skill) return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not found" }) };
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(skill),
      };
    }

    // DELETE /skills/:id (admin)
    if (path.match(/^\/skills\/[^/]+$/) && method === "DELETE") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const id = path.split("/")[2];
      const deleted = await deleteSkill(id);
      if (!deleted) return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not found" }) };
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    // GET /projects
    if (path === "/projects" && method === "GET") {
      const projects = await getProjects();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(projects),
      };
    }

    // POST /projects (admin)
    if (path === "/projects" && method === "POST") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const project = await createProject(body);
      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify(project),
      };
    }

    // PUT /projects/:id (admin)
    if (path.match(/^\/projects\/[^/]+$/) && method === "PUT") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const id = path.split("/")[2];
      const project = await updateProject(id, body);
      if (!project) return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not found" }) };
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(project),
      };
    }

    // DELETE /projects/:id (admin)
    if (path.match(/^\/projects\/[^/]+$/) && method === "DELETE") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const id = path.split("/")[2];
      const deleted = await deleteProject(id);
      if (!deleted) return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not found" }) };
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    // GET /blog
    if (path === "/blog" && method === "GET") {
      const posts = await getBlogPosts();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(posts),
      };
    }

    // POST /blog (admin)
    if (path === "/blog" && method === "POST") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const post = await createBlogPost(body);
      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify(post),
      };
    }

    // PUT /blog/:id (admin)
    if (path.match(/^\/blog\/[^/]+$/) && method === "PUT") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const id = path.split("/")[2];
      const post = await updateBlogPost(id, body);
      if (!post) return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not found" }) };
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(post),
      };
    }

    // DELETE /blog/:id (admin)
    if (path.match(/^\/blog\/[^/]+$/) && method === "DELETE") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const id = path.split("/")[2];
      const deleted = await deleteBlogPost(id);
      if (!deleted) return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not found" }) };
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    // GET /social-links
    if (path === "/social-links" && method === "GET") {
      const links = await getSocialLinks();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(links),
      };
    }

    // POST /social-links (admin)
    if (path === "/social-links" && method === "POST") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const link = await createSocialLink(body);
      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify(link),
      };
    }

    // PUT /social-links/:id (admin)
    if (path.match(/^\/social-links\/[^/]+$/) && method === "PUT") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const id = path.split("/")[2];
      const link = await updateSocialLink(id, body);
      if (!link) return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not found" }) };
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(link),
      };
    }

    // DELETE /social-links/:id (admin)
    if (path.match(/^\/social-links\/[^/]+$/) && method === "DELETE") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const id = path.split("/")[2];
      const deleted = await deleteSocialLink(id);
      if (!deleted) return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not found" }) };
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    // POST /contact
    if (path === "/contact" && method === "POST") {
      const message = await createContactMessage(body);
      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify(message),
      };
    }

    // GET /messages (admin)
    if (path === "/messages" && method === "GET") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const messages = await getContactMessages();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(messages),
      };
    }

    // PUT /messages/:id/read (admin)
    if (path.match(/^\/messages\/[^/]+\/read$/) && method === "PUT") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const id = path.split("/")[2];
      const marked = await markMessageRead(id);
      if (!marked) return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not found" }) };
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    // DELETE /messages/:id (admin)
    if (path.match(/^\/messages\/[^/]+$/) && method === "DELETE") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const id = path.split("/")[2];
      const deleted = await deleteContactMessage(id);
      if (!deleted) return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not found" }) };
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    // GET /resume
    if (path === "/resume" && method === "GET") {
      const resume = await getResume();
      if (!resume) return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not found" }) };
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(resume),
      };
    }

    // PUT /resume (admin)
    if (path === "/resume" && method === "PUT") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const resume = await upsertResume(body);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(resume),
      };
    }

    // DELETE /resume (admin)
    if (path === "/resume" && method === "DELETE") {
      if (!admin) return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ message: "Unauthorized" }) };
      const deleted = await deleteResume();
      if (!deleted) return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ message: "Not found" }) };
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Not found" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
}
