import { useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { footerSections } from "./landing-data";
import { Github, Heart, ArrowUp, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function FooterSection() {
  const footerRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        footerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            once: true,
          },
        }
      );
    },
    { scope: footerRef }
  );

  return (
    <footer ref={footerRef} id="footer" className="mx-auto max-w-[1240px] px-6 pb-12 lg:px-0">
      <div className="rounded-[28px] border border-[#e9e5df] bg-gradient-to-b from-[#f7f5f2] to-[#f0eee9] p-8 shadow-sm lg:p-10">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand Info */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-orange-500 text-white shadow-sm shadow-orange-500/30">
                  <img
                    src="/dev-tinder.svg"
                    alt="DevTinder logo"
                    className="size-5"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#242322]">
                  DevTinder
                </span>
              </div>
              <p className="mt-4 max-w-sm text-xs leading-relaxed text-[#77736e]">
                Match with developers who build like you. Powered by Voyage AI vector embeddings, pgvector cosine similarity, and real-time pair chat.
              </p>
            </div>

            {/* System Status Pill */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e2ded7] bg-white/90 px-3.5 py-1.5 text-[11px] font-medium text-[#55504b] shadow-xs">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Voyage AI & pgvector Ready
              </div>

              <Link
                to="/signin"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e2ded7] bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#44403c] transition hover:border-orange-400 hover:text-orange-600"
              >
                <Github className="size-3.5" />
                GitHub OAuth
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-7">
            {footerSections.map(({ title, items }) => (
              <div key={title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#242322]">
                  {title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-xs text-[#77736e]">
                  {items.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="inline-block transition hover:translate-x-0.5 hover:text-orange-600"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#e2ded7] pt-6 sm:flex-row text-xs text-[#88827c]">
          <p className="flex items-center gap-1">
            © 2026 DevTinder. Built with{" "}
            <Heart className="size-3.5 fill-red-500 text-red-500 inline" /> by{" "}
            <span className="font-semibold text-[#3a3735]">Abhishek</span>
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-mono text-[10px] text-[#9a948e]">
              <Sparkles className="size-3 text-orange-500" /> Open Source Developer Matching
            </span>
            <a
              href="#top"
              className="group flex items-center gap-1.5 rounded-full border border-[#e2ded7] bg-white px-3 py-1.5 text-xs font-medium text-[#55504b] transition hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
            >
              <span>Back to top</span>
              <ArrowUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
