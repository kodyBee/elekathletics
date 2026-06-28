import Link from "next/link";
import {
  ArrowRight,
  Dumbbell,
  HeartPulse,
  Trophy,
  Quote,
  CheckCircle2,
} from "lucide-react";

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
import { siteConfig } from "@/lib/site";

const services = [
  {
    icon: Dumbbell,
    title: "Strength & Hypertrophy",
    body: "Progressive programs built around the big lifts to add lean muscle and real-world strength.",
  },
  {
    icon: HeartPulse,
    title: "Conditioning & Mobility",
    body: "Smarter cardio and movement prep so you train pain-free and recover faster between sessions.",
  },
  {
    icon: Trophy,
    title: "Athletic Performance",
    body: "Sport-specific programming for athletes who need to be explosive, durable, and fast.",
  },
];

const stats = [
  { value: "10+", label: "Years coaching" },
  { value: "400+", label: "Clients trained" },
  { value: "98%", label: "Stick with it past 90 days" },
];

const testimonials = [
  {
    name: "Maya R.",
    role: "Marathon runner",
    quote:
      "Knocked 12 minutes off my PR in one season. The programming finally made sense for my schedule.",
  },
  {
    name: "Jordan K.",
    role: "Busy dad of two",
    quote:
      "Lost 28 lbs and actually got stronger doing it. No fluff, no shame — just a plan I can stick to.",
  },
  {
    name: "Sam D.",
    role: "Amateur powerlifter",
    quote:
      "Squat went from 315 to 405 in nine months. Best coach I've ever worked with, hands down.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-primary" aria-hidden />
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div className="container mx-auto relative px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-28 lg:py-32">
          <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-2">
            <div className="space-y-5 sm:space-y-6">
              <h1 className="text-[2.5rem] leading-[0.95] font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="text-foreground">Train hard.</span>{" "}
                <span className="text-gradient-primary">Move better.</span>{" "}
                <span className="text-foreground">Live stronger.</span>
              </h1>
              <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                {siteConfig.description} Built around your body, your schedule,
                and the goals you actually care about.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button asChild size="lg" className="w-full font-medium sm:w-auto">
                  <Link href="/coaching/custom">
                    Book free consult
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="/coaching">See coaching plans</Link>
                </Button>
              </div>
              <div className="flex flex-col gap-2 pt-4 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3 sm:pt-6">
                {[
                  "Certified Strength & Conditioning Specialist",
                  "Nutrition coaching included",
                  "In-person & online programs",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <ImagePlaceholder
                label="Hero — coach in action"
                ratio="portrait"
                className="shadow-2xl shadow-primary/20"
                src="/MPFin01852 (1).JPG"
                objectPosition="center 20%"
                priority
              />
              <div className="absolute -bottom-6 -left-6 hidden w-44 md:block">
                <ImagePlaceholder
                  label="Action shot"
                  ratio="square"
                  src="/elek2.JPG"
                  objectPosition="center 38%"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center text-center sm:items-start sm:text-left"
              >
                <span className="font-heading text-3xl text-primary sm:text-5xl md:text-6xl tabular-nums">
                  {s.value}
                </span>
                <span className="mt-2 text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs sm:tracking-[0.2em]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            What I do
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Programs that meet you where you are.
          </h2>
          <p className="text-muted-foreground">
            Whether you&apos;re lifting for the first time or chasing a competition
            podium, every plan is built individually around your training age,
            schedule, and goals.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
          {services.map(({ icon: Icon, title, body }) => (
            <Card
              key={title}
              className="group relative overflow-hidden border-border/60 bg-card/60 transition-colors hover:border-primary/40"
            >
              <div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <CardHeader>
                <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {body}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* FEATURE STRIP — image-friendly */}
      <section className="bg-card/40 border-y border-border/60">
        <div className="container mx-auto grid items-center gap-8 px-4 sm:px-6 sm:gap-10 lg:px-8 py-16 sm:py-20 lg:grid-cols-2">
          <ImagePlaceholder
            label="Gym floor — coaching a deadlift"
            ratio="wide"
            src="/elek4.PNG"
            objectPosition="center 38%"
          />
          <div className="space-y-5">
            <Badge variant="outline" className="border-primary/40 text-primary">
              How it works
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              A simple system. Relentless attention to detail.
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Free 20-minute intro call to align on goals and timelines.",
                "Movement screen + baseline assessment so the plan fits your body.",
                "Weekly programming with video form checks and weekly check-ins.",
                "Quarterly retests so progress is measured, not guessed.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/coaching/custom">
                  Start with a free consult
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Client wins
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Real people. Real numbers.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card
              key={t.name}
              className="border-border/60 bg-card/60 transition-colors hover:border-primary/40"
            >
              <CardHeader>
                <Quote className="size-6 text-primary/70" />
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <Separator />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border/60 bg-gradient-to-b from-background to-primary/10">
        <div className="absolute inset-0 bg-radial-primary opacity-60" aria-hidden />
        <div className="container mx-auto relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 text-center">
          <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            Ready to put in the work?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Spots are limited so I can give every client the attention they
            deserve. Lock in your session and let&apos;s build something.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/coaching/custom">
                Book free consult
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/about">Get in touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
