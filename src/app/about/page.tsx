import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Clock,
  ArrowRight,
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
import { ContactForm } from "@/components/contact-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About & Contact",
  description:
    "Meet your coach and get in touch. Studio location, hours, and a direct line to ask anything.",
};

const credentials = [
  {
    icon: GraduationCap,
    title: "B.S. Exercise Science",
    detail: "University of Whatever, 2014",
  },
  {
    icon: Award,
    title: "NSCA-CSCS",
    detail: "Certified Strength & Conditioning Specialist",
  },
  {
    icon: Award,
    title: "Precision Nutrition L1",
    detail: "Nutrition coaching certification",
  },
  {
    icon: Award,
    title: "FMS Level 2",
    detail: "Functional Movement Screen",
  },
];

const values = [
  {
    title: "Honest programming",
    body: "No magic, no fads. Sustainable progress built on principles that have worked for decades.",
  },
  {
    title: "Every client is different",
    body: "Your program is yours. It accounts for your history, your schedule, and your goals.",
  },
  {
    title: "Show up, every week",
    body: "Consistency over intensity. The plan only works if it fits your real life.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* HERO / BIO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-radial-primary" aria-hidden />
        <div className="container mx-auto relative px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-24">
          <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-2">
            <div className="space-y-5">
              <Badge variant="outline" className="border-primary/40 text-primary">
                About
              </Badge>
              <h1 className="text-[2.5rem] leading-[0.95] font-bold tracking-tight sm:text-5xl md:text-6xl">
                Hey, I&apos;m{" "}
                <span className="text-gradient-primary">Jonny Elek.</span>
              </h1>
              <div className="space-y-4 text-base text-muted-foreground sm:text-lg">
                <p>
                  I&apos;m a personal trainer, online coach, and competitive bodybuilder based in the Los Angeles area and the founder of Elek Athletics.
                </p>
                <p>
                  After 4 years in the Marine Corps, discipline isn&apos;t just something I talk about, it&apos;s how I live. That mindset is the foundation of everything I do as a coach. I train out of Winner&apos;s Circle in Burbank, and I work with clients both in person and online to help them build real, lasting physiques.
                </p>
                <p>
                  As a bodybuilder myself, I know what it takes to transform your body: the consistency, the attention to nutrition, and the commitment to the process. I bring all of that into my coaching, without the pressure of stage prep. My focus is on helping everyday people build a body they&apos;re proud of and develop the discipline to maintain it for life.
                </p>
                <p>
                  If you&apos;re ready to stop going through the motions and start training with real intention, you&apos;re in the right place. Let&apos;s get to work.
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/coaching/book">
                    Book a session
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="#contact">Send a message</Link>
                </Button>
              </div>
            </div>
            <ImagePlaceholder
              label="Portrait of the coach"
              ratio="portrait"
              className="shadow-2xl shadow-primary/20"
              src="/elek5.png"
              objectPosition="center 20%"
              priority
            />
          </div>
        </div>
      </section>

      {/* CREDENTIALS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-3">
          <div className="space-y-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Credentials
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Trained where it counts.
            </h2>
            <p className="text-muted-foreground">
              Continued education is a big part of the job. Here&apos;s the
              short list of the credentials behind every program.
            </p>
          </div>
          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
            {credentials.map(({ icon: Icon, title, detail }) => (
              <Card
                key={title}
                className="border-border/60 bg-card/60 transition-colors hover:border-primary/40"
              >
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>{detail}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES + IMAGE STRIP */}
      <section className="bg-card/40 border-y border-border/60">
        <div className="container mx-auto grid gap-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <ImagePlaceholder
              label="Studio detail"
              ratio="portrait"
              src="/elek1.JPG"
              objectPosition="center 20%"
            />
            <div className="space-y-3 pt-10 sm:space-y-4">
              <ImagePlaceholder
                label="Coaching cue"
                ratio="square"
                src="/elek2.JPG"
                objectPosition="center 38%"
              />
              <ImagePlaceholder
                label="Athlete training"
                ratio="square"
                src="/elek4.PNG"
                objectPosition="center 38%"
              />
            </div>
          </div>
          <div className="space-y-5">
            <Badge variant="outline" className="border-primary/40 text-primary">
              How I coach
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Three things I won&apos;t compromise on.
            </h2>
            <div className="space-y-5 pt-2">
              {values.map((v) => (
                <div key={v.title}>
                  <h3 className="text-lg font-semibold">{v.title}</h3>
                  <p className="mt-1 text-muted-foreground">{v.body}</p>
                  <Separator className="mt-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 scroll-mt-20"
      >
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6">
            <Badge variant="outline" className="border-primary/40 text-primary">
              Contact
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Got a question? Let&apos;s talk.
            </h2>
            <p className="text-muted-foreground max-w-md">
              Use the form, drop me a line, or come by the studio. I respond to
              every message within 24 hours.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/60 bg-card/60">
                <CardHeader>
                  <Mail className="size-5 text-primary" />
                  <CardTitle className="text-base">Email</CardTitle>
                  <CardDescription>
                    <a
                      className="hover:text-foreground"
                      href={`mailto:${siteConfig.contact.email}`}
                    >
                      {siteConfig.contact.email}
                    </a>
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border/60 bg-card/60">
                <CardHeader>
                  <Phone className="size-5 text-primary" />
                  <CardTitle className="text-base">Phone</CardTitle>
                  <CardDescription>
                    <a
                      className="hover:text-foreground"
                      href={`tel:${siteConfig.contact.phone.replace(/[^+\d]/g, "")}`}
                    >
                      {siteConfig.contact.phone}
                    </a>
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border/60 bg-card/60">
                <CardHeader>
                  <MapPin className="size-5 text-primary" />
                  <CardTitle className="text-base">Studio</CardTitle>
                  <CardDescription>
                    {siteConfig.contact.location}
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border/60 bg-card/60">
                <CardHeader>
                  <Clock className="size-5 text-primary" />
                  <CardTitle className="text-base">Hours</CardTitle>
                  <CardDescription>{siteConfig.contact.hours}</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="pt-2">
              <ImagePlaceholder
                label="Studio exterior"
                ratio="wide"
                src="/elek3.JPG"
              />
            </div>
          </div>

          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
              <CardDescription>
                For training questions, partnerships, or anything else.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
