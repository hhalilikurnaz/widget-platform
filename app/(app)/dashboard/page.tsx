import { StatsCards } from '@/components/dashboard/stats-cards'
import { VisitorsChart } from '@/components/dashboard/visitors-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { TopPerforming } from '@/components/dashboard/top-performing'
import { QuickActions } from '@/components/dashboard/quick-actions'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Good morning, Jordan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening across your widgets today.
        </p>
      </div>

      {/* KPI Cards */}
      <StatsCards />

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Chart — spans 2 cols */}
        <div className="xl:col-span-2">
          <VisitorsChart />
        </div>
        {/* Quick actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TopPerforming />
        <RecentActivity />
      </div>
    </div>
  )
}
