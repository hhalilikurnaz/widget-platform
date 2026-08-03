'use client'

import { motion } from 'framer-motion'
import { widgets } from '@/lib/mock-data'
import { formatNumber, formatPercent, statusColor, widgetTypeColor, cn } from '@/lib/utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

const topWidgets = [...widgets]
  .filter(w => w.status === 'published')
  .sort((a, b) => b.submissions - a.submissions)
  .slice(0, 5)

export function TopPerforming() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.3 }}
      className="bg-card border border-border rounded-xl flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Top Performing Widgets</h3>
        <Link href="/widgets" className="text-xs text-brand hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {topWidgets.map((widget, i) => (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 * i + 0.4 }}
            className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors"
          >
            <span className="text-xs text-muted-foreground/50 font-mono w-4 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{widget.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium capitalize', widgetTypeColor(widget.type))}>
                  {widget.type}
                </span>
                {widget.aiGenerated && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium text-amber-400 bg-amber-400/10">AI</span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold text-foreground">{formatNumber(widget.submissions)}</p>
              <p className="text-[11px] text-emerald-400">{formatPercent(widget.conversionRate)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
