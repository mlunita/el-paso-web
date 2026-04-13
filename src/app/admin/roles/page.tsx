import { prisma } from "@/lib/prisma";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Shield, Plus } from "lucide-react";
import { RoleActions } from "./client-actions";

export default async function RolesPage() {
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
            <Shield className="w-8 h-8 text-[#a67c52]" />
            Roles
          </h1>
          <p className="text-white/30 text-sm mt-1">Manage moderator roles and their permissions</p>
        </div>
        <Link
          href="/admin/roles/create"
          className="flex items-center gap-2 bg-[#a67c52] hover:bg-[#956e47] text-white py-2 px-4 rounded-lg font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">Role Name</TableHead>
              <TableHead className="text-white font-bold">Description</TableHead>
              <TableHead className="text-white font-bold">Permissions</TableHead>
              <TableHead className="text-white font-bold">Tokens</TableHead>
              <TableHead className="text-white font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={5} className="text-center py-8 text-white/50">
                  No roles created yet.
                </TableCell>
              </TableRow>
            )}
            {roles.map((role) => (
              <TableRow key={role.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-bold">{role.name}</TableCell>
                <TableCell className="text-white/50">{role.description || "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((p) => (
                      <Badge key={p.id} className="bg-[#a67c52]/20 text-[#c9a87c] border-[#a67c52]/20 text-[9px]">
                        {p.label}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge className="bg-white/10 text-white/50 text-[9px]">
                        +{role.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-white/10 text-white/60">{role._count.tokens} tokens</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/roles/edit/${role.id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm"
                    >
                      Edit
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
