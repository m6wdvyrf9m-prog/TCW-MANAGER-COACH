import { CoachWorkspace } from "@/components/CoachWorkspace";
import { Logo } from "@/components/Logo";
import { findSessionByToken } from "@/lib/repository";
import Link from "next/link";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CoachPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await findSessionByToken(token);
  if (!session) notFound();

  return (
    <>
      <header className="topbar">
        <Link href="/" aria-label="Start page">
          <Logo />
        </Link>
        <nav>
          <Link href="/privacy">Privacy</Link>
          <Link href="/admin/login">Admin</Link>
        </nav>
      </header>
      <CoachWorkspace initialSession={JSON.parse(JSON.stringify(session))} />
    </>
  );
}
