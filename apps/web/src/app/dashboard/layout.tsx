import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard";

const API_URL = process.env.INTERNAL_API_URL || "http://localhost:3000/api";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  let userProfile = null;

  try {
    const res = await fetch(`${API_URL}/v1/me`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (res.ok) {
      userProfile = await res.json();
    } else {
      // If unauthorized, token might be expired
      if (res.status === 401) {
        cookieStore.delete("session_token");
        redirect("/login");
      }
    }
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
  }

  // Serialize user data for the DashboardShell
  const serializedUser = {
    email: userProfile?.email || "Guest",
    user_metadata: {
      full_name: userProfile?.name || "Guest User",
    },
    plan: userProfile?.plan || "FREE",
    credits: userProfile?.credits || 0,
    usage: userProfile?.usage || { requestsThisMonth: 0 },
  };

  return <DashboardShell user={serializedUser}>{children}</DashboardShell>;
}
