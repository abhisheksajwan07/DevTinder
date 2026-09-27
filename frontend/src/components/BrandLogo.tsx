interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export default function BrandLogo({
  className = "",
  textClassName = "",
}: BrandLogoProps) {
  return (
    <span
      className={`inline-flex items-center font-bold tracking-tight select-none ${className} ${textClassName}`}
    >
      Dev<span className="text-orange-500">Tinder</span>
    </span>
  );
}
