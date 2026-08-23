type LandingIconProps = {
  children: string;
};

export function LandingIcon({ children }: LandingIconProps) {
  return (
    <span className="grid size-9 place-items-center rounded-xl border border-[#eeeae4] bg-[#faf9f7] text-base text-orange-500">
      {children}
    </span>
  );
}
