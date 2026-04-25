import { prisma } from "@/lib/prisma";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Key, Plus } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { TokenActions } from "./client-actions";

export default async function TokensPage() {
  const tokens = await prisma.moderatorToken.findMany({
    include: {
      role: true,
      _count: { select: { loginLogs: true, banRequests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Key className="w-8 h-8 text-[#a67c52]" />
            Moderator Tokens
          </h1>
          <p className="text-white/30 text-sm mt-1">Generate and manage moderator access tokens</p>
        </div>
        <Link
          href="/hq/tokens/create"
          className="flex items-center gap-2 bg-[#a67c52] hover:bg-[#956e47] text-white py-2 px-4 rounded-lg font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Token
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">Preview</TableHead>
              <TableHead className="text-white font-bold">Moderator</TableHead>
              <TableHead className="text-white font-bold">Mod ID</TableHead>
              <TableHead className="text-white font-bold">Role</TableHead>
              <TableHead className="text-white font-bold">Status</TableHead>
              <TableHead className="text-white font-bold">Logins</TableHead>
              <TableHead className="text-white font-bold">Bans</TableHead>
              <TableHead className="text-white font-bold">Created</TableHead>
              <TableHead className="text-white font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={9} className="text-center py-8 text-white/50">
                  No tokens generated yet.
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
                  <span className="text-[#c9a87c] font-semibold text-sm">{token.role.name}</span>
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
                  <TokenActions id={token.id} status={token.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
