import { prisma } from "@/lib/prisma";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Shield, Plus } from "lucide-react";
import { RoleActions } from "./client-actions";
import { getTranslations } from "@/lib/i18n/server";

export default async function RolesPage() {
  const t = await getTranslations();
  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
      _count: { select: { tokens: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Shield className="w-8 h-8 text-[var(--ep-accent)]" />
            {t.admin.roles.title}
          </h1>
          <p className="text-white/30 text-sm mt-1">{t.admin.roles.subtitle}</p>
        </div>
        <Link
          href="/hq/roles/create"
          className="flex items-center gap-2 bg-[var(--ep-accent)] hover:bg-[#956e47] text-white py-2 px-4 rounded-lg font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t.admin.roles.createButton}
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">{t.admin.roles.name}</TableHead>
              <TableHead className="text-white font-bold">{t.common.description}</TableHead>
              <TableHead className="text-white font-bold">{t.admin.roles.permissions}</TableHead>
              <TableHead className="text-white font-bold">{t.admin.nav.tokens}</TableHead>
              <TableHead className="text-white font-bold">{t.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={5} className="text-center py-8 text-white/50">
                  {t.admin.roles.noRoles}
                </TableCell>
              </TableRow>
            )}
            {roles.map((role) => (
              <TableRow key={role.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-bold">{role.name}</TableCell>
                <TableCell className="text-white/50">{role.description || t.common.unavailable}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((p) => (
                      <Badge key={p.id} className="bg-[var(--ep-accent)]/20 text-[var(--ep-accent-hover)] border-[var(--ep-accent)]/20 text-[9px]">
                        {p.label}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge className="bg-white/10 text-white/50 text-[9px]">
                        {t.common.more(role.permissions.length - 3)}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-white/10 text-white/60">{t.common.tokens(role._count.tokens)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/hq/roles/edit/${role.id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm"
                    >
                      {t.common.edit}
                    </Link>
                    <RoleActions id={role.id} tokenCount={role._count.tokens} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
