import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Clock,
  Calendar as CalendarIcon,
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
import { Separator } from "@/components/ui/separator";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { BookingForm } from "@/components/booking-form";

export const metadata: Metadata = {
  title: "Coaching & Booking",
  description:
    "1-on-1, online, and hybrid coaching packages. Book a session that fits your goals and your week.",
};

const plans = [
  {
    name: "Online Training Premium",
    category: "Online Coaching",
    price: "$350",
    cadence: "per month",
    description:
      "The flagship online program — fully customized training and ongoing coaching support.",
    features: [
      "Custom weekly programming built around your goals",
      "Video form reviews and exercise breakdowns",
      "Direct messaging with Jon throughout the week",
      "Progress tracking and regular plan updates",
    ],
    cta: "Start coaching",
    highlight: true,
  },
  {
    name: "In-Person @ Wnrs Circle",
    category: "Studio Training",
    price: "$90",
    cadence: "per hour",
    description:
      "1-on-1 training at the Wnrs Circle studio in Burbank, CA.",
    features: [
      "60-minute 1-on-1 session",
      "Hands-on coaching every set",
      "Personalized warm-up & main lift focus",
      "Take-home notes after each session",
    ],
    cta: "Book a session",
    highlight: false,
  },
  {
    name: "In-Person Outside Wnrs Circle",
    category: "On-Location Training",
    price: "$135",
    cadence: "per hour",
    description:
      "On-site training at the gym or location of your choice.",
    features: [
      "60-minute 1-on-1 session at your gym",
      "Full programming for the session",
      "Travel within agreed area included",
      "Ideal for athletes with home or private setups",
    ],
    cta: "Request a session",
    highlight: false,
  },
  {
    name: "Nutrition Plan",
    category: "Nutrition",
    price: "$175",
    cadence: "one-time",
    description:
      "A custom nutrition plan dialed to your body, goals, and schedule.",
    features: [
      "Personalized macro and calorie targets",
      "Meal structure & food guidance",
      "Built around training and recovery",
      "Delivered as an easy-to-follow plan",
    ],
    cta: "Get your plan",
    highlight: false,
  },
  {
    name: "In-Person Posing",
    category: "Posing",
    price: "$90",
    cadence: "per 45 min",
    description:
      "Men's Physique posing coaching, in person at the studio.",
    features: [
      "45-minute focused posing session",
      "Mandatories & quarter-turn refinement",
      "Stage presentation & transitions",
      "Pre-show prep and feedback",
    ],
    cta: "Book posing",
    highlight: false,
  },
  {
    name: "Online Posing",
    category: "Posing",
    price: "$70",
    cadence: "per 45 min",
    description:
      "Men's Physique posing coaching over video from anywhere.",
    features: [
      "45-minute live video session",
      "Mandatories & stage walk review",
      "Personalized cues and homework",
      "Recordings reviewed between sessions",
    ],
    cta: "Book online posing",
    highlight: false,
  },
];

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
        <div className="absolute inset-0 bg-radial-red" aria-hidden />
        <div className="container mx-auto relative px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-24">
          <div className="max-w-3xl space-y-5">
            <Badge variant="outline" className="border-primary/40 text-primary">
              Coaching & Booking
            </Badge>
            <h1 className="text-[2.5rem] leading-[0.95] font-bold tracking-tight sm:text-5xl md:text-6xl">
              Start with a{" "}
              <span className="text-gradient-red">conversation.</span>
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Not sure which plan is right for you? Let's hop on a free 15-minute 
              call to discuss your goals and find the perfect fit.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="#consultation">
                  <CalendarIcon className="mr-2 size-4" />
                  Book free consult
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="#plans">Skip to packages</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CONSULTATION */}
      <section
        id="consultation"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 scroll-mt-20 border-b border-border/60"
      >
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/40 text-primary">
              Step 1
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Let's talk goals.
            </h2>
            <p className="text-muted-foreground">
              Grab a time on my calendar. We'll do a quick 15-minute call to talk
              through your training history, where you want to go, and which
              coaching package makes the most sense. No pressure, no credit card required.
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

      {/* PLANS */}
      <section
        id="plans"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24"
      >
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Coaching plans
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Find the format that fits your week.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlight
                  ? "group relative flex h-full flex-col border-primary/60 bg-card shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30"
                  : "group relative flex h-full flex-col border-border/60 bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              }
            >
              {/* Top accent bar */}
              <div
                aria-hidden
                className={
                  plan.highlight
                    ? "absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary to-transparent opacity-100"
                    : "absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary/70 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100"
                }
              />
              {/* Ambient glow on highlight */}
              {plan.highlight && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-linear-to-b from-primary/15 to-transparent"
                />
              )}
              {plan.highlight && (
                <Badge className="absolute right-4 top-4">Most popular</Badge>
              )}
              <CardHeader className="relative">
                <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-primary/80">
                  {plan.category}
                </span>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span
                    className={
                      plan.highlight
                        ? "text-gradient-red text-5xl font-bold"
                        : "text-4xl font-bold"
                    }
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.cadence}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  {plan.features.map((f) => (
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
                <Button
                  asChild
                  size="lg"
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                >
                  <Link href="#book">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* SCHEDULE STRIP */}
      <section className="bg-card/40 border-y border-border/60">
        <div className="container mx-auto grid gap-8 px-4 sm:px-6 sm:gap-10 lg:px-8 py-14 sm:py-16 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ImagePlaceholder
              label="Studio interior"
              ratio="square"
              src="/elek3.JPG"
            />
          </div>
          <div className="lg:col-span-2 space-y-5">
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
              When you can train.
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4">
                <Clock className="size-5 text-primary" />
                <div>
                  <p className="font-medium">Weekdays</p>
                  <p className="text-sm text-muted-foreground">
                    6:00am – 8:00pm
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4">
                <Clock className="size-5 text-primary" />
                <div>
                  <p className="font-medium">Saturday</p>
                  <p className="text-sm text-muted-foreground">
                    7:00am – 1:00pm
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Don&apos;t see a time that works? Reach out in the booking form
              and we&apos;ll find one.
            </p>
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section
        id="book"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 scroll-mt-20"
      >
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/40 text-primary">
              Book a session
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to commit?
            </h2>
            <p className="text-muted-foreground">
              If you know exactly what you need, you can skip the consultation
              and request your first session right here.
            </p>
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
