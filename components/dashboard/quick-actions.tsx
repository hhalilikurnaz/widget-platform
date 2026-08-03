'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Wand2, Zap, LayoutTemplate, BarChart3, ArrowRight } from 'lucide-react'

const actions = [
  {
    label: 'Visual Builder',
    description: 'Drag & drop widget editor',
    href: '/builder',
    icon: Wand2,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  {
    label: 'Generate with AI',
    description: 'Describe and build instantly',
    href: '/ai',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
  {
    label: 'Browse Templates',
    description: '100+ ready-to-use designs',
    href: '/templates',
    icon: LayoutTemplate,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
  },
  {
    label: 'View Analytics',
    description: 'Performance insights',
    href: '/analytics',
    icon: BarChart3,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
]

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.3 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.06 * i + 0.25 }}
          >
            <Link
              href={action.href}
              className={`flex items-start gap-3 p-3 rounded-lg border ${action.border} ${action.bg} hover:opacity-90 transition-opacity group`}
            >
              <div className={`w-8 h-8 rounded-lg bg-background/60 flex items-center justify-center shrink-0`}>
                <action.icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${action.color}`}>{action.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{action.description}</p>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 ${action.color} opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5`} />
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
