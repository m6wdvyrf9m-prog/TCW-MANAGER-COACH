import { clearAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export async function GET() {
  await clearAdminSession();
  redirect("/admin/login");
}
