"use client";

import { PropsWithChildren } from "react";
import { Navbar } from "@/components/mainNavbar";
import Footer from "@/components/Footer";

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className="app-shell min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4 md:px-6">
        <nav className="flex items-center justify-between">
          <Navbar />
        </nav>
        <div className="flex flex-col items-center justify-center pt-4 md:py-14">
          {children}
        </div>
        <footer>
          <Footer />
        </footer>
      </div>
    </main>
  );
};
export default AuthLayout;
