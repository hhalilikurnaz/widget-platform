"use client"

import { useState } from "react"
import { LeftPanel } from "@/components/builder/left-panel"
import { CenterPanel } from "@/components/builder/center-panel"
import { RightPanel } from "@/components/builder/right-panel"
import { BuilderProvider } from "@/lib/builder-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Undo2, Redo2, Eye, Share2, Zap, ChevronDown,
  History, Keyboard, ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function BuilderPage() {
  const [saved, setSaved] = useState(true)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(true), 2000)
  }

  return (
    <BuilderProvider>
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Builder Topbar */}
      <header className="h-12 flex items-center gap-2 px-3 border-b border-border/40 bg-sidebar shrink-0">
        {/* Left */}
        <div className="flex items-center gap-2 w-[240px] shrink-0">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-foreground/40 hover:text-foreground">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4 bg-border/40" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium truncate max-w-[140px]">Contact Form Pro</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-1.5 py-0 h-5 border transition-colors",
              saved
                ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                : "border-amber-500/30 text-amber-400 bg-amber-500/5"
            )}
          >
            {saved ? "Saved" : "Unsaved"}
          </Badge>
        </div>

        {/* Center tools */}
        <div className="flex-1 flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-foreground/40 hover:text-foreground">
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-foreground/40 hover:text-foreground">
            <Redo2 className="w-3.5 h-3.5" />
          </Button>
          <Separator orientation="vertical" className="h-4 bg-border/40 mx-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7 text-foreground/40 hover:text-foreground">
            <History className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-foreground/40 hover:text-foreground">
            <Keyboard className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 w-[240px] justify-end shrink-0">
          <Button variant="ghost" size="sm" className="h-7 text-xs text-foreground/50 hover:text-foreground gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Preview
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-foreground/50 hover:text-foreground gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
          <Separator orientation="vertical" className="h-4 bg-border/40" />
          <Button
            size="sm"
            className="h-7 text-xs bg-primary hover:bg-primary/90 gap-1"
          >
            Publish
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </header>

      {/* Builder Canvas — 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — 260px */}
        <div className="w-[260px] shrink-0 border-r border-border/40 overflow-hidden">
          <LeftPanel />
        </div>

        {/* Center canvas — flex */}
        <div className="flex-1 overflow-hidden">
          <CenterPanel />
        </div>

        {/* Right panel — 260px */}
        <div className="w-[260px] shrink-0 border-l border-border/40 overflow-hidden">
          <RightPanel />
        </div>
      </div>
    </div>
    </BuilderProvider>
  )
}
