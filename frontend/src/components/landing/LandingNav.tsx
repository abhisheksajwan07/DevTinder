import { useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Github } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function LandingNav() {
  const navRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      // Sleek header slide down on load
      gsap.fromTo(
        navRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      // Scroll progress bar indicator
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
          },
        });
      }
    },
    { scope: navRef }
  );

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 w-full border-b border-[#ebe8e4]/80 bg-[#fdfcfb]/85 backdrop-blur-md transition-all"
    >
      {/* Scroll Progress Line */}
      <div
        ref={progressRef}
        className="h-0.5 w-full origin-left bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 scale-x-0"
      />

      <nav className="mx-auto flex h-[62px] max-w-[1240px] items-center justify-between px-6 lg:px-0">
        <a
          href="#top"
          className="group flex items-center gap-2 rounded-full border border-transparent px-3 py-1.5 text-base font-bold tracking-tight text-[#242322] transition hover:border-orange-200 hover:bg-orange-50/50"
        >
          <div className="grid size-7 place-items-center rounded-lg bg-orange-500 text-white shadow-xs transition-transform group-hover:scale-105">
            <img
              src="/dev-tinder.svg"
              alt="DevTinder logo"
              className="size-4"
            />
          </div>
          <span>DevTinder</span>
        </a>

        <div className="hidden items-center gap-8 text-xs font-medium text-[#77736e] md:flex">
          <a
            className="transition hover:text-orange-600"
            href="#features"
          >
            Features
          </a>
          <a
            className="transition hover:text-orange-600"
            href="#matching"
          >
            AI Matching
          </a>
          <a
            className="transition hover:text-orange-600"
            href="#demo"
          >
            Get Started
          </a>
          <a
            className="inline-flex items-center gap-1.5 transition hover:text-orange-600"
            href="https://github.com/abhisheksajwan07/DevTinder"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="size-3.5" />
            Open Source
          </a>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            className="hidden font-medium text-[#77736e] transition hover:text-[#242322] sm:block"
            to="/signin"
          >
            Sign In
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-[#24292f] px-4 py-2.5 font-semibold text-white shadow-sm shadow-black/20 transition hover:bg-[#1a1e22] hover:shadow-md hover:shadow-black/25 active:scale-95"
            to="/signup"
            style={{ color: "#ffffff" }}
          >
            <Github className="size-4" />
            <span>Get Started</span>
          </Link>
          <a
            href="https://github.com/abhisheksajwan07/DevTinder"
            target="_blank"
            rel="noreferrer"
            aria-label="Star DevTinder on GitHub"
            className="hidden size-10 items-center justify-center rounded-full border border-[#ded9d2] text-[#55504b] transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 sm:inline-flex"
          >
            <Github className="size-4" />
          </a>
        </div>
      </nav>
    </header>
  );
}
