import { prisma } from "@/lib/prisma";
import { ApplyForm } from "./client-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ApplysStaffPage() {
  let settings = null;
  let staff: any[] = [];
  
  try {
    settings = await prisma.siteSettings.findFirst();
    staff = await prisma.staffMember.findMany({
      orderBy: { order: 'asc' }
    });
  } catch (e) {
    // IGNORE
  }

  const applicationsOpen = settings ? settings.appsOpen : true;

  return (
    <div className="flex flex-col gap-12 w-full">
      <div className="text-center md:text-left mb-2 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400">
          Staff & Apply
        </h1>
        <div className="flex items-center gap-3 mt-3 justify-center md:justify-start">
          <div className="h-[2px] w-12 bg-gradient-to-r from-violet-500 to-transparent rounded-full" />
          <p className="text-zinc-500 text-lg">Meet the team or become part of it.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
        
        {/* TEAM STAFF SECTION */}
        <div className="lg:col-span-2 order-2 lg:order-1 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-2xl font-black mb-6 uppercase tracking-wider text-white flex items-center gap-3">
            <div className="h-[2px] w-6 bg-violet-500 rounded-full" />
            Our Team
          </h2>
          
          {staff.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center">
              <span className="text-zinc-500 font-medium">No staff members listed yet.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {staff.map((member, index) => (
                <div 
                  key={member.id} 
                  className="group glass-card p-4 rounded-2xl flex items-center gap-5 hover:border-violet-500/25 transition-all duration-300 shadow-lg shadow-black/20 hover:-translate-y-0.5 animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 80}ms` }}
                >
                  <div className="relative">
                    <Avatar className="w-14 h-14 border-2 border-zinc-800 group-hover:border-violet-500/50 transition-all duration-300 shadow-xl">
                      <AvatarImage src={member.image || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-600/30 to-indigo-600/30 text-zinc-200 font-black">{member.name[0]}</AvatarFallback>
                    </Avatar>
                    {/* Avatar glow on hover */}
                    <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-zinc-100 group-hover:text-white transition-colors duration-300">{member.name}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-violet-400">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* APPLY SECTION */}
        <div className="lg:col-span-3 order-1 lg:order-2 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="glass-card-strong rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-black/30">
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500" />
            {/* Corner glow */}
            <div className="absolute -top-[30%] -right-[15%] w-[50%] h-[50%] bg-violet-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <h2 className="text-3xl font-black mb-4 uppercase tracking-wider text-white mt-2 flex items-center gap-3">
              <div className="h-[2px] w-6 bg-violet-500 rounded-full" />
              Join The Ranks
            </h2>
            <p className="mb-8 text-zinc-500 font-medium line-clamp-2">
              {applicationsOpen 
                ? "We are currently looking for dedicated individuals. Think you have what it takes? Submit your application below."
                : "The application window is currently closed. Keep an eye on the news for our next recruitment wave!"}
            </p>

            {applicationsOpen ? (
              <ApplyForm />
            ) : (
              <div className="bg-red-500/5 p-12 rounded-2xl text-center border border-red-500/15">
                <div className="text-3xl font-black uppercase tracking-widest text-red-400/70">Closed</div>
                <p className="text-red-300/50 mt-4 font-medium">Recruitment is frozen at this time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
