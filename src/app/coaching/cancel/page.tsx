import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description: "Your payment was cancelled. Your booking slot will be released.",
};

export default function BookingCancelPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-primary" aria-hidden />
      <div className="container mx-auto relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:py-36">
        <div className="mx-auto max-w-xl text-center space-y-6">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive animate-in fade-in zoom-in duration-500">
            <XCircle className="size-10" />
          </div>

          <Badge variant="outline" className="border-destructive/40 text-destructive">
            Payment cancelled
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            No worries.
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
            Your payment wasn&apos;t processed and you haven&apos;t been charged.
            The booking slot will be released automatically so others can book it.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/coaching/book">
                <ArrowLeft className="mr-2 size-4" />
                Try again
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/">Back to home</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            Need help? Reach out at{" "}
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
