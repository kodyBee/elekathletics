import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { BookingForm } from "@/components/booking-form";

export const metadata: Metadata = {
  title: "Custom Plan — Free Consultation",
  description:
    "Book a free 15-minute consultation to build a coaching plan tailored to your goals and budget.",
};

export default function CustomPlanPage() {
  return (
    <>
      {/* BACK LINK */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/coaching">
            <ArrowLeft className="size-4" />
            Back to coaching
          </Link>
        </Button>
      </div>

      {/* CONSULTATION SECTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20 scroll-mt-20">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/40 text-primary">
              Custom Plan
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Let&apos;s talk goals.
            </h1>
            <p className="text-muted-foreground">
              Grab a time on my calendar. We&apos;ll do a quick 15-minute call to talk
              through your training history, where you want to go, and which
              coaching setup makes the most sense. No pressure, no credit card
              required.
            </p>
            <Separator />
            <ul className="space-y-3 text-sm">
              {[
                "100% free, no obligation",
                "Discuss your specific goals",
                "Review training history & injuries",
                "Get a recommendation on the best plan",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <ImagePlaceholder
                label="Consultation call"
                ratio="video"
                src="/elek4.PNG"
              />
            </div>
          </div>

          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle>Book your consult</CardTitle>
              <CardDescription>
                Takes about 30 seconds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingForm
                defaultPackage="consultation"
                hidePackageSelection={true}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
