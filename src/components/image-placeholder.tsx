import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ImagePlaceholderProps = {
  label?: string;
  ratio?: "square" | "video" | "portrait" | "wide" | "auto";
  className?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
  objectPosition?: string;
};

const ratioClass: Record<NonNullable<ImagePlaceholderProps["ratio"]>, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/7]",
  auto: "",
};

export function ImagePlaceholder({
  label = "Photo placeholder",
  ratio = "video",
  className,
  src,
  alt,
  priority,
  objectPosition = "center",
}: ImagePlaceholderProps) {
  if (src) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border/60 bg-muted",
          ratioClass[ratio],
          className
        )}
      >
        <Image
          src={src}
          alt={alt ?? label}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          style={objectPosition ? { objectPosition } : undefined}
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-muted/60 via-background to-primary/15",
        ratioClass[ratio],
        className
      )}
    >
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <ImageIcon className="size-6" aria-hidden />
        <span className="text-xs uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}
