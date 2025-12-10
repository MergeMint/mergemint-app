'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Bug,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  MoreHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Zap,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Checkbox } from '@kit/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { cn } from '@kit/ui/utils';

type Category = 'new_feature' | 'improvement' | 'bug_fix' | 'breaking_change';

interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  category: Category;
  is_draft: boolean;
  is_hidden: boolean;
  published_at: string | null;
  created_at: string;
  pr_id: string | null;
  pull_requests?: { number: number; title: string } | null;
  generated_by_llm: boolean;
  admin_edited: boolean;
}

interface AvailablePR {
  id: string;
  number: number;
  title: string;
  merged_at_gh: string;
  additions: number;
  deletions: number;
}

const CATEGORY_CONFIG: Record<Category, { label: string; icon: typeof Sparkles; color: string }> = {
  new_feature: { label: 'New Feature', icon: Sparkles, color: 'bg-green-500/10 text-green-600 border-green-200 dark:text-green-400 dark:border-green-800' },
  improvement: { label: 'Improvement', icon: TrendingUp, color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800' },
  bug_fix: { label: 'Bug Fix', icon: Bug, color: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800' },
  breaking_change: { label: 'Breaking Change', icon: AlertTriangle, color: 'bg-red-500/10 text-red-600 border-red-200 dark:text-red-400 dark:border-red-800' },
};

function CategoryBadge({ category }: { category: Category }) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn('gap-1', config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export function ChangelogDashboardClient({
  orgId,
  orgSlug,
  isAdmin,
  initialEntries,
  initialAvailablePrs,
  totalAvailablePrs,
  stats,
}: {
  orgId: string;
  orgSlug: string;
  isAdmin: boolean;
  initialEntries: ChangelogEntry[];
  initialAvailablePrs: AvailablePR[];
  totalAvailablePrs: number;
  stats: { published: number; drafts: number };
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');

  // Generate dialog state
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedPrs, setSelectedPrs] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [availablePrs, setAvailablePrs] = useState<AvailablePR[]>(initialAvailablePrs);
  const [totalPrs, setTotalPrs] = useState(totalAvailablePrs);
  const [loadingMore, setLoadingMore] = useState(false);
  const [progress, setProgress] = useState<{
    completed: number;
    total: number;
    label: string;
    currentPR?: string;
  } | null>(null);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'improvement' as Category,
  });
  const [saving, setSaving] = useState(false);

  // Bulk selection state
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Filtered entries
  const filteredEntries = entries.filter(entry => {
    if (filter === 'draft') return entry.is_draft;
    if (filter === 'published') return !entry.is_draft;
    return true;
  });

  // Computed stats from entries state
  const publishedCount = entries.filter(e => !e.is_draft).length;
  const draftCount = entries.filter(e => e.is_draft).length;

  const handleGenerate = async () => {
    if (selectedPrs.length === 0) {
      toast.error('Please select at least one PR');
      return;
    }

    const prsToProcess: AvailablePR[] = selectedPrs
      .map(id => availablePrs.find(pr => pr.id === id))
      .filter((pr): pr is AvailablePR => pr !== undefined);

    // Close the dialog and reset selection
    setGenerateOpen(false);
    setSelectedPrs([]);
    setGenerating(true);
    setProgress({ completed: 0, total: prsToProcess.length, label: 'Generating changelog entries' });

    const results: Array<{
      prId: string;
      prNumber: number;
      prTitle: string;
      status: 'success' | 'skipped' | 'error';
      reason?: string;
    }> = [];

    for (let i = 0; i < prsToProcess.length; i++) {
      const pr = prsToProcess[i]!;

      // Update progress
      setProgress({
        completed: i,
        total: prsToProcess.length,
        label: 'Generating changelog entries',
        currentPR: `#${pr.number} ${pr.title.slice(0, 40)}${pr.title.length > 40 ? '...' : ''}`,
      });

      try {
        const res = await fetch('/api/changelog/generate-single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orgId,
            prId: pr.id,
            saveAsDraft: true,
          }),
        });

        const data = await res.json();

        if (data.skipped) {
          results.push({
            prId: pr.id,
            prNumber: pr.number,
            prTitle: pr.title,
            status: 'skipped',
            reason: data.reason,
          });
        } else if (data.error) {
          results.push({
            prId: pr.id,
            prNumber: pr.number,
            prTitle: pr.title,
            status: 'error',
            reason: data.error,
          });
        } else {
          results.push({
            prId: pr.id,
            prNumber: pr.number,
            prTitle: pr.title,
            status: 'success',
          });
          toast.success(`#${pr.number}: Entry created`);
        }
      } catch (err) {
        results.push({
          prId: pr.id,
          prNumber: pr.number,
          prTitle: pr.title,
          status: 'error',
          reason: (err as Error).message,
        });
        toast.error(`#${pr.number}: ${(err as Error).message}`);
      }

      // Update progress after each PR
      setProgress({
        completed: i + 1,
        total: prsToProcess.length,
        label: 'Generating changelog entries',
      });
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    // Show final summary toast
    if (successCount > 0) {
      toast.success(`Generated ${successCount} changelog entries`, {
        description: `${skippedCount} skipped (not user-facing), ${errorCount} errors`,
      });
    } else if (errorCount > 0) {
      toast.error('Failed to generate changelog entries', {
        description: `${skippedCount} skipped, ${errorCount} errors`,
      });
    } else {
      toast.info('No changelog entries generated', {
        description: `${skippedCount} PRs skipped (not user-facing)`,
      });
    }

    // Fetch updated entries to refresh the list
    try {
      const entriesRes = await fetch(`/api/changelog/entries?orgId=${orgId}`);
      if (entriesRes.ok) {
        const { entries: newEntries } = await entriesRes.json();
        setEntries(newEntries || []);
      }
    } catch {
      // Fall back to router refresh if fetch fails
      router.refresh();
    }

    setGenerating(false);
    setProgress(null);
  };

  const handleCloseGenerateDialog = () => {
    if (!generating) {
      setGenerateOpen(false);
    }
  };

  const loadMorePrs = async (loadAll = false) => {
    setLoadingMore(true);
    try {
      const limit = loadAll ? totalPrs : 100;
      const res = await fetch(
        `/api/changelog/available-prs?orgId=${orgId}&offset=${availablePrs.length}&limit=${limit}`
      );
      if (res.ok) {
        const { prs, total } = await res.json();
        setAvailablePrs(prev => [...prev, ...prs]);
        setTotalPrs(total);
        return prs;
      }
    } catch (err) {
      toast.error('Failed to load more PRs');
    } finally {
      setLoadingMore(false);
    }
    return [];
  };

  const selectAllPrs = async () => {
    if (availablePrs.length < totalPrs) {
      // Load all remaining PRs first
      const newPrs = await loadMorePrs(true);
      // Select all including newly loaded
      setSelectedPrs([...availablePrs, ...newPrs].map(pr => pr.id));
    } else {
      // All PRs already loaded, just select them
      setSelectedPrs(availablePrs.map(pr => pr.id));
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/changelog/entries/${id}/publish`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to publish');

      const { entry } = await res.json();
      setEntries(entries.map(e => e.id === id ? { ...e, is_draft: false, published_at: entry.published_at } : e));
      toast.success('Entry published');
    } catch (err) {
      toast.error('Failed to publish entry');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      const res = await fetch(`/api/changelog/entries/${id}/unpublish`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to unpublish');

      setEntries(entries.map(e => e.id === id ? { ...e, is_draft: true } : e));
      toast.success('Entry unpublished');
    } catch (err) {
      toast.error('Failed to unpublish entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this changelog entry?')) return;

    try {
      const res = await fetch(`/api/changelog/entries/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      setEntries(entries.filter(e => e.id !== id));
      toast.success('Entry deleted');
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  const handleEdit = (entry: ChangelogEntry) => {
    setEditingEntry(entry);
    setEditForm({
      title: entry.title,
      description: entry.description,
      category: entry.category,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/changelog/entries/${editingEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error('Failed to save');

      const { entry } = await res.json();
      setEntries(entries.map(e => e.id === editingEntry.id ? { ...e, ...entry } : e));
      setEditOpen(false);
      toast.success('Entry updated');
    } catch (err) {
      toast.error('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  // Bulk actions
  const handleBulkPublish = async () => {
    if (selectedEntries.length === 0) return;

    setBulkActionLoading(true);
    const total = selectedEntries.length;

    for (let i = 0; i < selectedEntries.length; i++) {
      const id = selectedEntries[i]!;
      const entryData = entries.find(e => e.id === id);

      try {
        const res = await fetch(`/api/changelog/entries/${id}/publish`, {
          method: 'POST',
        });
        if (res.ok) {
          const { entry } = await res.json();
          setEntries(prev => prev.map(e => e.id === id ? { ...e, is_draft: false, published_at: entry.published_at } : e));
          toast.success(`Published "${entryData?.title || 'Entry'}"`, {
            description: `${i + 1} of ${total} completed`,
          });
        } else {
          toast.error(`Failed to publish "${entryData?.title || 'Entry'}"`);
        }
      } catch {
        toast.error(`Failed to publish "${entryData?.title || 'Entry'}"`);
      }
    }

    setSelectedEntries([]);
    setBulkActionLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.length === 0) return;
    if (!confirm(`Delete ${selectedEntries.length} changelog entries?`)) return;

    setBulkActionLoading(true);
    let successCount = 0;

    for (const id of selectedEntries) {
      try {
        const res = await fetch(`/api/changelog/entries/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          successCount++;
          setEntries(prev => prev.filter(e => e.id !== id));
        }
      } catch {
        // Continue with next
      }
    }

    toast.success(`Deleted ${successCount} entries`);
    setSelectedEntries([]);
    setBulkActionLoading(false);
  };

  const toggleEntrySelection = (id: string) => {
    setSelectedEntries(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const toggleSelectAllEntries = () => {
    if (selectedEntries.length === filteredEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredEntries.map(e => e.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-2xl">{publishedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-2xl">{draftCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available PRs</CardDescription>
            <CardTitle className="text-2xl">{availablePrs.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Actions & Filter */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('draft')}
          >
            Drafts
          </Button>
          <Button
            variant={filter === 'published' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('published')}
          >
            Published
          </Button>
        </div>

        <div className="flex gap-2">
          {isAdmin && availablePrs.length > 0 && (
            <Button onClick={() => setGenerateOpen(true)} disabled={generating}>
              <Zap className="h-4 w-4 mr-2" />
              Generate from PRs
            </Button>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      {progress && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {progress.label}...
                </span>
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
          </CardContent>
        </Card>
      )}

      {/* Bulk Selection Bar */}
      {isAdmin && filteredEntries.length > 0 && (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
              onCheckedChange={toggleSelectAllEntries}
            />
            <span className="text-sm text-muted-foreground">
              {selectedEntries.length > 0
                ? `${selectedEntries.length} selected`
                : 'Select entries'}
            </span>
          </div>
          {selectedEntries.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkPublish}
                disabled={bulkActionLoading}
              >
                {bulkActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Publish ({selectedEntries.length})
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="text-destructive hover:text-destructive"
              >
                {bulkActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedEntries.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-medium">No changelog entries yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isAdmin
                  ? 'Generate entries from your merged PRs to get started.'
                  : 'Changelog entries will appear here once created.'}
              </p>
              {isAdmin && availablePrs.length > 0 && (
                <Button className="mt-4" onClick={() => setGenerateOpen(true)}>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate from PRs
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map(entry => (
            <Card
              key={entry.id}
              className={cn(
                entry.is_hidden && 'opacity-50',
                selectedEntries.includes(entry.id) && 'ring-2 ring-primary'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {isAdmin && (
                    <Checkbox
                      checked={selectedEntries.includes(entry.id)}
                      onCheckedChange={() => toggleEntrySelection(entry.id)}
                      className="mt-1"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryBadge category={entry.category} />
                      {entry.is_draft && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                      {entry.generated_by_llm && !entry.admin_edited && (
                        <Badge variant="outline" className="gap-1">
                          <Sparkles className="h-3 w-3" />
                          AI Generated
                        </Badge>
                      )}
                      {entry.is_hidden && (
                        <Badge variant="outline" className="gap-1">
                          <EyeOff className="h-3 w-3" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                    {entry.pull_requests && (
                      <p className="text-xs text-muted-foreground mt-2">
                        PR #{entry.pull_requests.number}: {entry.pull_requests.title}
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(entry)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {entry.is_draft ? (
                          <DropdownMenuItem onClick={() => handlePublish(entry.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUnpublish(entry.id)}>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(entry.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Generate Dialog */}
      <Dialog open={generateOpen} onOpenChange={handleCloseGenerateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Changelog Entries</DialogTitle>
            <DialogDescription>
              Select merged PRs to generate user-friendly changelog entries using AI.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">
              {selectedPrs.length} of {availablePrs.length} selected
              {totalPrs > availablePrs.length && (
                <span className="text-muted-foreground/60"> ({totalPrs} total available)</span>
              )}
            </span>
            <div className="flex gap-2">
              {totalPrs > availablePrs.length && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllPrs}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Select All ${totalPrs}`
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedPrs.length === availablePrs.length) {
                    setSelectedPrs([]);
                  } else {
                    setSelectedPrs(availablePrs.map(pr => pr.id));
                  }
                }}
              >
                {selectedPrs.length === availablePrs.length ? 'Deselect All' : 'Select Loaded'}
              </Button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2 py-4">
            {availablePrs.map(pr => (
              <label
                key={pr.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  selectedPrs.includes(pr.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                )}
              >
                <Checkbox
                  checked={selectedPrs.includes(pr.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPrs([...selectedPrs, pr.id]);
                    } else {
                      setSelectedPrs(selectedPrs.filter(id => id !== pr.id));
                    }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">#{pr.number}: {pr.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Merged {new Date(pr.merged_at_gh).toLocaleDateString()} · +{pr.additions} -{pr.deletions}
                  </p>
                </div>
              </label>
            ))}

            {/* Load more button */}
            {availablePrs.length < totalPrs && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => loadMorePrs()}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load more (${totalPrs - availablePrs.length} remaining)`
                )}
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseGenerateDialog}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={selectedPrs.length === 0}>
              <Zap className="mr-2 h-4 w-4" />
              Generate ({selectedPrs.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Changelog Entry</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={editForm.category}
                onValueChange={(value: Category) => setEditForm({ ...editForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
