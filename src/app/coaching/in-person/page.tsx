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
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "In-Person Training — Contact",
  description:
    "Reach out to arrange in-person training sessions with Elek. We'll match your schedule, location, and goals.",
};

export default function InPersonPage() {
  return (
    <>
      {/* BACK LINK */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Link href="/coaching">
            <ArrowLeft className="size-4" />
            Back to coaching
          </Link>
        </Button>
      </div>

      {/* CONTACT SECTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/40 text-primary">
              In-Person Training
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Let&apos;s train in the same room.
            </h1>
            <p className="text-muted-foreground">
              Send a quick note about your goals, schedule, and where you&apos;re
              located. I&apos;ll get back to you within 24 hours to lock in
              details and pricing for in-person sessions.
            </p>
            <Separator />
            <ul className="space-y-3 text-sm">
              {[
                "1-on-1 coaching, in person with Elek",
                "Real-time form coaching and cueing",
                "Flexible scheduling around your week",
                "Pricing and packages tailored to your plan",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <ImagePlaceholder
                label="In-person training"
                ratio="video"
                src="/elek3.JPG"
              />
            </div>
          </div>

          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle>Reach out</CardTitle>
              <CardDescription>
                Quick form — I&apos;ll reply by email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm
                topic="in-person"
                defaultSubject="In-Person Training Inquiry"
                hideSubject
                messagePlaceholder="Goals, preferred days/times, and where you'd like to train..."
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
