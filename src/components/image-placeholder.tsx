import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ImagePlaceholderProps = {
  label?: string;
  ratio?: "square" | "video" | "portrait" | "wide" | "auto";
  className?: string;
};

const ratioClass: Record<NonNullable<ImagePlaceholderProps["ratio"]>, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/7]",
  auto: "",
};

/**
 * Drop-in stand-in for a future <Image>. Swap the wrapping div for
 * <Image src=... alt=... fill className="object-cover" /> when assets arrive.
 */
export function ImagePlaceholder({
  label = "Photo placeholder",
  ratio = "video",
  className,
}: ImagePlaceholderProps) {
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
