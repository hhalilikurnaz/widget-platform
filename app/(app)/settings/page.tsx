"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  User, Building, CreditCard, Bell, Shield, Code2, Webhook,
  Globe, Palette, Key, AlertTriangle, CheckCircle, ExternalLink,
  Copy, RefreshCw, Trash2, Plus, ChevronRight
} from "lucide-react"

const NAV = [
  { id: "profile", label: "Profile", icon: User },
  { id: "workspace", label: "Workspace", icon: Building },
  { id: "billing", label: "Billing & Plan", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "api", label: "API & Webhooks", icon: Code2 },
  { id: "integrations", label: "Integrations", icon: Globe },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
]

const PLANS = [
  { id: "starter", label: "Starter", price: "$0", features: ["5 widgets", "1K submissions/mo", "Basic analytics"] },
  { id: "pro", label: "Pro", price: "$29", features: ["Unlimited widgets", "50K submissions/mo", "Advanced analytics", "Custom domains", "Remove branding"] },
  { id: "enterprise", label: "Enterprise", price: "$99", features: ["Everything in Pro", "SSO", "SLAs", "Dedicated support", "Audit logs"] },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile")
  const [currentPlan] = useState("pro")
  const [apiKey] = useState("sk_live_wPxQr7...4xKm")
  const [copied, setCopied] = useState(false)

  const copyKey = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar Nav */}
      <div className="w-56 shrink-0 border-r border-border/40 flex flex-col py-4 overflow-y-auto">
        <div className="px-4 mb-3">
          <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Settings</p>
        </div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 mx-2 rounded-lg text-sm transition-colors",
              activeSection === id
                ? "bg-white/8 text-foreground"
                : "text-foreground/50 hover:text-foreground hover:bg-white/5",
              id === "danger" && "text-red-400/70 hover:text-red-400 hover:bg-red-500/5"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
            {id === "billing" && <Badge className="ml-auto text-xs px-1.5 h-4 bg-blue-500/20 text-blue-300 border-blue-500/20">Pro</Badge>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl">

          {activeSection === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Profile</h2>
                <p className="text-sm text-foreground/40 mt-0.5">Manage your personal account information.</p>
              </div>
              <div className="flex items-center gap-5 p-5 rounded-xl border border-border/40 bg-card">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-blue-300 font-bold">
                    AK
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Alex Kim</p>
                  <p className="text-xs text-foreground/40 mb-2">alex@acme.io</p>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-border/40">Change Avatar</Button>
                </div>
              </div>
              <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-foreground/50 mb-1.5 block">First Name</Label>
                    <Input defaultValue="Alex" className="h-8 text-sm bg-background/50 border-border/40" />
                  </div>
                  <div>
                    <Label className="text-xs text-foreground/50 mb-1.5 block">Last Name</Label>
                    <Input defaultValue="Kim" className="h-8 text-sm bg-background/50 border-border/40" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-foreground/50 mb-1.5 block">Email Address</Label>
                  <Input defaultValue="alex@acme.io" className="h-8 text-sm bg-background/50 border-border/40" />
                </div>
                <div>
                  <Label className="text-xs text-foreground/50 mb-1.5 block">Timezone</Label>
                  <Select defaultValue="utc-8">
                    <SelectTrigger className="h-8 text-sm bg-background/50 border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="utc+0">UTC</SelectItem>
                      <SelectItem value="utc+1">Central European (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end pt-1">
                  <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90">Save Changes</Button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "billing" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Billing &amp; Plan</h2>
                <p className="text-sm text-foreground/40 mt-0.5">Manage your subscription and payment methods.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {PLANS.map(plan => (
                  <div
                    key={plan.id}
                    className={cn(
                      "rounded-xl border p-4 transition-colors",
                      currentPlan === plan.id
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/40 bg-card hover:border-border/60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold">{plan.label}</p>
                      {currentPlan === plan.id && (
                        <Badge className="text-xs px-1.5 h-4 bg-primary/20 text-primary border-primary/30">Current</Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold mb-3">{plan.price}<span className="text-xs text-foreground/40 font-normal">/mo</span></p>
                    <ul className="space-y-1 mb-4">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-foreground/50">
                          <CheckCircle className="w-3 h-3 text-emerald-400" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="sm"
                      variant={currentPlan === plan.id ? "outline" : "default"}
                      className={cn("w-full h-7 text-xs", currentPlan === plan.id ? "border-border/40" : "bg-primary hover:bg-primary/90")}
                      disabled={currentPlan === plan.id}
                    >
                      {currentPlan === plan.id ? "Current Plan" : "Upgrade"}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border/40 bg-card p-5">
                <h3 className="text-sm font-semibold mb-3">Payment Method</h3>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-xs text-white font-bold">VISA</div>
                    <div>
                      <p className="text-sm font-medium">Visa ending in 4242</p>
                      <p className="text-xs text-foreground/40">Expires 12/2027</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-foreground/50">Update</Button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "api" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">API &amp; Webhooks</h2>
                <p className="text-sm text-foreground/40 mt-0.5">Programmatic access to your widget data.</p>
              </div>

              <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
                <h3 className="text-sm font-semibold">API Keys</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 h-8 px-3 rounded-lg bg-background/50 border border-border/40 font-mono text-sm text-foreground/50">
                    {apiKey}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 border border-border/40" onClick={copyKey}>
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 border border-border/40 text-foreground/40 hover:text-amber-400">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-foreground/30">Keep your API key secret. Never expose it in client-side code.</p>
              </div>

              <div className="rounded-xl border border-border/40 bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Webhooks</h3>
                  <Button size="sm" className="h-7 text-xs gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Endpoint
                  </Button>
                </div>
                {[
                  { url: "https://api.acme.io/webhooks/forms", events: ["submission.created"], status: "active" },
                  { url: "https://hooks.zapier.com/catches/abc123", events: ["submission.created", "widget.published"], status: "active" },
                ].map((wh, i) => (
                  <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-foreground/70 truncate">{wh.url}</p>
                      <div className="flex gap-1 mt-1.5">
                        {wh.events.map(e => (
                          <Badge key={e} variant="outline" className="text-xs px-1.5 h-4 border-border/30 text-foreground/40">{e}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground/30 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="text-sm text-foreground/40 mt-0.5">Control how and when you hear from us.</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
                {[
                  { label: "New Submission", desc: "Notify when a widget receives a new submission", defaultValue: true },
                  { label: "Widget Published", desc: "Confirm when a widget goes live", defaultValue: true },
                  { label: "Weekly Digest", desc: "Summary of performance every Monday", defaultValue: false },
                  { label: "Conversion Alerts", desc: "Alert when conversion drops below threshold", defaultValue: true },
                  { label: "Billing Reminders", desc: "Reminders before renewal and payment failures", defaultValue: true },
                  { label: "Product Updates", desc: "New features and improvements from our team", defaultValue: false },
                ].map(({ label, desc, defaultValue }) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-foreground/40 mt-0.5">{desc}</p>
                    </div>
                    <Switch defaultChecked={defaultValue} className="shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "danger" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
                <p className="text-sm text-foreground/40 mt-0.5">Irreversible actions. Proceed with caution.</p>
              </div>
              {[
                { title: "Delete All Submissions", desc: "Permanently delete all submission data. This cannot be undone.", action: "Delete Submissions" },
                { title: "Reset All Widgets", desc: "Archive all widgets and reset analytics counters.", action: "Reset Widgets" },
                { title: "Delete Workspace", desc: "Permanently delete your workspace and all associated data.", action: "Delete Workspace" },
              ].map(({ title, desc, action }) => (
                <div key={title} className="flex items-center justify-between p-5 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div>
                    <p className="text-sm font-semibold text-red-300">{title}</p>
                    <p className="text-xs text-foreground/40 mt-0.5 max-w-xs">{desc}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 shrink-0">
                    {action}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Fallback for other sections */}
          {!["profile", "billing", "api", "notifications", "danger"].includes(activeSection) && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold capitalize">{activeSection}</h2>
                <p className="text-sm text-foreground/40 mt-0.5">This section is coming soon.</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-card p-10 flex items-center justify-center">
                <p className="text-sm text-foreground/30">Settings panel under construction.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
