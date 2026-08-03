"use client"

import { useState } from "react"
import { templates, templateCategories } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search, Star, Zap, ArrowRight, Users, TrendingUp, CheckCircle, Eye, Lock } from "lucide-react"
import Link from "next/link"

const SORT_OPTIONS = ["Most Popular", "Newest", "Top Rated"]

const ACCENT_COLORS: Record<string, string> = {
  "Lead Generation": "#3b82f6",
  "Surveys":         "#8b5cf6",
  "Onboarding":      "#10b981",
  "Popups":          "#f43f5e",
  "Marketing":       "#f59e0b",
  "Support":         "#06b6d4",
  "Feedback":        "#6366f1",
  "Booking":         "#14b8a6",
  "HR":              "#ec4899",
  "Events":          "#f97316",
}

export default function TemplatesPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [sort, setSort] = useState("Most Popular")
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const sorted = [...templates].sort((a, b) => {
    if (sort === "Most Popular") return b.usageCount - a.usageCount
    if (sort === "Top Rated") return b.usageCount - a.usageCount
    return 0
  })

  const filtered = sorted.filter(t => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === "All" || t.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Template Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Start with a professionally designed template and customise it in minutes.
          </p>
        </div>
        <Button variant="outline" className="h-8 text-xs gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Submit a Template
        </Button>
      </div>

      {/* Featured Banner */}
      <div className="relative rounded-xl overflow-hidden border border-brand/20 bg-brand/5 p-5 flex items-center gap-6">
        <div className="flex-1">
          <Badge className="mb-2 bg-brand/20 text-brand border-brand/30 text-xs">Featured</Badge>
          <h3 className="text-base font-semibold mb-1">SaaS Onboarding Kit</h3>
          <p className="text-sm text-muted-foreground mb-3 max-w-lg">
            A complete set of onboarding widgets — welcome screens, feature tours, NPS collectors — ready to drop in.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />12.4K uses</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />4.9</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" />Verified</span>
          </div>
        </div>
        <Link href="/builder">
          <Button className="shrink-0 bg-brand hover:bg-brand/90 text-white gap-2 border-0">
            Use Template <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Filters toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative min-w-48 flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/30"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {templateCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 h-8 rounded-lg text-xs font-medium transition-all",
                category === cat
                  ? "bg-brand text-white"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 bg-muted/30 rounded-lg p-1 border border-border">
          {SORT_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                "px-2.5 py-1 rounded text-xs transition-colors",
                sort === s
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">{filtered.length} templates</p>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(template => {
          const accent = ACCENT_COLORS[template.category] ?? "#3b82f6"
          return (
            <div
              key={template.id}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-border/80 hover:shadow-lg hover:shadow-black/20"
            >
              {/* Preview */}
              <div className="relative h-36 bg-muted/20 border-b border-border flex items-center justify-center overflow-hidden">
                <div className="w-2/3 rounded-lg border border-border bg-surface p-3 shadow-lg">
                  <div className="h-2 w-16 rounded bg-foreground/20 mb-2" />
                  <div className="h-1.5 w-full rounded bg-foreground/10 mb-1" />
                  <div className="h-1.5 w-4/5 rounded bg-foreground/10 mb-3" />
                  <div
                    className="h-6 rounded text-[10px] flex items-center justify-center font-semibold text-white"
                    style={{ background: accent }}
                  >
                    Get Started
                  </div>
                </div>

                {/* Hover overlay */}
                <div className={cn(
                  "absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity",
                  hoveredId === template.id ? "opacity-100" : "opacity-0"
                )}>
                  <Link href="/builder">
                    <Button size="sm" className="h-7 text-xs bg-white text-black hover:bg-white/90">
                      Use Template
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-white/30 text-white hover:bg-white/10 px-2">
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>

                {template.isPremium && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                    <Lock className="w-2.5 h-2.5" /> Pro
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-medium leading-tight">{template.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span
                    className="px-1.5 py-0.5 rounded font-medium"
                    style={{ background: `${accent}20`, color: accent }}
                  >
                    {template.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {template.usageCount.toLocaleString()} uses
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
