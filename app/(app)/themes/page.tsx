"use client"

import { useState } from "react"
import { mockThemes } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Plus, Check, Palette, Copy, Pencil, Trash2,
  Eye, Download, ChevronRight, Sparkles
} from "lucide-react"

export default function ThemesPage() {
  const [selectedTheme, setSelectedTheme] = useState(mockThemes[0].id)
  const [editingTheme, setEditingTheme] = useState(mockThemes[0])

  const activeTheme = mockThemes.find(t => t.id === selectedTheme) ?? mockThemes[0]

  const swatchRow = (colors: string[]) => (
    <div className="flex gap-1">
      {colors.map((c, i) => (
        <div key={i} className="w-5 h-5 rounded-full border border-black/10" style={{ background: c }} />
      ))}
    </div>
  )

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Theme List */}
      <div className="w-72 shrink-0 border-r border-border/40 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-semibold">Themes</h2>
            <p className="text-xs text-foreground/40 mt-0.5">{mockThemes.length} available</p>
          </div>
          <Button size="sm" className="h-7 text-xs gap-1">
            <Plus className="w-3.5 h-3.5" /> New
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {mockThemes.map(theme => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                selectedTheme === theme.id
                  ? "bg-white/5 border-r-2 border-primary"
                  : "hover:bg-white/5 border-r-2 border-transparent"
              )}
            >
              {/* Color preview */}
              <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden border border-border/30"
                style={{ background: theme.colors[0] }}>
                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-lg" style={{ background: theme.colors[1] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{theme.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {swatchRow(theme.colors.slice(0, 4))}
                </div>
              </div>
              {theme.isActive && (
                <Badge className="text-xs px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shrink-0">
                  Active
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Bottom tip */}
        <div className="p-4 border-t border-border/40 shrink-0">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/40 leading-relaxed">
              Generate a matching theme from your brand URL using AI.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Theme Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-border/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-border/40 overflow-hidden" style={{ background: activeTheme.colors[0] }}>
              <div className="w-full h-1/2" style={{ background: activeTheme.colors[1] }} />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{activeTheme.name}</h1>
              <p className="text-xs text-foreground/40">{activeTheme.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-foreground/50">
              <Eye className="w-3.5 h-3.5" /> Preview
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-foreground/50">
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-foreground/50">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
            <Separator orientation="vertical" className="h-5 bg-border/40" />
            <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 gap-1.5">
              <Check className="w-3.5 h-3.5" /> Apply Theme
            </Button>
          </div>
        </div>

        {/* Editor body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-6 grid grid-cols-2 gap-6">

            {/* Color Tokens */}
            <div className="col-span-2">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-foreground/40" />
                Color Tokens
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Primary", key: "primary", color: activeTheme.colors[0] },
                  { label: "Secondary", key: "secondary", color: activeTheme.colors[1] },
                  { label: "Accent", key: "accent", color: activeTheme.colors[2] },
                  { label: "Background", key: "bg", color: activeTheme.colors[3] ?? "#0f0f0f" },
                  { label: "Surface", key: "surface", color: "#1a1a1a" },
                  { label: "Border", key: "border", color: "#2a2a2a" },
                  { label: "Text Primary", key: "textPrimary", color: "#ffffff" },
                  { label: "Text Secondary", key: "textSecondary", color: "#888888" },
                ].map(({ label, key, color }) => (
                  <div key={key} className="group rounded-xl border border-border/40 bg-card overflow-hidden hover:border-border/60 transition-colors">
                    <div className="h-16 relative" style={{ background: color }}>
                      <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded bg-black/40 flex items-center justify-center">
                        <Pencil className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-medium">{label}</p>
                      <p className="text-xs text-foreground/40 font-mono">{color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="rounded-xl border border-border/40 bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Typography</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-foreground/50 mb-1.5 block">Heading Font</Label>
                  <Input value={activeTheme.fontHeading} className="h-8 text-sm bg-background/50 border-border/40" readOnly />
                </div>
                <div>
                  <Label className="text-xs text-foreground/50 mb-1.5 block">Body Font</Label>
                  <Input value={activeTheme.fontBody} className="h-8 text-sm bg-background/50 border-border/40" readOnly />
                </div>
                <div>
                  <Label className="text-xs text-foreground/50 mb-1.5 block">Base Font Size</Label>
                  <div className="flex items-center gap-3">
                    <Slider defaultValue={[16]} min={12} max={20} step={1} className="flex-1" />
                    <span className="text-xs text-foreground/40 w-8 text-right">16px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-foreground/50 mb-1.5 block">Line Height</Label>
                  <div className="flex items-center gap-3">
                    <Slider defaultValue={[160]} min={120} max={200} step={5} className="flex-1" />
                    <span className="text-xs text-foreground/40 w-8 text-right">1.6</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spacing & Shape */}
            <div className="rounded-xl border border-border/40 bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Spacing &amp; Shape</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-foreground/50 mb-1.5 block">Border Radius</Label>
                  <div className="flex items-center gap-3">
                    <Slider defaultValue={[8]} min={0} max={24} step={2} className="flex-1" />
                    <span className="text-xs text-foreground/40 w-8 text-right">8px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-foreground/50 mb-1.5 block">Button Radius</Label>
                  <div className="flex items-center gap-3">
                    <Slider defaultValue={[6]} min={0} max={24} step={2} className="flex-1" />
                    <span className="text-xs text-foreground/40 w-8 text-right">6px</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-foreground/50 mb-1.5 block">Spacing Scale</Label>
                  <div className="flex items-center gap-3">
                    <Slider defaultValue={[4]} min={2} max={8} step={1} className="flex-1" />
                    <span className="text-xs text-foreground/40 w-8 text-right">4px</span>
                  </div>
                </div>

                <Separator className="bg-border/30" />

                <div className="space-y-3">
                  {[
                    { label: "Show Shadow", desc: "Drop shadow on widget" },
                    { label: "Show Border", desc: "Outline around widget" },
                    { label: "Animate Entrance", desc: "Fade / slide in on open" },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">{label}</p>
                        <p className="text-xs text-foreground/40">{desc}</p>
                      </div>
                      <Switch defaultChecked className="scale-90" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="col-span-2 rounded-xl border border-border/40 bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Live Preview</h3>
              <div className="flex items-center justify-center py-8 bg-background/50 rounded-lg border border-border/30">
                <div className="w-80 rounded-xl overflow-hidden shadow-2xl border border-border/30"
                  style={{ background: activeTheme.colors[3] ?? "#0f0f0f" }}>
                  <div className="h-1.5 w-full" style={{ background: activeTheme.colors[0] }} />
                  <div className="p-5">
                    <h4 className="text-base font-semibold mb-1" style={{ fontFamily: activeTheme.fontHeading }}>
                      Get in Touch
                    </h4>
                    <p className="text-sm text-foreground/50 mb-4" style={{ fontFamily: activeTheme.fontBody }}>
                      We&apos;d love to hear from you. Fill out the form below.
                    </p>
                    <div className="space-y-2.5 mb-4">
                      <div className="h-9 rounded-lg border border-border/40 bg-background/50 px-3 flex items-center">
                        <span className="text-xs text-foreground/30">Your email address</span>
                      </div>
                      <div className="h-9 rounded-lg border border-border/40 bg-background/50 px-3 flex items-center">
                        <span className="text-xs text-foreground/30">Your message</span>
                      </div>
                    </div>
                    <button
                      className="w-full h-9 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                      style={{ background: activeTheme.colors[0] }}
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
