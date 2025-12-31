import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prisma } from "@scrapter/database";
import type { User, Subscription } from "@scrapter/database";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { hashPassword, comparePassword, generateToken } from "./lib/auth.js";
import { sendVerificationEmail } from "./lib/email.js";

type Bindings = {
  OPENAI_API_KEY: string;
  GEMINI_API_KEY: string;
};

type Variables = {
  user: User & { subscription: Subscription | null };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use("/*", cors());
app.get("/", (c) => c.text("Scrapter API is running!"));

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
  const { email, password, name } = await c.req.json();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return c.json({ error: "User already exists" }, 400);
  }

  const hashedPassword = await hashPassword(password);
  const verificationToken = generateToken(64);

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

  await sendVerificationEmail(email, verificationToken);

  return c.json({
    message: "User created. Please check your email for verification.",
  });
});

// Real Login
app.post("/auth/login", async (c) => {
  const { email, password } = await c.req.json();

  const user = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true },
  });

  if (!user || !(await comparePassword(password, user.password))) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  if (!user.emailVerified) {
    return c.json({ error: "Email not verified" }, 403);
  }

  const token = generateToken(32);
  await prisma.session.create({
    data: {
      sessionToken: token,
      userId: user.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return c.json({
    sessionToken: token,
    user: {
      email: user.email,
      id: user.id,
      name: user.name,
      plan: user.subscription?.plan,
    },
  });
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

  // Fallback to OpenAI
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

import { handle } from "hono/vercel";

// const port = 3001;
// console.log(`Server is running on port ${port}`);

// serve({
//   fetch: app.fetch,
//   port
// });

export default handle(app);
