"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartSessionForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        participantName: formData.get("participantName"),
        participantEmail: formData.get("participantEmail"),
        organisation: formData.get("organisation"),
        roleTitle: formData.get("roleTitle"),
        consentAccepted: formData.get("consentAccepted") === "on"
      })
    });
    const body = (await response.json()) as { ok: boolean; url?: string; message?: string };
    if (!response.ok || !body.ok || !body.url) {
      setMessage(body.message || "Something went wrong starting your coaching session.");
      setIsSubmitting(false);
      return;
    }
    router.push(body.url);
  }

  return (
    <form className="start-form" onSubmit={submit}>
      <label>
        <span>Name</span>
        <input name="participantName" autoComplete="name" required />
      </label>
      <label>
        <span>Email</span>
        <input name="participantEmail" type="email" autoComplete="email" required />
      </label>
      <label>
        <span>Organisation</span>
        <input name="organisation" autoComplete="organization" required />
      </label>
      <label>
        <span>Role title</span>
        <input name="roleTitle" autoComplete="organization-title" required />
      </label>
      <label className="check-row">
        <input name="consentAccepted" type="checkbox" required />
        <span>
          I understand that my uploaded PDF is parsed in memory and not stored. The app stores the confirmed behavioural summary,
          coaching plan and actions so I can return to this session.
        </span>
      </label>
      <button className="primary-button" disabled={isSubmitting} type="submit">
        <ShieldCheck aria-hidden="true" />
        {isSubmitting ? "Starting..." : "Start coaching session"}
        <ArrowRight aria-hidden="true" />
      </button>
      {message ? <p className="form-error" role="alert">{message}</p> : null}
    </form>
  );
}
