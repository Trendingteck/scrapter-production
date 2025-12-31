"use client";

import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@extension/ui";

export default function SignupSuccessPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-orange-500 animate-bounce" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Check your email
        </h1>
        <p className="text-zinc-400">
          We&apos;ve sent a verification link to your email address. Please
          click the link to activate your account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-500 text-center">
          Didn&apos;t receive the email? Check your spam folder or wait a few
          minutes.
        </div>

        <Link href="/login" className="block">
          <Button
            variant="outline"
            className="w-full h-11 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Button>
        </Link>
      </div>
    </div>
  );
}
