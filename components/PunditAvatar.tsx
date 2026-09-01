type PunditAvatarProps = {
  src: string;
  alt: string;
  size: "row" | "hero" | "peek" | "feed";
};

const SIZE_PX = {
  row: 56,
  hero: 192,
  peek: 36,
  feed: 72,
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
      className={`pundit-avatar inline-block overflow-hidden ${
        hero
          ? "pundit-avatar-hero rounded-full ring-1 ring-[var(--green)]"
          : "bg-[#1a1a1a] ring-1 ring-inset ring-[#2a2a2a]"
      }`}
      style={hero ? undefined : { width: dim, height: dim }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {/* Faces sit in the top third of most source photos; bias the crop up. */}
      <img
        src={href}
        alt={alt}
        width={dim}
        height={dim}
        loading={hero ? "eager" : "lazy"}
        decoding={hero ? undefined : "async"}
        className="h-full w-full object-cover object-[50%_25%]"
      />
    </span>
  );
}
