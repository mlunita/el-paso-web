import { ModLoginForm } from "./client-form";
import { getTranslations } from "@/lib/i18n/server";
import Image from "next/image";
import bgImage from "../2026.png";

export default async function ModLoginPage() {
  const t = await getTranslations();
  return (
    <main 
      className="relative flex min-h-screen w-full items-center bg-no-repeat bg-center"
      style={{ 
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: '100% 100%' 
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-y-0 left-0 w-full sm:w-[80%] md:w-[50%] lg:w-[35%] bg-black/60 md:bg-black/40 z-10" />

      {/* Content */}
      <div className="relative z-20 w-full sm:w-[80%] md:w-[50%] lg:w-[35%] px-6 sm:px-10 lg:px-16 flex flex-col justify-center">
        <ModLoginForm />
      </div>
    </main>
  );
}
