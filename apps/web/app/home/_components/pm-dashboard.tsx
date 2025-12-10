'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bug,
  Code2,
  Crown,
  ExternalLink,
  Flame,
  GitPullRequest,
  Layers,
  RefreshCcw,
  Shield,
  Target,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@kit/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Skeleton } from '@kit/ui/skeleton';
import { Progress } from '@kit/ui/progress';

import {
  DateRangePicker,
  DateRangeValue,
  createPresetValue,
  getDateRangeParams,
} from '~/components/date-range-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@kit/ui/tooltip';

type PMDashboardData = {
  summary: {
    totalPrs: number;
    eligiblePrs: number;
    eligibilityRate: number;
    totalScore: number;
    bugCount: number;
    featureCount: number;
    bugToFeatureRatio: string;
    activeContributors: number;
    activeComponents: number;
    thisWeekBugs: number;
    bugChange: number;
  };
  components: {
    key: string;
    name: string;
    totalPrs: number;
    eligiblePrs: number;
    totalScore: number;
    p0Count: number;
    p1Count: number;
    p2Count: number;
    p3Count: number;
    contributorCount: number;
    avgScore: number;
    eligibilityRate: number;
    bugCount: number;
    linesChanged: number;
    additions: number;
    deletions: number;
  }[];
  bugHotspots: {
    key: string;
    name: string;
    bugCount: number;
    p0Count: number;
    p1Count: number;
    totalPrs: number;
  }[];
  atRiskComponents: {
    key: string;
    name: string;
    bugCount: number;
    eligibilityRate: number;
    riskScore: number;
    totalPrs: number;
  }[];
  knowledgeSilos: {
    key: string;
    name: string;
    contributorCount: number;
    totalPrs: number;
  }[];
  neglectedComponents: {
    key: string;
    name: string;
    totalPrs: number;
  }[];
  severityTrend: {
    week: string;
    label: string;
    P0: number;
    P1: number;
    P2: number;
    P3: number;
    total: number;
  }[];
  componentTrend: {
    week: string;
    label: string;
    [key: string]: number | string;
  }[];
  focusTrend: {
    week: string;
    label: string;
    bugs: number;
    features: number;
    total: number;
  }[];
  topComponentKeys: { key: string; name: string }[];
  contributorDistribution: {
    author: string;
    avatar_url?: string;
    prCount: number;
    componentCount: number;
    score: number;
  }[];
  componentExperts: {
    componentKey: string;
    componentName: string;
    totalPrs: number;
    topContributors: {
      author: string;
      avatar_url?: string;
      prCount: number;
      score: number;
      bugFixes: number;
    }[];
    primaryOwner: {
      author: string;
      avatar_url?: string;
      prCount: number;
      score: number;
      bugFixes: number;
    } | null;
    ownershipPercent: number;
  }[];
  recentCriticalFixes: {
    id: string;
    title: string;
    number: number;
    url: string;
    repo: string;
    author: string;
    avatar_url?: string;
    component: string;
    componentKey: string;
    severity: string;
    score: number;
    mergedAt: string;
  }[];
  period: { days: number; since: string };
};

export function PMDashboard({ orgId }: { orgId: string }) {
  const [data, setData] = useState<PMDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeValue>(createPresetValue(30));

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ orgId });
      const rangeParams = getDateRangeParams(dateRange);
      if (rangeParams.days) {
        params.set('days', String(rangeParams.days));
      }
      if (rangeParams.from) {
        params.set('from', rangeParams.from);
      }
      if (rangeParams.to) {
        params.set('to', rangeParams.to);
      }
      const res = await fetch(`/api/github/pm-dashboard?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch PM dashboard data');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, dateRange]);

  const getDateRangeDescription = () => {
    if (dateRange.type === 'preset') {
      const { days } = dateRange;
      if (days === 7) return 'this week';
      if (days === 14) return 'the last 2 weeks';
      if (days === 30) return 'the last month';
      if (days === 90) return 'the last 3 months';
      if (days === 180) return 'the last 6 months';
      if (days === 365) return 'the last year';
      return `the last ${days} days`;
    }
    return 'the selected date range';
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Product Insights</h1>
        <p className="text-sm text-muted-foreground">
          Showing data from {getDateRangeDescription()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 pb-36">
        {renderHeader()}
        <PMDashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-6 pb-36">
        {renderHeader()}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Failed to load PM dashboard: {error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.summary.totalPrs === 0) {
    return (
      <div className="flex flex-col space-y-6 pb-36">
        {renderHeader()}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Layers className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Product Data Yet</h3>
              <p className="text-muted-foreground max-w-md">
                Process some PRs to see product insights and component analytics here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary } = data;

  return (
    <TooltipProvider>
      <div className="flex flex-col space-y-6 pb-36">
        {renderHeader()}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          <MetricCard
            icon={<Layers className="h-4 w-4" />}
            label="Active Components"
            value={summary.activeComponents}
            sublabel="in this period"
            tooltip="Number of unique product components that received PRs in this time period."
          />
          <MetricCard
            icon={<Bug className="h-4 w-4" />}
            label="Bugs Fixed"
            value={summary.bugCount}
            sublabel={`${summary.thisWeekBugs} this week`}
            change={summary.bugChange}
            tooltip="Total P0 and P1 severity PRs (critical bug fixes) in this period."
            variant="destructive"
          />
          <MetricCard
            icon={<Zap className="h-4 w-4" />}
            label="Features/Improvements"
            value={summary.featureCount}
            sublabel="P2 + P3 PRs"
            tooltip="Total P2 and P3 severity PRs (features and improvements) in this period."
            variant="success"
          />
          <MetricCard
            icon={<Target className="h-4 w-4" />}
            label="Bug:Feature Ratio"
            value={summary.bugToFeatureRatio}
            sublabel={Number(summary.bugToFeatureRatio) > 1 ? 'More bugs than features' : 'Healthy ratio'}
            tooltip="Ratio of bug fixes to feature work. Lower is generally better, indicating more proactive development."
            variant={Number(summary.bugToFeatureRatio) > 1 ? 'warning' : 'default'}
          />
          <MetricCard
            icon={<Shield className="h-4 w-4" />}
            label="Quality Rate"
            value={`${summary.eligibilityRate}%`}
            sublabel="PR eligibility"
            tooltip="Percentage of PRs meeting quality criteria (linked issues, tests, documentation)."
            variant={summary.eligibilityRate >= 70 ? 'success' : summary.eligibilityRate >= 50 ? 'warning' : 'destructive'}
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          <SeverityTrendChart data={data.severityTrend} />
          <FocusTrendChart data={data.focusTrend} />
        </div>

        {/* Component Activity */}
        <div className="grid gap-4 lg:grid-cols-3">
          <ComponentActivityTable data={data.components} />
          <div className="space-y-4">
            <BugHotspotsCard data={data.bugHotspots} />
            <AtRiskComponentsCard data={data.atRiskComponents} />
          </div>
        </div>

        {/* Knowledge & Resources */}
        <div className="grid gap-4 lg:grid-cols-3">
          <ContributorDistributionCard data={data.contributorDistribution} />
          <KnowledgeSilosCard data={data.knowledgeSilos} />
          <NeglectedAreasCard data={data.neglectedComponents} />
        </div>

        {/* Component Experts - Who owns what */}
        <ComponentExpertsCard data={data.componentExperts} />

        {/* Recent Critical Fixes */}
        <RecentCriticalFixesTable data={data.recentCriticalFixes} />
      </div>
    </TooltipProvider>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sublabel,
  tooltip,
  change,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel: string;
  tooltip: string;
  change?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}) {
  const colors = {
    default: 'text-foreground',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    destructive: 'text-red-500',
  };

  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                {icon}
                <span className="text-xs font-medium truncate">{label}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xl font-bold ${colors[variant]} truncate`}>{value}</p>
                {change !== undefined && (
                  <span className={`flex items-center text-xs ${change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(change)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{sublabel}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  );
}

function SeverityTrendChart({ data }: { data: PMDashboardData['severityTrend'] }) {
  const chartConfig = {
    P0: { label: 'P0 (Critical)', color: 'hsl(0, 84%, 60%)' },
    P1: { label: 'P1 (High)', color: 'hsl(25, 95%, 53%)' },
    P2: { label: 'P2 (Medium)', color: 'hsl(48, 96%, 53%)' },
    P3: { label: 'P3 (Low)', color: 'hsl(142, 71%, 45%)' },
  } as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Severity Breakdown Over Time
        </CardTitle>
        <CardDescription>Distribution of PR severity levels by week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-64 w-full" config={chartConfig}>
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} fontSize={11} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="P0" stackId="a" fill="hsl(0, 84%, 60%)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="P1" stackId="a" fill="hsl(25, 95%, 53%)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="P2" stackId="a" fill="hsl(48, 96%, 53%)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="P3" stackId="a" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function FocusTrendChart({ data }: { data: PMDashboardData['focusTrend'] }) {
  const chartConfig = {
    bugs: { label: 'Bug Fixes (P0+P1)', color: 'hsl(0, 84%, 60%)' },
    features: { label: 'Features (P2+P3)', color: 'hsl(142, 71%, 45%)' },
  } as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Development Focus
        </CardTitle>
        <CardDescription>Bug fixes vs feature development over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-64 w-full" config={chartConfig}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillBugs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillFeatures" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} fontSize={11} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Area
              dataKey="bugs"
              type="monotone"
              fill="url(#fillBugs)"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
            />
            <Area
              dataKey="features"
              type="monotone"
              fill="url(#fillFeatures)"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ComponentActivityTable({ data }: { data: PMDashboardData['components'] }) {
  const topComponents = data.slice(0, 10);
  const maxPrs = Math.max(...topComponents.map((c) => c.totalPrs));

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Component Activity
        </CardTitle>
        <CardDescription>Most active product areas in this period</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead className="text-center">PRs</TableHead>
              <TableHead className="text-center">Bugs</TableHead>
              <TableHead className="text-center">Contributors</TableHead>
              <TableHead className="text-center">Quality</TableHead>
              <TableHead className="w-32">Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topComponents.map((component) => (
              <TableRow key={component.key}>
                <TableCell className="font-medium">
                  <div className="max-w-[150px] truncate" title={component.name}>
                    {component.name}
                  </div>
                </TableCell>
                <TableCell className="text-center">{component.totalPrs}</TableCell>
                <TableCell className="text-center">
                  {component.bugCount > 0 ? (
                    <Badge variant="destructive" className="text-xs">
                      {component.bugCount}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    {component.contributorCount}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      component.eligibilityRate >= 70
                        ? 'default'
                        : component.eligibilityRate >= 50
                          ? 'secondary'
                          : 'destructive'
                    }
                    className="text-xs"
                  >
                    {component.eligibilityRate}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Progress value={(component.totalPrs / maxPrs) * 100} className="h-2" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BugHotspotsCard({ data }: { data: PMDashboardData['bugHotspots'] }) {
  const COLORS = ['hsl(0, 84%, 60%)', 'hsl(25, 95%, 53%)', 'hsl(48, 96%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(200, 80%, 50%)'];

  const chartConfig = {
    bugCount: { label: 'Bugs' },
  } as const;

  const pieData = data.slice(0, 5).map((item, idx) => ({
    name: item.name,
    value: item.bugCount,
    fill: COLORS[idx % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bug className="h-4 w-4 text-red-500" />
          Bug Hotspots
        </CardTitle>
        <CardDescription className="text-xs">Components with most critical bugs</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No critical bugs found</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ChartContainer className="h-28 w-28" config={chartConfig}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex-1 space-y-1">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="truncate max-w-[80px]" title={item.name}>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AtRiskComponentsCard({ data }: { data: PMDashboardData['atRiskComponents'] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          At-Risk Areas
        </CardTitle>
        <CardDescription className="text-xs">High bugs + low quality PRs</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">All components healthy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.slice(0, 4).map((component) => (
              <div key={component.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate max-w-[120px]" title={component.name}>
                    {component.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-[10px]">
                      {component.bugCount} bugs
                    </Badge>
                    <span className="text-xs text-muted-foreground">{component.eligibilityRate}% quality</span>
                  </div>
                </div>
                <Progress
                  value={Math.min(component.riskScore, 100)}
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContributorDistributionCard({ data }: { data: PMDashboardData['contributorDistribution'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Distribution
        </CardTitle>
        <CardDescription>How work is distributed across contributors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 6).map((contributor) => (
            <div key={contributor.author} className="flex items-center gap-3">
              <Link href={`/home/developer/${contributor.author}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contributor.avatar_url} />
                  <AvatarFallback className="text-xs">{contributor.author[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/home/developer/${contributor.author}`} className="font-medium text-sm hover:underline truncate block">
                  {contributor.author}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{contributor.prCount} PRs</span>
                  <span>•</span>
                  <span>{contributor.componentCount} components</span>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">{contributor.score} pts</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function KnowledgeSilosCard({ data }: { data: PMDashboardData['knowledgeSilos'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserX className="h-5 w-5 text-orange-500" />
          Knowledge Silos
        </CardTitle>
        <CardDescription>Components with single contributor</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No knowledge silos detected</p>
            <p className="text-xs">All components have multiple contributors</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((component) => (
              <div key={component.key} className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div>
                  <p className="font-medium text-sm truncate max-w-[140px]" title={component.name}>
                    {component.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{component.totalPrs} PRs by 1 dev</p>
                </div>
                <Badge variant="outline" className="text-orange-500 border-orange-500">
                  Risk
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NeglectedAreasCard({ data }: { data: PMDashboardData['neglectedComponents'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-500" />
          Low Activity Areas
        </CardTitle>
        <CardDescription>Components with least recent work</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">All components active</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((component) => (
              <div key={component.key} className="flex items-center justify-between">
                <span className="font-medium text-sm truncate max-w-[150px]" title={component.name}>
                  {component.name}
                </span>
                <span className="text-sm text-muted-foreground">{component.totalPrs} PRs</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ComponentExpertsCard({ data }: { data: PMDashboardData['componentExperts'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          Component Experts
        </CardTitle>
        <CardDescription>Who knows each feature area best - primary contributors per component</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No component data available</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((component) => (
              <div
                key={component.componentKey}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-sm truncate max-w-[180px]" title={component.componentName}>
                      {component.componentName}
                    </h4>
                    <p className="text-xs text-muted-foreground">{component.totalPrs} PRs total</p>
                  </div>
                  {component.ownershipPercent >= 50 && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Primary owner ({component.ownershipPercent}% of PRs)</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {/* Primary Owner */}
                {component.primaryOwner && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Primary Expert</p>
                    <Link
                      href={`/home/developer/${component.primaryOwner.author}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-7 w-7 border-2 border-primary">
                        <AvatarImage src={component.primaryOwner.avatar_url} />
                        <AvatarFallback className="text-[10px]">
                          {component.primaryOwner.author[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm hover:underline truncate">
                          {component.primaryOwner.author}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{component.primaryOwner.prCount} PRs</span>
                          <span>•</span>
                          <span>{component.ownershipPercent}%</span>
                          {component.primaryOwner.bugFixes > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-red-500">{component.primaryOwner.bugFixes} bugs</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Other Contributors */}
                {component.topContributors.length > 1 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Also Contributing</p>
                    <div className="flex items-center gap-1">
                      {component.topContributors.slice(1).map((contributor) => (
                        <Tooltip key={contributor.author}>
                          <TooltipTrigger asChild>
                            <Link href={`/home/developer/${contributor.author}`}>
                              <Avatar className="h-6 w-6 border border-border hover:border-primary transition-colors">
                                <AvatarImage src={contributor.avatar_url} />
                                <AvatarFallback className="text-[9px]">
                                  {contributor.author[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{contributor.author}</p>
                            <p className="text-xs text-muted-foreground">
                              {contributor.prCount} PRs • {contributor.score} pts
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentCriticalFixesTable({ data }: { data: PMDashboardData['recentCriticalFixes'] }) {
  if (data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitPullRequest className="h-5 w-5" />
          Recent Critical Bug Fixes
        </CardTitle>
        <CardDescription>Latest P0 and P1 severity fixes</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pull Request</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((pr) => (
              <TableRow key={pr.id}>
                <TableCell>
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline flex items-center gap-1 max-w-[250px]"
                  >
                    <span className="truncate">{pr.title}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                  <p className="text-xs text-muted-foreground">{pr.repo?.split('/').pop()}#{pr.number}</p>
                </TableCell>
                <TableCell>
                  <Link href={`/home/developer/${pr.author}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={pr.avatar_url} />
                      <AvatarFallback className="text-xs">{pr.author[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm hover:underline">{pr.author}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{pr.component}</Badge>
                </TableCell>
                <TableCell>
                  <SeverityBadge severity={pr.severity} />
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="default">{pr.score} pts</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    P0: 'destructive',
    P1: 'default',
    P2: 'secondary',
    P3: 'outline',
  };
  return <Badge variant={variants[severity] ?? 'outline'}>{severity}</Badge>;
}

function PMDashboardSkeleton() {
  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
      {/* Component Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Knowledge & Resources */}
      <div className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Component Experts */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
