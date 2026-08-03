'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
  Plus,
  ChevronRight,
  Wand2,
  Circle,
  Zap,
  FileText,
  LayoutTemplate,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ─── Breadcrumb config ────────────────────────────────────────────────────────

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  widgets: 'Widgets',
  builder: 'Builder',
  templates: 'Templates',
  themes: 'Themes',
  analytics: 'Analytics',
  submissions: 'Submissions',
  ai: 'AI Assistant',
  settings: 'Settings',
  playground: 'Playground',
}

const notifications = [
  { id: 'n1', title: 'New submission', body: 'Sarah Chen submitted Enterprise Contact Form', time: '2026-08-03T10:24:00Z', read: false, type: 'submission' },
  { id: 'n2', title: 'Widget published', body: 'Bug Report Widget is now live', time: '2026-08-03T08:15:00Z', read: false, type: 'publish' },
  { id: 'n3', title: 'AI generation complete', body: 'Demo Booking Form has been created', time: '2026-08-03T09:30:00Z', read: true, type: 'ai' },
  { id: 'n4', title: 'Weekly digest', body: '17,741 total submissions this week (+12%)', time: '2026-08-01T09:00:00Z', read: true, type: 'report' },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface TopbarProps {
  onSearchOpen: () => void
}

export function Topbar({ onSearchOpen }: TopbarProps) {
  const pathname = usePathname()
  const [notifOpen, setNotifOpen] = useState(false)
  const [readIds, setReadIds] = useState<string[]>([])

  const segments = pathname.split('/').filter(Boolean)
  const unreadCount = notifications.filter(n => !n.read && !readIds.includes(n.id)).length

  const markAllRead = () => setReadIds(notifications.map(n => n.id))

  return (
    <header className="flex items-center h-14 px-4 border-b border-border bg-background/80 backdrop-blur-sm shrink-0 gap-3">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm min-w-0 flex-1" aria-label="Breadcrumb">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          WidgetForge
        </Link>
        {segments.map((seg, i) => {
          const href = '/' + segments.slice(0, i + 1).join('/')
          const label = routeLabels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
          const isLast = i === segments.length - 1
          return (
            <span key={seg} className="flex items-center gap-1 min-w-0">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              {isLast
                ? <span className="font-medium text-foreground truncate">{label}</span>
                : <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors truncate">{label}</Link>
              }
            </span>
          )
        })}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search trigger */}
        <button
          onClick={onSearchOpen}
          className="flex items-center gap-2 h-8 px-3 rounded-lg bg-muted/50 border border-border text-muted-foreground text-sm hover:border-border/80 hover:text-foreground transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-xs">Search...</span>
          <kbd className="hidden md:inline text-[10px] bg-background px-1.5 py-0.5 rounded border border-border ml-1">⌘K</kbd>
        </button>

        {/* Notifications */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand border-2 border-background" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-brand hover:underline">Mark all read</button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map(n => {
                const isRead = n.read || readIds.includes(n.id)
                return (
                  <div key={n.id} className={cn('flex items-start gap-3 px-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer', !isRead && 'bg-brand/5')}>
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', isRead ? 'bg-transparent' : 'bg-brand')} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.time)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-3 py-2 border-t border-border">
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center">View all notifications</button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* New widget */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="sm" className="h-8 gap-1.5 bg-brand hover:bg-brand/90 text-white border-0 text-xs font-medium" />}
          >
            <Plus className="w-3.5 h-3.5" />
            New Widget
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">Create widget</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/builder" className="flex items-center gap-2 cursor-pointer" />} nativeButton={false}>
                <Wand2 className="w-3.5 h-3.5 text-brand" />
                Visual Builder
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/ai" className="flex items-center gap-2 cursor-pointer" />} nativeButton={false}>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Generate with AI
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/templates" className="flex items-center gap-2 cursor-pointer" />} nativeButton={false}>
                <LayoutTemplate className="w-3.5 h-3.5 text-purple-400" />
                From Template
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/widgets" className="flex items-center gap-2 cursor-pointer" />} nativeButton={false}>
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Blank Widget
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
