'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Layers,
  Wand2,
  LayoutTemplate,
  Palette,
  BarChart3,
  Inbox,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  FlaskConical,
  ChevronsUpDown,
  Check,
} from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ─── Nav Config ───────────────────────────────────────────────────────────────

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Widgets', href: '/widgets', icon: Layers },
  { label: 'Builder', href: '/builder', icon: Wand2, badge: 'New' },
  { label: 'Templates', href: '/templates', icon: LayoutTemplate },
  { label: 'Themes', href: '/themes', icon: Palette },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Submissions', href: '/submissions', icon: Inbox },
  { label: 'AI Assistant', href: '/ai', icon: Sparkles },
]

const bottomItems = [
  { label: 'Playground', href: '/playground', icon: FlaskConical },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const workspaces = [
  { id: 'acme', name: 'Acme Corp', plan: 'Pro' },
  { id: 'nova', name: 'Nova Health', plan: 'Business' },
  { id: 'stripe', name: 'Stripe', plan: 'Enterprise' },
  { id: 'studio', name: 'WidgetForge Studio', plan: 'Pro' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0])

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-full shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar"
      style={{ minWidth: collapsed ? 60 : 220 }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand shrink-0">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="font-semibold text-sm text-foreground whitespace-nowrap overflow-hidden"
              >
                WidgetForge
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            {collapsed
              ? <ChevronRight className="w-3.5 h-3.5" />
              : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Workspace Switcher */}
      <div className="px-2 pt-3 pb-1 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent group',
              collapsed && 'justify-center px-1.5'
            )}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-brand/20 border border-brand/30 shrink-0">
              <span className="text-[10px] font-bold text-brand">{activeWorkspace.name[0]}</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-xs font-medium text-foreground truncate leading-none mb-0.5">{activeWorkspace.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-none">{activeWorkspace.plan}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && <ChevronsUpDown className="w-3 h-3 text-muted-foreground shrink-0" />}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map(ws => (
                <DropdownMenuItem key={ws.id} onClick={() => setActiveWorkspace(ws)} className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded bg-brand/20 border border-brand/30 shrink-0">
                    <span className="text-[9px] font-bold text-brand">{ws.name[0]}</span>
                  </div>
                  <span className="flex-1 text-sm">{ws.name}</span>
                  <span className="text-[10px] text-muted-foreground">{ws.plan}</span>
                  {ws.id === activeWorkspace.id && <Check className="w-3 h-3 text-brand ml-1" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Divider */}
      <div className="mx-3 my-1 h-px bg-sidebar-border shrink-0" />

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto space-y-0.5">
        {navItems.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all group relative',
                collapsed && 'justify-center px-1.5',
                active
                  ? 'bg-brand/15 text-brand font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', active ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground')} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand/20 text-brand border border-brand/30">
                  {item.badge}
                </span>
              )}
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-brand"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-1 h-px bg-sidebar-border shrink-0" />

      {/* Bottom nav */}
      <nav className="px-2 pb-2 space-y-0.5 shrink-0">
        {bottomItems.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-all group',
                collapsed && 'justify-center px-1.5',
                active
                  ? 'bg-brand/15 text-brand font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', active ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground')} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}

        {/* User profile */}
        <div className={cn('flex items-center gap-2 rounded-lg px-2 py-1.5 mt-1', collapsed && 'justify-center px-1.5')}>
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarFallback className="bg-brand/20 text-brand text-xs font-semibold">JD</AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 overflow-hidden"
              >
                <p className="text-xs font-medium text-foreground truncate leading-none mb-0.5">Jordan Davis</p>
                <p className="text-[10px] text-muted-foreground leading-none truncate">jordan@acmecorp.com</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </motion.aside>
  )
}
