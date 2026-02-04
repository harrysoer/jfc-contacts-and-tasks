import Image from "next/image";
import Sidebar from "@/src/components/Sidebar";
import UserMenu from "@/src/components/UserMenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] grid-cols-[250px_1fr]">
      <header className="col-span-2 bg-transparent p-4 flex items-center gap-3">
        <Image src="/jblogo.png" alt="Logo" width={40} height={40} />
        <span className="text-xl font-semibold">Dashboard Manager</span>
        <div className="ml-auto">
          <UserMenu />
        </div>
      </header>
      <aside className="bg-transparent p-4">
        <Sidebar />
      </aside>
      <main className="p-4 overflow-auto">{children}</main>
    </div>
  );
}
