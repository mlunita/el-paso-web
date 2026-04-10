import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export default async function AdminDashboard() {
  const [userCount, postCount, applicationCount, staffCount, wikiCount] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.application.count(),
    prisma.staffMember.count(),
    prisma.wikiItem.count(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-black mb-8 border-b border-white/20 pb-4">Dashboard Status</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-[#a67c52] border-0 text-white p-6 rounded-2xl flex flex-col items-center justify-center">
          <div className="text-5xl font-black mb-2">{applicationCount}</div>
          <div className="text-sm font-bold uppercase tracking-widest opacity-80">Applications</div>
        </Card>
        
        <Card className="bg-[#f97316] border-0 text-white p-6 rounded-2xl flex flex-col items-center justify-center">
          <div className="text-5xl font-black mb-2">{postCount}</div>
          <div className="text-sm font-bold uppercase tracking-widest opacity-80">News Posts</div>
        </Card>
        
        <Card className="bg-[#7ca982] border-0 text-white p-6 rounded-2xl flex flex-col items-center justify-center">
          <div className="text-5xl font-black mb-2">{staffCount}</div>
          <div className="text-sm font-bold uppercase tracking-widest opacity-80">Staff Members</div>
        </Card>

        <Card className="bg-amber-700 border-0 text-white p-6 rounded-2xl flex flex-col items-center justify-center">
          <div className="text-5xl font-black mb-2">{wikiCount}</div>
          <div className="text-sm font-bold uppercase tracking-widest opacity-80">Wiki Items</div>
        </Card>

        <Card className="bg-white/10 border border-white/20 text-white p-6 rounded-2xl flex flex-col items-center justify-center">
          <div className="text-5xl font-black mb-2 text-white">{userCount}</div>
          <div className="text-sm font-bold uppercase tracking-widest opacity-80">Admins</div>
        </Card>
      </div>
    </div>
  );
}
