'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Progress } from '@kit/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kit/ui/tabs';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  FastForward,
  GitMerge,
  GitPullRequest,
  Loader2,
  Mail,
  MailCheck,
  Medal,
  Play,
  RefreshCcw,
  Square,
  Trophy,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

type ComponentInfo = {
  id: string;
  key: string;
  name: string;
  multiplier: number;
};

type SeverityInfo = {
  id: string;
  key: string;
  name: string;
  base_points: number;
};

type PRInfo = {
  repo_id: string;
  repo_full_name: string;
  pr: {
    id: number;
    number: number;
    title: string;
    body: string | null;
    merged_at: string | null;
    created_at: string;
    html_url: string;
    additions: number;
    deletions: number;
    changed_files: number;
    user: { id: number; login: string; avatar_url?: string };
    head: { sha: string };
    base: { sha: string };
  };
};

type EvaluationResult = {
  id: string;
  pr_id: string;
  component: { key: string; name: string; multiplier: number };
  severity: { key: string; name: string; base_points: number };
  eligibility: {
    issue: boolean;
    fix_implementation: boolean;
    pr_linked: boolean;
    tests: boolean;
  };
  is_eligible: boolean;
  base_points: number;
  multiplier: number;
  final_score: number;
  justification_component: string;
  justification_severity: string;
  impact_summary: string;
  eligibility_notes: string;
  author: string;
};

type ProcessedPR = PRInfo & {
  status: 'pending' | 'processing' | 'completed' | 'error' | 'skipped';
  evaluation?: EvaluationResult;
  error?: string;
  github_pr_id?: number; // To match against existing evaluations
};

type LeaderboardEntry = {
  author: string;
  avatar_url?: string;
  total_score: number;
  pr_count: number;
  eligible_count: number;
  p0_count: number;
  p1_count: number;
  p2_count: number;
  p3_count: number;
};

type ContributorInviteStatus = 'idle' | 'sending' | 'sent' | 'error';

export function ProcessingClient({
  orgId,
  orgSlug,
  orgName,
  components: _components,
  severityLevels: _severityLevels,
}: {
  orgId: string;
  orgSlug: string;
  orgName: string;
  components: ComponentInfo[];
  severityLevels: SeverityInfo[];
}) {
  const [prs, setPRs] = useState<ProcessedPR[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [_phase, setPhase] = useState<'idle' | 'fetching' | 'processing' | 'done'>('idle');
  const stopRequestedRef = useRef(false);
  const [evaluatedPrIds, setEvaluatedPrIds] = useState<Set<number>>(new Set());

  // Contributor invitation state
  const [inviteStatuses, setInviteStatuses] = useState<Record<string, ContributorInviteStatus>>({});
  const [inviteUrls, setInviteUrls] = useState<Record<string, string>>({});
  const [invitingAll, setInvitingAll] = useState(false);
  const [contributorEmails, setContributorEmails] = useState<Record<string, string | null>>({});
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [emailsSent, setEmailsSent] = useState<Record<string, boolean>>({});

  const fetchPRs = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPhase('fetching');
    try {
      // Fetch PRs and existing evaluations in parallel
      const [prsRes, evalsRes] = await Promise.all([
        fetch(`/api/github/merged-prs?orgId=${orgId}&months=3`),
        fetch(`/api/github/evaluations?orgId=${orgId}&months=3`),
      ]);

      if (!prsRes.ok) {
        const err = await prsRes.json();
        throw new Error(err.error || 'Failed to fetch PRs');
      }

      const prsData = await prsRes.json();

      // Get set of already-evaluated PR IDs
      let evaluatedIds = new Set<number>();
      if (evalsRes.ok) {
        const evalsData = await evalsRes.json();
        evaluatedIds = new Set(
          (evalsData.evaluations ?? []).map((e: any) => e.pr?.id).filter(Boolean)
        );
        setEvaluatedPrIds(evaluatedIds);
      }

      // Mark PRs as completed if already evaluated
      setPRs(
        prsData.prs.map((pr: PRInfo) => ({
          ...pr,
          github_pr_id: pr.pr.id,
          status: evaluatedIds.has(pr.pr.id) ? 'completed' as const : 'pending' as const,
        })),
      );
      setPhase('idle');
    } catch (err) {
      setError((err as Error).message);
      setPhase('idle');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const processPR = useCallback(
    async (prData: ProcessedPR): Promise<EvaluationResult | null> => {
      try {
        const res = await fetch('/api/github/process-pr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orgId,
            repoId: prData.repo_id,
            repoFullName: prData.repo_full_name,
            prNumber: prData.pr.number,
            prId: prData.pr.id,
            prTitle: prData.pr.title,
            prBody: prData.pr.body,
            prAuthor: prData.pr.user.login,
            prAuthorId: prData.pr.user.id,
            prAuthorAvatar: prData.pr.user.avatar_url,
            prUrl: prData.pr.html_url,
            mergedAt: prData.pr.merged_at,
            createdAt: prData.pr.created_at,
            additions: prData.pr.additions,
            deletions: prData.pr.deletions,
            changedFiles: prData.pr.changed_files,
            headSha: prData.pr.head.sha,
            baseSha: prData.pr.base.sha,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to process PR');
        }

        const result = await res.json();
        return result.evaluation;
      } catch (err) {
        console.error('Error processing PR:', err);
        throw err;
      }
    },
    [orgId],
  );

  const startProcessing = useCallback(async () => {
    if (prs.length === 0) return;

    // Reset stop flag
    stopRequestedRef.current = false;
    setProcessing(true);
    setPhase('processing');

    // Find first pending PR to start from
    const pendingPRs = prs.filter((pr) => pr.status === 'pending');
    if (pendingPRs.length === 0) {
      setProcessing(false);
      setPhase('done');
      return;
    }

    for (let i = 0; i < prs.length; i++) {
      // Check if stop was requested
      if (stopRequestedRef.current) {
        console.log('Processing stopped by user');
        break;
      }

      const currentPR = prs[i]!;

      // Skip already processed PRs
      if (currentPR.status === 'completed' || currentPR.status === 'skipped') {
        continue;
      }

      setCurrentIndex(i);

      // Update status to processing
      setPRs((prev) =>
        prev.map((pr, idx) =>
          idx === i ? { ...pr, status: 'processing' as const } : pr,
        ),
      );

      try {
        const evaluation = await processPR(currentPR);
        setPRs((prev) =>
          prev.map((pr, idx) =>
            idx === i
              ? { ...pr, status: 'completed' as const, evaluation: evaluation! }
              : pr,
          ),
        );
      } catch (err) {
        setPRs((prev) =>
          prev.map((pr, idx) =>
            idx === i
              ? { ...pr, status: 'error' as const, error: (err as Error).message }
              : pr,
          ),
        );
      }

      // Check stop flag again after processing
      if (stopRequestedRef.current) {
        break;
      }

      // Small delay between requests to avoid rate limiting
      if (i < prs.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setProcessing(false);
    setPhase('done');
  }, [prs, processPR]);

  const stopProcessing = useCallback(() => {
    stopRequestedRef.current = true;
  }, []);

  // Calculate leaderboard (moved up so inviteAll can reference it)
  const leaderboard: LeaderboardEntry[] = Object.values(
    prs
      .filter((pr) => pr.status === 'completed' && pr.evaluation)
      .reduce(
        (acc, pr) => {
          const author = pr.evaluation!.author;
          if (!acc[author]) {
            acc[author] = {
              author,
              avatar_url: pr.pr.user.avatar_url,
              total_score: 0,
              pr_count: 0,
              eligible_count: 0,
              p0_count: 0,
              p1_count: 0,
              p2_count: 0,
              p3_count: 0,
            };
          }
          acc[author].pr_count++;
          if (pr.evaluation!.is_eligible) {
            acc[author].total_score += pr.evaluation!.final_score;
            acc[author].eligible_count++;
          }
          const severity = pr.evaluation!.severity.key;
          if (severity === 'P0') acc[author].p0_count++;
          else if (severity === 'P1') acc[author].p1_count++;
          else if (severity === 'P2') acc[author].p2_count++;
          else if (severity === 'P3') acc[author].p3_count++;
          return acc;
        },
        {} as Record<string, LeaderboardEntry>,
      ),
  ).sort((a, b) => b.total_score - a.total_score);

  // Get unique repos from processed PRs
  const uniqueRepos = [...new Set(prs.map(pr => pr.repo_full_name))];

  // Fetch contributor emails from commit data
  const fetchContributorEmails = useCallback(async () => {
    if (leaderboard.length === 0) return;

    setLoadingEmails(true);
    try {
      const usernames = leaderboard.map(c => c.author);
      const res = await fetch('/api/github/contributor-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          usernames,
          repos: uniqueRepos,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setContributorEmails(data.emails || {});
      }
    } catch (err) {
      console.error('Failed to fetch contributor emails:', err);
    } finally {
      setLoadingEmails(false);
    }
  }, [orgId, leaderboard, uniqueRepos]);

  // Fetch emails when leaderboard is ready
  useEffect(() => {
    if (leaderboard.length > 0 && Object.keys(contributorEmails).length === 0 && !loadingEmails) {
      fetchContributorEmails();
    }
  }, [leaderboard.length, contributorEmails, loadingEmails, fetchContributorEmails]);

  // Send invitation to a contributor
  const sendInvite = useCallback(async (githubLogin: string, avatarUrl?: string) => {
    setInviteStatuses(prev => ({ ...prev, [githubLogin]: 'sending' }));

    // Get email for this contributor
    const email = contributorEmails[githubLogin] || undefined;

    try {
      const res = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          githubLogin,
          avatarUrl,
          email, // Include email if available
          role: 'member',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create invitation');
      }

      const data = await res.json();
      setInviteStatuses(prev => ({ ...prev, [githubLogin]: 'sent' }));
      setInviteUrls(prev => ({ ...prev, [githubLogin]: data.invitation.inviteUrl }));

      // Track if email was sent
      if (data.invitation.emailSent) {
        setEmailsSent(prev => ({ ...prev, [githubLogin]: true }));
      }

      return data.invitation;
    } catch (err) {
      setInviteStatuses(prev => ({ ...prev, [githubLogin]: 'error' }));
      toast.error(`Failed to create invite for ${githubLogin}`, {
        description: (err as Error).message,
      });
      return null;
    }
  }, [orgId, contributorEmails]);

  // Invite all contributors at once
  const inviteAll = useCallback(async () => {
    setInvitingAll(true);
    const uninvited = leaderboard.filter(c => inviteStatuses[c.author] !== 'sent');

    let successCount = 0;
    let emailCount = 0;
    for (const contributor of uninvited) {
      const result = await sendInvite(contributor.author, contributor.avatar_url);
      if (result) {
        successCount++;
        if (result.emailSent) emailCount++;
      }
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setInvitingAll(false);
    if (successCount > 0) {
      if (emailCount > 0) {
        toast.success(`Sent ${emailCount} email${emailCount > 1 ? 's' : ''} and created ${successCount - emailCount} invite link${successCount - emailCount !== 1 ? 's' : ''}`);
      } else {
        toast.success(`Created ${successCount} invite link${successCount > 1 ? 's' : ''}`);
      }
    }
  }, [leaderboard, inviteStatuses, sendInvite]);

  const copyInviteUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied to clipboard');
  }, []);

  const copyAllInviteUrls = useCallback(() => {
    const urls = Object.values(inviteUrls).filter(Boolean);
    if (urls.length === 0) {
      toast.error('No invite links to copy');
      return;
    }
    navigator.clipboard.writeText(urls.join('\n'));
    toast.success(`Copied ${urls.length} invite link${urls.length > 1 ? 's' : ''} to clipboard`);
  }, [inviteUrls]);

  // Ineligible PRs
  const ineligiblePRs = prs.filter(
    (pr) => pr.status === 'completed' && pr.evaluation && !pr.evaluation.is_eligible,
  );

  // Eligible PRs
  const eligiblePRs = prs.filter(
    (pr) => pr.status === 'completed' && pr.evaluation?.is_eligible,
  );

  // Calculate progress
  const processedCount = prs.filter((pr) => pr.status === 'completed' || pr.status === 'error').length;
  const pendingCount = prs.filter((pr) => pr.status === 'pending').length;
  const skippedCount = prs.filter((pr) => pr.status === 'skipped').length;
  const progress = prs.length > 0 ? (processedCount / prs.length) * 100 : 0;

  // Load existing evaluations on mount
  const loadExistingEvaluations = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/github/evaluations?orgId=${orgId}&months=3`);
      if (!res.ok) return false;
      const data = await res.json();
      if (data.evaluations?.length > 0) {
        setPRs(data.evaluations);
        setPhase('done');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to load existing evaluations:', err);
      return false;
    }
  }, [orgId]);

  // Auto-fetch on mount
  useEffect(() => {
    let mounted = true;
    
    async function init() {
      // First try to load existing evaluations
      const hasExisting = await loadExistingEvaluations();
      if (mounted && !hasExisting) {
        // If no existing evaluations, fetch PRs
        fetchPRs();
      }
    }
    
    init();
    
    return () => {
      mounted = false;
    };
  }, [fetchPRs, loadExistingEvaluations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PR Processing</h1>
          <p className="text-muted-foreground">
            Analyzing merged PRs for {orgName || orgSlug}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchPRs}
            disabled={loading || processing}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {processing ? (
            <Button
              variant="destructive"
              onClick={stopProcessing}
            >
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button
              onClick={startProcessing}
              disabled={loading || prs.length === 0 || pendingCount === 0}
            >
              {pendingCount === 0 && processedCount > 0 ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  All Processed
                </>
              ) : pendingCount < prs.length && pendingCount > 0 ? (
                <>
                  <FastForward className="mr-2 h-4 w-4" />
                  Continue ({pendingCount} remaining)
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Processing
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total PRs</CardTitle>
            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prs.length}</div>
            <p className="text-xs text-muted-foreground">Last 3 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              {pendingCount === 0 ? 'All done!' : 'Awaiting processing'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedCount}</div>
            <p className="text-xs text-muted-foreground">
              {prs.length > 0 ? `${Math.round(progress)}% complete` : 'Waiting...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eligible</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{eligiblePRs.length}</div>
            <p className="text-xs text-muted-foreground">Scored PRs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ineligible</CardTitle>
            <XCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{ineligiblePRs.length}</div>
            <p className="text-xs text-muted-foreground">Not scored</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {processing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Processing PR {currentIndex + 1} of {prs.length}
                </span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {prs[currentIndex] && (
                <p className="text-xs text-muted-foreground truncate">
                  {prs[currentIndex].pr.title}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="eligible" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Eligible ({eligiblePRs.length})
          </TabsTrigger>
          <TabsTrigger value="ineligible" className="gap-2">
            <XCircle className="h-4 w-4" />
            Ineligible ({ineligiblePRs.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <GitMerge className="h-4 w-4" />
            All PRs
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Developer Leaderboard
              </CardTitle>
              <CardDescription>
                Ranked by total contribution score from merged PRs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>Developer</TableHead>
                      <TableHead className="text-center">PRs</TableHead>
                      <TableHead className="text-center">P0</TableHead>
                      <TableHead className="text-center">P1</TableHead>
                      <TableHead className="text-center">P2</TableHead>
                      <TableHead className="text-center">P3</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry, idx) => (
                      <TableRow key={entry.author}>
                        <TableCell>
                          <RankBadge rank={idx + 1} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.avatar_url ? (
                              <img
                                src={entry.avatar_url}
                                alt={entry.author}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                {entry.author[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{entry.author}</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.eligible_count} eligible / {entry.pr_count} total
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{entry.pr_count}</TableCell>
                        <TableCell className="text-center">
                          {entry.p0_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {entry.p0_count}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.p1_count > 0 && (
                            <Badge variant="default" className="text-xs">
                              {entry.p1_count}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.p2_count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {entry.p2_count}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.p3_count > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {entry.p3_count}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-lg font-bold">{entry.total_score}</span>
                          <span className="text-xs text-muted-foreground ml-1">pts</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {processing
                      ? 'Processing PRs... Leaderboard will appear soon.'
                      : 'No data yet. Start processing to see the leaderboard.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Eligible PRs Tab */}
        <TabsContent value="eligible">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Eligible PRs
              </CardTitle>
              <CardDescription>
                PRs that passed all eligibility checks and were scored
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eligiblePRs.length > 0 ? (
                <div className="space-y-3">
                  {eligiblePRs.map((pr) => (
                    <PRCard key={`${pr.repo_full_name}-${pr.pr.number}`} pr={pr} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CheckCircle2}
                  message={
                    processing
                      ? 'Processing... Eligible PRs will appear here.'
                      : 'No eligible PRs found yet.'
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ineligible PRs Tab */}
        <TabsContent value="ineligible">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-orange-500" />
                Ineligible PRs
              </CardTitle>
              <CardDescription>
                PRs that did not pass eligibility checks (score = 0)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ineligiblePRs.length > 0 ? (
                <div className="space-y-3">
                  {ineligiblePRs.map((pr) => (
                    <PRCard key={`${pr.repo_full_name}-${pr.pr.number}`} pr={pr} showReason />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={XCircle}
                  message={
                    processing
                      ? 'Processing... Ineligible PRs will appear here.'
                      : 'No ineligible PRs found.'
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All PRs Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitMerge className="h-5 w-5" />
                All Merged PRs
              </CardTitle>
              <CardDescription>
                Complete list of PRs from the last 3 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Status</TableHead>
                      <TableHead>PR</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Component</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prs.map((pr) => (
                      <TableRow key={`${pr.repo_full_name}-${pr.pr.number}`}>
                        <TableCell>
                          <StatusIcon status={pr.status} />
                        </TableCell>
                        <TableCell>
                          <a
                            href={pr.pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            <div className="max-w-xs">
                              <p className="font-medium truncate">{pr.pr.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {pr.repo_full_name}#{pr.pr.number}
                              </p>
                            </div>
                          </a>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {pr.pr.user.avatar_url && (
                              <img
                                src={pr.pr.user.avatar_url}
                                alt={pr.pr.user.login}
                                className="h-6 w-6 rounded-full"
                              />
                            )}
                            <span className="text-sm">{pr.pr.user.login}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pr.evaluation?.component.name ?? '-'}
                        </TableCell>
                        <TableCell>
                          {pr.evaluation?.severity.key ? (
                            <SeverityBadge severity={pr.evaluation.severity.key} />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {pr.evaluation?.final_score ?? '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  icon={GitMerge}
                  message={loading ? 'Fetching PRs...' : 'No PRs found.'}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Next Steps Section - Shows when processing is complete */}
      {pendingCount === 0 && processedCount > 0 && (
        <div className="space-y-6">
          {/* Invite Contributors Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-violet-500" />
                    Invite Contributors
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    {loadingEmails ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Finding contributor emails...
                      </span>
                    ) : (
                      <>
                        Send email invitations to contributors with known emails.
                        {Object.values(contributorEmails).filter(Boolean).length > 0 && (
                          <span className="ml-1 text-green-600">
                            ({Object.values(contributorEmails).filter(Boolean).length} emails found)
                          </span>
                        )}
                      </>
                    )}
                  </CardDescription>
                </div>
                {leaderboard.length > 0 && (
                  <div className="flex gap-2">
                    {Object.keys(inviteUrls).length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyAllInviteUrls}
                        className="gap-1"
                      >
                        <Copy className="h-4 w-4" />
                        Copy All Links
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={inviteAll}
                      disabled={invitingAll || leaderboard.every(c => inviteStatuses[c.author] === 'sent')}
                      className="gap-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                    >
                      {invitingAll ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : leaderboard.every(c => inviteStatuses[c.author] === 'sent') ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          All Invited
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Invite All ({leaderboard.filter(c => inviteStatuses[c.author] !== 'sent').length})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((contributor) => {
                    const isInvited = inviteStatuses[contributor.author] === 'sent';
                    const isSending = inviteStatuses[contributor.author] === 'sending';
                    const email = contributorEmails[contributor.author];
                    const wasEmailSent = emailsSent[contributor.author];

                    return (
                      <div
                        key={contributor.author}
                        className="flex items-center gap-4 rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {contributor.avatar_url ? (
                            <img
                              src={contributor.avatar_url}
                              alt={contributor.author}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                              {contributor.author[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">@{contributor.author}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{contributor.total_score} pts • {contributor.pr_count} PRs</span>
                              {email ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  <Mail className="h-3 w-3" />
                                  {email}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/60">No email found</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isInvited ? (
                          <div className="flex items-center gap-2">
                            {wasEmailSent ? (
                              <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-200">
                                <MailCheck className="h-3 w-3" />
                                Email Sent
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-600 border-blue-200">
                                <CheckCircle2 className="h-3 w-3" />
                                Link Ready
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyInviteUrl(inviteUrls[contributor.author]!)}
                              title="Copy invite link"
                              className="gap-1"
                            >
                              <Copy className="h-4 w-4" />
                              Copy
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant={email ? 'default' : 'outline'}
                            onClick={() => sendInvite(contributor.author, contributor.avatar_url)}
                            disabled={isSending || invitingAll || loadingEmails}
                            className={email ? 'gap-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700' : 'gap-1'}
                          >
                            {isSending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : email ? (
                              <>
                                <Mail className="h-4 w-4" />
                                Send Invite
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4" />
                                Generate Link
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No contributors found in processed PRs.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Go to Dashboard Card */}
          <Card className="border-violet-500/50 bg-gradient-to-r from-violet-500/5 to-purple-500/5">
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
                  <Trophy className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <h3 className="font-semibold">All done! Ready to view results?</h3>
                  <p className="text-sm text-muted-foreground">
                    Head to the dashboard to see the leaderboard and detailed analytics.
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                onClick={() => {
                  window.location.href = '/home';
                }}
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20">
        <Medal className="h-4 w-4 text-yellow-500" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400/20">
        <Medal className="h-4 w-4 text-gray-400" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600/20">
        <Medal className="h-4 w-4 text-amber-600" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center text-sm font-medium text-muted-foreground">
      {rank}
    </div>
  );
}

function StatusIcon({ status }: { status: ProcessedPR['status'] }) {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    case 'processing':
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'skipped':
      return <FastForward className="h-4 w-4 text-muted-foreground" />;
  }
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

function PRCard({ pr, showReason = false }: { pr: ProcessedPR; showReason?: boolean }) {
  const evaluation = pr.evaluation;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <a
            href={pr.pr.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            {pr.pr.title}
          </a>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span>{pr.repo_full_name}#{pr.pr.number}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              {pr.pr.user.avatar_url && (
                <img
                  src={pr.pr.user.avatar_url}
                  alt={pr.pr.user.login}
                  className="h-4 w-4 rounded-full"
                />
              )}
              <span>{pr.pr.user.login}</span>
            </div>
            <span>•</span>
            <span>+{pr.pr.additions} / -{pr.pr.deletions}</span>
          </div>
        </div>
        {evaluation && (
          <div className="text-right">
            <div className="text-xl font-bold">
              {evaluation.final_score}
              <span className="text-xs text-muted-foreground ml-1">pts</span>
            </div>
            <div className="flex items-center gap-1 justify-end mt-1">
              <SeverityBadge severity={evaluation.severity.key} />
              <Badge variant="outline">{evaluation.component.name}</Badge>
            </div>
          </div>
        )}
      </div>

      {evaluation && (
        <div className="text-sm text-muted-foreground">
          <p>{evaluation.impact_summary}</p>
        </div>
      )}

      {showReason && evaluation && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium text-orange-600">Ineligibility Reasons:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <EligibilityCheck
              label="Issue/Bug Fix"
              passed={evaluation.eligibility.issue}
            />
            <EligibilityCheck
              label="Fix Implementation"
              passed={evaluation.eligibility.fix_implementation}
            />
            <EligibilityCheck
              label="PR Documented"
              passed={evaluation.eligibility.pr_linked}
            />
            <EligibilityCheck
              label="Tests Included"
              passed={evaluation.eligibility.tests}
            />
          </div>
          {evaluation.eligibility_notes && (
            <p className="text-xs text-muted-foreground mt-2">
              {evaluation.eligibility_notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function EligibilityCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
      {passed ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

