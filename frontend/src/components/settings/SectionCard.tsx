import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

export default function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="rounded-[24px] border border-[#e9e5df] bg-white p-5 shadow-xs">
      <h2 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}
