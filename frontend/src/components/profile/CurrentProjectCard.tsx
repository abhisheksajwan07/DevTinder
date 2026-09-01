import { Label } from "./ProfileUI";

interface CurrentProjectCardProps {
  projectDescription: string;
}

export default function CurrentProjectCard({
  projectDescription,
}: CurrentProjectCardProps) {
  return (
    <section className="rounded-3xl border border-[#e9e5df] bg-white p-5 shadow-xs">
      <Label>Current project</Label>
      <p className="text-sm leading-relaxed text-[#55504b]">
        {projectDescription}
      </p>
    </section>
  );
}
