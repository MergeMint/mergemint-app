'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { MagicCard } from '@kit/ui/magicui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import {
  Activity,
  AlertTriangle,
  CircleDot,
  Flame,
  Github,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Shield,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { cn } from '@kit/ui/utils';

export type RepoOption = {
  id?: number | string;
  name: string;
  full_name?: string;
  description?: string;
  selected?: boolean;
  default_branch?: string | null;
  pushed_at?: string | null;
};

export type ComponentOption = {
  id?: string;
  repo_full_name?: string;
  repo_id?: string;
  key: string;
  name: string;
  importance: 'critical' | 'high' | 'normal' | 'low';
  description: string;
  multiplier?: number;
};

function getMultiplierForImportance(importance: ComponentOption['importance']): number {
  switch (importance) {
    case 'critical': return 2.0;
    case 'high': return 1.5;
    case 'normal': return 1.0;
    case 'low': return 0.5;
    default: return 1.0;
  }
}

function generateKey(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 32) || 'COMPONENT';
}

function ImportanceBadge({ level }: { level: ComponentOption['importance'] }) {
  const config = {
    critical: { icon: Flame, className: 'bg-red-500/10 text-red-600 border-red-200' },
    high: { icon: AlertTriangle, className: 'bg-orange-500/10 text-orange-600 border-orange-200' },
    normal: { icon: Activity, className: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    low: { icon: CircleDot, className: 'bg-gray-500/10 text-gray-600 border-gray-200' },
  };
  const { icon: Icon, className } = config[level] || config.normal;
  return (
    <Badge variant="outline" className={cn('gap-1 capitalize', className)}>
      <Icon className="h-3 w-3" />
      {level}
    </Badge>
  );
}

export function RepoComponentsEditor({
  orgId,
  repos,
  initialComponents = [],
  onComponentsChange,
  showEmptyState = true,
}: {
  orgId: string;
  repos: RepoOption[];
  initialComponents?: ComponentOption[];
  onComponentsChange?: (components: ComponentOption[]) => void;
  showEmptyState?: boolean;
}) {
  const { theme } = useTheme();
  const [components, setComponents] = useState<ComponentOption[]>(initialComponents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<'select-repo' | 'add-component'>('select-repo');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedRepoForDialog, setSelectedRepoForDialog] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<{
    repoFullName: string;
    component: ComponentOption;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    importance: 'normal' as ComponentOption['importance'],
    multiplier: getMultiplierForImportance('normal'),
  });

  // Sync with initial components when they change
  useEffect(() => {
    setComponents(initialComponents);
  }, [initialComponents]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      key: '',
      description: '',
      importance: 'normal',
      multiplier: getMultiplierForImportance('normal'),
    });
    setEditingComponent(null);
    setSelectedRepoForDialog(null);
    setDialogStep('select-repo');
  }, []);

  const handleOpenAddDialog = useCallback(() => {
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const handleSelectRepo = useCallback((repoFullName: string) => {
    setSelectedRepoForDialog(repoFullName);
    setDialogStep('add-component');
  }, []);

  const handleOpenDialog = useCallback((repo: RepoOption) => {
    resetForm();
    setSelectedRepoForDialog(repo.full_name ?? repo.name);
    setDialogStep('add-component');
    setDialogOpen(true);
  }, [resetForm]);

  const handleEditComponent = useCallback((repoFullName: string, component: ComponentOption) => {
    setEditingComponent({ repoFullName, component });
    setSelectedRepoForDialog(repoFullName);
    setDialogStep('add-component');
    setFormData({
      name: component.name,
      key: component.key,
      description: component.description,
      importance: component.importance,
      multiplier: component.multiplier ?? 1,
    });
    setDialogOpen(true);
  }, []);

  const handleSave = async () => {
    if (!selectedRepoForDialog) return;

    setSaving(true);
    try {
      const componentData = {
        repo_full_name: selectedRepoForDialog,
        key: formData.key || generateKey(formData.name),
        name: formData.name,
        description: formData.description,
        importance: formData.importance,
        multiplier: formData.multiplier,
      };

      // Save to backend
      const res = await fetch('/api/github/save-components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          components: [componentData],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save component');
      }

      // Update local state
      const newComponent: ComponentOption = {
        ...componentData,
        id: editingComponent?.component.id,
      };

      let newComponents: ComponentOption[];
      if (editingComponent) {
        newComponents = components.map(c =>
          c.key === editingComponent.component.key && c.repo_full_name === editingComponent.repoFullName
            ? newComponent
            : c
        );
      } else {
        newComponents = [...components, newComponent];
      }

      setComponents(newComponents);
      onComponentsChange?.(newComponents);

      setDialogOpen(false);
      resetForm();
      toast.success(editingComponent ? 'Component updated' : 'Component added');
    } catch (err) {
      console.error('Failed to save component:', err);
      toast.error('Failed to save component', {
        description: (err as Error).message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (repoFullName: string, component: ComponentOption) => {
    if (!confirm(`Delete "${component.name}"?`)) return;

    setDeleting(component.key);
    try {
      const res = await fetch('/api/github/delete-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          repoFullName,
          componentKey: component.key,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete component');
      }

      const newComponents = components.filter(
        c => !(c.key === component.key && c.repo_full_name === repoFullName)
      );
      setComponents(newComponents);
      onComponentsChange?.(newComponents);
      toast.success('Component deleted');
    } catch (err) {
      console.error('Failed to delete component:', err);
      toast.error('Failed to delete component', {
        description: (err as Error).message,
      });
    } finally {
      setDeleting(null);
    }
  };

  if (repos.length === 0 && showEmptyState) {
    return (
      <MagicCard
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        gradientFrom="#F59E0B"
        gradientTo="#EF4444"
        gradientOpacity={0.1}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 mb-4">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
          </div>
          <p className="font-medium mb-1">No repositories connected</p>
          <p className="text-sm text-muted-foreground">
            Connect a GitHub repository first to add components.
          </p>
        </div>
      </MagicCard>
    );
  }

  // Group components by repo for display - only show repos that have components
  const componentsByRepo = repos.reduce((acc, repo) => {
    const repoName = repo.full_name ?? repo.name;
    const repoComponents = components.filter(c => c.repo_full_name === repoName);
    if (repoComponents.length > 0) {
      acc[repoName] = repoComponents;
    }
    return acc;
  }, {} as Record<string, ComponentOption[]>);

  const reposWithComponents = Object.keys(componentsByRepo);

  // Get repos that don't have any components yet (available for adding)
  const availableRepos = repos.filter(repo => {
    const repoName = repo.full_name ?? repo.name;
    return !reposWithComponents.includes(repoName);
  });

  return (
    <div className="space-y-4">
      {/* Show repos that have components */}
      {reposWithComponents.length > 0 ? (
        reposWithComponents.map((repoName) => {
          const repoComponents = componentsByRepo[repoName] || [];

          return (
            <MagicCard
              key={repoName}
              gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
              gradientFrom="#10B981"
              gradientTo="#059669"
              gradientOpacity={0.1}
            >
              <div className="p-4">
                {/* Repo header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">{repoName.split('/')[1] || repoName}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {repoComponents.length} component{repoComponents.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-8"
                    onClick={() => handleOpenDialog({ name: repoName, full_name: repoName })}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Components list */}
                <div className="space-y-2">
                  {repoComponents.map((component) => (
                    <div
                      key={`${repoName}-${component.key}`}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <ImportanceBadge level={component.importance} />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{component.name}</p>
                          {component.description && (
                            <p className="text-xs text-muted-foreground truncate">{component.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {component.multiplier ?? 1}x
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditComponent(repoName, component)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(repoName, component)}
                              className="text-destructive"
                              disabled={deleting === component.key}
                            >
                              {deleting === component.key ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </MagicCard>
          );
        })
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No components defined yet</p>
          <p className="text-xs mt-1">Click "Add Repository" to get started</p>
        </div>
      )}

      {/* Add Repository Button - only show if there are repos available to add */}
      {availableRepos.length > 0 && (
        <Button
          onClick={handleOpenAddDialog}
          variant="outline"
          className="w-full rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Repository
        </Button>
      )}

      {/* Add/Edit Component Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 border-0 bg-transparent shadow-none">
          <MagicCard
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
            gradientFrom="#8B5CF6"
            gradientTo="#EC4899"
            gradientOpacity={0.15}
          >
            <div className="p-6">
              {dialogStep === 'select-repo' ? (
                <>
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl">Add Repository</DialogTitle>
                    <DialogDescription>
                      Choose a repository to add components to
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {availableRepos.map((repo) => {
                      const repoName = repo.full_name ?? repo.name;

                      return (
                        <button
                          key={repoName}
                          onClick={() => handleSelectRepo(repoName)}
                          className="w-full flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Github className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{repoName.split('/')[1] || repoName}</p>
                              <p className="text-xs text-muted-foreground">{repoName}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <DialogFooter className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl">
                      {editingComponent ? 'Edit Component' : 'Add Component'}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedRepoForDialog && (
                        <span className="flex items-center gap-1">
                          <Github className="h-3 w-3" />
                          {selectedRepoForDialog}
                        </span>
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Component Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Authentication, Payments, API"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            name: e.target.value,
                            key: prev.key || generateKey(e.target.value),
                          }));
                        }}
                        className="rounded-xl border-border/50 bg-muted/30 focus-visible:ring-violet-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">Description (optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="What does this component cover?"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                        className="rounded-xl border-border/50 bg-muted/30 focus-visible:ring-violet-500/50 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Importance Level</Label>
                      <Select
                        value={formData.importance}
                        onValueChange={(value: ComponentOption['importance']) => {
                          setFormData(prev => ({
                            ...prev,
                            importance: value,
                            multiplier: getMultiplierForImportance(value),
                          }));
                        }}
                      >
                        <SelectTrigger className="rounded-xl border-border/50 bg-muted/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">
                            <div className="flex items-center gap-2">
                              <Flame className="h-4 w-4 text-red-500" />
                              <span>Critical (2.0x)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              <span>High (1.5x)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="normal">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-blue-500" />
                              <span>Normal (1.0x)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <CircleDot className="h-4 w-4 text-gray-500" />
                              <span>Low (0.5x)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Multiplier info */}
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Multiplier: {formData.multiplier}x</strong>
                        {' — '}
                        PRs affecting this component will have their points multiplied by this value.
                      </p>
                    </div>
                  </div>

                  <DialogFooter className="mt-6 gap-2">
                    {!editingComponent && (
                      <Button
                        variant="ghost"
                        onClick={() => setDialogStep('select-repo')}
                        className="rounded-xl mr-auto"
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving || !formData.name}
                      className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingComponent ? 'Update Component' : 'Add Component'
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          </MagicCard>
        </DialogContent>
      </Dialog>
    </div>
  );
}
