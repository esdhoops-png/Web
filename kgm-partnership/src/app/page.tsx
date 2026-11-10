import { Nav } from "@/components/Nav";
import { Intro } from "@/components/Intro";
import { Hero } from "@/components/sections/Hero";
import { Vision } from "@/components/sections/Vision";
import { WhoWeAre } from "@/components/sections/WhoWeAre";
import { OnCourt } from "@/components/sections/OnCourt";
import { GlobalReach } from "@/components/sections/GlobalReach";
import { WhyKgm } from "@/components/sections/WhyKgm";
import { Concepts } from "@/components/sections/Concepts";
import { Fleet } from "@/components/sections/Fleet";
import { Activation } from "@/components/sections/Activation";
import { Synergy } from "@/components/sections/Synergy";
import { Value } from "@/components/sections/Value";
import { Future } from "@/components/sections/Future";
import { Contact } from "@/components/sections/Contact";

export default function Page() {
  return (
    <>
      <a href="#vision" className="label sr-only z-[60] bg-bone px-4 py-2 !text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4">
        Saltar al contenido
      </a>
      <Intro />
      <Nav />
      <main>
        <Hero />
        <Vision />
        <WhoWeAre />
        <OnCourt />
        <GlobalReach />
        <WhyKgm />
        <Concepts />
        <Fleet />
        <Activation />
        <Synergy />
        <Value />
        <Future />
        <Contact />
      </main>
    </>
  );
}
