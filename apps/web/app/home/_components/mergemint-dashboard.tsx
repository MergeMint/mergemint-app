'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bug,
  Crown,
  ExternalLink,
  Flame,
  GitPullRequest,
  Medal,
  RefreshCcw,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Skeleton } from '@kit/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@kit/ui/tooltip';

type DashboardData = {
  hero: {
    weeklyMvp: { author: string; avatar_url?: string; score: number; pr_count: number } | null;
    isLastWeekMvp: boolean;
    highestScoringPr: { title: string; number: number; url: string; author: string; avatar_url?: string; score: number; severity: string } | null;
    thisWeekScore: number;
    weekOverWeekChange: number;
    criticalBugs: number;
    criticalBugsChange: number;
    qualityIndex: number;
    activeContributors: number;
    hottestComponent: { name: string; count: number } | null;
    streak: number;
    totalScore: number;
    totalPrs: number;
    eligiblePrs: number;
    avgScorePerPr: number;
    avgScorePerDev: number;
  };
  scoreTrend: { date: string; day: string; score: number; eligible: number; total: number; avg: number }[];
  velocityTrend: { week: string; label: string; total: number; eligible: number; score: number }[];
  contributorTrend: { week: string; label: string; contributors: number }[];
  severityCounts: { severity: string; count: number }[];
  componentScores: { component: string; key: string; score: number; count: number }[];
  leaderboard: {
    author: string;
    avatar_url?: string;
    total_score: number;
    pr_count: number;
    eligible_count: number;
    avg_score: number;
    p0_count: number;
    p1_count: number;
    p2_count: number;
    p3_count: number;
  }[];
  topPrs: {
    id: string;
    title: string;
    number: number;
    url: string;
    repo: string;
    author: string;
    avatar_url?: string;
    component: string;
    severity: string;
    score: number;
    merged_at: string;
  }[];
  recentEvaluations: {
    id: string;
    title: string;
    number: number;
    url: string;
    repo: string;
    author: string;
    avatar_url?: string;
    component: string;
    component_name: string;
    severity: string;
    score: number;
    eligible: boolean;
    merged_at: string;
    additions: number;
    deletions: number;
  }[];
  period: { days: number; since: string };
};

export function MergeMintDashboard({ orgId, orgName: _orgName }: { orgId: string; orgName: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github/dashboard?orgId=${orgId}&days=${days}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch dashboard data');
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
  }, [orgId, days]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>Failed to load dashboard: {error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.hero.totalPrs === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <GitPullRequest className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No PR Data Yet</h3>
            <p className="text-muted-foreground max-w-md">
              Connect a GitHub repository and process some PRs to see analytics here.
            </p>
            <Button className="mt-4" onClick={() => window.location.href = '/home/onboarding'}>
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { hero } = data;

  return (
    <TooltipProvider>
    <div className="flex flex-col space-y-6 pb-36">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing data from the last {days} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboard}>
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v, 10))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hero Cards Row 1 - Key People & PRs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Weekly MVP */}
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardHeader className="pb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-sm font-medium flex items-center gap-2 cursor-help">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  {hero.isLastWeekMvp ? "Last Week's MVP" : "This Week's MVP"}
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  {hero.isLastWeekMvp 
                    ? "The developer with the highest score last week. No activity yet this week."
                    : "The developer with the highest total score this week. Based on eligible PRs merged since Sunday."
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            {hero.weeklyMvp ? (
              <Link href={`/home/developer/${hero.weeklyMvp.author}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <Avatar className="h-12 w-12 border-2 border-yellow-500">
                  <AvatarImage src={hero.weeklyMvp.avatar_url} />
                  <AvatarFallback>{hero.weeklyMvp.author[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold text-lg hover:underline">{hero.weeklyMvp.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {hero.weeklyMvp.pr_count} PRs {hero.isLastWeekMvp ? 'last week' : 'this week'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-500">{hero.weeklyMvp.score}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </Link>
            ) : (
              <p className="text-muted-foreground">No activity yet</p>
            )}
          </CardContent>
        </Card>

        {/* Highest Scoring PR */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader className="pb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-sm font-medium flex items-center gap-2 cursor-help">
                  <Trophy className="h-4 w-4 text-purple-500" />
                  Highest Scoring PR
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>The single PR with the highest score in the selected time period. Click to view on GitHub.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            {hero.highestScoringPr ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <a 
                    href={hero.highestScoringPr.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium hover:underline flex items-center gap-1 truncate max-w-[200px]"
                  >
                    {hero.highestScoringPr.title}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                  <Badge variant="secondary" className="text-purple-500">
                    {hero.highestScoringPr.score} pts
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href={`/home/developer/${hero.highestScoringPr.author}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={hero.highestScoringPr.avatar_url} />
                      <AvatarFallback className="text-xs">{hero.highestScoringPr.author[0]}</AvatarFallback>
                    </Avatar>
                    <span className="hover:underline">{hero.highestScoringPr.author}</span>
                  </Link>
                  <SeverityBadge severity={hero.highestScoringPr.severity} />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No eligible PRs yet</p>
            )}
          </CardContent>
        </Card>

        {/* Week Over Week */}
        <Card>
          <CardHeader className="pb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-sm font-medium flex items-center gap-2 cursor-help">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  This Week&apos;s Score
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Total points earned this week from eligible PRs. The percentage shows change compared to last week&apos;s performance.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{hero.thisWeekScore.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">points earned</p>
              </div>
              <div className={`flex items-center gap-1 text-sm ${hero.weekOverWeekChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {hero.weekOverWeekChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {Math.abs(hero.weekOverWeekChange)}% vs last week
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hero Cards Row 2 - Key Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <MetricCard
          icon={<Bug className="h-4 w-4" />}
          label="Critical Bugs Fixed"
          value={hero.criticalBugs}
          sublabel={hero.criticalBugsChange !== 0 ? `${hero.criticalBugsChange > 0 ? '+' : ''}${hero.criticalBugsChange} from last week` : 'P0 + P1 combined'}
          tooltip="Number of high-severity bugs (P0 and P1) fixed in this period. These are critical issues that significantly impact users or the product."
          variant="destructive"
        />
        <MetricCard
          icon={<Target className="h-4 w-4" />}
          label="Quality Index"
          value={`${hero.qualityIndex}%`}
          sublabel="PR eligibility rate"
          tooltip="Percentage of PRs that meet eligibility criteria (linked issues, proper documentation, tests). Higher is better. Target: 70%+"
          variant={hero.qualityIndex >= 70 ? 'success' : hero.qualityIndex >= 50 ? 'warning' : 'destructive'}
        />
        <MetricCard
          icon={<Users className="h-4 w-4" />}
          label="Active Devs"
          value={hero.activeContributors}
          sublabel="contributors this period"
          tooltip="Number of unique developers who have contributed at least one PR in the selected time period."
        />
        <MetricCard
          icon={<Zap className="h-4 w-4" />}
          label="Hottest Component"
          value={hero.hottestComponent?.name ?? '-'}
          sublabel={hero.hottestComponent ? `${hero.hottestComponent.count} PRs` : 'No data'}
          tooltip="The product component receiving the most attention. Indicates where the team is focusing bug fixes and improvements."
          variant="info"
        />
        <MetricCard
          icon={<Flame className="h-4 w-4" />}
          label="Activity Streak"
          value={`${hero.streak} days`}
          sublabel="consecutive PR days"
          tooltip="Number of consecutive days with at least one eligible PR merged. Encourages consistent contribution patterns."
          variant={hero.streak >= 5 ? 'success' : 'default'}
        />
        <MetricCard
          icon={<Star className="h-4 w-4" />}
          label="Avg per Dev"
          value={hero.avgScorePerDev}
          sublabel="points per contributor"
          tooltip="Average total score per developer. Calculated by dividing total score by number of active contributors. Indicates team efficiency."
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ScoreTrendChart data={data.scoreTrend} />
        <WeeklyBreakdownChart data={data.velocityTrend} />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Leaderboard */}
        <LeaderboardCard data={data.leaderboard} />
        
        {/* Top PRs + Component Distribution */}
        <div className="space-y-4">
          <TopPrsCard data={data.topPrs} />
          <ComponentDistributionChart data={data.componentScores} severityData={data.severityCounts} />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivityTable data={data.recentEvaluations} />
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
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel: string;
  tooltip: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
}) {
  const colors = {
    default: 'text-foreground',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    destructive: 'text-red-500',
    info: 'text-blue-500',
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
              <p className={`text-xl font-bold ${colors[variant]} truncate`}>{value}</p>
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

function ScoreTrendChart({ data }: { data: DashboardData['scoreTrend'] }) {
  const chartConfig = {
    score: { label: 'Score', color: 'hsl(var(--chart-1))' },
  } as const;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Score Trend
        </CardTitle>
        <CardDescription>Daily scores over the past 2 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-64 w-full" config={chartConfig}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-score)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-score)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} fontSize={11} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="score"
              type="monotone"
              fill="url(#fillScore)"
              stroke="var(--color-score)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function WeeklyBreakdownChart({ data }: { data: DashboardData['velocityTrend'] }) {
  const chartConfig = {
    score: { label: 'Score', color: 'hsl(var(--chart-2))' },
    total: { label: 'PRs', color: 'hsl(var(--chart-3))' },
  } as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Weekly Performance
        </CardTitle>
        <CardDescription>Score and PR count by week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-64 w-full" config={chartConfig}>
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} fontSize={11} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="score" fill="var(--color-score)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function LeaderboardCard({ data }: { data: DashboardData['leaderboard'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Medal className="h-5 w-5" />
          Leaderboard
        </CardTitle>
        <CardDescription>Top contributors by total score</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-6">#</TableHead>
              <TableHead>Developer</TableHead>
              <TableHead className="text-center">PRs</TableHead>
              <TableHead className="text-center">Avg</TableHead>
              <TableHead className="text-right pr-6">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 8).map((dev, idx) => (
              <TableRow key={dev.author}>
                <TableCell className="pl-6">
                  <RankBadge rank={idx + 1} />
                </TableCell>
                <TableCell>
                  <Link href={`/home/developer/${dev.author}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={dev.avatar_url} />
                      <AvatarFallback className="text-xs">{dev.author[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm hover:underline">{dev.author}</p>
                      {(dev.p0_count > 0 || dev.p1_count > 0) && (
                        <div className="flex gap-1">
                          {dev.p0_count > 0 && <Badge variant="destructive" className="text-[10px] px-1 py-0">{dev.p0_count} P0</Badge>}
                          {dev.p1_count > 0 && <Badge className="text-[10px] px-1 py-0">{dev.p1_count} P1</Badge>}
                        </div>
                      )}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-center text-sm">{dev.eligible_count}/{dev.pr_count}</TableCell>
                <TableCell className="text-center text-sm">{dev.avg_score}</TableCell>
                <TableCell className="text-right pr-6 font-bold">{dev.total_score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TopPrsCard({ data }: { data: DashboardData['topPrs'] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          Top Scoring PRs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.slice(0, 4).map((pr, idx) => (
          <div key={pr.id} className="flex items-center gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <a 
                href={pr.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline truncate block"
              >
                {pr.title}
              </a>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{pr.author}</span>
                <span>•</span>
                <SeverityBadge severity={pr.severity} small />
              </div>
            </div>
            <Badge variant="secondary" className="font-bold">{pr.score}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ComponentDistributionChart({ 
  data, 
  severityData 
}: { 
  data: DashboardData['componentScores']; 
  severityData: DashboardData['severityCounts'];
}) {
  // Using actual color values for SVG fills (CSS variables don't resolve in SVG)
  const COLORS = [
    '#a855f7', // purple-500
    '#7c3aed', // violet-600
    '#d946ef', // fuchsia-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
  ];
  
  const chartConfig = {
    value: { label: 'PRs' },
  } as const;

  // Combine component and severity for a quick view
  const pieData = data.slice(0, 5).map((item, idx) => ({
    name: item.component,
    value: item.count,
    fill: COLORS[idx % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" />
          PR Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <ChartContainer className="h-32 w-32" config={chartConfig}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={25}
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
                  <span className="truncate max-w-[100px]">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-3 pt-3 border-t">
          {severityData.map((item) => (
            <div key={item.severity} className="text-center">
              <SeverityBadge severity={item.severity} />
              <p className="text-xs text-muted-foreground mt-1">{item.count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivityTable({ data }: { data: DashboardData['recentEvaluations'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitPullRequest className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest evaluated pull requests</CardDescription>
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
                  <Badge variant="outline" className="text-xs">{pr.component_name}</Badge>
                </TableCell>
                <TableCell>
                  <SeverityBadge severity={pr.severity} />
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={pr.eligible ? 'default' : 'secondary'}>
                    {pr.score} pts
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-medium text-muted-foreground">{rank}</span>;
}

function SeverityBadge({ severity, small }: { severity: string; small?: boolean }) {
  const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    P0: 'destructive',
    P1: 'default',
    P2: 'secondary',
    P3: 'outline',
  };
  const className = small ? 'text-[10px] px-1.5 py-0' : '';
  return <Badge variant={variants[severity] ?? 'outline'} className={className}>{severity}</Badge>;
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
