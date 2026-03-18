import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_CONFIG, ADMIN_COOKIE_NAME } from "@/lib/store-config";

export async function requireStoreAdminSession(loginPath = "/admin-loja/login") {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (token !== ADMIN_CONFIG.sessionToken) {
    redirect(loginPath);
  }
}
