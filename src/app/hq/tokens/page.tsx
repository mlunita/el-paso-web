import { prisma } from "@/lib/prisma";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Key, Plus } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { TokenActions } from "./client-actions";
import { getTranslations } from "@/lib/i18n/server";

export default async function TokensPage() {
  const t = await getTranslations();

  const [tokens, roles] = await Promise.all([
    prisma.moderatorToken.findMany({
      include: {
        role: true,
        _count: { select: { loginLogs: true, banRequests: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Key className="w-8 h-8 text-[var(--ep-accent)]" />
            {t.admin.tokens.title}
          </h1>
          <p className="text-white/30 text-sm mt-1">{t.admin.tokens.subtitle}</p>
        </div>
        <Link
          href="/hq/tokens/create"
          className="flex items-center gap-2 bg-[var(--ep-accent)] hover:bg-[#956e47] text-white py-2 px-4 rounded-lg font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t.admin.tokens.generateButton}
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">{t.common.preview}</TableHead>
              <TableHead className="text-white font-bold">{t.admin.tokens.moderator}</TableHead>
              <TableHead className="text-white font-bold">{t.admin.tokens.moderatorId}</TableHead>
              <TableHead className="text-white font-bold">{t.common.role}</TableHead>
              <TableHead className="text-white font-bold">{t.common.status}</TableHead>
              <TableHead className="text-white font-bold">{t.admin.tokens.logins}</TableHead>
              <TableHead className="text-white font-bold">{t.admin.tokens.bans}</TableHead>
              <TableHead className="text-white font-bold">{t.common.created}</TableHead>
              <TableHead className="text-white font-bold">{t.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={9} className="text-center py-8 text-white/50">
                  {t.admin.tokens.noTokens}
                </TableCell>
              </TableRow>
            )}
            {tokens.map((token) => (
              <TableRow key={token.id} className="border-white/10 hover:bg-white/5">
                <TableCell>
                  <code className="text-xs bg-white/5 px-2 py-1 rounded font-mono text-white/60">
                    {token.tokenPreview}
                  </code>
                </TableCell>
                <TableCell className="font-bold">{token.moderatorName}</TableCell>
                <TableCell className="text-white/50 font-mono text-xs">{token.moderatorId}</TableCell>
                <TableCell>
                  <span className="text-[var(--ep-accent-hover)] font-semibold text-sm">{token.role.name}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={token.status} />
                </TableCell>
                <TableCell className="text-white/50">{token._count.loginLogs}</TableCell>
                <TableCell className="text-white/50">{token._count.banRequests}</TableCell>
                <TableCell className="text-white/40 text-xs">
                  {new Date(token.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <TokenActions
                    id={token.id}
                    status={token.status}
                    currentRoleId={token.roleId}
                    roles={roles}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
