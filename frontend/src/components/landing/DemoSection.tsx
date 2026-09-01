import { useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Github, Sparkles, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function DemoSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="mx-auto max-w-[1240px] px-6 pb-20 lg:px-0"
    >
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-[28px] border border-[#e9e5df] bg-gradient-to-br from-white via-[#fcfbfa] to-[#f7f4ef] px-6 py-14 text-center shadow-sm"
      >
        {/* Background Subtle Accent Orb */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-orange-200/30 to-amber-200/20 blur-2xl animate-pulse-soft" />

        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-3.5 py-1.5 text-xs font-semibold text-orange-700">
            <Sparkles className="size-3.5 text-orange-500" />
            <span>Instant Developer Match</span>
          </div>

          <h2 className="text-[30px] font-extrabold tracking-tight text-[#242322] sm:text-[36px] leading-tight">
            Ready to find your next co-founder or pair programming partner?
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#77736e]">
            Build a profile in minutes, then optionally connect GitHub to import
            your public repositories and enrich your matches.
          </p>

          <div className="mx-auto mt-8 flex justify-center">
            <Link
              to="/signup"
              style={{ color: "#ffffff" }}
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#24292f] px-8 py-4 text-sm font-bold text-white shadow-md shadow-black/20 transition-all duration-200 hover:bg-[#1a1e22] hover:shadow-lg hover:shadow-black/25 active:scale-95"
            >
              <Github className="size-4.5" />
              <span>Continue with GitHub</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>


        </div>
      </div>
    </section>
  );
}
