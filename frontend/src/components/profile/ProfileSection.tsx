import { Label } from "./ProfileUI";

interface ProfileSectionProps {
  title: string;
  items: string[];
  accent?: boolean;
}

export default function ProfileSection({
  title,
  items,
  accent,
}: ProfileSectionProps) {
  return (
    <section className="rounded-3xl border border-[#e9e5df] bg-white p-5 shadow-xs">
      <Label>{title}</Label>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border border-[#e9e5df] px-3 py-1.5 text-[11px] font-semibold ${
              accent
                ? "bg-orange-50 text-orange-700"
                : "bg-[#f7f5f2] text-[#55504b]"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
