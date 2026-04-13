// Force this layout and all nested pages to be rendered dynamically at runtime
export const dynamic = "force-dynamic";

import AdminLayoutClient from "./client-layout";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
