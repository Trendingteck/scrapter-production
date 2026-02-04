import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.warn(
    "⚠️ Warning: RESEND_API_KEY is missing. Emails will not be sent.",
  );
}
const resend = new Resend(apiKey || "re_missing_key");

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/verify?token=${token}`;

  try {
    await resend.emails.send({
      from: "Scrapter <onboarding@resend.dev>",
      to: email,
      subject: "Verify your Scrapter account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FFD700;">Welcome to Scrapter!</h1>
          <p>Please click the button below to verify your email address and activate your account.</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #FFD700; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email</a>
          <p style="margin-top: 24px; font-size: 12px; color: #666;">If you didn't sign up for Scrapter, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }
}
