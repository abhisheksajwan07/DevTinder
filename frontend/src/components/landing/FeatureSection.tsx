import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { featureCards } from "./landing-data";
import { Github, Cpu, MessageSquareCode } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const iconsMap: Record<number, React.ReactNode> = {
  0: <Github className="size-5 text-orange-500" />,
  1: <Cpu className="size-5 text-orange-500" />,
  2: <MessageSquareCode className="size-5 text-orange-500" />,
};

export default function FeatureSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".feature-card");

      gsap.fromTo(
        cards,
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.14,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="features"
      className="mx-auto max-w-[1240px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-0"
    >
      <header className="mb-8 text-center sm:mb-10">
        <h2 className="text-[28px] font-bold tracking-tight text-[#242322] sm:text-[32px]">
          How DevTinder Works
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-relaxed text-[#77736e]">
          From GitHub profile sync to real-time pair programming in three simple
          steps.
        </p>
      </header>

      <div className="grid gap-10 md:grid-cols-3">
        {featureCards.map(({ title, description }, index) => (
          <article
            key={title}
            className="feature-card group relative rounded-[24px] border border-[#e9e5df] bg-white/80 p-5 sm:p-6 shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-300 hover:bg-white hover:shadow-lg hover:shadow-orange-500/10"
          >
            <div className="grid size-11 place-items-center rounded-2xl border border-orange-100 bg-orange-50/60 shadow-2xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-orange-100/70">
              {iconsMap[index] || <Cpu className="size-5 text-orange-500" />}
            </div>
            <h3 className="mt-5 text-base font-bold text-[#242322]">{title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#77736e]">
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
