"use client";

import Footer from "@/components/Footer";
import { SidebarComponent } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { usePathname } from "next/navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Hide sidebar when creating workspace or joining a project
  const hideSidebar =
    pathname.includes("/workspaces/create") || pathname.includes("/join/");

  return (
    <SidebarProvider>
      <div className="app-shell flex min-h-screen w-full pb-8">
        {!hideSidebar && <SidebarComponent />}
        <main className="flex-1 overflow-auto">
          <div className="px-3 pt-3 md:px-5 md:pt-5">
            {children}
          </div>
          <div className="mt-12 px-3 md:px-5">
            <Footer />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
