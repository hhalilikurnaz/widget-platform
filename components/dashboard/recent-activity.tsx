'use client'

import { motion } from 'framer-motion'
import { activityFeed } from '@/lib/mock-data'
import { timeAgo, cn } from '@/lib/utils'
import { FileText, Zap, Upload, Palette, Inbox, LayoutTemplate, Plus } from 'lucide-react'

const typeConfig: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  created:         { icon: Plus,           color: 'text-blue-400',    bg: 'bg-blue-400/10'    },
  published:       { icon: Upload,         color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  submission:      { icon: Inbox,          color: 'text-purple-400',  bg: 'bg-purple-400/10'  },
  ai_generated:    { icon: Zap,            color: 'text-amber-400',   bg: 'bg-amber-400/10'   },
  template_used:   { icon: LayoutTemplate, color: 'text-cyan-400',    bg: 'bg-cyan-400/10'    },
  theme_applied:   { icon: Palette,        color: 'text-rose-400',    bg: 'bg-rose-400/10'    },
  settings_updated:{ icon: FileText,       color: 'text-zinc-400',    bg: 'bg-zinc-400/10'    },
}

export function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className="bg-card border border-border rounded-xl flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <button className="text-xs text-brand hover:underline">View all</button>
      </div>
      <div className="divide-y divide-border/50">
        {activityFeed.slice(0, 6).map((item, i) => {
          const cfg = typeConfig[item.type] ?? typeConfig.created
          const Icon = cfg.icon
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i + 0.4 }}
              className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors"
            >
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{item.message}</p>
                {item.widget && (
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.widget}</p>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground/60 shrink-0">{timeAgo(item.timestamp)}</span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
