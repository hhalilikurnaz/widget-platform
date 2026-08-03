'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Layers, Globe, Users, MousePointerClick, BarChart2, Clock } from 'lucide-react'
import { cn, formatNumber, formatPercent } from '@/lib/utils'
import { dashboardStats } from '@/lib/mock-data'

const stats = [
  {
    label: 'Active Widgets',
    value: dashboardStats.activeWidgets.value,
    change: dashboardStats.activeWidgets.change,
    changeType: dashboardStats.activeWidgets.changeType,
    format: (v: number) => String(v),
    icon: Layers,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    suffix: '',
  },
  {
    label: 'Total Views',
    value: dashboardStats.totalViews.value,
    change: dashboardStats.totalViews.change,
    changeType: dashboardStats.totalViews.changeType,
    format: formatNumber,
    icon: Globe,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    suffix: '',
  },
  {
    label: 'Total Leads',
    value: dashboardStats.totalLeads.value,
    change: dashboardStats.totalLeads.change,
    changeType: dashboardStats.totalLeads.changeType,
    format: formatNumber,
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    suffix: '',
  },
  {
    label: 'Conversion Rate',
    value: dashboardStats.conversionRate.value,
    change: dashboardStats.conversionRate.change,
    changeType: dashboardStats.conversionRate.changeType,
    format: (v: number) => formatPercent(v),
    icon: MousePointerClick,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    suffix: '%',
  },
  {
    label: 'Published',
    value: dashboardStats.totalPublished.value,
    change: dashboardStats.totalPublished.change,
    changeType: dashboardStats.totalPublished.changeType,
    format: (v: number) => String(v),
    icon: BarChart2,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    suffix: '',
  },
  {
    label: 'Avg. Session',
    value: dashboardStats.avgSessionTime.value,
    change: dashboardStats.avgSessionTime.change,
    changeType: dashboardStats.avgSessionTime.changeType,
    format: (v: number) => `${v}m`,
    icon: Clock,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    suffix: 'm',
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', stat.bg)}>
              <stat.icon className={cn('w-3.5 h-3.5', stat.color)} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none">{stat.format(stat.value)}</p>
            <div className="flex items-center gap-1 mt-1.5">
              {stat.changeType === 'positive'
                ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                : <TrendingDown className="w-3 h-3 text-rose-400" />}
              <span className={cn('text-[11px] font-medium', stat.changeType === 'positive' ? 'text-emerald-400' : 'text-rose-400')}>
                {stat.changeType === 'positive' ? '+' : ''}{formatNumber(stat.change)}{stat.suffix}
              </span>
              <span className="text-[11px] text-muted-foreground">vs last week</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
