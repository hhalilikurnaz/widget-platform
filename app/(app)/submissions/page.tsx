"use client"

import { useState, useMemo } from "react"
import { submissions, widgets } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn, timeAgo } from "@/lib/utils"
import {
  Search, Download, Inbox, Mail, Clock,
  CheckCircle, Trash2, Star, Archive, SlidersHorizontal,
  Monitor, Smartphone, Tablet, Globe,
} from "lucide-react"
import type { Submission } from "@/lib/mock-data"

const statusStyles: Record<string, string> = {
  new:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  read:     "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  starred:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  archived: "bg-zinc-500/10 text-zinc-500 border-zinc-500/10",
}

const deviceIcon = (device: string) => {
  if (device === "mobile") return <Smartphone className="w-3 h-3" />
  if (device === "tablet") return <Tablet className="w-3 h-3" />
  return <Monitor className="w-3 h-3" />
}

export default function SubmissionsPage() {
  const [search, setSearch] = useState("")
  const [widgetFilter, setWidgetFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selected, setSelected] = useState<Submission | null>(submissions[0])

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      const matchSearch = !search ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase())
      const matchWidget = widgetFilter === "all" || s.widgetId === widgetFilter
      const matchStatus = statusFilter === "all" || s.status === statusFilter
      return matchSearch && matchWidget && matchStatus
    })
  }, [search, widgetFilter, statusFilter])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: List */}
      <div className="w-[320px] shrink-0 border-r border-border flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-border space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Submissions</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} entries</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <Download className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-7 text-xs bg-muted/20"
            />
          </div>
          <div className="flex gap-1.5">
            <Select value={widgetFilter} onValueChange={setWidgetFilter}>
              <SelectTrigger className="h-7 text-xs flex-1 bg-muted/20">
                <SelectValue placeholder="Widget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Widgets</SelectItem>
                {widgets.filter(w => w.status === "published").slice(0, 6).map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-7 text-xs w-24 bg-muted/20">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <Inbox className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No submissions found</p>
            </div>
          ) : (
            filtered.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelected(sub)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left border-b border-border/50 transition-colors",
                  selected?.id === sub.id ? "bg-muted/30" : "hover:bg-muted/20",
                  sub.status === "new" && selected?.id !== sub.id && "border-l-2 border-l-brand"
                )}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="text-xs bg-brand/10 text-brand">
                    {sub.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className={cn("text-xs font-medium truncate", sub.status === "new" && "font-semibold text-foreground")}>
                      {sub.name}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(sub.submittedAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                  <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{sub.widgetName}</p>
                </div>
                {sub.status === "starred" && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0 mt-1" />}
                {sub.status === "new" && <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Detail */}
      {selected ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Detail header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-brand/10 text-brand font-semibold text-sm">
                  {selected.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{selected.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3 h-3" />{selected.email}
                  {selected.company && <>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{selected.company}</span>
                  </>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className={cn("text-xs px-2 py-0.5 border capitalize", statusStyles[selected.status])}>
                {selected.status}
              </Badge>
              <Separator orientation="vertical" className="h-5 bg-border" />
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-amber-400">
                <Star className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <Archive className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-400">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Source info */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Source</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Widget</p>
                  <p className="text-sm font-medium truncate">{selected.widgetName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">URL</p>
                  <p className="text-sm font-medium text-brand truncate">{selected.source}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Country</p>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-muted-foreground" />
                    {selected.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Submitted data */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Submitted Fields</h3>
              <div className="space-y-3">
                {selected.message && (
                  <div className="flex gap-4">
                    <p className="text-xs text-muted-foreground w-28 shrink-0">Message</p>
                    <p className="text-sm text-foreground leading-relaxed">{selected.message}</p>
                  </div>
                )}
                {selected.score !== undefined && (
                  <div className="flex gap-4">
                    <p className="text-xs text-muted-foreground w-28 shrink-0">Score</p>
                    <p className="text-sm font-semibold text-foreground">{selected.score} / 10</p>
                  </div>
                )}
                {Object.entries(selected.data).map(([key, val]) => (
                  <div key={key} className="flex gap-4">
                    <p className="text-xs text-muted-foreground w-28 shrink-0 capitalize">{key.replace(/_/g, " ")}</p>
                    <p className="text-sm text-foreground leading-relaxed">{String(val)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Metadata</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Submission ID", value: selected.id },
                  { label: "Device", value: selected.device },
                  { label: "Submitted At", value: new Date(selected.submittedAt).toLocaleString() },
                  { label: "Widget ID", value: selected.widgetId },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-xs font-mono text-foreground/70 truncate flex items-center gap-1">
                      {label === "Device" && deviceIcon(value)}
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border shrink-0 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {filtered.indexOf(selected) + 1} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Reply
              </Button>
              <Button size="sm" className="h-7 text-xs bg-brand hover:bg-brand/90 text-white gap-1.5 border-0">
                <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Select a submission to view details</p>
          </div>
        </div>
      )}
    </div>
  )
}
