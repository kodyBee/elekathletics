import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowLeft, Clock } from "lucide-react";

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
  title: "Book — Everything Included Plan",
  description:
    "Book your first session for the Everything Included coaching plan. $350/mo — fully customized training and ongoing support.",
};

export default function BookPage() {
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

      {/* BOOKING SECTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20 scroll-mt-20">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/40 text-primary">
              Everything Included Plan
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to commit?
            </h1>
            <p className="text-muted-foreground">
              Lock in your first session. You&apos;ll get fully customized
              programming, video form reviews, and direct messaging with Elek
              — everything you need to hit your goals.
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-gradient-primary text-4xl font-bold">
                $350
              </span>
              <span className="text-sm text-muted-foreground">per month</span>
            </div>
            <Separator />
            <ul className="space-y-3 text-sm">
              {[
                "Lock in your spot immediately",
                "Movement screen on your first visit",
                "Flexible reschedules with 24h notice",
                "Programs that scale to your week",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Schedule strip */}
            <div className="pt-4 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Availability
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3">
                  <Clock className="size-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Weekdays</p>
                    <p className="text-xs text-muted-foreground">
                      6:00am – 8:00pm
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3">
                  <Clock className="size-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Saturday</p>
                    <p className="text-xs text-muted-foreground">
                      7:00am – 1:00pm
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <ImagePlaceholder
                label="Training session"
                ratio="video"
                src="/elek5.png"
              />
            </div>
          </div>

          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle>Booking request</CardTitle>
              <CardDescription>
                It takes about 60 seconds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
