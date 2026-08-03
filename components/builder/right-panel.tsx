"use client"

import { useBuilder } from "@/lib/builder-store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Type, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Palette, Box,
  LayoutGrid, Info, ChevronDown
} from "lucide-react"
import { useState } from "react"

const Section = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-foreground/60 uppercase tracking-wider hover:text-foreground/80 transition-colors"
      >
        {title}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <Label className="text-xs text-foreground/50 w-20 shrink-0">{label}</Label>
    <div className="flex-1">{children}</div>
  </div>
)

export function RightPanel() {
  const { state, update } = useBuilder()
  const [fontAlign, setFontAlign] = useState("left")

  return (
    <div className="h-full flex flex-col overflow-hidden bg-sidebar">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-sm font-medium">Form Block</span>
        </div>
        <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-border/40 text-foreground/40">Selected</Badge>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Content */}
        <Section title="Content">
          <div className="space-y-2">
            <Label className="text-xs text-foreground/50">Title</Label>
            <Input
              value={state.title}
              onChange={e => update({ title: e.target.value })}
              className="h-8 text-sm bg-background/50 border-border/40"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-foreground/50">Subtitle</Label>
            <Textarea
              value={state.subtitle}
              onChange={e => update({ subtitle: e.target.value })}
              className="text-sm bg-background/50 border-border/40 resize-none"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-foreground/50">Button Label</Label>
            <Input
              value={state.buttonText}
              onChange={e => update({ buttonText: e.target.value })}
              className="h-8 text-sm bg-background/50 border-border/40"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-foreground/50">Success Message</Label>
            <Input
              value={state.successMessage}
              onChange={e => update({ successMessage: e.target.value })}
              className="h-8 text-sm bg-background/50 border-border/40"
            />
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <Row label="Border R.">
            <div className="flex items-center gap-2">
              <Slider
                value={[state.borderRadius]}
                onValueChange={([v]) => update({ borderRadius: v })}
                min={0} max={24} step={1}
                className="flex-1"
              />
              <span className="text-xs text-foreground/50 w-6 text-right">{state.borderRadius}</span>
            </div>
          </Row>
          <Row label="Align">
            <div className="flex gap-1">
              {[
                { val: "left", icon: AlignLeft },
                { val: "center", icon: AlignCenter },
                { val: "right", icon: AlignRight },
              ].map(({ val, icon: Icon }) => (
                <button
                  key={val}
                  onClick={() => setFontAlign(val)}
                  className={cn(
                    "flex-1 h-7 rounded flex items-center justify-center transition-colors",
                    fontAlign === val
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-background/50 border border-border/30 text-foreground/40 hover:text-foreground/60"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </Row>
          <Row label="Style">
            <div className="flex gap-1">
              {[
                { val: "bold", icon: Bold },
                { val: "italic", icon: Italic },
                { val: "underline", icon: Underline },
              ].map(({ val, icon: Icon }) => (
                <button key={val} className="flex-1 h-7 rounded bg-background/50 border border-border/30 text-foreground/40 hover:text-foreground/60 flex items-center justify-center transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* Colors */}
        <Section title="Colors">
          <Row label="Primary">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border border-border/40 shrink-0" style={{ background: state.primaryColor }} />
              <Input
                value={state.primaryColor}
                onChange={e => update({ primaryColor: e.target.value })}
                className="h-7 text-xs bg-background/50 border-border/40 font-mono"
              />
            </div>
          </Row>
          <Row label="Background">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border border-border/40 shrink-0" style={{ background: state.bgColor }} />
              <Input
                value={state.bgColor}
                onChange={e => update({ bgColor: e.target.value })}
                className="h-7 text-xs bg-background/50 border-border/40 font-mono"
              />
            </div>
          </Row>
          <Row label="Text">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border border-border/40 shrink-0" style={{ background: state.textColor }} />
              <Input
                value={state.textColor}
                onChange={e => update({ textColor: e.target.value })}
                className="h-7 text-xs bg-background/50 border-border/40 font-mono"
              />
            </div>
          </Row>
        </Section>

        {/* Layout */}
        <Section title="Layout">
          <Row label="Position">
            <Select value={state.position} onValueChange={v => update({ position: v as any })}>
              <SelectTrigger className="h-7 text-xs bg-background/50 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="fullscreen">Fullscreen</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Radius">
            <div className="flex items-center gap-2">
              <Slider
                value={[state.borderRadius]}
                onValueChange={([v]) => update({ borderRadius: v })}
                min={0} max={24} step={2}
                className="flex-1"
              />
              <span className="text-xs text-foreground/50 w-7 text-right">{state.borderRadius}px</span>
            </div>
          </Row>
          <Row label="Font">
            <Select value={state.fontFamily} onValueChange={v => update({ fontFamily: v })}>
              <SelectTrigger className="h-7 text-xs bg-background/50 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Inter', 'Geist', 'DM Sans', 'Sora', 'Roboto', 'Poppins'].map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
        </Section>

        {/* Behavior */}
        <Section title="Behavior">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">Show Overlay</p>
                <p className="text-xs text-foreground/40 mt-0.5">Dim background behind widget</p>
              </div>
              <Switch
                checked={state.showOverlay}
                onCheckedChange={v => update({ showOverlay: v })}
                className="scale-90"
              />
            </div>
            <Separator className="bg-border/30" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">Close on Overlay Click</p>
                <p className="text-xs text-foreground/40 mt-0.5">Allow closing by clicking outside</p>
              </div>
              <Switch
                checked={state.closeOnOverlay}
                onCheckedChange={v => update({ closeOnOverlay: v })}
                className="scale-90"
              />
            </div>
            <Separator className="bg-border/30" />
            <div>
              <Label className="text-xs text-foreground/50 mb-1.5 block">Trigger Delay: {state.triggerDelay}s</Label>
              <Slider
                value={[state.triggerDelay]}
                onValueChange={([v]) => update({ triggerDelay: v })}
                min={0} max={30} step={1}
              />
            </div>
          </div>
        </Section>

        {/* Advanced */}
        <Section title="Advanced" defaultOpen={false}>
          <div className="space-y-2">
            <Label className="text-xs text-foreground/50">Custom CSS Class</Label>
            <Input className="h-7 text-xs bg-background/50 border-border/40 font-mono" placeholder="my-widget" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-foreground/50">Z-Index</Label>
            <Input className="h-7 text-xs bg-background/50 border-border/40 font-mono" defaultValue="9999" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Debug Mode</p>
              <p className="text-xs text-foreground/40">Show widget boundaries</p>
            </div>
            <Switch className="scale-90" />
          </div>
        </Section>

        {/* Actions */}
        <div className="p-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/50 leading-relaxed">
              Changes are saved automatically and reflected in the live preview instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-3 border-t border-border/40 shrink-0 space-y-2">
        <Button className="w-full h-8 text-xs bg-primary hover:bg-primary/90">
          Publish Changes
        </Button>
        <Button variant="ghost" className="w-full h-7 text-xs text-foreground/50 hover:text-foreground">
          Save as Draft
        </Button>
      </div>
    </div>
  )
}
