import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export function formatPercent(n: number, decimals = 1): string {
  return n.toFixed(decimals) + '%'
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function statusColor(status: string): string {
  switch (status) {
    case 'published': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    case 'draft': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    case 'paused': return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
    case 'archived': return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
    default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
  }
}

export function widgetTypeColor(type: string): string {
  const map: Record<string, string> = {
    contact: 'text-blue-400 bg-blue-400/10',
    survey: 'text-purple-400 bg-purple-400/10',
    quiz: 'text-cyan-400 bg-cyan-400/10',
    popup: 'text-rose-400 bg-rose-400/10',
    embed: 'text-green-400 bg-green-400/10',
    chat: 'text-amber-400 bg-amber-400/10',
    feedback: 'text-indigo-400 bg-indigo-400/10',
    booking: 'text-teal-400 bg-teal-400/10',
  }
  return map[type] ?? 'text-zinc-400 bg-zinc-400/10'
}
