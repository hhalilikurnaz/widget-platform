'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { widgets } from '@/lib/mock-data'
import type { Widget, WidgetStatus } from '@/lib/mock-data'
import { cn, formatNumber, formatPercent, statusColor, widgetTypeColor, timeAgo } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  MoreHorizontal,
  Wand2,
  Eye,
  Copy,
  Trash2,
  ExternalLink,
  Zap,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type SortField = 'name' | 'views' | 'submissions' | 'conversionRate' | 'updatedAt'
type SortDir = 'asc' | 'desc'
type ViewMode = 'table' | 'grid'

const STATUS_FILTERS: (WidgetStatus | 'all')[] = ['all', 'published', 'draft', 'paused', 'archived']

export default function WidgetsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<WidgetStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let list = [...widgets]
    if (search) list = list.filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || w.type.includes(search.toLowerCase()))
    if (statusFilter !== 'all') list = list.filter(w => w.status === statusFilter)
    list.sort((a, b) => {
      const av = a[sortField] as any
      const bv = b[sortField] as any
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [search, statusFilter, sortField, sortDir])

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/50 ml-1" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-brand ml-1" />
      : <ChevronDown className="w-3 h-3 text-brand ml-1" />
  }

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Widgets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{widgets.length} widgets across all workspaces</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/builder">
            <Button size="sm" className="h-8 gap-1.5 bg-brand hover:bg-brand/90 text-white border-0 text-xs">
              <Plus className="w-3.5 h-3.5" />
              New Widget
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search widgets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/30 border-border"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 h-8 rounded-lg text-xs font-medium transition-all capitalize',
                statusFilter === s
                  ? 'bg-brand text-white'
                  : 'bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {s === 'all' ? `All (${widgets.length})` : s}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 border border-border">
          <button
            onClick={() => setViewMode('table')}
            className={cn('w-6 h-6 flex items-center justify-center rounded transition-colors',
              viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn('w-6 h-6 flex items-center justify-center rounded transition-colors',
              viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-brand/10 border border-brand/20"
          >
            <span className="text-xs text-brand font-medium">{selected.size} selected</span>
            <div className="h-3 w-px bg-brand/30" />
            <button onClick={() => { toast.success(`${selected.size} widgets archived`); setSelected(new Set()) }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Archive</button>
            <button onClick={() => { toast.error(`${selected.size} widgets deleted`); setSelected(new Set()) }} className="text-xs text-rose-400 hover:text-rose-300 transition-colors">Delete</button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Clear</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table view */}
      {viewMode === 'table' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    onChange={e => setSelected(e.target.checked ? new Set(filtered.map(w => w.id)) : new Set())}
                    checked={selected.size === filtered.length && filtered.length > 0}
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  <button onClick={() => toggleSort('name')} className="flex items-center">Name <SortIcon field="name" /></button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  <button onClick={() => toggleSort('views')} className="flex items-center">Views <SortIcon field="views" /></button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  <button onClick={() => toggleSort('submissions')} className="flex items-center">Submissions <SortIcon field="submissions" /></button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  <button onClick={() => toggleSort('conversionRate')} className="flex items-center">CVR <SortIcon field="conversionRate" /></button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  <button onClick={() => toggleSort('updatedAt')} className="flex items-center">Updated <SortIcon field="updatedAt" /></button>
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((widget, i) => (
                <motion.tr
                  key={widget.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors group',
                    selected.has(widget.id) && 'bg-brand/5'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selected.has(widget.id)}
                      onChange={() => toggleSelect(widget.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{widget.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium capitalize', widgetTypeColor(widget.type))}>
                            {widget.type}
                          </span>
                          {widget.aiGenerated && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium text-amber-400 bg-amber-400/10 flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5" /> AI
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-1 rounded-md border font-medium capitalize', statusColor(widget.status))}>
                      {widget.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{formatNumber(widget.views)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{formatNumber(widget.submissions)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-sm text-emerald-400 font-medium">{formatPercent(widget.conversionRate)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(widget.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem render={<Link href="/builder" className="flex items-center gap-2 cursor-pointer" />} nativeButton={false}>
                          <Wand2 className="w-3.5 h-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2" onClick={() => toast.success('Widget duplicated')}>
                          <Copy className="w-3.5 h-3.5" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <ExternalLink className="w-3.5 h-3.5" /> Embed code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center gap-2 text-rose-400 focus:text-rose-400" onClick={() => toast.error('Widget deleted')}>
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No widgets match your filters.
            </div>
          )}
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((widget, i) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-border/80 hover:shadow-lg hover:shadow-black/20 transition-all group"
            >
              <div className="flex items-start justify-between">
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium capitalize', widgetTypeColor(widget.type))}>
                  {widget.type}
                </span>
                <div className="flex items-center gap-1.5">
                  {widget.aiGenerated && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium text-amber-400 bg-amber-400/10">AI</span>}
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md border font-medium capitalize', statusColor(widget.status))}>
                    {widget.status}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">{widget.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{widget.workspace}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                <div>
                  <p className="text-xs font-semibold text-foreground">{formatNumber(widget.views)}</p>
                  <p className="text-[10px] text-muted-foreground">views</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{formatNumber(widget.submissions)}</p>
                  <p className="text-[10px] text-muted-foreground">leads</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-400">{formatPercent(widget.conversionRate)}</p>
                  <p className="text-[10px] text-muted-foreground">CVR</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href="/builder" className="flex-1">
                  <Button size="sm" variant="outline" className="h-7 w-full text-xs gap-1">
                    <Wand2 className="w-3 h-3" /> Edit
                  </Button>
                </Link>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => toast.success('Widget duplicated')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
