
import { Link } from "react-router-dom";

export default function AuthShowcase() {
  return (
    <div className="relative hidden lg:flex min-h-screen flex-col justify-between p-8 sm:p-12 lg:p-12 xl:p-14 bg-[#121212] text-white overflow-hidden border-r border-[#22211e] select-none">
      {/* Subtle Ambient Background Glow */}
      <div className="pointer-events-none absolute top-1/4 left-10 z-0 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />

      {/* Top Header Logo */}
      <div className="relative z-10 shrink-0">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 rounded-full px-1 py-1 transition hover:opacity-90"
        >
          <img src="/dev-tinder.svg" alt="DevTinder logo" className="size-6" />
          <span className="text-xl font-bold tracking-tight text-white">
            Dev<span className="text-orange-500">Tinder</span>
          </span>
        </Link>
      </div>

      {/* Center: devtinder.db Code Window */}
      <div className="relative z-10 flex flex-1 items-center py-8">
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-[#2a2825] bg-[#181715] p-5 shadow-2xl backdrop-blur-sm">
          {/* Window Top Controls */}
          <div className="flex items-center justify-between border-b border-[#292724] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#ff5f56]" />
              <span className="size-3 rounded-full bg-[#ffbd2e]" />
              <span className="size-3 rounded-full bg-[#27c93f]" />
            </div>

            <span className="font-mono text-xs font-medium text-[#88827c]">
              devtinder.db
            </span>
          </div>

          {/* Code Snippet Block */}
          <div className="font-mono text-xs leading-relaxed text-slate-200 space-y-1">
            <p>
              <span className="text-orange-400 font-semibold">SELECT</span>{" "}
              profile_id,
            </p>

            <p className="pl-4">
              1 - (embedding &lt;=&gt; viewer_embedding)
            </p>

            <p className="pl-4 text-orange-400 font-semibold">
              AS match_score
            </p>

            <p>
              <span className="text-orange-400 font-semibold">FROM</span>{" "}
              profiles
            </p>

            <p>
              <span className="text-orange-400 font-semibold">ORDER BY</span>{" "}
              match_score DESC
            </p>

            <p>
              <span className="text-orange-400 font-semibold">LIMIT</span> 10;
            </p>

            <p className="pt-2 text-[#77716b] font-normal">
              -- semantic developer matching
            </p>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-[#292724]" />

          {/* Matched Developers List */}
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between rounded-xl bg-[#21201d] px-3.5 py-2.5 transition hover:bg-[#282623]">
              <div>
                <p className="text-xs font-semibold text-white">
                  Chai Sharma{" "}
                  <span className="text-[#99948e] font-normal">
                    — Full Stack
                  </span>
                </p>

                <p className="font-mono text-[10px] text-[#77716b]">
                  TypeScript, Node.js, Redis
                </p>
              </div>

              <span className="font-mono text-xs font-bold text-orange-400">
                94%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#21201d] px-3.5 py-2.5 transition hover:bg-[#282623]">
              <div>
                <p className="text-xs font-semibold text-white">
                  Bugesh Kumar{" "}
                  <span className="text-[#99948e] font-normal">
                    — Backend Lead
                  </span>
                </p>

                <p className="font-mono text-[10px] text-[#77716b]">
                  Python, FastAPI, PostgreSQL
                </p>
              </div>

              <span className="font-mono text-xs font-bold text-orange-400">
                87%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#21201d] px-3.5 py-2.5 transition hover:bg-[#282623]">
              <div>
                <p className="text-xs font-semibold text-white">
                  Aloo Prasad{" "}
                  <span className="text-[#99948e] font-normal">
                    — ML Engineer
                  </span>
                </p>

                <p className="font-mono text-[10px] text-[#77716b]">
                  React, Go, TensorFlow
                </p>
              </div>

              <span className="font-mono text-xs font-bold text-orange-400">
                81%
              </span>
            </div>
          </div>

          {/* Bottom Accent Marker */}
          <div className="mt-4 h-2.5 w-2.5 bg-orange-500 rounded-xs" />
        </div>
      </div>

      {/* Bottom Headline & Footer */}
      <div className="relative z-10 shrink-0">
        <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-white">
          Find developers who
          <br />
          build the way{" "}
          <span className="font-serif italic font-normal text-orange-500">
            you think.
          </span>
        </h2>

        <p className="mt-3 font-mono text-[11px] text-[#77716b]">
          © 2026 DevTinder 
        </p>
      </div>
    </div>
  );
}
