import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";

import Hero from "@/components/Hero";
import { getWorkspaces } from "@/features/workspaces/queries";
import { Navbar } from "@/components/mainNavbar";
// import Features from "@/components/Features";
import Footer from "@/components/Footer";
import BentoGrid from "@/components/BentoGrid";
// import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";

export default async function Home() {
  const current = await getCurrent();

  if (!current) {
    return (
      <div className="container mx-auto w-full">
        <Navbar />
        <Hero />
        {/* <Features /> */}
        <BentoGrid />
        {/* <Testimonials /> */}
        <Pricing />
        <Footer />
      </div>
    );
  }

  const workspaces = await getWorkspaces();
  if (workspaces?.total === 0) {
    return redirect("/workspaces/create");
  } else {
    return redirect(`/workspaces/${workspaces?.documents[0]?.$id}`);
  }
}
