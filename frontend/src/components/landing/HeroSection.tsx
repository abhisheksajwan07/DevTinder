import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { demoProfiles } from "./landing-data";
import {
  Github,
  Sparkles,
  X,
  Heart,
  Star,
  Code2,
  CheckCircle2,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const cardInnerRef = useRef<HTMLDivElement | null>(null);
  const floatTweenRef = useRef<gsap.core.Tween | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const currentProfile = demoProfiles[currentIndex % demoProfiles.length];

  // GSAP Animations setup
  useGSAP(
    () => {
      // 1. Staggered reveal of left content
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });

      tl.fromTo(
        ".hero-element",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power4.out",
          clearProps: "transform",
        },
      ).fromTo(
        cardContainerRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "back.out(1.2)",
          clearProps: "opacity",
        },
        "-=0.5",
      );

      // 2. Smooth levitation float loop for card
      if (cardContainerRef.current) {
        floatTweenRef.current = gsap.to(cardContainerRef.current, {
          y: -8,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // Ensure ScrollTrigger updates coordinates accurately
      ScrollTrigger.refresh();
    },
    { scope: sectionRef },
  );

  // Smooth Mouse 3D Tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardInnerRef.current) return;
    const rect = cardInnerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(cardInnerRef.current, {
      rotateY: (x / rect.width) * 16,
      rotateX: (-y / rect.height) * 16,
      duration: 0.3,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    if (!cardInnerRef.current) return;
    gsap.to(cardInnerRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  // Interactive Swipe animation (Like / Pass)
  const handleSwipe = (direction: "like" | "pass") => {
    if (!cardInnerRef.current) return;

    // Pause gentle float while swiping
    if (floatTweenRef.current) floatTweenRef.current.pause();

    const xTarget = direction === "like" ? 320 : -320;
    const rotateTarget = direction === "like" ? 18 : -18;

    setFeedbackMessage(direction === "like" ? "Matched! 🚀" : "Skipped");

    gsap.to(cardInnerRef.current, {
      x: xTarget,
      rotate: rotateTarget,
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        // Next profile
        setCurrentIndex((prev) => prev + 1);

        // Reset offscreen on opposite side
        gsap.set(cardInnerRef.current, {
          x: direction === "like" ? -120 : 120,
          rotate: direction === "like" ? -10 : 10,
          scale: 0.9,
          opacity: 0,
        });

        // Animate back in smoothly
        gsap.to(cardInnerRef.current, {
          x: 0,
          rotate: 0,
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(1.4)",
          onComplete: () => {
            if (floatTweenRef.current) floatTweenRef.current.resume();
            setTimeout(() => setFeedbackMessage(null), 1500);
          },
        });
      },
    });
  };

  return (
    <section
      ref={sectionRef}
      id="top"
      className="mx-auto grid max-w-[1240px] gap-10 px-4 pb-16 pt-8 sm:gap-12 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-0 lg:pt-16"
    >
      <div className="lg:ml-4">
        {/* Hero Badge */}
        <div className="hero-element inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-gradient-to-r from-orange-50 via-amber-50 to-white px-3.5 py-1.5 text-[11px] font-semibold text-orange-700 shadow-xs">
          <Sparkles className="size-3.5 text-orange-500 animate-pulse" />
          <span>Powered by Voyage AI & pgvector</span>
        </div>

        {/* Hero Title */}
        <h1 className="hero-element mt-5 max-w-[620px] text-[38px] font-extrabold leading-[1.05] tracking-tight sm:text-[62px]">
          Match with{" "}
          <span className="bg-gradient-to-r from-[#ee7100] via-amber-600 to-orange-500 bg-clip-text text-transparent">
            Developers
          </span>{" "}
          Who Build Like You.
        </h1>

        {/* Hero Description */}
        <p className="hero-element mt-5 max-w-[510px] text-base leading-relaxed text-[#66615c]">
          Swipe through developer profiles powered by Voyage AI vector
          embeddings. Find compatible people through tech stack similarity,
          featured repositories, and real-time pair chat.
        </p>

        {/* Hero CTAs */}
        <div className="hero-element mt-7 flex flex-col items-stretch gap-3 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#24292f] px-6 py-3.5 font-bold text-white shadow-md shadow-black/20 transition-transform duration-200 hover:bg-[#1a1e22] hover:shadow-lg hover:shadow-black/25 active:scale-95 sm:w-auto"
            to="/signup"
            style={{ color: "#ffffff" }}
          >
            <Github className="size-4.5 transition-transform group-hover:scale-110" />
            <span>Continue with GitHub</span>
          </Link>
          <a
            href="#matching"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#e2ded7] bg-white px-5 py-3.5 font-semibold text-[#55504b] transition-colors hover:border-orange-300 hover:bg-orange-50/40 hover:text-orange-600 sm:w-auto"
          >
            <span>Explore AI Matcher</span>
          </a>
        </div>
      </div>

      {/* Floating Match Card Preview */}
      <div
        ref={cardContainerRef}
        className="relative mx-auto w-full max-w-[390px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Feedback Popup Badge */}
        {feedbackMessage && (
          <div className="absolute -top-12 left-1/2 z-30 -translate-x-1/2 animate-bounce rounded-full border border-emerald-300 bg-emerald-900/90 px-4 py-1.5 font-mono text-xs font-bold text-emerald-200 shadow-xl backdrop-blur-md">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              {feedbackMessage}
            </span>
          </div>
        )}

        {/* Decorative backdrop glow */}
        <div className="absolute -inset-1.5 rounded-[36px] bg-gradient-to-r from-orange-400/20 via-amber-300/20 to-orange-500/20 blur-lg opacity-70 animate-pulse-soft" />

        <div
          ref={cardInnerRef}
          className="relative rounded-[28px] border border-[#ebe8e4] bg-white/95 p-5 shadow-[0_20px_50px_rgba(46,35,20,0.08)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_25px_60px_rgba(238,113,0,0.12)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="flex items-start gap-3.5">
            <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#1a1918] to-[#3a3835] font-mono text-base font-bold text-white shadow-sm">
              {currentProfile.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-base text-[#242322]">
                  {currentProfile.name}
                </p>
                <span
                  className="inline-flex size-2 rounded-full bg-emerald-500"
                  title="Online now"
                />
              </div>
              <p className="mt-0.5 text-xs font-medium leading-relaxed text-[#77716b]">
                {currentProfile.role}
              </p>
            </div>
            <div className="ml-auto rounded-2xl border border-orange-200 bg-orange-50/70 px-3 py-1.5 text-center">
              <span className="font-mono text-sm font-bold text-orange-600">
                {currentProfile.matchScore}%
              </span>
              <span className="block text-[9px] font-semibold text-orange-500 uppercase tracking-wider">
                Match
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-[#66615c] italic">
            "{currentProfile.bio}"
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {currentProfile.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-[#eae6e1] bg-[#f7f5f2] px-3 py-1 font-mono text-[10px] font-semibold text-[#5c5752]"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {currentProfile.repos.map(({ name, stack, stars }) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-xl border border-[#f0ede8] bg-[#f8f6f3] px-3.5 py-2.5 transition-colors hover:border-orange-200"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="size-3.5 text-orange-500" />
                  <div>
                    <p className="text-xs font-semibold text-[#242322]">
                      {name}
                    </p>
                    <p className="text-[10px] text-[#8e8983]">{stack}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 font-mono text-xs font-semibold text-orange-600">
                  <Star className="size-3 fill-orange-400 text-orange-500" />
                  <span>{stars}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Interactive Swipe Buttons */}
          <div className="mt-5 flex justify-center gap-6">
            <button
              type="button"
              aria-label="Pass profile"
              onClick={() => handleSwipe("pass")}
              className="grid size-12 place-items-center rounded-full border border-[#e8e4df] bg-[#faf9f7] text-[#77716b] shadow-xs transition-transform duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 hover:scale-110 active:scale-90 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <button
              type="button"
              aria-label="Like profile"
              onClick={() => handleSwipe("like")}
              className="grid size-12 place-items-center rounded-full border border-[#e8e4df] bg-[#faf9f7] text-orange-500 shadow-xs transition-transform duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-500 hover:scale-110 active:scale-90 cursor-pointer"
            >
              <Heart className="size-5 fill-orange-500" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
