import Link from "next/link";
import Image from "next/image";
import { Camera } from "lucide-react";

import { siteConfig } from "@/lib/site";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid gap-8 sm:gap-10 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold">
              <div className="relative size-14 overflow-visible">
                <Image 
                  src="/ea-logo.svg" 
                  alt="Elek Athletics Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <span className="text-base tracking-wide uppercase">
                {siteConfig.shortName}
                <span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {siteConfig.description}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Explore
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="-mx-2 inline-flex min-h-9 items-center rounded-md px-2 hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/coaching"
                  className="-mx-2 inline-flex min-h-9 items-center rounded-md px-2 hover:text-foreground transition-colors"
                >
                  Coaching & Booking
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="-mx-2 inline-flex min-h-9 items-center rounded-md px-2 hover:text-foreground transition-colors"
                >
                  About & Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <a
                  className="-mx-2 inline-flex min-h-9 items-center rounded-md px-2 break-all hover:text-foreground transition-colors"
                  href={`mailto:${siteConfig.contact.email}`}
                >
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <a
                  className="-mx-2 inline-flex min-h-9 items-center rounded-md px-2 hover:text-foreground transition-colors"
                  href={`tel:${siteConfig.contact.phone.replace(/[^+\d]/g, "")}`}
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="px-0 py-1">{siteConfig.contact.location}</li>
              <li className="px-0 py-1">{siteConfig.contact.hours}</li>
            </ul>
            <div className="flex items-center gap-1 pt-1">
              <a
                href={siteConfig.social.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
              >
                <Camera className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center safe-pb">
          <p>© {year} {siteConfig.name}. All rights reserved.</p>
          <p>
            Built with Next.js & shadcn/ui — designed for hard work.
          </p>
        </div>
      </div>
    </footer>
  );
}
