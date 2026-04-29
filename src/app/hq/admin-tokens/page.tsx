import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { KeyRound } from "lucide-react";
import { AdminTokenActions } from "./client-actions";
import { getTranslations } from "@/lib/i18n/server";
import { formatStatus } from "@/lib/i18n";

function getTokenStatus(token: { revokedAt: Date | null; expiresAt: Date | null }) {
  if (token.revokedAt) return "REVOKED";
  if (token.expiresAt && new Date() > token.expiresAt) return "EXPIRED";
  return "ACTIVE";
}

function statusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "REVOKED":
      return "bg-red-500/15 text-red-400 border-red-500/20";
    case "EXPIRED":
      return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
    default:
      return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
  }
}

export default async function AdminTokensPage() {
  await requireAdminSession();
  const t = await getTranslations();

  const tokens = await prisma.adminToken.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-amber-500" />
            {t.admin.adminTokens.title}
          </h1>
          <p className="text-white/30 text-sm mt-1">
            {t.admin.adminTokens.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
          <code className="text-xs text-white/50 font-mono">
            pnpm admin:token:create -- --name &quot;Label&quot;
          </code>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">{t.admin.adminTokens.name}</TableHead>
              <TableHead className="text-white font-bold">{t.common.status}</TableHead>
              <TableHead className="text-white font-bold">{t.common.created}</TableHead>
              <TableHead className="text-white font-bold">{t.admin.adminTokens.lastUsed}</TableHead>
              <TableHead className="text-white font-bold">{t.admin.adminTokens.expires}</TableHead>
              <TableHead className="text-white font-bold">{t.common.notes}</TableHead>
              <TableHead className="text-white font-bold">{t.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={7} className="text-center py-8 text-white/50">
                  {t.admin.adminTokens.noTokens}
                </TableCell>
              </TableRow>
            )}
            {tokens.map((token) => {
              const status = getTokenStatus(token);
              return (
                <TableRow key={token.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-bold">{token.name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor(status)}`}>
                      {formatStatus(status, t)}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/40 text-xs">
                    {new Date(token.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-white/40 text-xs">
                    {token.lastUsedAt
                      ? new Date(token.lastUsedAt).toLocaleString()
                      : t.common.unavailable}
                  </TableCell>
                  <TableCell className="text-white/40 text-xs">
                    {token.expiresAt
                      ? new Date(token.expiresAt).toLocaleDateString()
                      : t.common.never}
                  </TableCell>
                  <TableCell className="text-white/50 text-xs max-w-[200px] truncate">
                    {token.notes || t.common.unavailable}
                  </TableCell>
                  <TableCell>
                    <AdminTokenActions id={token.id} status={status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
