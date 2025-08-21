import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black px-6 py-20 text-white">
      <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="zukku-logo text-5xl sm:text-6xl">Zukku</span>
        <h1 className="text-4xl font-semibold sm:text-5xl">Unleash Your Creative Vision with Zukku</h1>
        <p className="max-w-2xl text-balance text-lg text-gray-300">
          Transform, enhance, and generate images with AI. Sign in to access your dashboard and start creating.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Link href="/sign-in" className="rounded-md bg-[#624cf5] px-6 py-3 text-base font-medium text-white hover:opacity-90">
            Get Started
          </Link>
          <Link href="/sign-up" className="rounded-md border border-white/20 px-6 py-3 text-base font-medium text-white hover:bg-white/10">
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}


