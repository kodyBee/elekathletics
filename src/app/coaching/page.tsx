import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Calendar as CalendarIcon,
  Sparkles,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Coaching & Booking",
  description:
    "1-on-1, online, and hybrid coaching packages. Book a session that fits your goals and your week.",
};

const faqs = [
  {
    q: "I've never lifted before. Is this for me?",
    a: "100%. Most new clients have never touched a barbell. Every plan is built from where you actually are, with as much hands-on coaching as you need.",
  },
  {
    q: "How long until I see results?",
    a: "Most clients feel real changes in strength and energy within 3-4 weeks. Visible body composition changes typically show up by week 8-12, depending on consistency and recovery.",
  },
  {
    q: "What if I have to cancel a session?",
    a: "Life happens. 24h notice gets you a free reschedule. Less than 24h is a half-session credit.",
  },
  {
    q: "Do you offer programs for athletes?",
    a: "Yes — sport-specific programming for runners, climbers, lifters, and team-sport athletes is available under the Coaching Membership.",
  },
];

export default function CoachingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-radial-primary" aria-hidden />
        <div className="container mx-auto relative px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <Badge variant="outline" className="border-primary/40 text-primary">
              Coaching & Booking
            </Badge>
            <h1 className="text-[2.5rem] leading-[0.95] font-bold tracking-tight sm:text-5xl md:text-6xl">
              Find the format that{" "}
              <span className="text-gradient-primary">fits you.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Whether you want the full coaching experience or a tailored plan
              that fits your budget, pick the path that matches your goals.
            </p>
          </div>
        </div>
      </section>

      {/* TWO CARDS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2">
          {/* Everything Included */}
          <Card className="group relative flex h-full flex-col border-primary/60 bg-card shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30">
            {/* Top accent bar */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary to-transparent opacity-100"
            />
            {/* Ambient glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-linear-to-b from-primary/15 to-transparent"
            />
            <Badge className="absolute right-4 top-4">Most popular</Badge>
            <CardHeader className="relative">
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-6" />
              </div>
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-primary/80">
                Premium Coaching
              </span>
              <CardTitle className="text-2xl">Everything Included Plan</CardTitle>
              <CardDescription>
                The flagship online program — fully customized training and
                ongoing coaching support. Everything you need to succeed.
              </CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-gradient-primary text-5xl font-bold">
                  $350
                </span>
                <span className="text-sm text-muted-foreground">per month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3 text-sm">
                {[
                  "Custom weekly programming built around your goals",
                  "Video form reviews and exercise breakdowns",
                  "Direct messaging with Elek throughout the week",
                  "Progress tracking and regular plan updates",
                ].map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild size="lg" className="w-full">
                <Link href="/coaching/book">
                  Start coaching
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Custom Plan */}
          <Card className="group relative flex h-full flex-col border-border/60 bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
            {/* Top accent bar */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary/70 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100"
            />
            <CardHeader className="relative">
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="size-6" />
              </div>
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-primary/80">
                Personalized
              </span>
              <CardTitle className="text-2xl">Custom Plan</CardTitle>
              <CardDescription>
                Don&apos;t need all the features of the Premium plan? We can build
                a customized plan that fits your exact needs and budget.
              </CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">Custom</span>
                <span className="text-sm text-muted-foreground">
                  more affordable
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3 text-sm">
                {[
                  "Tailored to your specific goals",
                  "More affordable pricing options",
                  "Flexible coaching structure",
                  "Free 15-min consultation to build your plan",
                ].map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild size="lg" variant="outline" className="w-full">
                <Link href="/coaching/custom">
                  Contact for a custom plan
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center space-y-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                FAQ
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Common questions.
              </h2>
            </div>
            <Accordion type="single" collapsible className="mt-10 w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
}
