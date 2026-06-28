"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link2, UserPlus, Copy, Loader2, Check } from "lucide-react";

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
    </div>
  );
}
