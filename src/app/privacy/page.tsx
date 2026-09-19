import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="document-page">
      <Logo />
      <p className="eyebrow">Privacy Notice</p>
      <h1>Manager Coach Data Handling</h1>
      <p>
        Manager Coach parses uploaded Insights PDFs in memory and does not store the original PDF or raw PDF text. The app stores the
        behavioural summary you confirm, the challenge details you choose to enter, generated coaching guidance, action plans and
        reflections so that your private session URL can be reopened.
      </p>
      <p>
        Analytics events are limited to operational data such as journey stage, profile confidence and challenge category. They do not
        include sensitive profile text, challenge text, coaching content or reflection notes.
      </p>
      <p>
        Admin access is protected by server-side authentication. Production deployments should use PostgreSQL, HTTPS and strong secrets.
      </p>
      <Link className="secondary-link" href="/">Start page</Link>
    </main>
  );
}
