import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Sparkles,
  Users,
  Globe,
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
    name: "Drop-in Session",
    price: "$90",
    cadence: "per session",
    icon: Users,
    description: "Pay-as-you-go 1-on-1 training at the studio.",
    features: [
      "60-minute session",
      "Personalized warm-up & lift",
      "Form coaching on every set",
      "Take-home workout notes",
    ],
    cta: "Book a session",
    highlight: false,
  },
  {
    name: "Coaching Membership",
    price: "$320",
    cadence: "per month",
    icon: Sparkles,
    description: "Most popular — 1-on-1 sessions plus full programming.",
    features: [
      "4 in-person sessions / month",
      "Custom weekly programming",
      "Nutrition framework & check-ins",
      "Unlimited Slack support",
    ],
    cta: "Start membership",
    highlight: true,
  },
  {
    name: "Online Coaching",
    price: "$220",
    cadence: "per month",
    icon: Globe,
    description: "Train anywhere with a fully customized program.",
    features: [
      "Weekly programming in TrainHeroic",
      "Video form reviews (48h turnaround)",
      "Bi-weekly video check-ins",
      "Nutrition guidance",
    ],
    cta: "Apply for online",
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
        <div className="container mx-auto relative px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="max-w-3xl space-y-5">
            <Badge variant="outline" className="border-primary/40 text-primary">
              Coaching & Booking
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Pick the plan.{" "}
              <span className="text-gradient-red">Show up.</span> Get strong.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Every package is personal. Choose the format that fits your life
              and book your first session in under a minute.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="#book">
                  <CalendarIcon className="mr-2 size-4" />
                  Jump to booking
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#plans">Compare plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section
        id="plans"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24"
      >
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Coaching plans
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Find the format that fits your week.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map(({ icon: Icon, ...plan }) => (
            <Card
              key={plan.name}
              className={
                plan.highlight
                  ? "relative border-primary/60 bg-card shadow-lg shadow-primary/20"
                  : "relative border-border/60 bg-card/60"
              }
            >
              {plan.highlight && (
                <Badge className="absolute -top-3 left-6">Most popular</Badge>
              )}
              <CardHeader>
                <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.cadence}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
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
        <div className="container mx-auto grid gap-10 px-4 sm:px-6 lg:px-8 py-16 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ImagePlaceholder label="Studio interior" ratio="square" />
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
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 scroll-mt-20"
      >
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/40 text-primary">
              Book a session
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Request your session.
            </h2>
            <p className="text-muted-foreground">
              Fill in the form and you&apos;ll receive a confirmation email
              within 24 hours. New clients always start with a free intro call
              so we can make sure it&apos;s the right fit.
            </p>
            <Separator />
            <ul className="space-y-3 text-sm">
              {[
                "Free intro call to align on goals",
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
