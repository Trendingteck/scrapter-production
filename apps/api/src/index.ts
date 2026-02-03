import { getRequestListener, serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient } from "@prisma/client";
import type { User, Subscription } from "@scrapter/database";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { hashPassword, comparePassword, generateToken } from "./lib/auth.js";
import { sendVerificationEmail } from "./lib/email.js";

// Global instantiation for Vercel
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"], // Reduce log overhead
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type Bindings = {
  OPENAI_API_KEY: string;
  GEMINI_API_KEY: string;
};

type Variables = {
  user: User & { subscription: Subscription | null };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// SILENCE FAVICON ERRORS
app.get("/favicon.ico", (c) => c.body(null, 204));
app.get("/favicon.png", (c) => c.body(null, 204));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use("/*", cors());
app.get("/", (c) => c.text("Scrapter API is running!"));

app.get("/health", async (c) => {
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? "FOUND (Masked)" : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ? "YES" : "NO",
  };

  let dbStatus = "Checking...";
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    dbStatus = "CONNECTED: " + JSON.stringify(result);
  } catch (err: any) {
    dbStatus = "FAILED: " + err.message;
  }

  return c.json({
    status: "ok",
    env: envVars,
    db: dbStatus,
  });
});

// 1. Debug Endpoint: Test if POST body parsing works
app.post("/debug/echo", async (c) => {
  console.log("DEBUG: Echo endpoint hit");
  try {
    const body = await c.req.json();
    console.log("DEBUG: Body parsed successfully", body);
    return c.json({ received: body, message: "Body parsing works" });
  } catch (e: any) {
    console.error("DEBUG: Body parsing failed", e);
    return c.json({ error: "Could not parse body", details: e.message }, 400);
  }
});

// 2. Debug Endpoint: Test explicit DB connection
app.get("/debug/db-force", async (c) => {
  console.log("DEBUG: Forcing DB connection...");
  const start = Date.now();
  try {
    // Force a raw query that bypasses Prisma cache
    await prisma.$queryRaw`SELECT 1`;
    console.log(`DEBUG: DB Success in ${Date.now() - start}ms`);
    return c.json({ status: "connected", latency: Date.now() - start });
  } catch (e: any) {
    console.error("DEBUG: DB Failed", e);
    return c.json({ error: e.message }, 500);
  }
});

// Auth Middleware
app.use("/v1/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: { include: { subscription: true } } },
  });

  if (!session || session.expires < new Date()) {
    return c.json({ error: "Session expired or invalid" }, 401);
  }

  if (!session.user.emailVerified) {
    return c.json({ error: "Email not verified" }, 403);
  }

  c.set("user", session.user);
  await next();
});

// Real Signup
app.post("/auth/signup", async (c) => {
  console.log("📝 [SIGNUP] Request received");
  try {
    const body = await c.req.json();
    const { email, password, name } = body;
    console.log(`📝 [SIGNUP] Payload parsed for: ${email}`);

    console.log("📝 [SIGNUP] Checking DB heartbeat...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("📝 [SIGNUP] DB Heartbeat OK");

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("📝 [SIGNUP] User already exists");
      return c.json({ error: "User already exists" }, 400);
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = generateToken(64);

    console.log("📝 [SIGNUP] Creating user...");
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        verificationToken,
        subscription: {
          create: { plan: "FREE" },
        },
      },
    });
    console.log("📝 [SIGNUP] User created successfully");

    await sendVerificationEmail(email, verificationToken);
    console.log("📝 [SIGNUP] Verification email sent");

    return c.json({
      message: "User created. Please check your email for verification.",
    });
  } catch (error: any) {
    console.error("❌ [SIGNUP] CRITICAL ERROR:", error);
    return c.json({ error: error.message || "Internal Server Error" }, 500);
  }
});

// Real Login (WITH DEBUG LOGS)
app.post("/auth/login", async (c) => {
  console.log("1. Login request received");

  try {
    // Add a race condition to see if json parsing is the blocker
    const bodyPromise = c.req.json();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("JSON Parse Timeout")), 5000),
    );

    const body: any = await Promise.race([bodyPromise, timeoutPromise]);
    console.log("2. Body parsed for:", body.email);

    console.log("3. Connecting to DB...");
    console.log("3a. DB Heartbeat...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("3b. Heartbeat OK");

    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { subscription: true },
    });
    console.log("4. DB Search complete. User found:", !!user);

    if (!user) {
      console.log("5. User not found");
      return c.json({ error: "Invalid credentials" }, 401);
    }

    console.log("6. Comparing password...");
    const isValid = await comparePassword(body.password, user.password);
    console.log("7. Password valid:", isValid);

    if (!isValid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    if (!user.emailVerified) {
      console.log("8. Email not verified");
      return c.json({ error: "Email not verified" }, 403);
    }

    console.log("9. Generating token...");
    const token = generateToken(32);

    await prisma.session.create({
      data: {
        sessionToken: token,
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    console.log("10. Success! Sending response.");
    return c.json({
      sessionToken: token,
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
        plan: user.subscription?.plan,
      },
    });
  } catch (error: any) {
    console.error("!!! LOGIN CRASH !!!", error);
    return c.json({ error: error.message || "Internal Error" }, 500);
  }
});

// Email Verification
app.get("/auth/verify", async (c) => {
  const token = c.req.query("token");
  if (!token) return c.json({ error: "Token missing" }, 400);

  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });
  if (!user) return c.json({ error: "Invalid or expired token" }, 400);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
    },
  });

  return c.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/verify-success`);
});

// Get User Profile
app.get("/v1/me", async (c) => {
  const user = c.get("user");
  const usage = await prisma.usageLog.count({
    where: {
      userId: user.id,
      createdAt: { gte: new Date(new Date().setDate(1)) }, // Since start of month
    },
  });

  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.subscription?.plan || "FREE",
    credits: user.subscription?.plan === "PRO" ? "Unlimited" : 500,
    usage: {
      requestsThisMonth: usage,
    },
  });
});

// Get User Settings
app.get("/v1/me/settings", async (c) => {
  const user = c.get("user");
  let settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId: user.id },
    });
  }

  return c.json(settings);
});

// Update User Settings (Real-time sync)
app.patch("/v1/me/settings", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const updatedSettings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...body,
    },
    update: body,
  });

  return c.json(updatedSettings);
});

// --- Chat History Endpoints ---

// List Chat Sessions
app.get("/v1/chat/sessions", async (c) => {
  const user = c.get("user");
  const sessions = await prisma.chatSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      messageCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return c.json(sessions);
});

// Create Chat Session
app.post("/v1/chat/sessions", async (c) => {
  const user = c.get("user");
  const { title } = await c.req.json();
  const session = await prisma.chatSession.create({
    data: {
      userId: user.id,
      title: title || "New Chat",
    },
  });
  return c.json(session);
});

// Get Chat Session with Messages
app.get("/v1/chat/sessions/:id", async (c) => {
  const user = c.get("user");
  const sessionId = c.req.param("id");
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId, userId: user.id },
    include: { messages: { orderBy: { timestamp: "asc" } } },
  });

  if (!session) return c.json({ error: "Session not found" }, 404);
  return c.json(session);
});

// Update Chat Session (title or agentStateHistory)
app.patch("/v1/chat/sessions/:id", async (c) => {
  const user = c.get("user");
  const sessionId = c.req.param("id");
  const body = await c.req.json();

  const session = await prisma.chatSession.update({
    where: { id: sessionId, userId: user.id },
    data: body,
  });

  return c.json(session);
});

// Delete Chat Session
app.delete("/v1/chat/sessions/:id", async (c) => {
  const user = c.get("user");
  const sessionId = c.req.param("id");
  await prisma.chatSession.delete({
    where: { id: sessionId, userId: user.id },
  });
  return c.json({ success: true });
});

// Add Message to Session
app.post("/v1/chat/sessions/:id/messages", async (c) => {
  const user = c.get("user");
  const sessionId = c.req.param("id");
  const { actor, content, metadata } = await c.req.json();

  const [message] = await prisma.$transaction([
    prisma.chatMessage.create({
      data: {
        sessionId,
        actor,
        content,
        metadata: metadata || {},
      },
    }),
    prisma.chatSession.update({
      where: { id: sessionId, userId: user.id },
      data: {
        messageCount: { increment: 1 },
        updatedAt: new Date(),
      },
    }),
  ]);

  return c.json(message);
});

// agentStateHistory endpoints
app.get("/v1/chat/sessions/:id/history", async (c) => {
  const user = c.get("user");
  const sessionId = c.req.param("id");
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId, userId: user.id },
    select: { agentStateHistory: true },
  });
  return c.json(session?.agentStateHistory || null);
});

app.post("/v1/chat/sessions/:id/history", async (c) => {
  const user = c.get("user");
  const sessionId = c.req.param("id");
  const body = await c.req.json(); // { task, history, timestamp }

  await prisma.chatSession.update({
    where: { id: sessionId, userId: user.id },
    data: { agentStateHistory: body },
  });

  return c.json({ success: true });
});

// --- LLM Chat Endpoint (Multi-provider) ---

app.post("/v1/chat", async (c) => {
  const user = c.get("user");
  const { messages, model, temperature, provider } = await c.req.json();

  // Admin and PRO plan enforcement
  const isAdmin = user.email === "admin@scrapter.com";
  const isPro = user.subscription?.plan === "PRO";

  if (!isAdmin && !isPro) {
    const usageCount = await prisma.usageLog.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });
    if (usageCount > 100) {
      return c.json(
        { error: "Daily limit reached for Free plan. Please upgrade." },
        402,
      );
    }
  }

  // Handle different providers
  if (
    provider === "gemini" ||
    (model && (model.includes("gemini") || model.startsWith("scrapter-")))
  ) {
    if (!GEMINI_API_KEY)
      return c.json({ error: "Gemini API Key not configured" }, 500);

    // Map managed aliases to real Gemini models
    let realModel = model;
    if (model === "scrapter-auto") {
      realModel = "gemini-2.5-flash";
    } else if (model === "scrapter-best") {
      realModel = "gemini-3-flash-preview";
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({
      model: realModel || "gemini-2.5-flash",
    });

    try {
      // Helper to convert OpenAI content to Gemini Parts
      const toGeminiParts = (content: any) => {
        if (typeof content === "string") return [{ text: content }];
        if (Array.isArray(content)) {
          return content
            .map((part: any) => {
              if (part.type === "text") {
                return { text: part.text };
              }
              if (part.type === "image_url") {
                const url = part.image_url?.url || "";
                // Extract base64 data: "data:image/jpeg;base64,....."
                if (url.startsWith("data:")) {
                  const mimeType = url.substring(5, url.indexOf(";"));
                  const data = url.substring(url.indexOf("base64,") + 7);
                  return { inlineData: { mimeType, data } };
                }
              }
              return null;
            })
            .filter(Boolean); // Remove nulls
        }
        return [{ text: JSON.stringify(content) }];
      };

      // Map OpenAI style messages to Gemini
      // Important: Gemini assumes roles 'user' and 'model'. 'system' should ideally be set in model config or merged.
      // Here we merge 'system' into the first user message or treat as user.
      const history = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: toGeminiParts(m.content),
      }));

      const lastMessageContent = messages[messages.length - 1].content;
      const lastMessageParts = toGeminiParts(lastMessageContent);

      const chat = geminiModel.startChat({ history });
      const result = await chat.sendMessage(lastMessageParts as any);

      const response = await result.response;
      const text = response.text();

      await prisma.usageLog.create({
        data: {
          userId: user.id,
          actionType: "CHAT_COMPLETION",
          metadata: { model: realModel, provider: "gemini", alias: model },
        },
      });

      return c.json({ content: text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      // Fallback for safety if model is overloaded or fails
      return c.json({ error: error.message }, 500);
    }
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  try {
    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o-mini",
      messages: messages,
      temperature: temperature || 0.7,
    });

    await prisma.usageLog.create({
      data: {
        userId: user.id,
        actionType: "CHAT_COMPLETION",
        tokensUsed: completion.usage?.total_tokens || 0,
        metadata: { model: model || "gpt-4o-mini", provider: "openai" },
      },
    });

    return c.json({
      content: completion.choices[0].message.content,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return c.json({ error: error.message }, 500);
  }
});

console.log("Scrapter API initialized with @hono/node-server");

// 2. Add Local Server Logic at the bottom
// Only run this if NOT in Vercel, or if explicitly in Development
if (process.env.NODE_ENV === "development" || !process.env.VERCEL) {
  const port = 3001;
  console.log(`🚀 Server is listening on http://localhost:${port}`);

  serve({
    fetch: app.fetch,
    port,
  });
}

// 3. Keep the default export for Vercel Serverless
export default getRequestListener(app.fetch);
