import {
  Building2,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Bot,
  MapPin,
  UserCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export default function AdminDash() {
  const kpis = [
    {
      title: "Active Companies",
      value: "12",
      icon: Building2,
      trend: "+2 this week",
    },
    {
      title: "Eligible Students",
      value: "347",
      icon: Users,
      trend: "98% verified",
    },
    {
      title: "Shortlisted",
      value: "82",
      icon: CheckCircle2,
      trend: "Awaiting approval",
      alert: true,
    },
    {
      title: "Interviews Today",
      value: "51",
      icon: Calendar,
      trend: "4 rooms active",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 flex flex-col min-h-full">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Good morning, Placement Officer.
          </h1>
          <p className="text-sm text-text-secondary">
            3 actions require your attention today.
          </p>
        </div>
        <Badge variant="ai" className="w-fit">
          <Clock className="w-3 h-3 mr-1" />
          AI Operations Active
        </Badge>
      </header>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  {kpi.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary">
                  {kpi.value}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-text-secondary">{kpi.trend}</p>
                  {kpi.alert && (
                    <span className="flex h-2 w-2 rounded-full bg-semantic-warning animate-pulse"></span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending actions</CardTitle>
                <p className="text-sm text-text-secondary mt-1">AI-prepared work waiting for officer approval.</p>
              </div>
              <Bot className="w-5 h-5 text-indigo-500" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Approve TechNova shortlist", "41 students matched above 80%", "Review shortlist"],
                ["Resolve Room A overlap", "2 interviews need a new room", "Open exception"],
                ["Publish DataSphere eligibility", "Eligibility extraction is complete", "Publish results"],
              ].map(([title, detail, action]) => (
                <div key={title} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-white/10 p-4">
                  <div className="flex gap-3 items-start">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div><p className="font-semibold text-text-primary">{title}</p><p className="text-sm text-text-secondary">{detail}</p></div>
                  </div>
                  <button className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 whitespace-nowrap">{action}<ArrowUpRight className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Today&apos;s placement schedule</CardTitle><Calendar className="w-5 h-5 text-text-secondary" /></CardHeader>
            <CardContent className="space-y-3">
              {[
                ["09:00 AM", "TechNova Solutions", "Technical Round 1", "Room 101", "24 candidates"],
                ["11:30 AM", "DataSphere AI", "Aptitude Test", "Lab 2", "58 candidates"],
                ["02:00 PM", "FinEdge Systems", "HR Discussion", "Room 204", "16 candidates"],
              ].map(([time, company, round, room, count]) => (
                <div key={`${time}-${company}`} className="grid grid-cols-[78px_1fr_auto] items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/5 p-3">
                  <span className="text-sm font-bold text-indigo-500">{time}</span>
                  <div><p className="font-semibold text-text-primary">{company}</p><p className="text-xs text-text-secondary">{round} · {count}</p></div>
                  <span className="hidden sm:flex items-center gap-1 text-xs text-text-secondary"><MapPin className="w-3.5 h-3.5" />{room}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Agent activity</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {[
                ["JD Agent", "Extracted 12 requirements from FinEdge JD", "2 min ago", "text-cyan-500"],
                ["Match Agent", "Ranked 82 candidates for TechNova", "18 min ago", "text-indigo-500"],
                ["Schedule Agent", "Detected Room A panel conflict", "31 min ago", "text-amber-500"],
                ["Comms Agent", "Sent 94 interview reminders", "1 hr ago", "text-emerald-500"],
              ].map(([agent, detail, time, color]) => (
                <div key={detail} className="flex gap-3">
                  <span className={`mt-1.5 w-2 h-2 rounded-full ${color.replace("text-", "bg-")} shrink-0`} />
                  <div><p className="text-sm font-semibold text-text-primary">{agent}</p><p className="text-sm text-text-secondary leading-relaxed">{detail}</p><p className="text-xs text-text-secondary mt-1">{time}</p></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Readiness snapshot</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-text-secondary"><UserCheck className="w-4 h-4" /> Verified profiles</span><strong className="text-text-primary">347 / 356</strong></div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden"><div className="h-full w-[98%] bg-emerald-500 rounded-full" /></div>
              <div className="grid grid-cols-2 gap-3 pt-2"><div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3"><p className="text-xs text-text-secondary">Avg. readiness</p><p className="text-xl font-bold text-text-primary">81%</p></div><div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3"><p className="text-xs text-text-secondary">Open exceptions</p><p className="text-xl font-bold text-amber-500">3</p></div></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}