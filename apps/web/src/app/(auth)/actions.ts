"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const API_URL = process.env.INTERNAL_API_URL || "http://localhost:3001";

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Login failed" };
    }

    const cookieStore = await cookies();

    // Secure HTTP-only cookie for server-side auth
    cookieStore.set("session_token", data.sessionToken, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Public cookie for Client-side UI (Avatar, Name)
    cookieStore.set("user_profile", JSON.stringify(data.user), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
    });
  } catch (error) {
    return { error: "Connection failed" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("full_name") as string;

  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Signup failed" };
    }

    redirect("/signup/success");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT"))
      throw error;
    return { error: "Connection failed" };
  }
}

export async function signout() {
  const cookieStore = await cookies();

  // Delete all auth related cookies
  cookieStore.delete("session_token");
  cookieStore.delete("user_profile");

  // Force revalidation of all layouts
  revalidatePath("/", "layout");

  // Redirect to login page
  redirect("/login");
}
