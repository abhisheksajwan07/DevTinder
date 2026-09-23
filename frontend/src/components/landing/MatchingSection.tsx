import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { matchCards } from "./landing-data";
import {
  Sparkles,
  Github,
  MessageCircle,
  ShieldCheck,
  Code2,
  Star,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const matchIconMap: Record<number, React.ReactNode> = {
  0: <Sparkles className="size-5 text-orange-500" />,
  1: <Github className="size-5 text-orange-500" />,
  2: <MessageCircle className="size-5 text-orange-500" />,
  3: <ShieldCheck className="size-5 text-orange-500" />,
};

export default function MatchingSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const codeBoxRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".match-bento-card");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 82%",
          once: true,
        },
      });

      tl.fromTo(
        cards,
        { opacity: 0, y: 45, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "transform",
        },
      );

      // Subtle pulse glow effect on the code box
      if (codeBoxRef.current) {
        tl.fromTo(
          codeBoxRef.current,
          { borderColor: "rgba(232, 228, 222, 1)" },
          {
            borderColor: "rgba(238, 113, 0, 0.4)",
            duration: 1,
            repeat: 1,
            yoyo: true,
            ease: "sine.inOut",
          },
          "-=0.4",
        );
      }
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="matching"
      className="mx-auto max-w-[1240px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-0"
    >
      <div className="mb-6 sm:mb-8">
        <h2 className="text-[28px] font-bold tracking-tight text-[#242322] sm:text-[32px]">
          Everything you need to match & ship
        </h2>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-[#77736e]">
          A developer-native platform engineered for authentic collaboration and
          high-signal matching.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {matchCards.map(
          (
            {
              title,
              description,
              details,
              badgeLabel,
              tags,
              repositories,
              codeSnippet,
              columnSpan = 2,
            },
            index,
          ) => (
            <article
              key={title}
              className={[
                "match-bento-card group relative rounded-[24px] border border-[#e9e5df] bg-white/90 p-5 sm:p-6 shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-300 hover:bg-white hover:shadow-lg hover:shadow-orange-500/10",
                columnSpan === 3 ? "md:col-span-3" : "md:col-span-2",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-orange-100 bg-orange-50/60 shadow-2xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-orange-100/70">
                  {matchIconMap[index] || (
                    <Sparkles className="size-5 text-orange-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#242322]">
                    {title}
                  </h3>
                  {description ? (
                    <p className="mt-1 text-xs leading-relaxed text-[#77736e]">
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>

              {details ? (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-orange-200/80 bg-orange-50/70 px-3 py-1 font-mono text-[11px] font-bold text-orange-600">
                  <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
                  {details}
                </div>
              ) : null}

              {codeSnippet ? (
                <div
                  ref={codeBoxRef}
                  className="mt-4 overflow-hidden rounded-xl border border-[#e8e4de] bg-[#1e1d1b] p-3.5 shadow-inner transition-colors duration-500"
                >
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-mono text-[#8e8880]">
                    <span className="size-2 rounded-full bg-red-400/80" />
                    <span className="size-2 rounded-full bg-yellow-400/80" />
                    <span className="size-2 rounded-full bg-green-400/80" />
                    <span className="ml-2 font-semibold text-[#a8a299]">
                      pgvector_query.sql
                    </span>
                  </div>
                  <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-amber-200/90">
                    {codeSnippet}
                  </pre>
                </div>
              ) : null}

              {tags ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#eae6e1] bg-[#f8f6f3] px-3 py-1.5 font-mono text-xs font-semibold text-[#524d47]"
                    >
                      <span className="size-1.5 rounded-full bg-orange-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {repositories ? (
                <div className="mt-4 space-y-2">
                  {repositories.map(({ name, language, stars }) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded-xl border border-[#f0ede8] bg-[#f8f6f3] px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Code2 className="size-3.5 shrink-0 text-orange-500" />
                        <p className="truncate text-xs font-semibold text-[#242322]">
                          {name}
                        </p>
                        {language ? (
                          <span className="hidden text-[10px] text-[#8e8983] sm:inline">
                            {language}
                          </span>
                        ) : null}
                      </div>
                      <span className="ml-3 flex shrink-0 items-center gap-1 font-mono text-xs font-semibold text-orange-600">
                        <Star className="size-3 fill-orange-400 text-orange-500" />
                        {stars}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              {badgeLabel ? (
                <div className="mt-4 flex justify-end">
                  <span className="rounded-full bg-[#ee7100] px-4 py-2 text-xs font-bold text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
                    {badgeLabel}
                  </span>
                </div>
              ) : null}
            </article>
          ),
        )}
      </div>
    </section>
  );
}
