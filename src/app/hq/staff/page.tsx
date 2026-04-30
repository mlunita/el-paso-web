import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { getTranslations } from "@/lib/i18n/server";
import { AdminStaffRow } from "./admin-staff-row";

export default async function StaffPage() {
  const t = await getTranslations();
  const staff = await prisma.staffMember.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">{t.admin.staff.manage}</h1>
        <Link href="/hq/staff/create" className="bg-[var(--ep-accent)] hover:bg-[#956e47] text-white py-2 px-4 rounded-lg font-bold transition-colors">{t.admin.staff.addButton}</Link>
      </div>
      
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">{t.admin.staff.member}</TableHead>
              <TableHead className="text-white font-bold">{t.common.role}</TableHead>
              <TableHead className="text-white font-bold">Discord ID</TableHead>
              <TableHead className="text-white font-bold">{t.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={4} className="text-center py-8 text-white/50">
                  {t.admin.staff.noStaff}
                </TableCell>
              </TableRow>
            )}
            {staff.map((member) => (
              <AdminStaffRow key={member.id} member={member} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
