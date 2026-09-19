"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password")
      })
    });
    const body = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !body.ok) {
      setMessage(body.message || "The admin login details were not recognised.");
      setIsSubmitting(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="admin-login-card" onSubmit={submit}>
      <label>
        <span>Username</span>
        <input name="username" autoComplete="username" required />
      </label>
      <label>
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="primary-button" disabled={isSubmitting} type="submit">
        <LogIn aria-hidden="true" />
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      {message ? <p className="form-error" role="alert">{message}</p> : null}
    </form>
  );
}
