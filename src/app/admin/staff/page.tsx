import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DeleteStaffAction } from "./client-actions";

export default async function StaffPage() {
  const staff = await prisma.staffMember.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Manage Staff</h1>
        <Link href="/admin/staff/create" className="bg-[#a67c52] hover:bg-[#956e47] text-white py-2 px-4 rounded-lg font-bold transition-colors">Add Staff Member</Link>
      </div>
      
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">Member</TableHead>
              <TableHead className="text-white font-bold">Role</TableHead>
              <TableHead className="text-white font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={3} className="text-center py-8 text-white/50">
                  No staff members added yet.
                </TableCell>
              </TableRow>
            )}
            {staff.map((member) => (
              <TableRow key={member.id} className="border-white/10 hover:bg-white/5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="border border-white/20">
                      <AvatarImage src={member.image || ""} />
                      <AvatarFallback className="bg-black text-white px-2 cursor-default">{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold">{member.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[#a67c52] font-medium">{member.role}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/staff/edit/${member.id}`} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm">Edit</Link>
                    <DeleteStaffAction id={member.id} />
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
