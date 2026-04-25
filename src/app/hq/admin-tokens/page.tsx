import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { KeyRound } from "lucide-react";
import { AdminTokenActions } from "./client-actions";

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

  const tokens = await prisma.adminToken.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-amber-500" />
            Admin Tokens
          </h1>
          <p className="text-white/30 text-sm mt-1">
            Manage admin access tokens. Tokens can only be created via the CLI.
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
              <TableHead className="text-white font-bold">Name</TableHead>
              <TableHead className="text-white font-bold">Status</TableHead>
              <TableHead className="text-white font-bold">Created</TableHead>
              <TableHead className="text-white font-bold">Last Used</TableHead>
              <TableHead className="text-white font-bold">Expires</TableHead>
              <TableHead className="text-white font-bold">Notes</TableHead>
              <TableHead className="text-white font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={7} className="text-center py-8 text-white/50">
                  No admin tokens yet. Create one via the CLI.
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
                      {status}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/40 text-xs">
                    {new Date(token.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-white/40 text-xs">
                    {token.lastUsedAt
                      ? new Date(token.lastUsedAt).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-white/40 text-xs">
                    {token.expiresAt
                      ? new Date(token.expiresAt).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-white/50 text-xs max-w-[200px] truncate">
                    {token.notes || "—"}
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
