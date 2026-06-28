import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  description: "Your session has been booked and payment confirmed.",
};

export default function BookingSuccessPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-primary" aria-hidden />
      <div className="container mx-auto relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:py-36">
        <div className="mx-auto max-w-xl text-center space-y-6">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="size-10" />
          </div>

          <Badge variant="outline" className="border-primary/40 text-primary">
            Payment confirmed
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            You&apos;re{" "}
            <span className="text-gradient-primary">booked.</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
            Payment went through and your session is locked in.
            You&apos;ll get a confirmation email shortly with all the details.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/coaching">
                <Calendar className="mr-2 size-4" />
                Book another session
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/">
                <ArrowLeft className="mr-2 size-4" />
                Back to home
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            Questions? Reach out at{" "}
            <a
              href="mailto:Jon@elekathletics.com"
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Jon@elekathletics.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
