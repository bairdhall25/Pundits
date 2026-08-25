import Image from "next/image";

type PunditAvatarProps = {
  src: string;
  alt: string;
  size: "row" | "hero";
};

const SIZE_PX = {
  row: 56,
  hero: 192,
} as const;

export function PunditAvatar({ src, alt, size }: PunditAvatarProps) {
  const dim = SIZE_PX[size];
  const hero = size === "hero";

  return (
    <span
      className={`inline-block overflow-hidden rounded-full ${
        hero ? "ring-1 ring-[var(--green)]" : ""
      }`}
      style={{ width: dim, height: dim }}
    >
      <Image
        src={src}
        alt={alt}
        width={dim}
        height={dim}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
