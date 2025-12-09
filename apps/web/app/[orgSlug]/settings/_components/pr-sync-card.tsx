'use client';

import { useState, useEffect, useRef } from 'react';

import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Label } from '@kit/ui/label';

interface PRSyncCardProps {
  orgId: string;
}

interface SyncStats {
  totalPRs: number;
  evaluatedPRs: number;
  unprocessedPRs: number;
  debug?: {
    prsWithMergedAt: number;
    evalsFound: number;
    samplePrIds: string[];
    sampleEvalPrIds: string[];
  };
}

interface Repo {
  id: string;
  full_name: string;
  github_repo_id: number;
  last_synced_at: string | null;
}

interface UnprocessedPR {
  id: string;
  repoId: string;
  repoFullName: string;
  prNumber: number;
  prId: number;
  prTitle: string;
  prBody: string | null;
  prAuthor: string | null;
  prAuthorId: number | null;
  prAuthorAvatar: string | null;
  prUrl: string;
  mergedAt: string;
  createdAt: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  headSha: string;
  baseSha: string;
}

interface Progress {
  completed: number;
  total: number;
  label: string;
  currentPR?: string;
}

export function PRSyncCard({ orgId }: PRSyncCardProps) {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [months, setMonths] = useState('3');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [orgId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/github/process-unprocessed?orgId=${orgId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const syncFromGitHub = async () => {
    try {
      setSyncing(true);
      setError(null);
      setProgress(null);
      abortRef.current = false;

      // First, get list of repos
      const reposResponse = await fetch(`/api/github/sync-prs?orgId=${orgId}`);
      if (!reposResponse.ok) {
        const errData = await reposResponse.json();
        throw new Error(errData.error || 'Failed to get repos');
      }

      const { repos } = await reposResponse.json() as { repos: Repo[] };

      if (!repos.length) {
        toast.info('No repositories found to sync');
        return;
      }

      toast.info(`Starting sync for ${repos.length} repositories (last ${months} months)...`);

      let totalSynced = 0;
      let totalPages = 0;

      // Process each repo sequentially, fetching page by page
      for (let repoIndex = 0; repoIndex < repos.length; repoIndex++) {
        if (abortRef.current) break;

        const repo = repos[repoIndex]!;
        let page = 1;
        let hasMore = true;
        let repoSynced = 0;

        // Calculate progress: each repo gets equal share, pages subdivide within repo
        // Use page/20 as estimate for sub-progress within a repo (capped at 1)
        const repoBaseProgress = repoIndex / repos.length;
        const repoShare = 1 / repos.length;

        setProgress({
          completed: repoBaseProgress * 100,
          total: 100,
          label: 'Syncing repos',
          currentPR: `${repo.full_name} (page ${page})`,
        });

        while (hasMore && !abortRef.current) {
          try {
            const response = await fetch('/api/github/sync-prs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orgId,
                repoId: repo.id,
                repoFullName: repo.full_name,
                months: parseInt(months),
                page,
              }),
            });

            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || 'Sync failed');
            }

            const data = await response.json() as {
              synced: number;
              skipped: number;
              hasMore: boolean;
              page: number;
              fetchedFromGitHub: number;
            };

            repoSynced += data.synced;
            totalSynced += data.synced;
            totalPages++;
            hasMore = data.hasMore;

            // Progress: base + fraction of current repo's share based on pages (estimate 20 pages max per repo)
            const pageProgress = Math.min(page / 20, 0.95); // Cap at 95% until done
            const currentProgress = (repoBaseProgress + repoShare * pageProgress) * 100;

            setProgress({
              completed: currentProgress,
              total: 100,
              label: 'Syncing repos',
              currentPR: `${repo.full_name} (page ${page}${data.synced > 0 ? `, +${data.synced}` : ''})`,
            });

            page++;
          } catch (err) {
            toast.error(`${repo.full_name}: ${(err as Error).message}`);
            hasMore = false; // Stop this repo on error
          }
        }

        if (repoSynced > 0) {
          toast.success(`${repo.full_name}: ${repoSynced} new PRs`);
        }
      }

      // Final summary
      setProgress({ completed: 100, total: 100, label: 'Syncing repos' });

      if (totalSynced > 0) {
        toast.success(`Sync complete! ${totalSynced} new PRs added (${totalPages} pages)`);
      } else {
        toast.info('Sync complete - no new PRs found');
      }

      // Refresh stats after sync
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      toast.error(`Sync failed: ${(err as Error).message}`);
    } finally {
      setSyncing(false);
      setProgress(null);
    }
  };

  const processAllUnprocessed = async () => {
    try {
      setProcessing(true);
      setError(null);
      abortRef.current = false;

      // Get the list of unprocessed PRs
      toast.info('Fetching unprocessed PRs...');
      const listResponse = await fetch(`/api/github/process-unprocessed?orgId=${orgId}&list=true`);
      if (!listResponse.ok) {
        throw new Error('Failed to fetch PR list');
      }

      const { list: prList } = await listResponse.json() as { list: UnprocessedPR[] };

      if (!prList || prList.length === 0) {
        toast.info('No unprocessed PRs found');
        setProcessing(false);
        return;
      }

      toast.info(`Processing ${prList.length} PRs one by one...`);
      setProgress({ completed: 0, total: prList.length, label: 'Evaluating PRs' });

      let totalProcessed = 0;
      let totalErrors = 0;

      // Process each PR one by one
      for (let i = 0; i < prList.length; i++) {
        if (abortRef.current) break;

        const pr = prList[i]!;
        setProgress({
          completed: i,
          total: prList.length,
          label: 'Evaluating PRs',
          currentPR: `#${pr.prNumber} ${pr.prTitle.slice(0, 40)}${pr.prTitle.length > 40 ? '...' : ''}`
        });

        try {
          const response = await fetch('/api/github/process-pr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orgId,
              repoId: pr.repoId,
              repoFullName: pr.repoFullName,
              prNumber: pr.prNumber,
              prId: pr.prId,
              prTitle: pr.prTitle,
              prBody: pr.prBody,
              prAuthor: pr.prAuthor,
              prAuthorId: pr.prAuthorId,
              prAuthorAvatar: pr.prAuthorAvatar,
              prUrl: pr.prUrl,
              mergedAt: pr.mergedAt,
              createdAt: pr.createdAt,
              additions: pr.additions,
              deletions: pr.deletions,
              changedFiles: pr.changedFiles,
              headSha: pr.headSha,
              baseSha: pr.baseSha,
              skipComment: true,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            totalProcessed++;
            toast.success(`#${pr.prNumber}: ${result.evaluation?.final_score ?? 0} pts`);
          } else {
            const errData = await response.json();
            totalErrors++;
            toast.error(`#${pr.prNumber}: ${errData.error || 'Failed'}`);
          }
        } catch (err) {
          totalErrors++;
          toast.error(`#${pr.prNumber}: ${(err as Error).message}`);
        }

        // Update progress after each PR
        setProgress({
          completed: i + 1,
          total: prList.length,
          label: 'Evaluating PRs'
        });
      }

      // Final summary
      if (abortRef.current) {
        toast.info(`Processing stopped. ${totalProcessed} PRs evaluated.`);
      } else {
        toast.success(`All done! ${totalProcessed} PRs evaluated${totalErrors > 0 ? `, ${totalErrors} errors` : ''}`);
      }

      // Refresh stats
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      toast.error(`Processing failed: ${(err as Error).message}`);
    } finally {
      setProcessing(false);
      setProgress(null);
    }
  };

  const stopProcessing = () => {
    abortRef.current = true;
    toast.info('Stopping after current PR...');
  };

  const isWorking = syncing || processing;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          PR Sync & Processing
          {stats && stats.unprocessedPRs > 0 && (
            <Badge variant="secondary">{stats.unprocessedPRs} pending</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Sync PRs from GitHub and evaluate them. Existing evaluations will not be overwritten.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        {loading && !isWorking ? (
          <div className="text-sm text-muted-foreground">Loading stats...</div>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold">{stats.totalPRs}</div>
              <div className="text-xs text-muted-foreground">Total PRs</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold text-green-600">{stats.evaluatedPRs}</div>
              <div className="text-xs text-muted-foreground">Evaluated</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold text-orange-600">{stats.unprocessedPRs}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        ) : null}

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Progress */}
        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{progress.label}...</span>
              <span>{progress.completed} / {progress.total}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
              />
            </div>
            {progress.currentPR && (
              <div className="text-xs text-muted-foreground truncate">
                Current: {progress.currentPR}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="months" className="text-sm whitespace-nowrap">
              Fetch PRs from last:
            </Label>
            <Select value={months} onValueChange={setMonths} disabled={isWorking}>
              <SelectTrigger id="months" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 month</SelectItem>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={syncFromGitHub}
            disabled={isWorking || loading}
          >
            {syncing
              ? `Syncing... ${progress ? `(${progress.completed}/${progress.total})` : ''}`
              : 'Sync from GitHub'}
          </Button>
          <Button
            onClick={processAllUnprocessed}
            disabled={isWorking || loading || (stats?.unprocessedPRs === 0)}
          >
            {processing
              ? `Evaluating... ${progress ? `(${progress.completed}/${progress.total})` : ''}`
              : 'Evaluate All PRs'}
          </Button>
          {isWorking && (
            <Button variant="destructive" onClick={stopProcessing}>
              Stop
            </Button>
          )}
          <Button variant="ghost" onClick={fetchStats} disabled={isWorking}>
            Refresh
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          1. Select time range and click &quot;Sync from GitHub&quot; to pull PRs.<br />
          2. Click &quot;Evaluate All PRs&quot; to process each PR one by one with live progress.
        </p>

        {/* Debug info */}
        {stats?.debug && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 overflow-auto rounded bg-muted p-2">
              {JSON.stringify(stats.debug, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
