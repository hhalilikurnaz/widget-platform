'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
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
  FlaskConical,
  Plus,
  Zap,
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const pages = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'Navigate' },
  { label: 'Widgets', href: '/widgets', icon: Layers, group: 'Navigate' },
  { label: 'Builder', href: '/builder', icon: Wand2, group: 'Navigate' },
  { label: 'Templates', href: '/templates', icon: LayoutTemplate, group: 'Navigate' },
  { label: 'Themes', href: '/themes', icon: Palette, group: 'Navigate' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, group: 'Navigate' },
  { label: 'Submissions', href: '/submissions', icon: Inbox, group: 'Navigate' },
  { label: 'AI Assistant', href: '/ai', icon: Sparkles, group: 'Navigate' },
  { label: 'Settings', href: '/settings', icon: Settings, group: 'Navigate' },
  { label: 'Playground', href: '/playground', icon: FlaskConical, group: 'Navigate' },
]

const actions = [
  { label: 'Create new widget', href: '/builder', icon: Plus, group: 'Actions' },
  { label: 'Generate widget with AI', href: '/ai', icon: Zap, group: 'Actions' },
  { label: 'Browse templates', href: '/templates', icon: LayoutTemplate, group: 'Actions' },
  { label: 'View analytics', href: '/analytics', icon: BarChart3, group: 'Actions' },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  const run = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, actions, widgets..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          {actions.map(a => (
            <CommandItem key={a.href + a.label} onSelect={() => run(a.href)} className="gap-2">
              <a.icon className="w-4 h-4 text-muted-foreground" />
              <span>{a.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          {pages.map(p => (
            <CommandItem key={p.href} onSelect={() => run(p.href)} className="gap-2">
              <p.icon className="w-4 h-4 text-muted-foreground" />
              <span>{p.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
