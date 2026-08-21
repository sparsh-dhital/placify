import {
  Building2,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
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

      {/* Grid for Complex Dashboard Components (Pending AI Actions, Timeline, etc.) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Main Column (2/3 width) - Live Operations & Exceptions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-96 border-dashed flex items-center justify-center">
            <span className="text-text-secondary text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              AI Pending Actions & Exception Center coming next
            </span>
          </Card>
        </div>

        {/* Side Column (1/3 width) - AI Agent Activity Timeline */}
        <div className="space-y-6">
          <Card className="h-96 border-dashed flex items-center justify-center">
            <span className="text-text-secondary text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Agent Activity Timeline coming next
            </span>
          </Card>
        </div>
      </div>
    </div>
  );
}