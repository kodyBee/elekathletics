"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Topic = "general" | "in-person" | "custom";

interface ContactFormProps {
  topic?: Topic;
  defaultSubject?: string;
  hideSubject?: boolean;
  messagePlaceholder?: string;
}

export function ContactForm({
  topic = "general",
  defaultSubject,
  hideSubject = false,
  messagePlaceholder = "Tell me a bit about what you're looking for...",
}: ContactFormProps = {}) {
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const subject = String(data.get("subject") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: subject || defaultSubject,
          message,
          topic,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not send message.");
        return;
      }
      toast.success("Message sent!", {
        description: "Elek will get back to you within 24 hours.",
      });
      form.reset();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" name="name" placeholder="Jane Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            placeholder="you@email.com"
            required
          />
        </div>
      </div>
      {!hideSubject && (
        <div className="space-y-2">
          <Label htmlFor="contact-subject">Subject</Label>
          <Input
            id="contact-subject"
            name="subject"
            placeholder="What's this about?"
            defaultValue={defaultSubject}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder={messagePlaceholder}
          required
        />
      </div>
      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 size-4" /> Send message
          </>
        )}
      </Button>
    </form>
  );
}
