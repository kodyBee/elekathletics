"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link2, UserPlus, Copy, Loader2, Check, Inbox, Mail, Trash2, RotateCcw } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  topic: "general" | "in-person" | "custom";
  status: "new" | "resolved";
  createdAt: string;
}

const TOPIC_LABEL: Record<Inquiry["topic"], string> = {
  general: "General",
  "in-person": "In-Person",
  custom: "Custom Plan",
};

export default function CoachDashboard() {
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("recurring");
  const [paymentLink, setPaymentLink] = useState("");
  const [loadingLink, setLoadingLink] = useState(false);
  const [copied, setCopied] = useState(false);

  const [tClientName, setTClientName] = useState("");
  const [tEmail, setTEmail] = useState("");
  const [tPhone, setTPhone] = useState("");
  const [loadingTrainerize, setLoadingTrainerize] = useState(false);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [inquiryFilter, setInquiryFilter] = useState<"new" | "all">("new");
  const [busyInquiryId, setBusyInquiryId] = useState<string | null>(null);

  const loadInquiries = useCallback(async () => {
    setLoadingInquiries(true);
    try {
      const res = await fetch("/api/inquiries", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setInquiries(data.inquiries ?? []);
      } else {
        toast.error(data.error || "Could not load inquiries");
      }
    } catch {
      toast.error("Network error loading inquiries");
    } finally {
      setLoadingInquiries(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const updateInquiry = async (id: string, status: Inquiry["status"]) => {
    setBusyInquiryId(id);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? data.inquiry : i))
        );
        toast.success(status === "resolved" ? "Marked as resolved" : "Reopened");
      } else {
        toast.error(data.error || "Could not update");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBusyInquiryId(null);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Delete this inquiry? This can't be undone.")) return;
    setBusyInquiryId(id);
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
        toast.success("Inquiry deleted");
      } else {
        toast.error(data.error || "Could not delete");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBusyInquiryId(null);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLink(true);
    setPaymentLink("");
    
    try {
      const res = await fetch("/api/coach/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, description, price, billingCycle }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.url) {
        setPaymentLink(data.url);
        toast.success("Payment link generated!");
      } else {
        toast.error(data.error || "Failed to create link");
      }
    } catch {
      toast.error("Network error");
    }
    setLoadingLink(false);
  };

  const handleCopyLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddTrainerize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingTrainerize(true);
    
    try {
      const res = await fetch("/api/coach/add-trainerize-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tClientName, email: tEmail, phone: tPhone }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Client added to Trainerize!");
        setTClientName("");
        setTEmail("");
        setTPhone("");
      } else {
        toast.error(data.error || "Failed to add client");
      }
    } catch {
      toast.error("Network error");
    }
    setLoadingTrainerize(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coach Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage custom subscriptions and client onboarding.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Custom Subscription Generator */}
        <Card className="border-primary/20 shadow-sm bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="text-primary size-5" />
              <CardTitle>Build Custom Subscription</CardTitle>
            </div>
            <CardDescription>Generate a unique Stripe payment link on the fly.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input id="clientName" value={clientName} onChange={e => setClientName(e.target.value)} required placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Plan Description</Label>
                <Input id="description" value={description} onChange={e => setDescription(e.target.value)} required placeholder="e.g. Custom Hybrid Coaching" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" step="0.01" min="1" value={price} onChange={e => setPrice(e.target.value)} required placeholder="350" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select value={billingCycle} onValueChange={setBillingCycle}>
                    <SelectTrigger id="billingCycle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recurring">Monthly Recurring</SelectItem>
                      <SelectItem value="one-time">One-Time Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loadingLink}>
                {loadingLink ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Generate Payment Link
              </Button>
            </form>

            {paymentLink && (
              <div className="mt-6 p-4 rounded-lg bg-background/50 border border-border/60">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Payment Link Ready</Label>
                <div className="flex gap-2">
                  <Input readOnly value={paymentLink} className="bg-background font-mono text-xs" />
                  <Button variant="secondary" size="icon" onClick={handleCopyLink} title="Copy Link" className="shrink-0">
                    {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add to Trainerize */}
        <Card className="border-border/60 shadow-sm bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="text-primary size-5" />
              <CardTitle>Add to Trainerize</CardTitle>
            </div>
            <CardDescription>Manually trigger Zapier to create a Trainerize client.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTrainerize} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tClientName">Client Name</Label>
                <Input id="tClientName" value={tClientName} onChange={e => setTClientName(e.target.value)} required placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tEmail">Client Email</Label>
                <Input id="tEmail" type="email" value={tEmail} onChange={e => setTEmail(e.target.value)} required placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tPhone">Phone (Optional)</Label>
                <Input id="tPhone" type="tel" value={tPhone} onChange={e => setTPhone(e.target.value)} placeholder="+1 555 555 5555" />
              </div>
              <Button type="submit" variant="outline" className="w-full mt-2" disabled={loadingTrainerize}>
                {loadingTrainerize ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Add Client
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Inquiries */}
      <Card className="border-border/60 shadow-sm bg-card/60">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <Inbox className="text-primary size-5" />
                <CardTitle>Inquiries</CardTitle>
                {inquiries.filter((i) => i.status === "new").length > 0 && (
                  <Badge variant="secondary" className="bg-primary/15 text-primary">
                    {inquiries.filter((i) => i.status === "new").length} new
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1">
                Contact-form messages from the site. Reply by email, then mark resolved.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={inquiryFilter} onValueChange={(v) => setInquiryFilter(v as "new" | "all")}>
                <SelectTrigger className="w-35">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New only</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={loadInquiries} title="Refresh" disabled={loadingInquiries}>
                {loadingInquiries ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const visible = inquiries.filter((i) =>
              inquiryFilter === "all" ? true : i.status === "new"
            );
            if (loadingInquiries && inquiries.length === 0) {
              return (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              );
            }
            if (visible.length === 0) {
              return (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  {inquiryFilter === "new"
                    ? "No new inquiries. Nice."
                    : "No inquiries yet."}
                </div>
              );
            }
            return (
              <ul className="divide-y divide-border/60">
                {visible.map((inq) => {
                  const isResolved = inq.status === "resolved";
                  const subject =
                    inq.subject || `${TOPIC_LABEL[inq.topic]} inquiry`;
                  const replyHref = `mailto:${inq.email}?subject=${encodeURIComponent(`Re: ${subject}`)}`;
                  return (
                    <li key={inq.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{inq.name}</span>
                            <span className="text-sm text-muted-foreground">&lt;{inq.email}&gt;</span>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                              {TOPIC_LABEL[inq.topic]}
                            </Badge>
                            {isResolved && (
                              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                                Resolved
                              </Badge>
                            )}
                          </div>
                          {inq.subject && (
                            <p className="mt-1 text-sm font-medium">{inq.subject}</p>
                          )}
                          <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                            {inq.message}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {new Date(inq.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <Button asChild size="sm" variant="outline">
                            <a href={replyHref}>
                              <Mail className="mr-1.5 size-3.5" />
                              Reply
                            </a>
                          </Button>
                          {isResolved ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateInquiry(inq.id, "new")}
                              disabled={busyInquiryId === inq.id}
                            >
                              Reopen
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => updateInquiry(inq.id, "resolved")}
                              disabled={busyInquiryId === inq.id}
                            >
                              {busyInquiryId === inq.id ? (
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                              ) : (
                                <Check className="mr-1.5 size-3.5" />
                              )}
                              Mark resolved
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteInquiry(inq.id)}
                            disabled={busyInquiryId === inq.id}
                            title="Delete"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
