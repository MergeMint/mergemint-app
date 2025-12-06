'use client';

import { Award, Flame, GitPullRequest, Shield, ShieldCheck } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const scoreTrend = [
  { day: 'Mon', score: 120, eligible: 3, avg: 40 },
  { day: 'Tue', score: 160, eligible: 4, avg: 53 },
  { day: 'Wed', score: 95, eligible: 2, avg: 48 },
  { day: 'Thu', score: 210, eligible: 5, avg: 42 },
  { day: 'Fri', score: 180, eligible: 4, avg: 45 },
  { day: 'Sat', score: 90, eligible: 2, avg: 45 },
  { day: 'Sun', score: 140, eligible: 3, avg: 46 },
];

const componentScores = [
  { component: 'CORE_CHAT', score: 320 },
  { component: 'KNOWLEDGE_BASES', score: 260 },
  { component: 'AGENTS', score: 180 },
  { component: 'OTHER', score: 120 },
];

const severityCounts = [
  { severity: 'P0', count: 2 },
  { severity: 'P1', count: 6 },
  { severity: 'P2', count: 9 },
  { severity: 'P3', count: 4 },
];

const recentEvaluations = [
  {
    title: 'Fix message delivery race condition',
    component: 'CORE_CHAT',
    severity: 'P1',
    score: 150,
    eligible: true,
  },
  {
    title: 'Improve KB indexing retries',
    component: 'KNOWLEDGE_BASES',
    severity: 'P2',
    score: 40,
    eligible: true,
  },
  {
    title: 'Harden agent tool sandboxing',
    component: 'AGENTS',
    severity: 'P0',
    score: 0,
    eligible: false,
  },
  {
    title: 'Polish notification copy',
    component: 'OTHER',
    severity: 'P3',
    score: 10,
    eligible: true,
  },
];

export default function DashboardDemo() {
  return (
    <div className={'flex flex-col space-y-4 pb-36'}>
      <div className={'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'}>
        <MetricCard
          title="Total score (7d)"
          value="920"
          icon={<Award className="h-4 w-4 text-primary" />}
          description="Sum of eligible PR scores"
          trend="up 12%"
        />
        <MetricCard
          title="Eligible PRs"
          value="23"
          icon={<ShieldCheck className="h-4 w-4 text-primary" />}
          description="Merged and passed all gates"
          trend="up 8%"
        />
        <MetricCard
          title="P0 / P1 fixes"
          value="2 / 6"
          icon={<Flame className="h-4 w-4 text-primary" />}
          description="Critical and high severity"
          trend="flat"
        />
        <MetricCard
          title="Avg score / PR"
          value="73"
          icon={<GitPullRequest className="h-4 w-4 text-primary" />}
          description="Eligible PRs only"
          trend="up 5%"
        />
      </div>

      <div className={'grid gap-4 lg:grid-cols-3'}>
        <ScoreTrend />
        <ComponentChart />
      </div>

      <div className={'grid gap-4 lg:grid-cols-3'}>
        <SeverityChart />
        <RecentEvaluations />
      </div>
    </div>
  );
}

function MetricCard(props: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          {props.icon}
          {props.title}
        </CardTitle>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
      <CardContent className={'space-y-1'}>
        <div className={'text-3xl font-semibold'}>{props.value}</div>
        <div className={'text-sm text-muted-foreground'}>{props.trend}</div>
      </CardContent>
    </Card>
  );
}

function ScoreTrend() {
  const chartConfig = {
    score: {
      label: 'Score',
      color: 'var(--chart-1)',
    },
    eligible: {
      label: 'Eligible PRs',
      color: 'var(--chart-2)',
    },
    avg: {
      label: 'Avg / PR',
      color: 'var(--chart-3)',
    },
  } as const;

  return (
    <Card className={'lg:col-span-2'}>
      <CardHeader>
        <CardTitle>Score over time</CardTitle>
        <CardDescription>Eligible PR scores across the past week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className={'h-64 w-full'} config={chartConfig}>
          <AreaChart data={scoreTrend}>
            <defs>
              <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-score)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-score)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillEligible" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-eligible)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-eligible)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="score"
              type="natural"
              fill="url(#fillScore)"
              fillOpacity={0.6}
              stroke="var(--color-score)"
              strokeWidth={2}
            />
            <Area
              dataKey="eligible"
              type="natural"
              fill="url(#fillEligible)"
              fillOpacity={0.4}
              stroke="var(--color-eligible)"
              strokeWidth={2}
            />
            <Line
              dataKey="avg"
              stroke="var(--color-avg, var(--chart-4))"
              strokeWidth={2}
              dot={false}
              type="natural"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ComponentChart() {
  const chartConfig = {
    score: {
      label: 'Score',
      color: 'var(--chart-3)',
    },
  } as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Component scores</CardTitle>
        <CardDescription>Totals by mapped product component</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className={'h-64 w-full'} config={chartConfig}>
          <BarChart data={componentScores}>
            <defs>
              <linearGradient id="fillComponent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-score)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--color-score)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="component"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="score"
              fill="url(#fillComponent)"
              radius={[10, 10, 6, 6]}
              barSize={36}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function SeverityChart() {
  const chartConfig = {
    count: {
      label: 'Count',
      color: 'var(--chart-4)',
    },
  } as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Severity distribution</CardTitle>
        <CardDescription>Eligible PRs by severity level</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className={'h-64 w-full'} config={chartConfig}>
          <BarChart data={severityCounts}>
            <defs>
              <linearGradient id="fillSeverity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-count)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--color-count)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="severity" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="count"
              fill="url(#fillSeverity)"
              radius={[10, 10, 6, 6]}
              barSize={36}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function RecentEvaluations() {
  return (
    <Card className={'lg:col-span-2'}>
      <CardHeader>
        <CardTitle>Recent evaluated PRs</CardTitle>
        <CardDescription>Sample evaluations for the current period</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PR</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead className={'text-right'}>Score</TableHead>
              <TableHead className={'text-right'}>Eligibility</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentEvaluations.map((pr) => (
              <TableRow key={pr.title}>
                <TableCell className={'font-medium'}>{pr.title}</TableCell>
                <TableCell>
                  <Badge variant={'secondary'}>{pr.component}</Badge>
                </TableCell>
                <TableCell>
                  <Badge>{pr.severity}</Badge>
                </TableCell>
                <TableCell className={'text-right'}>
                  <Badge variant={pr.eligible ? 'default' : 'destructive'}>
                    {pr.score} pts
                  </Badge>
                </TableCell>
                <TableCell className={'text-right'}>
                  {pr.eligible ? (
                    <Badge variant={'success'}>Eligible</Badge>
                  ) : (
                    <Badge variant={'destructive'}>Ineligible</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className={'text-sm text-muted-foreground'}>
        This is sample data shown while GitHub sync and LLM evaluations are not yet available.
      </CardFooter>
    </Card>
  );
}
