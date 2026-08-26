type PunditAvatarProps = {
  src: string;
  alt: string;
  size: "row" | "hero" | "peek";
};

const SIZE_PX = {
  row: 56,
  hero: 192,
  peek: 36,
} as const;

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function PunditAvatar({ src, alt, size }: PunditAvatarProps) {
  const dim = SIZE_PX[size];
  const hero = size === "hero";
  const href = src.startsWith("http")
    ? src
    : `${basePath}${src.startsWith("/") ? src : `/${src}`}`;

  return (
    <span
      className={`inline-block overflow-hidden ${
        hero ? "rounded-full ring-1 ring-[var(--green)]" : ""
      }`}
      style={{ width: dim, height: dim }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={href}
        alt={alt}
        width={dim}
        height={dim}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
