import { Link } from "react-router-dom";

interface AuthShowcaseProps {
  className?: string;
}

export default function AuthShowcase({ className = "" }: AuthShowcaseProps) {
  return (
    <aside
      className={`relative hidden h-full min-h-0 overflow-hidden bg-[#121212] text-white lg:block ${className}`}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-10 top-1/4 size-96 rounded-full bg-orange-600/10 blur-3xl" />

      <div className="auth-showcase-content relative z-10 grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
        {/* Logo */}
        <Link to="/" className="inline-flex w-fit items-center gap-2.5">
          <img src="/dev-tinder.svg" alt="DevTinder logo" className="size-6" />

          <span className="text-xl font-bold tracking-tight">
            Dev<span className="text-orange-500">Tinder</span>
          </span>
        </Link>

        {/* Showcase */}
        <div className="auth-showcase-middle min-h-0 w-full">
          <div className="auth-showcase-card mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[#2a2825] bg-[#181715] shadow-2xl">
            {/* Window header */}
            <div className="auth-showcase-window-header flex items-center justify-between border-b border-[#292724]">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#ff5f56]" />
                <span className="size-3 rounded-full bg-[#ffbd2e]" />
                <span className="size-3 rounded-full bg-[#27c93f]" />
              </div>

              <span className="font-mono text-xs text-[#88827c]">
                devtinder.db
              </span>
            </div>

            {/* SQL */}
            <div className="auth-showcase-query space-y-1 font-mono leading-relaxed text-slate-200">
              <p>
                <span className="font-semibold text-orange-400">SELECT</span>{" "}
                profile_id,
              </p>

              <p className="pl-4">1 - (embedding &lt;=&gt; viewer_embedding)</p>

              <p className="pl-4 font-semibold text-orange-400">
                AS match_score
              </p>

              <p>
                <span className="font-semibold text-orange-400">FROM</span>{" "}
                profiles
              </p>

              <p>
                <span className="font-semibold text-orange-400">ORDER BY</span>{" "}
                match_score DESC
              </p>

              <p>
                <span className="font-semibold text-orange-400">LIMIT</span> 10;
              </p>

              <p className="pt-2 text-[#77716b]">
                -- semantic developer matching
              </p>
            </div>

            <div className="auth-showcase-divider border-t border-[#292724]" />

            {/* Developers */}
            <div className="auth-showcase-developers space-y-3">
              <Developer
                name="Chai Sharma"
                role="Full Stack"
                skills="TypeScript, Node.js, Redis"
                score="94%"
              />

              <Developer
                name="Bugesh Kumar"
                role="Backend Lead"
                skills="Python, FastAPI, PostgreSQL"
                score="87%"
              />
            </div>

            <div className="auth-showcase-marker size-2.5 rounded-xs bg-orange-500" />
          </div>
        </div>

        {/* Bottom text */}
        <div className="auth-showcase-caption relative z-10">
          <h2 className="text-[clamp(1.35rem,2.2vw,1.875rem)] font-normal tracking-tight">
            Find developers who
            <br />
            build the way{" "}
            <span className="font-serif italic text-orange-500">
              you think.
            </span>
          </h2>

          <p className="mt-3 font-mono text-[11px] text-[#77716b]">
            © 2026 DevTinder
          </p>
        </div>
      </div>
    </aside>
  );
}

function Developer({
  name,
  role,
  skills,
  score,
}: {
  name: string;
  role: string;
  skills: string;
  score: string;
}) {
  return (
    <div className="auth-showcase-developer flex items-center justify-between rounded-xl bg-[#21201d]">
      <div>
        <p className="text-xs font-semibold text-white">
          {name} <span className="font-normal text-[#99948e]">— {role}</span>
        </p>

        <p className="font-mono text-[10px] text-[#77716b]">{skills}</p>
      </div>

      <span className="font-mono text-xs font-bold text-orange-400">
        {score}
      </span>
    </div>
  );
}
