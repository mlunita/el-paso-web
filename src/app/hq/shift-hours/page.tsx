import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default async function ShiftHoursPage() {
  await requireAdminSession();

  const modShiftAgg = await prisma.modShift.groupBy({
    by: ["modId", "modName", "modRole"],
    _sum: { totalSeconds: true, breakSeconds: true },
    orderBy: {
      _sum: { totalSeconds: "desc" }
    }
  });

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-[var(--ep-border)]">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
          Shift <span className="text-white/20 font-medium text-lg ml-2">Hours</span>
        </h1>
        <p className="text-white/30 text-sm mt-1.5">
          Total hours logged by each moderator.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)]">
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">Moderator</th>
              <th className="text-right text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">Total Time</th>
              <th className="text-right text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">Total Break Time</th>
            </tr>
          </thead>
          <tbody>
            {modShiftAgg.map((mod) => (
              <tr key={mod.modId} className="border-b border-[var(--ep-border)] last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pr-4">
                  <div className="font-semibold text-white">{mod.modName}</div>
                  <div className="text-[10px] text-white/30">{mod.modRole}</div>
                </td>
                <td className="py-3 pr-4 text-right font-mono text-white tabular-nums">
                  {formatDuration(Math.max(0, (mod._sum.totalSeconds || 0) - (mod._sum.breakSeconds || 0)))}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-white/40 tabular-nums text-xs">
                  {formatDuration(mod._sum.breakSeconds || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {modShiftAgg.length === 0 && (
          <div className="text-center py-12 text-white/20 text-sm">No shifts found.</div>
        )}
      </div>
    </div>
  );
}
