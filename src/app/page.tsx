import { Logo } from "@/components/Logo";
import { StartSessionForm } from "@/components/StartSessionForm";
import { ArrowRight, FileText, Lock, MessageSquareText } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-shell">
      <section className="home-panel">
        <div className="home-intro">
          <Logo />
          <p className="eyebrow">The Colour Works</p>
          <h1>Manager Coach</h1>
          <p className="lead">
            Prepare for a real management conversation using your confirmed Insights preference context, practical coaching
            prompts and a structured action plan.
          </p>
          <div className="feature-strip" aria-label="Session features">
            <span><FileText aria-hidden="true" /> PDF parsing</span>
            <span><MessageSquareText aria-hidden="true" /> Adaptive coaching</span>
            <span><Lock aria-hidden="true" /> Secure return link</span>
          </div>
          <Link className="admin-link" href="/admin/login">
            Admin <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <StartSessionForm />
      </section>
    </main>
  );
}
