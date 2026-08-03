"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Zap, Code2, Copy, CheckCircle, Monitor, Smartphone,
  Tablet, RefreshCw, ArrowRight, ExternalLink
} from "lucide-react"
import Link from "next/link"

const WIDGET_DEMOS = [
  { id: "contact", label: "Contact Form", color: "from-blue-500 to-cyan-500" },
  { id: "survey", label: "NPS Survey", color: "from-purple-500 to-pink-500" },
  { id: "popup", label: "Exit Popup", color: "from-rose-500 to-orange-500" },
  { id: "feedback", label: "Feedback Bar", color: "from-emerald-500 to-teal-500" },
]

const EMBED_CODE = `<!-- WidgetPlatform Embed -->
<script async src="https://cdn.widgetplatform.io/v2/loader.js"
  data-widget-id="wgt_contact_pro_demo"
  data-theme="dark"
  data-position="bottom-right">
</script>`

export default function PlaygroundPage() {
  const [activeDemo, setActiveDemo] = useState("contact")
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const deviceWidths: Record<string, string> = {
    desktop: "w-full max-w-lg",
    tablet: "w-96",
    mobile: "w-72",
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Nav */}
      <header className="h-14 flex items-center justify-between px-8 border-b border-border/40 bg-sidebar">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold">WidgetPlatform</span>
          <Badge variant="outline" className="text-xs px-1.5 border-border/40 text-foreground/40 ml-1">Playground</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-foreground/50 hover:text-foreground">
              Open Dashboard
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 gap-1.5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-8 pt-16 pb-10 text-center">
        <Badge className="mb-4 bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs">Interactive Demo</Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-balance">
          Build widgets that actually convert
        </h1>
        <p className="text-base text-foreground/50 max-w-xl mx-auto leading-relaxed mb-8">
          Try a live demo of our form widgets. Switch between types, preview on different devices, and grab the embed snippet.
        </p>

        {/* Widget Type Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {WIDGET_DEMOS.map(demo => (
            <button
              key={demo.id}
              onClick={() => { setActiveDemo(demo.id); setSubmitted(false) }}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                activeDemo === demo.id
                  ? `bg-gradient-to-r ${demo.color} text-white shadow-lg`
                  : "bg-white/5 text-foreground/50 hover:text-foreground hover:bg-white/8 border border-border/30"
              )}
            >
              {demo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Demo Area */}
      <div className="max-w-5xl mx-auto px-8 pb-16 grid grid-cols-5 gap-6">
        {/* Preview */}
        <div className="col-span-3 rounded-2xl border border-border/40 bg-card overflow-hidden">
          {/* Preview header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/30">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
            </div>
            <div className="flex items-center gap-1">
              {(["desktop", "tablet", "mobile"] as const).map((d, i) => {
                const Icon = [Monitor, Tablet, Smartphone][i]
                return (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={cn(
                      "w-7 h-7 rounded flex items-center justify-center transition-colors",
                      device === d ? "bg-white/10 text-foreground" : "text-foreground/30 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                )
              })}
              <Separator orientation="vertical" className="h-4 bg-border/40 mx-1" />
              <button
                onClick={() => setSubmitted(false)}
                className="w-7 h-7 rounded flex items-center justify-center text-foreground/30 hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex items-center justify-center p-8 min-h-[400px] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_60%)]">
            <div className={cn("transition-all duration-300", deviceWidths[device])}>
              {activeDemo === "contact" && (
                <div className="rounded-2xl border border-border/40 bg-[#111] shadow-2xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <div className="p-6">
                    {submitted ? (
                      <div className="py-6 text-center">
                        <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                        <h3 className="text-base font-semibold mb-1">Message sent!</h3>
                        <p className="text-sm text-foreground/40">We&apos;ll get back to you within 24 hours.</p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-base font-semibold mb-1">Get in Touch</h3>
                        <p className="text-xs text-foreground/40 mb-4">Fill out the form and we&apos;ll get back to you shortly.</p>
                        <div className="space-y-3 mb-4">
                          <Input placeholder="Your name" className="h-9 text-sm bg-background/50 border-border/40" />
                          <Input placeholder="Email address" className="h-9 text-sm bg-background/50 border-border/40" />
                          <Textarea placeholder="Your message..." rows={3} className="text-sm bg-background/50 border-border/40 resize-none" />
                        </div>
                        <Button
                          className="w-full h-9 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
                          onClick={() => setSubmitted(true)}
                        >
                          Send Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeDemo === "survey" && (
                <div className="rounded-2xl border border-border/40 bg-[#111] shadow-2xl p-6">
                  <div className="text-center mb-5">
                    <p className="text-xs text-foreground/40 mb-1">How likely are you to recommend us?</p>
                    <h3 className="text-base font-semibold">Rate your experience</h3>
                  </div>
                  <div className="flex justify-between gap-1.5 mb-5">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        className={cn(
                          "flex-1 aspect-square rounded-lg text-xs font-medium border transition-colors",
                          n >= 9
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            : n >= 7
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                              : "border-border/30 text-foreground/40 hover:border-border/50"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-foreground/30 mb-5">
                    <span>Not likely</span>
                    <span>Very likely</span>
                  </div>
                  <Button className="w-full h-9 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90" onClick={() => setSubmitted(true)}>
                    {submitted ? "Thanks for your feedback!" : "Submit Score"}
                  </Button>
                </div>
              )}

              {activeDemo === "popup" && (
                <div className="rounded-2xl border border-rose-500/20 bg-[#111] shadow-2xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-rose-500 to-orange-500" />
                  <div className="p-6 text-center">
                    <div className="text-3xl mb-3">⏰</div>
                    <h3 className="text-base font-semibold mb-1">Wait! Don&apos;t leave yet.</h3>
                    <p className="text-xs text-foreground/40 mb-5 leading-relaxed">Get 20% off your first month. Offer expires in 10 minutes.</p>
                    <Input placeholder="Enter your email" className="h-9 text-sm bg-background/50 border-border/40 mb-3" />
                    <Button className="w-full h-9 text-sm bg-gradient-to-r from-rose-500 to-orange-500 hover:opacity-90" onClick={() => setSubmitted(true)}>
                      {submitted ? "Claimed!" : "Claim 20% Off"}
                    </Button>
                    <button className="mt-3 text-xs text-foreground/30 hover:text-foreground/50 transition-colors">
                      No thanks, I&apos;ll pay full price
                    </button>
                  </div>
                </div>
              )}

              {activeDemo === "feedback" && (
                <div className="rounded-xl border border-emerald-500/20 bg-[#111] shadow-2xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <div className="flex items-center gap-4 p-4">
                    <p className="text-sm font-medium flex-1">How&apos;s your experience so far?</p>
                    <div className="flex gap-1.5 shrink-0">
                      {["😞", "😐", "😊", "😍"].map((emoji, i) => (
                        <button
                          key={i}
                          className="w-9 h-9 rounded-xl bg-background/50 border border-border/40 flex items-center justify-center text-lg hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code + Info */}
        <div className="col-span-2 space-y-4">
          {/* Stats */}
          <div className="rounded-2xl border border-border/40 bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Demo Stats</h3>
            <div className="space-y-2.5">
              {[
                { label: "Avg. Conversion", value: "18.4%", up: true },
                { label: "Avg. Time to Fill", value: "42s", up: false },
                { label: "Mobile Submissions", value: "61%", up: true },
              ].map(({ label, value, up }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-foreground/40">{label}</span>
                  <span className={cn("text-xs font-medium", up ? "text-emerald-400" : "text-amber-400")}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Embed */}
          <div className="rounded-2xl border border-border/40 bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Embed Code</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-foreground/40 hover:text-foreground transition-colors"
              >
                {copied
                  ? <><CheckCircle className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                  : <><Copy className="w-3 h-3" />Copy</>
                }
              </button>
            </div>
            <pre className="text-xs font-mono text-foreground/50 bg-background/50 rounded-lg p-3 overflow-x-auto leading-relaxed border border-border/30">
              {EMBED_CODE}
            </pre>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
            <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
            <h3 className="text-sm font-semibold mb-1">Ready to build your own?</h3>
            <p className="text-xs text-foreground/40 mb-4 leading-relaxed">
              Customise every pixel, connect to your stack, and publish in minutes.
            </p>
            <Link href="/dashboard">
              <Button className="w-full h-8 text-xs bg-primary hover:bg-primary/90 gap-1.5">
                Start for Free <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
