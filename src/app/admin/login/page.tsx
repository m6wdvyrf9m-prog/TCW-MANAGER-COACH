import { AdminLoginForm } from "@/components/AdminLoginForm";
import { Logo } from "@/components/Logo";

export default function AdminLoginPage() {
  return (
    <main className="admin-login-page">
      <section>
        <Logo className="admin-login-logo" />
        <p className="eyebrow">Secure Admin</p>
        <h1>Manager Coach</h1>
        <p>Sign in to view sessions, coaching-stage analytics and privacy-safe exports.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
