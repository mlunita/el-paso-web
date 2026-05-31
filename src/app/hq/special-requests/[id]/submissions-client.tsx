"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Check, X, Clock } from "lucide-react";
import { adminUpdateSubmissionStatus } from "../../special-requests-actions";

type Submission = {
  id: string;
  refCode: string;
  discord: string;
  roblox: string;
  responses: string;
  status: string;
  notes: string | null;
  createdAt: Date;
};

export function SubmissionsClient({ formId, submissions, fields }: { formId: string, submissions: Submission[], fields: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (subId: string, newStatus: string) => {
    startTransition(async () => {
      const notes = prompt("Add admin notes (optional):") || "";
      await adminUpdateSubmissionStatus(subId, newStatus, notes);
    });
  };

  const filtered = submissions.filter(s => 
    s.discord.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roblox.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.refCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center bg-[var(--ep-bg-deep)] border border-[var(--ep-border)] rounded-lg px-4 py-2 max-w-md">
        <Search className="w-5 h-5 text-[var(--ep-text-muted)] mr-3" />
        <input 
          type="text"
          placeholder="Search by Discord, Roblox, or Ref Code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-white focus:outline-none w-full"
        />
      </div>

      <div className="overflow-x-auto bg-[var(--ep-bg-deep)] border border-[var(--ep-border)] rounded-xl">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-[var(--ep-bg-hover)] border-b border-[var(--ep-border)]">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs text-[var(--ep-text-muted)]">Ref Code</th>
              <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs text-[var(--ep-text-muted)]">User</th>
              <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs text-[var(--ep-text-muted)]">Responses</th>
              <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs text-[var(--ep-text-muted)]">Status</th>
              <th className="px-6 py-4 font-bold tracking-wider uppercase text-xs text-[var(--ep-text-muted)] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ep-border)]">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--ep-text-muted)]">No submissions found.</td></tr>
            ) : filtered.map((sub) => {
              let responsesObj = {};
              try { responsesObj = JSON.parse(sub.responses); } catch(e) {}
              
              return (
                <tr key={sub.id} className="hover:bg-[var(--ep-bg-hover)]/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-[var(--ep-accent)]">{sub.refCode}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{sub.discord}</div>
                    <div className="text-xs text-[var(--ep-text-muted)]">{sub.roblox}</div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-2">
                      {fields.map(f => (
                        <div key={f.id} className="text-xs border-b border-[var(--ep-border)] pb-1 mb-1 last:border-0">
                          <span className="font-bold text-[var(--ep-text-muted)] block">{f.label}</span>
                          <span className="text-white line-clamp-2">{responsesObj[f.id as keyof typeof responsesObj] || "N/A"}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={
                      sub.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      sub.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      sub.status === 'REVIEWED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    }>
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(sub.id, "REVIEWED")} className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 p-2">
                      <Clock className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(sub.id, "APPROVED")} className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 p-2">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(sub.id, "REJECTED")} className="border-red-500/50 text-red-400 hover:bg-red-500/10 p-2">
                      <X className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
