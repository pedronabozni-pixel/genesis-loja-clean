import type { ReactNode } from "react";
import { requireStoreAdminSession } from "@/lib/admin-auth";

export default async function ProtectedAdminLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireStoreAdminSession();
  return children;
}
