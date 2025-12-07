'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  Activity,
  ArrowLeft,
  Award,
  BarChart3,
  Bug,
  CheckCircle2,
  Code2,
  Download,
  ExternalLink,
  FileCode,
  Flame,
  GitPullRequest,
  Medal,
  Share2,
  Target,
  Trophy,
  Twitter,
  XCircle,
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
import { Progress } from '@kit/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@kit/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

type DeveloperData = {
  developer: {
    username: string;
    avatar_url?: string;
    github_user_id: number;
  };
  title: {
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    color: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    flavorText: string;
    badges: string[];
  };
  summary: {
    totalScore: number;
    totalPrs: number;
    eligiblePrs: number;
    avgScore: number;
    eligibilityRate: number;
    rank: number;
    totalDevs: number;
    totalAdditions: number;
    totalDeletions: number;
    avgPrSize: number;
  };
  bestPr: {
    title: string;
    number: number;
    url: string;
    score: number;
    severity: string;
    component: string;
  } | null;
  severityBreakdown: { severity: string; count: number; score: number }[];
  componentBreakdown: { key: string; name: string; count: number; score: number }[];
  repoBreakdown: { repo: string; count: number; score: number }[];
  scoreTrend: { week: string; label: string; score: number; prs: number; eligible: number }[];
  eligibilityIssues: {
    missing_issue: number;
    missing_fix: number;
    missing_link: number;
    missing_tests: number;
  };
  recentPrs: {
    id: string;
    title: string;
    number: number;
    url: string;
    repo: string;
    component: string;
    severity: string;
    score: number;
    eligible: boolean;
    merged_at: string;
    additions: number;
    deletions: number;
    impact_summary: string;
    eligibility: {
      issue: boolean;
      fix: boolean;
      link: boolean;
      tests: boolean;
    };
  }[];
  period: { days: number; since: string };
};

export function DeveloperAnalytics({ username, orgId }: { username: string; orgId: string }) {
  const [data, setData] = useState<DeveloperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(90);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/github/developer/${username}?orgId=${orgId}&days=${days}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch developer data');
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [username, orgId, days]);

  if (loading) {
    return <DeveloperSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>Failed to load developer data: {error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Developer not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { developer, summary, title } = data;

  const rarityColors = {
    common: 'from-gray-500/10 to-gray-600/10 border-gray-500/20',
    uncommon: 'from-green-500/10 to-emerald-600/10 border-green-500/20',
    rare: 'from-blue-500/10 to-cyan-600/10 border-blue-500/20',
    epic: 'from-purple-500/10 to-pink-600/10 border-purple-500/20',
    legendary: 'from-yellow-500/10 to-orange-600/10 border-yellow-500/20',
  };

  const rarityTextColors = {
    common: 'text-gray-500',
    uncommon: 'text-green-500',
    rare: 'text-blue-500',
    epic: 'text-purple-500',
    legendary: 'text-yellow-500',
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col space-y-6 pb-36">
        {/* Back button and period selector */}
        <div className="flex items-center justify-between">
          <Link href="/home">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v, 10))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Title Card */}
        <Card className={`bg-gradient-to-br ${rarityColors[title.rarity]} overflow-hidden relative`}>
          <div className="absolute top-0 right-0 text-[120px] opacity-10 -mr-4 -mt-4 select-none">
            {title.icon}
          </div>
          {/* Share Button */}
          <div className="absolute top-4 right-4 z-10">
            <ShareButton username={developer.username} orgId={orgId} title={title} summary={summary} />
          </div>
          <CardContent className="pt-6 pb-4">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                  <AvatarImage src={developer.avatar_url} />
                  <AvatarFallback className="text-3xl">{developer.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 text-4xl">{title.icon}</div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <Badge 
                    variant="outline" 
                    className={`${rarityTextColors[title.rarity]} border-current uppercase text-xs tracking-wider`}
                  >
                    {title.rarity}
                  </Badge>
                  {summary.rank <= 3 && (
                    <Badge variant="secondary" className="gap-1">
                      <Medal className={`h-3 w-3 ${summary.rank === 1 ? 'text-yellow-500' : summary.rank === 2 ? 'text-gray-400' : 'text-amber-600'}`} />
                      #{summary.rank}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-1">{developer.username}</h1>
                <h2 className={`text-3xl font-black ${title.color} mb-1`}>{title.title}</h2>
                <p className="text-sm text-muted-foreground mb-2">{title.subtitle}</p>
                <p className="text-sm italic text-muted-foreground max-w-md">
                  "{title.flavorText}"
                </p>
                {title.badges.length > 0 && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                    {title.badges.map((badge) => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 text-center">
                <div className="bg-background/50 rounded-lg px-6 py-3">
                  <p className="text-4xl font-black text-primary">{summary.totalScore.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Score</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Ranked #{summary.rank} of {summary.totalDevs}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Title Description */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{title.icon}</div>
              <div>
                <h3 className={`font-bold ${title.color}`}>{title.title}</h3>
                <p className="text-sm text-muted-foreground">{title.description}</p>
              </div>
              {data.bestPr && (
                <div className="ml-auto hidden md:block">
                  <div className="flex items-center gap-2 text-yellow-600 text-xs mb-1">
                    <Trophy className="h-3 w-3" />
                    Best PR
                  </div>
                  <a 
                    href={data.bestPr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sm hover:underline block truncate max-w-[200px]"
                  >
                    {data.bestPr.title}
                  </a>
                  <div className="flex items-center gap-2 mt-1">
                    <SeverityBadge severity={data.bestPr.severity} />
                    <span className="text-sm font-bold text-yellow-600">{data.bestPr.score} pts</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard
            icon={<GitPullRequest className="h-4 w-4 text-primary" />}
            label="Total PRs"
            value={summary.totalPrs}
            sublabel={`${summary.eligiblePrs} eligible`}
          />
          <StatCard
            icon={<Target className="h-4 w-4 text-emerald-500" />}
            label="Avg Score"
            value={summary.avgScore}
            sublabel="per PR"
          />
          <StatCard
            icon={<Code2 className="h-4 w-4 text-green-500" />}
            label="Lines Added"
            value={`+${summary.totalAdditions.toLocaleString()}`}
            className="text-green-500"
          />
          <StatCard
            icon={<Code2 className="h-4 w-4 text-red-500" />}
            label="Lines Removed"
            value={`-${summary.totalDeletions.toLocaleString()}`}
            className="text-red-500"
          />
          <StatCard
            icon={<FileCode className="h-4 w-4" />}
            label="Eligibility"
            value={`${summary.eligibilityRate}%`}
            sublabel="rate"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ScoreTrendChart data={data.scoreTrend} />
          <div className="space-y-4">
            <SeverityBreakdownChart data={data.severityBreakdown} />
            <ComponentBreakdownChart data={data.componentBreakdown} />
          </div>
        </div>

        {/* Eligibility Analysis */}
        <EligibilityAnalysisCard 
          issues={data.eligibilityIssues} 
          totalPrs={summary.totalPrs}
          eligibilityRate={summary.eligibilityRate}
        />

        {/* Recent PRs */}
        <RecentPrsTable data={data.recentPrs} />
      </div>
    </TooltipProvider>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  className?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className={`text-xl font-bold ${className ?? ''}`}>{value}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </CardContent>
    </Card>
  );
}

function ScoreTrendChart({ data }: { data: DeveloperData['scoreTrend'] }) {
  const chartConfig = {
    score: { label: 'Score', color: 'hsl(var(--chart-1))' },
    prs: { label: 'PRs', color: 'hsl(var(--chart-2))' },
  } as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Score Trend
        </CardTitle>
        <CardDescription>Weekly performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-64 w-full" config={chartConfig}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="devFillScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-score)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-score)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} fontSize={11} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="score"
              type="monotone"
              fill="url(#devFillScore)"
              stroke="var(--color-score)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function SeverityBreakdownChart({ data }: { data: DeveloperData['severityBreakdown'] }) {
  const COLORS = ['hsl(0, 84%, 60%)', 'hsl(25, 95%, 53%)', 'hsl(48, 96%, 53%)', 'hsl(142, 71%, 45%)'];
  
  const chartConfig = {
    count: { label: 'PRs' },
  } as const;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4" />
          Severity Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <ChartContainer className="h-24 w-24" config={chartConfig}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={40}
                paddingAngle={2}
                dataKey="count"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex-1 space-y-1">
            {data.map((item, idx) => (
              <div key={item.severity} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span>{item.severity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{item.count} PRs</span>
                  <span className="font-medium">{item.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ComponentBreakdownChart({ data }: { data: DeveloperData['componentBreakdown'] }) {
  const chartConfig = {
    score: { label: 'Score', color: 'hsl(var(--chart-3))' },
  } as const;

  const topComponents = data.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4" />
          Top Components
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topComponents.map((item, idx) => (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate max-w-[150px]">{item.name}</span>
                <span className="text-muted-foreground">{item.count} PRs • {item.score} pts</span>
              </div>
              <Progress 
                value={(item.score / (topComponents[0]?.score || 1)) * 100} 
                className="h-2" 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EligibilityAnalysisCard({ 
  issues, 
  totalPrs,
  eligibilityRate,
}: { 
  issues: DeveloperData['eligibilityIssues']; 
  totalPrs: number;
  eligibilityRate: number;
}) {
  const items = [
    { label: 'Missing Issue Link', count: issues.missing_issue, icon: Bug },
    { label: 'Incomplete Fix', count: issues.missing_fix, icon: Target },
    { label: 'No PR Documentation', count: issues.missing_link, icon: FileCode },
    { label: 'Missing Tests', count: issues.missing_tests, icon: CheckCircle2 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Eligibility Analysis
        </CardTitle>
        <CardDescription>
          Areas to improve for higher eligibility rate (currently {eligibilityRate}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50 cursor-help">
                  <item.icon className={`h-6 w-6 mb-2 ${item.count > 0 ? 'text-amber-500' : 'text-green-500'}`} />
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-xs text-center text-muted-foreground">{item.label}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.count} of {totalPrs} PRs had this issue</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentPrsTable({ data }: { data: DeveloperData['recentPrs'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitPullRequest className="h-5 w-5" />
          Recent Pull Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pull Request</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Eligibility</TableHead>
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
                  <p className="text-xs text-muted-foreground">{pr.repo}#{pr.number}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{pr.component}</Badge>
                </TableCell>
                <TableCell>
                  <SeverityBadge severity={pr.severity} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <EligibilityIcon passed={pr.eligibility.issue} label="Issue" />
                    <EligibilityIcon passed={pr.eligibility.fix} label="Fix" />
                    <EligibilityIcon passed={pr.eligibility.link} label="Link" />
                    <EligibilityIcon passed={pr.eligibility.tests} label="Tests" />
                  </div>
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

function EligibilityIcon({ passed, label }: { passed: boolean; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        {passed ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}: {passed ? 'Passed' : 'Failed'}</p>
      </TooltipContent>
    </Tooltip>
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

function ShareButton({ 
  username, 
  orgId, 
  title, 
  summary 
}: { 
  username: string; 
  orgId: string;
  title: DeveloperData['title'];
  summary: DeveloperData['summary'];
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const ogImageUrl = `/api/og/developer/${username}?orgId=${orgId}`;
  
  const shareText = `${title.icon} I'm "${title.title}" on MergeMint!\n\n🏆 Total Score: ${summary.totalScore.toLocaleString()}\n📊 ${summary.eligiblePrs} Eligible PRs\n⭐ ${summary.avgScore} Avg Score\n\nTrack your dev contributions at mergemint.app`;
  
  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(ogImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${username}-mergemint-card.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://mergemint.app')}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      // Could add a toast notification here
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username}'s MergeMint Card`,
          text: shareText,
          url: 'https://mergemint.app',
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleDownloadImage} disabled={isGenerating}>
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Download Card'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareTwitter}>
          <Twitter className="h-4 w-4 mr-2" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareLinkedIn}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Copy Text
        </DropdownMenuItem>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="h-4 w-4 mr-2" />
            More Options...
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DeveloperSkeleton() {
  return (
    <div className="flex flex-col space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-4 mt-4">
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

