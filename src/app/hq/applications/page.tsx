import { prisma } from "@/lib/prisma";
import { ApplicationActions } from "./client-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function ApplicationsPage() {
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-black mb-8 border-b border-white/20 pb-4">Manage Applications</h1>
      
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">Ref Code</TableHead>
              <TableHead className="text-white font-bold">Discord</TableHead>
              <TableHead className="text-white font-bold">Roblox</TableHead>
              <TableHead className="text-white font-bold">Status</TableHead>
              <TableHead className="text-white font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={5} className="text-center py-8 text-white/50">
                  No applications found.
                </TableCell>
              </TableRow>
            )}
            {applications.map((app) => (
              <TableRow key={app.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-mono text-[#2dd4bf] font-bold">{app.refCode}</TableCell>
                <TableCell>
                  <div className="font-bold">{app.discord}</div>
                </TableCell>
                <TableCell>{app.roblox}</TableCell>
                <TableCell>
                  <Badge className={
                    app.status === 'APPROVED' ? 'bg-green-500/20 text-green-300' :
                    app.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                    app.status === 'REVIEWED' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-white/10 text-white'
                  }>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ApplicationActions id={app.id} currentStatus={app.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
