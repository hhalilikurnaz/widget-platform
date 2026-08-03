"use client"

import { useState } from "react"
import {
  visitorsChartData,
  widgetPerformanceData,
  deviceData,
  funnelData,
  widgets,
} from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, formatNumber, formatPercent } from "@/lib/utils"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts"
import {
  TrendingUp, TrendingDown, Eye, MousePointerClick,
  CheckCircle, Clock, ArrowUpRight, Download,
} from "lucide-react"

const DEVICE_COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === "number" ? formatNumber(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

const StatCard = ({ label, value, change, icon: Icon, colorClass }: {
  label: string; value: string; change: number; icon: any; colorClass: string
}) => {
  const up = change >= 0
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorClass)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          {up ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
          <span className={cn("text-xs font-medium", up ? "text-emerald-400" : "text-rose-400")}>
            {up ? "+" : ""}{change}%
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d")
  const [widgetFilter, setWidgetFilter] = useState("all")
  const [chartType, setChartType] = useState("area")

  const topWidgets = [...widgets]
    .filter(w => w.status === "published")
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track performance across all your widgets.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={widgetFilter} onValueChange={setWidgetFilter}>
            <SelectTrigger className="h-8 text-xs w-44 bg-muted/30 border-border">
              <SelectValue placeholder="All Widgets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Widgets</SelectItem>
              {widgets.slice(0, 5).map(w => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {["7d", "30d", "90d", "1y"].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1.5 text-xs transition-colors",
                  range === r
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Impressions" value={formatNumber(124670)} change={12.4} icon={Eye} colorClass="bg-blue-400/10 text-blue-400" />
        <StatCard label="Total Submissions" value={formatNumber(17741)} change={8.1} icon={MousePointerClick} colorClass="bg-cyan-400/10 text-cyan-400" />
        <StatCard label="Avg. Conversion" value={formatPercent(14.2)} change={1.8} icon={CheckCircle} colorClass="bg-purple-400/10 text-purple-400" />
        <StatCard label="Avg. Time on Widget" value="1m 42s" change={5.7} icon={Clock} colorClass="bg-amber-400/10 text-amber-400" />
      </div>

      {/* Main Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold">Views &amp; Submissions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Daily breakdown for the selected period</p>
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {["area", "bar", "line"].map(ct => (
              <button
                key={ct}
                onClick={() => setChartType(ct)}
                className={cn(
                  "px-3 py-1.5 text-xs capitalize transition-colors",
                  chartType === ct
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                {ct}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          {chartType === "bar" ? (
            <BarChart data={visitorsChartData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="views" name="Views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="submissions" name="Submissions" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart data={visitorsChartData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="views" name="Views" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="submissions" name="Submissions" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          ) : (
            <AreaChart data={visitorsChartData} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSubs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="views" name="Views" stroke="#3b82f6" fill="url(#gradViews)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#06b6d4" fill="url(#gradSubs)" strokeWidth={2} dot={false} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Top widgets */}
        <div className="xl:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Top Widgets by Conversion Rate</h3>
          <div className="space-y-3">
            {topWidgets.map((w, i) => (
              <div key={w.id} className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium truncate">{w.name}</p>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{formatPercent(w.conversionRate)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${(w.conversionRate / 30) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 shrink-0">
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="text-xs font-medium">{formatNumber(w.submissions)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device split */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Device Breakdown</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={deviceData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={3}>
                {deviceData.map((_, i) => (
                  <Cell key={i} fill={DEVICE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {deviceData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: DEVICE_COLORS[i] }} />
                  <span className="text-xs text-muted-foreground">{d.name}</span>
                </div>
                <span className="text-xs font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Conversion Funnel</h3>
        <div className="space-y-2">
          {funnelData.map((stage, i) => (
            <div key={stage.stage} className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-32 shrink-0">{stage.stage}</span>
              <div className="flex-1 h-7 bg-muted rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg flex items-center px-3"
                  style={{
                    width: `${stage.pct}%`,
                    background: `rgba(59,130,246,${1 - i * 0.17})`,
                    minWidth: 60,
                  }}
                >
                  <span className="text-xs text-white font-medium">{formatNumber(stage.value)}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right shrink-0">{formatPercent(stage.pct)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
