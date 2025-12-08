/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Calendar } from '@kit/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import {
  Activity,
  AlertTriangle,
  Gauge,
  GitPullRequest,
  Medal,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

type DateRange = { from?: Date; to?: Date };

type LeaderboardRow = {
  login: string;
  score: number;
  prs: number;
  p0: number;
  p1: number;
  p2: number;
  p3: number;
};

type ComponentRow = { component: string; score: number };
type RecentPr = {
  title: string;
  component: string;
  severity: string;
  score: number;
  eligible: boolean;
};

const seedLeaderboard: LeaderboardRow[] = [
  { login: 'alice', score: 520, prs: 6, p0: 1, p1: 2, p2: 2, p3: 1 },
  { login: 'bob', score: 410, prs: 5, p0: 0, p1: 2, p2: 2, p3: 1 },
  { login: 'carol', score: 275, prs: 4, p0: 0, p1: 1, p2: 2, p3: 1 },
];

const seedComponent: ComponentRow[] = [
  { component: 'CORE_CHAT', score: 320 },
  { component: 'KNOWLEDGE_BASES', score: 260 },
  { component: 'AGENTS', score: 180 },
  { component: 'OTHER', score: 120 },
];

const seedPrs: RecentPr[] = [
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
    title: 'Missing tests for agent tool exec',
    component: 'AGENTS',
    severity: 'P3',
    score: 0,
    eligible: false,
  },
];

const periodOptions = [
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last 1 week' },
  { value: '30d', label: 'Last 1 month' },
  { value: 'custom', label: 'Custom range' },
];

export function DemoDashboardClient() {
  const [period, setPeriod] = useState<string>('30d');
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>(seedLeaderboard);
  const [componentActivity, setComponentActivity] =
    useState<ComponentRow[]>(seedComponent);
  const [recentPrs, setRecentPrs] = useState<RecentPr[]>(seedPrs);

  const periodLabel = useMemo(() => {
    if (period === 'custom' && customRange?.from && customRange?.to) {
      return `${customRange.from.toLocaleDateString()} → ${customRange.to.toLocaleDateString()}`;
    }

    const option = periodOptions.find((o) => o.value === period);
    return option?.label ?? 'Last 30 days';
  }, [period, customRange]);

  const totals = useMemo(() => {
    const score = leaderboard.reduce((acc, row) => acc + row.score, 0);
    const eligiblePrs = leaderboard.reduce((acc, row) => acc + row.prs, 0);
    const p0 = leaderboard.reduce((acc, row) => acc + row.p0, 0);
    const p1 = leaderboard.reduce((acc, row) => acc + row.p1, 0);
    return { score, eligiblePrs, p0, p1 };
  }, [leaderboard]);

  function randomizeDemo() {
    setLeaderboard(
      leaderboard.map((row) => ({
        ...row,
        score: Math.max(0, Math.round(row.score * randomFactor())),
        prs: Math.max(1, Math.round(row.prs * randomFactor())),
        p0: Math.max(0, Math.round(row.p0 * randomFactor())),
        p1: Math.max(0, Math.round(row.p1 * randomFactor())),
        p2: Math.max(0, Math.round(row.p2 * randomFactor())),
        p3: Math.max(0, Math.round(row.p3 * randomFactor())),
      })),
    );

    setComponentActivity(
      componentActivity.map((row) => ({
        ...row,
        score: Math.max(20, Math.round(row.score * randomFactor())),
      })),
    );

    setRecentPrs(
      recentPrs.map((pr) => ({
        ...pr,
        score: Math.max(0, Math.round(pr.score * randomFactor())),
        eligible: pr.eligible ? Math.random() > 0.1 : false,
      })),
    );
  }

  function randomFactor() {
    return 0.8 + Math.random() * 0.6; // 0.8x to 1.4x
  }

  return (
    <div className={'space-y-6'}>
      <Card>
        <CardHeader className={'flex flex-col gap-3 md:flex-row md:items-center md:justify-between'}>
          <div className={'flex flex-col gap-3 md:flex-row md:items-center'}>
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value)}
            >
              <SelectTrigger className={'w-44'}>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {period === 'custom' ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={'outline'}>
                    {customRange?.from && customRange?.to
                      ? `${customRange.from.toLocaleDateString()} → ${customRange.to.toLocaleDateString()}`
                      : 'Select dates'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="end">
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    selected={customRange as any}
                    onSelect={(range) =>
                      setCustomRange((range as DateRange) ?? undefined)
                    }
                  />
                </PopoverContent>
              </Popover>
            ) : null}
          </div>

          <Button variant={'secondary'} onClick={randomizeDemo}>
            <RefreshCw className={'mr-2 h-4 w-4'} />
            Randomize demo data
          </Button>
        </CardHeader>
      </Card>

      <div className={'grid gap-4 md:grid-cols-3'}>
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2'}>
              <Medal className={'h-4 w-4 text-primary'} />
              Total score ({periodLabel})
            </CardTitle>
          </CardHeader>
          <CardContent className={'text-3xl font-semibold'}>
            {totals.score}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2'}>
              <ShieldCheck className={'h-4 w-4 text-primary'} />
              Eligible PRs ({periodLabel})
            </CardTitle>
          </CardHeader>
          <CardContent className={'text-3xl font-semibold'}>
            {totals.eligiblePrs}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2'}>
              <AlertTriangle className={'h-4 w-4 text-primary'} />
              P0 / P1 fixes
            </CardTitle>
          </CardHeader>
          <CardContent className={'text-3xl font-semibold'}>
            {totals.p0} / {totals.p1}
          </CardContent>
        </Card>
      </div>

      <div className={'grid gap-4 lg:grid-cols-2'}>
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2'}>
              <Gauge className={'h-4 w-4 text-primary'} />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Developer</TableHead>
                  <TableHead className={'text-right'}>Score</TableHead>
                  <TableHead className={'text-right'}>PRs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((row) => (
                  <TableRow key={row.login}>
                    <TableCell className={'font-medium'}>@{row.login}</TableCell>
                    <TableCell className={'text-right'}>
                      {row.score}
                    </TableCell>
                    <TableCell className={'text-right'}>
                      {row.prs}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2'}>
              <Activity className={'h-4 w-4 text-primary'} />
              Component activity
            </CardTitle>
          </CardHeader>
          <CardContent className={'space-y-2'}>
            {componentActivity.map((item) => (
              <div
                key={item.component}
                className={
                  'flex items-center justify-between rounded-md border p-2 text-sm'
                }
              >
                <span className={'font-medium'}>{item.component}</span>
                <Badge variant={'secondary'}>{item.score} pts</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <GitPullRequest className={'h-4 w-4 text-primary'} />
            Recent evaluated PRs
          </CardTitle>
        </CardHeader>
        <CardContent className={'space-y-2'}>
          {recentPrs.map((pr) => (
            <div
              key={pr.title}
              className={
                'flex items-center justify-between rounded-md border p-3'
              }
            >
              <div>
                <p className={'font-medium'}>{pr.title}</p>
                <p className={'text-sm text-muted-foreground'}>
                  {pr.component} · {pr.severity}
                </p>
              </div>
              <Badge variant={pr.eligible ? 'default' : 'destructive'}>
                {pr.score} pts
              </Badge>
            </div>
          ))}

          <p className={'text-sm text-muted-foreground'}>
            This view will automatically populate with your organization’s real PRs once GitHub sync and evaluations run.
          </p>
        </CardContent>
      </Card>

      <div className={'text-sm text-muted-foreground'}>
        Ready for real data? Connect GitHub in the admin console and trigger a
        sync from{' '}
        <Link href={'/home/mergemint'} className={'underline'}>
          MergeMint Hub
        </Link>
        .
      </div>
    </div>
  );
}
